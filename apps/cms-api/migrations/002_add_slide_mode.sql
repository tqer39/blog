-- Add slide_mode column to articles table for presentation mode
ALTER TABLE articles ADD COLUMN slide_mode INTEGER NOT NULL DEFAULT 0;
