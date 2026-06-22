-- Add developer_note column to project_data for admin-to-client status messages
ALTER TABLE project_data ADD COLUMN IF NOT EXISTS developer_note text;
