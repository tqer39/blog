-- Add review result storage to articles
ALTER TABLE articles ADD COLUMN review_result TEXT;
ALTER TABLE articles ADD COLUMN review_updated_at TEXT;
