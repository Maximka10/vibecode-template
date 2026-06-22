-- Workspace settings for the studio (single-row config)
CREATE TABLE IF NOT EXISTS workspace_settings (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name  text,
  company_desc  text,
  contact_email text,
  contact_phone text,
  contact_tg    text,
  services      text,
  branding_color text,
  branding_logo  text,
  domain        text,
  content_about text,
  updated_at    timestamptz DEFAULT now()
);

-- Only one row allowed
CREATE UNIQUE INDEX IF NOT EXISTS workspace_settings_singleton ON workspace_settings ((true));

-- RLS: only service role can access (admin client bypasses)
ALTER TABLE workspace_settings ENABLE ROW LEVEL SECURITY;
