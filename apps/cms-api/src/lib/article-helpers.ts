import type { Article, Category } from '@blog/cms-types';
import { generateId } from '@blog/utils';
import type { Env } from '../index';
import type { ArticleRow } from '../types/rows';
import { getImageUrl } from './image-url';
import { mapRowToCategory } from './mappers';

// Single article tag fetch (for single article endpoints)
export async function getArticleTags(
  db: D1Database,
  articleId: string
): Promise<string[]> {
  const { results } = await db
    .prepare(
      `SELECT t.name FROM tags t
     JOIN article_tags at ON t.id = at.tag_id
     WHERE at.article_id = ?`
    )
    .bind(articleId)
    .all();

  return (results || []).map((r) => r.name as string);
}

// Batch fetch tags for multiple articles (avoids N+1)
export async function getArticleTagsBatch(
  db: D1Database,
  articleIds: string[]
): Promise<Map<string, string[]>> {
  const result = new Map<string, string[]>();

  if (articleIds.length === 0) {
    return result;
  }

  const placeholders = articleIds.map(() => '?').join(',');
  const { results } = await db
    .prepare(
      `SELECT at.article_id, t.name
     FROM article_tags at
     JOIN tags t ON at.tag_id = t.id
     WHERE at.article_id IN (${placeholders})`
    )
    .bind(...articleIds)
    .all();

  // Initialize empty arrays for all article IDs
  for (const id of articleIds) {
    result.set(id, []);
  }

  // Group tags by article
  for (const row of results || []) {
    const articleId = row.article_id as string;
    const tagName = row.name as string;
    result.get(articleId)?.push(tagName);
  }

  return result;
}

// Single article category fetch
export async function getArticleCategory(
  db: D1Database,
  categoryId: string | null
): Promise<Category | null> {
  if (!categoryId) return null;

  const row = await db
    .prepare('SELECT * FROM categories WHERE id = ?')
    .bind(categoryId)
    .first();

  if (!row) return null;

  return mapRowToCategory(row);
}

// Batch fetch categories (avoids N+1)
export async function getCategoriesBatch(
  db: D1Database,
  categoryIds: string[]
): Promise<Map<string, Category>> {
  const result = new Map<string, Category>();

  if (categoryIds.length === 0) {
    return result;
  }

  const placeholders = categoryIds.map(() => '?').join(',');
  const { results } = await db
    .prepare(`SELECT * FROM categories WHERE id IN (${placeholders})`)
    .bind(...categoryIds)
    .all();

  for (const row of results || []) {
    const category = mapRowToCategory(row);
    result.set(category.id, category);
  }

  return result;
}

// Batch fetch header image URLs for multiple articles (avoids N+1)
export async function getHeaderImageUrlsBatch(
  db: D1Database,
  articleIds: string[],
  env: Env
): Promise<Map<string, string | null>> {
  const result = new Map<string, string | null>();

  if (articleIds.length === 0) {
    return result;
  }

  // Initialize all as null
  for (const id of articleIds) {
    result.set(id, null);
  }

  const placeholders = articleIds.map(() => '?').join(',');
  const { results } = await db
    .prepare(
      `SELECT a.id as article_id, i.r2_key
     FROM articles a
     JOIN images i ON a.header_image_id = i.id
     WHERE a.id IN (${placeholders}) AND a.header_image_id IS NOT NULL`
    )
    .bind(...articleIds)
    .all();

  // Build URLs for articles with images
  for (const row of results || []) {
    const articleId = row.article_id as string;
    const r2Key = row.r2_key as string;
    result.set(articleId, getImageUrl(env, r2Key));
  }

  return result;
}

// Optimized tag sync using batch operations
export async function syncArticleTags(
  db: D1Database,
  articleId: string,
  tagNames: string[]
): Promise<void> {
  // Remove existing tags
  await db
    .prepare('DELETE FROM article_tags WHERE article_id = ?')
    .bind(articleId)
    .run();

  if (tagNames.length === 0) {
    return;
  }

  // Batch upsert all tags
  const tagData = tagNames.map((name) => ({
    id: generateId(),
    name,
  }));

  // Use batch for tag upserts
  const tagInsertStatements = tagData.map((tag) =>
    db
      .prepare(
        `INSERT INTO tags (id, name) VALUES (?, ?)
       ON CONFLICT (name) DO NOTHING`
      )
      .bind(tag.id, tag.name)
  );

  await db.batch(tagInsertStatements);

  // Fetch all tag IDs in one query
  const placeholders = tagNames.map(() => '?').join(',');
  const { results: tagResults } = await db
    .prepare(`SELECT id, name FROM tags WHERE name IN (${placeholders})`)
    .bind(...tagNames)
    .all();

  if (!tagResults || tagResults.length === 0) {
    return;
  }

  // Batch insert article_tags relationships
  const articleTagStatements = tagResults.map((tag) =>
    db
      .prepare('INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)')
      .bind(articleId, tag.id as string)
  );

  await db.batch(articleTagStatements);
}

export function mapRowToArticle(
  row: ArticleRow,
  tags: string[],
  headerImageUrl: string | null = null,
  category: Category | null = null
): Article {
  return {
    id: row.id,
    hash: row.hash,
    title: row.title,
    description: row.description,
    content: row.content,
    status: row.status,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags,
    categoryId: row.category_id,
    category,
    headerImageId: row.header_image_id,
    headerImageUrl,
    slideMode: Boolean(row.slide_mode),
    slideDuration: row.slide_duration,
    reviewResult: row.review_result ? JSON.parse(row.review_result) : null,
    reviewUpdatedAt: row.review_updated_at,
  };
}

// Single article header image fetch (for single article endpoints)
export async function getHeaderImageUrl(
  db: D1Database,
  headerImageId: string | null,
  env: Env
): Promise<string | null> {
  if (!headerImageId) return null;

  const image = await db
    .prepare('SELECT r2_key FROM images WHERE id = ?')
    .bind(headerImageId)
    .first<{ r2_key: string }>();

  if (!image) return null;

  return getImageUrl(env, image.r2_key);
}
