-- Remove slug from articles table (now using hash for identification)
DROP INDEX IF EXISTS idx_articles_slug;
ALTER TABLE articles DROP COLUMN slug;
