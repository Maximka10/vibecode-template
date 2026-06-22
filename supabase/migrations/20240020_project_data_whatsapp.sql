-- SALES-1: Add whatsapp column to project_data
ALTER TABLE project_data
  ADD COLUMN IF NOT EXISTS whatsapp text;
