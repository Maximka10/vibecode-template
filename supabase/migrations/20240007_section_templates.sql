-- Saved section templates for reuse across orders
CREATE TABLE IF NOT EXISTS section_templates (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  section_type  text NOT NULL,
  content       jsonb NOT NULL DEFAULT '{}',
  created_by    uuid REFERENCES auth.users(id),
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE section_templates ENABLE ROW LEVEL SECURITY;
