-- Align site_builds table with actual deployed schema.
-- Migration 20240005 used build_version; actual DB uses version + additional columns.

-- Rename build_version → version if it still exists under the old name
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_builds' AND column_name = 'build_version'
  ) THEN
    ALTER TABLE site_builds RENAME COLUMN build_version TO version;
  END IF;
END $$;

-- Add version column if neither build_version nor version exists
ALTER TABLE site_builds
  ADD COLUMN IF NOT EXISTS version integer DEFAULT 1;

-- Add columns that were in the actual DB but not in the original migration
ALTER TABLE site_builds
  ADD COLUMN IF NOT EXISTS build_status text DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS zip_url text,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Drop updated_at if it was added by the old migration (not in actual schema)
ALTER TABLE site_builds
  DROP COLUMN IF EXISTS updated_at;
