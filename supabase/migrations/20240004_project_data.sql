-- project_data: one row per order, stores website production data
CREATE TABLE IF NOT EXISTS project_data (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            uuid REFERENCES orders(id) ON DELETE CASCADE,
  company_name        text,
  company_description text,
  phone               text,
  email               text,
  telegram            text,
  address             text,
  working_hours       text,
  domain_name         text,
  services            jsonb DEFAULT '[]',
  seo_title           text,
  seo_description     text,
  branding            jsonb DEFAULT '{}',
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- One project_data row per order
CREATE UNIQUE INDEX IF NOT EXISTS project_data_order_id_idx ON project_data (order_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_project_data_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS project_data_set_updated_at ON project_data;
CREATE TRIGGER project_data_set_updated_at
  BEFORE UPDATE ON project_data
  FOR EACH ROW EXECUTE FUNCTION set_project_data_updated_at();

-- RLS (service role bypasses; client RLS not needed for admin-only table)
ALTER TABLE project_data ENABLE ROW LEVEL SECURITY;

-- project_snapshot: immutable copy of template state at order time
ALTER TABLE orders ADD COLUMN IF NOT EXISTS project_snapshot jsonb;
