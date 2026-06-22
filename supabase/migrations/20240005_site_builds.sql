-- site_builds: compiled build snapshots per order
CREATE TABLE IF NOT EXISTS site_builds (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      uuid REFERENCES orders(id) ON DELETE CASCADE,
  build_data    jsonb NOT NULL,
  build_version integer DEFAULT 1,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS site_builds_order_id_idx ON site_builds (order_id);

CREATE OR REPLACE FUNCTION set_site_builds_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS site_builds_set_updated_at ON site_builds;
CREATE TRIGGER site_builds_set_updated_at
  BEFORE UPDATE ON site_builds
  FOR EACH ROW EXECUTE FUNCTION set_site_builds_updated_at();

ALTER TABLE site_builds ENABLE ROW LEVEL SECURITY;
