-- Categories table (master data)
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7280',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  hash TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  header_image_id TEXT REFERENCES images(id) ON DELETE SET NULL,
  review_result TEXT,
  review_updated_at TEXT,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_hash ON articles(hash);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Article-Tags junction table
CREATE TABLE IF NOT EXISTS article_tags (
  article_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (article_id, tag_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_article_tags_article ON article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_tag ON article_tags(tag_id);

-- Images table
CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY,
  article_id TEXT,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  r2_key TEXT UNIQUE NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  alt_text TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_images_article ON images(article_id);
CREATE INDEX IF NOT EXISTS idx_images_r2_key ON images(r2_key);

-- Site settings table for storing configurable site-wide settings
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default site settings
INSERT INTO site_settings (key, value) VALUES
  ('site_name', 'tqer39''s blog'),
  ('site_description', '未来の自分に向けた技術ログ'),
  ('author_name', 'tqer39'),
  ('footer_text', ''),
  ('social_github', 'https://github.com/tqer39'),
  ('social_twitter', 'https://twitter.com/tqer39'),
  ('social_bento', 'https://bento.me/tqer39'),
  ('show_rss_link', 'true')
ON CONFLICT (key) DO NOTHING;

-- Trigger to update updated_at on articles
CREATE TRIGGER IF NOT EXISTS articles_updated_at
AFTER UPDATE ON articles
BEGIN
  UPDATE articles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger to auto-update updated_at on site_settings
CREATE TRIGGER IF NOT EXISTS site_settings_updated_at
AFTER UPDATE ON site_settings
BEGIN
  UPDATE site_settings SET updated_at = CURRENT_TIMESTAMP WHERE key = NEW.key;
END;
