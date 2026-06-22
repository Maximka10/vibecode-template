-- Add content_edits jsonb to project_data for section-level content overrides
ALTER TABLE project_data ADD COLUMN IF NOT EXISTS content_edits jsonb;
