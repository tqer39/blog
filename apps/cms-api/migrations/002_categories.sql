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

-- Add category_id to articles (nullable for existing articles)
ALTER TABLE articles ADD COLUMN category_id TEXT REFERENCES categories(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);

-- Seed initial categories (matching existing ArticleCategory type)
INSERT INTO categories (id, name, slug, color, display_order) VALUES
  ('cat_tech', 'Tech', 'tech', '#3B82F6', 1),
  ('cat_life', 'Life', 'life', '#10B981', 2),
  ('cat_books', 'Books', 'books', '#F59E0B', 3);
