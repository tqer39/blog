-- Add header_image_id column to articles table
ALTER TABLE articles ADD COLUMN header_image_id TEXT REFERENCES images(id) ON DELETE SET NULL;
