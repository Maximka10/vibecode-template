-- Telegram CRM: link client telegram accounts to orders
-- Stores telegram_chat_id for bot-initiated conversations
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS telegram_chat_id  bigint,
  ADD COLUMN IF NOT EXISTS telegram_username text,
  ADD COLUMN IF NOT EXISTS telegram_linked_at timestamptz;

CREATE INDEX IF NOT EXISTS orders_telegram_chat_id_idx ON orders(telegram_chat_id);
