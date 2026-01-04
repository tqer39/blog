-- Add hash column for unique article URLs
ALTER TABLE articles ADD COLUMN hash TEXT;

-- Create unique index for hash lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_hash ON articles(hash);
