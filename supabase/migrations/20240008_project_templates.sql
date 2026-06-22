-- Full site configurations that can be reused across orders
CREATE TABLE IF NOT EXISTS project_templates (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  description  text,
  site_json    jsonb NOT NULL,
  created_by   uuid REFERENCES auth.users(id),
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;
