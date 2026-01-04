-- SQLite doesn't support DROP COLUMN for UNIQUE columns
-- Use table recreation pattern

-- 1. Create new table without slug
CREATE TABLE articles_new (
  id TEXT PRIMARY KEY,
  hash TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  header_image_id TEXT REFERENCES images(id) ON DELETE SET NULL
);

-- 2. Copy data (excluding slug)
INSERT INTO articles_new (id, hash, title, description, content, status, published_at, created_at, updated_at, header_image_id)
SELECT id, hash, title, description, content, status, published_at, created_at, updated_at, header_image_id
FROM articles;

-- 3. Drop old table (cascades indexes and triggers)
DROP TABLE articles;

-- 4. Rename new table
ALTER TABLE articles_new RENAME TO articles;

-- 5. Recreate indexes
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE UNIQUE INDEX idx_articles_hash ON articles(hash);

-- 6. Recreate trigger
CREATE TRIGGER articles_updated_at
AFTER UPDATE ON articles
BEGIN
  UPDATE articles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
