-- Add slide_duration column for timer feature in slide mode
-- Stores duration in seconds, NULL means use default (180 seconds = 3 minutes)
ALTER TABLE articles ADD COLUMN slide_duration INTEGER DEFAULT NULL;
