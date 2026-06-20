-- CRM-1: Telegram CRM foundation
-- Creates: telegram_clients, telegram_messages, telegram_webhook_log
-- Adds:    orders.telegram_client_id (FK replaces direct telegram_chat_id coupling)

-- ── 1. telegram_clients ───────────────────────────────────────────────────────
-- Normalized record per Telegram user. One client may appear across orders
-- (e.g. repeat customer), so we normalise out of orders table.

CREATE TABLE IF NOT EXISTS telegram_clients (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id      bigint      NOT NULL UNIQUE,
  username     text,
  first_name   text,
  last_name    text,
  language_code text,
  linked_at    timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tg_clients_chat_id ON telegram_clients (chat_id);

-- ── 2. orders: add telegram_client_id FK ──────────────────────────────────────
-- Supersedes the direct telegram_chat_id / telegram_username / telegram_linked_at
-- columns added in 20240011. Those columns remain for backward compat during migration.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS telegram_client_id uuid REFERENCES telegram_clients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_telegram_client_id ON orders (telegram_client_id);

-- ── 3. telegram_messages ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS telegram_messages (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         uuid        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  client_id        uuid        NOT NULL REFERENCES telegram_clients(id) ON DELETE CASCADE,
  telegram_msg_id  bigint,                -- Telegram's own message_id (for threading / edit)
  direction        text        NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type     text        NOT NULL CHECK (message_type IN (
                                 'text', 'photo', 'document', 'voice',
                                 'video', 'video_note', 'sticker', 'system')),
  message_status   text        NOT NULL DEFAULT 'received'
                               CHECK (message_status IN ('received', 'delivered', 'read', 'failed')),
  content_text     text,                  -- Message text or caption
  file_id          text,                  -- Telegram file_id (re-downloadable)
  file_unique_id   text,                  -- Stable dedup key (survives file re-upload)
  storage_path     text,                  -- Path in Supabase Storage after download
  storage_bucket   text        DEFAULT 'order-files',
  metadata         jsonb       NOT NULL DEFAULT '{}',  -- mime_type, size, width, height, duration
  sent_at          timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tgmsg_order_id    ON telegram_messages (order_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_tgmsg_client_id   ON telegram_messages (client_id);
CREATE INDEX IF NOT EXISTS idx_tgmsg_file_uid    ON telegram_messages (file_unique_id)
  WHERE file_unique_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tgmsg_direction   ON telegram_messages (direction, created_at DESC);

-- RLS: admin sees all; no client web access (clients interact via bot only)
ALTER TABLE telegram_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tgmsg_admin_all" ON telegram_messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ── 4. telegram_webhook_log ───────────────────────────────────────────────────
-- Replay-attack prevention: every Telegram update_id is unique and monotonic.
-- We insert before processing; conflict = duplicate, skip silently.

CREATE TABLE IF NOT EXISTS telegram_webhook_log (
  update_id   bigint      PRIMARY KEY,
  received_at timestamptz NOT NULL DEFAULT now()
);

-- Purge entries older than 72h via Supabase scheduled function or pg_cron:
--   DELETE FROM telegram_webhook_log WHERE received_at < now() - INTERVAL '72 hours';
