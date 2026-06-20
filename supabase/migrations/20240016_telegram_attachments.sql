-- CRM-3: telegram_attachments table + media_status column on telegram_messages

-- ── telegram_attachments ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS telegram_attachments (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id       uuid        NOT NULL REFERENCES telegram_messages(id) ON DELETE CASCADE,
  type             text        NOT NULL,
  file_id          text,
  file_unique_id   text        UNIQUE,
  storage_path     text,
  storage_bucket   text        NOT NULL DEFAULT 'order-files',
  mime_type        text,
  file_size        bigint,
  width            int,
  height           int,
  duration         int,
  file_name        text,
  download_status  text        NOT NULL DEFAULT 'pending'
    CHECK (download_status IN ('pending', 'downloading', 'done', 'failed')),
  retry_count      int         NOT NULL DEFAULT 0,
  metadata         jsonb       NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tgatt_message_id
  ON telegram_attachments(message_id);

CREATE INDEX IF NOT EXISTS idx_tgatt_pending
  ON telegram_attachments(download_status)
  WHERE download_status IN ('pending', 'failed');

ALTER TABLE telegram_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tgatt_admin_all" ON telegram_attachments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ── media_status column on telegram_messages ─────────────────────────────────
ALTER TABLE telegram_messages
  ADD COLUMN IF NOT EXISTS media_status text NOT NULL DEFAULT 'none'
    CHECK (media_status IN ('none', 'pending', 'done', 'failed'));
