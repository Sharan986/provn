-- ============================================================
-- Migration: skills.description TEXT → JSONB
-- Run this ONCE on your production database.
-- ============================================================

-- Step 1: Add a temporary JSONB column
ALTER TABLE skills ADD COLUMN IF NOT EXISTS description_jsonb JSONB;

-- Step 2: Migrate existing text data into JSONB format
UPDATE skills
SET description_jsonb = CASE
  WHEN description IS NULL OR description = ''
    THEN '{"type": "text", "content": ""}'::jsonb
  ELSE jsonb_build_object('type', 'text', 'content', description)
END;

-- Step 3: Drop old column and rename
ALTER TABLE skills DROP COLUMN description;
ALTER TABLE skills RENAME COLUMN description_jsonb TO description;
