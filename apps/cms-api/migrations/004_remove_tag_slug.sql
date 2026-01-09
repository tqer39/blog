-- Remove slug column from tags table
-- SQLite does not support DROP COLUMN in older versions, so we recreate the table

-- Drop the slug index
DROP INDEX IF EXISTS idx_tags_slug;

-- Create new table without slug column
CREATE TABLE IF NOT EXISTS tags_new (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from old table (excluding slug)
INSERT INTO tags_new (id, name, created_at)
SELECT id, name, created_at FROM tags;

-- Drop old table
DROP TABLE tags;

-- Rename new table to tags
ALTER TABLE tags_new RENAME TO tags;
