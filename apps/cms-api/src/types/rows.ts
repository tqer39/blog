/**
 * Database row type definitions for D1 query results
 * These types represent the raw database columns before mapping to API types
 */

export interface ArticleRow {
  id: string;
  hash: string;
  title: string;
  description: string | null;
  content: string;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
  header_image_id: string | null;
  category_id: string | null;
  review_result: string | null;
  review_updated_at: string | null;
}

export interface TagRow {
  id: string;
  name: string;
  created_at: string;
}

export interface TagWithCountRow extends TagRow {
  article_count: number;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  color: string;
  display_order: number;
  created_at: string;
}

export interface ImageRow {
  id: string;
  r2_key: string;
  filename: string;
  content_type: string;
  size: number;
  created_at: string;
}
