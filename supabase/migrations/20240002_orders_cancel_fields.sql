-- Cancel fields for orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS cancel_reason  text,
  ADD COLUMN IF NOT EXISTS cancelled_by   uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS cancelled_at   timestamptz;
