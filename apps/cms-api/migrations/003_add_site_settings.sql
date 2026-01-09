-- Site settings table for storing configurable site-wide settings
-- Uses key-value format for flexibility in adding new settings
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default values
INSERT INTO site_settings (key, value) VALUES
  ('site_name', 'tB'),
  ('site_description', '未来の自分に向けた技術ログ'),
  ('author_name', 'tqer39'),
  ('footer_text', ''),
  ('social_github', 'https://github.com/tqer39'),
  ('social_twitter', 'https://twitter.com/tqer39'),
  ('social_bento', 'https://bento.me/tqer39')
ON CONFLICT (key) DO NOTHING;

-- Trigger to auto-update updated_at on UPDATE
CREATE TRIGGER IF NOT EXISTS site_settings_updated_at
AFTER UPDATE ON site_settings
BEGIN
  UPDATE site_settings SET updated_at = CURRENT_TIMESTAMP WHERE key = NEW.key;
END;
