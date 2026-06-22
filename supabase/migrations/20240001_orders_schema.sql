-- Migration: ensure orders table has all columns defined in order.contract.ts
-- Run this in Supabase SQL editor if any "column not found in schema cache" errors occur.
-- All ADD COLUMN statements use IF NOT EXISTS — safe to re-run.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS updated_at       timestamptz,
  ADD COLUMN IF NOT EXISTS user_id          uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status           text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS client_name      text,
  ADD COLUMN IF NOT EXISTS client_phone     text,
  ADD COLUMN IF NOT EXISTS client_telegram  text,
  ADD COLUMN IF NOT EXISTS template_id      text,
  ADD COLUMN IF NOT EXISTS template_name    text,
  ADD COLUMN IF NOT EXISTS selected_services jsonb,
  ADD COLUMN IF NOT EXISTS selected_options  jsonb,
  ADD COLUMN IF NOT EXISTS notes            text,
  ADD COLUMN IF NOT EXISTS total_price      numeric,
  ADD COLUMN IF NOT EXISTS primary_color    text,
  ADD COLUMN IF NOT EXISTS bg_color         text,
  ADD COLUMN IF NOT EXISTS project_url      text,
  ADD COLUMN IF NOT EXISTS domain           text,
  ADD COLUMN IF NOT EXISTS launch_date      date,
  ADD COLUMN IF NOT EXISTS admin_url        text;

-- Ensure updated_at is auto-set on every update
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_set_updated_at ON orders;
CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx  ON orders(status);
