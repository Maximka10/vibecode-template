-- SALES-1: Multi-order disambiguation + brief_json support

-- Add active_order_id to telegram_clients for multi-order selection
ALTER TABLE telegram_clients
  ADD COLUMN IF NOT EXISTS active_order_id uuid REFERENCES orders(id) ON DELETE SET NULL;

-- Add brief_json to orders for public lead form data
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS brief_json jsonb;
