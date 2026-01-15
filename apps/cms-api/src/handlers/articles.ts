import type {
  Article,
  ArticleInput,
  ArticleListResponse,
  Category,
} from '@blog/cms-types';
import { generateHash, generateId } from '@blog/utils';
import { Hono } from 'hono';
import type { Env } from '../index';
import {
  notFound,
  throwIfUniqueConstraint,
  validationError,
} from '../lib/errors';
import { getImageUrl } from '../lib/image-url';
import type { ArticleRow, CategoryRow } from '../types/rows';

export const articlesHandler = new Hono<{ Bindings: Env }>();

// List articles
articlesHandler.get('/', async (c) => {
  const status = c.req.query('status');
  const tag = c.req.query('tag');
  const category = c.req.query('category');
  const page = Number.parseInt(c.req.query('page') || '1', 10);
  const perPage = Number.parseInt(c.req.query('perPage') || '10', 10);
  const offset = (page - 1) * perPage;

  let query = `
    SELECT DISTINCT a.*
    FROM articles a
  `;
  const params: (string | number)[] = [];
  const conditions: string[] = [];
  const joins: string[] = [];

  if (tag) {
    joins.push(`
      JOIN article_tags at ON a.id = at.article_id
      JOIN tags t ON at.tag_id = t.id
    `);
    conditions.push('t.name = ?');
    params.push(tag);
  }

  if (category) {
    joins.push('JOIN categories c ON a.category_id = c.id');
    conditions.push('c.slug = ?');
    params.push(category);
  }

  if (status) {
    conditions.push('a.status = ?');
    params.push(status);
  }

  query += joins.join(' ');

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  // Count total
  const countQuery = query.replace(
    'SELECT DISTINCT a.*',
    'SELECT COUNT(DISTINCT a.id) as count'
  );
  const countResult = await c.env.DB.prepare(countQuery)
    .bind(...params)
    .first<{ count: number }>();
  const total = countResult?.count || 0;

  // Get paginated results
  query += ' ORDER BY a.published_at DESC, a.created_at DESC LIMIT ? OFFSET ?';
  params.push(perPage, offset);

  const { results } = await c.env.DB.prepare(query)
    .bind(...params)
    .all();

  if (!results || results.length === 0) {
    return c.json({
      articles: [],
      total,
      page,
      perPage,
    } satisfies ArticleListResponse);
  }

  // Batch fetch tags, categories, and images to avoid N+1
  const articleIds = results.map((row) => row.id as string);
  const categoryIds = [
    ...new Set(
      results
        .map((row) => row.category_id as string | null)
        .filter((id): id is string => id !== null)
    ),
  ];

  const [tagsByArticle, imageUrlsByArticle, categoriesById] = await Promise.all(
    [
      getArticleTagsBatch(c.env.DB, articleIds),
      getHeaderImageUrlsBatch(c.env.DB, articleIds, c.env),
      getCategoriesBatch(c.env.DB, categoryIds),
    ]
  );

  const articles: Article[] = results.map((row) => {
    const id = row.id as string;
    const categoryId = row.category_id as string | null;
    return mapRowToArticle(
      row,
      tagsByArticle.get(id) || [],
      imageUrlsByArticle.get(id) || null,
      categoryId ? categoriesById.get(categoryId) || null : null
    );
  });

  const response: ArticleListResponse = {
    articles,
    total,
    page,
    perPage,
  };

  return c.json(response);
});

// Get single article by hash
articlesHandler.get('/:hash', async (c) => {
  const hash = c.req.param('hash');

  const row = await c.env.DB.prepare('SELECT * FROM articles WHERE hash = ?')
    .bind(hash)
    .first();

  if (!row) {
    notFound('Article not found');
  }

  const [tags, headerImageUrl, category] = await Promise.all([
    getArticleTags(c.env.DB, row.id as string),
    getHeaderImageUrl(c.env.DB, row.header_image_id as string | null, c.env),
    getArticleCategory(c.env.DB, row.category_id as string | null),
  ]);
  const article = mapRowToArticle(row, tags, headerImageUrl, category);

  return c.json(article);
});

// Create article
articlesHandler.post('/', async (c) => {
  const input = await c.req.json<ArticleInput>();

  if (!input.title || !input.content) {
    validationError('Invalid input', {
      ...(input.title ? {} : { title: 'Required' }),
      ...(input.content ? {} : { content: 'Required' }),
    });
  }

  const id = generateId();
  const hash = generateHash();
  const status = input.status || 'draft';
  const publishedAt = status === 'published' ? new Date().toISOString() : null;

  try {
    await c.env.DB.prepare(
      `INSERT INTO articles (id, hash, title, description, content, status, published_at, header_image_id, category_id, slide_mode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        hash,
        input.title,
        input.description || null,
        input.content,
        status,
        publishedAt,
        input.headerImageId || null,
        input.categoryId || null,
        input.slideMode ? 1 : 0
      )
      .run();

    // Handle tags
    if (input.tags && input.tags.length > 0) {
      await syncArticleTags(c.env.DB, id, input.tags);
    }

    const row = await c.env.DB.prepare('SELECT * FROM articles WHERE id = ?')
      .bind(id)
      .first();
    const [tags, headerImageUrl, category] = await Promise.all([
      getArticleTags(c.env.DB, id),
      getHeaderImageUrl(c.env.DB, input.headerImageId || null, c.env),
      getArticleCategory(c.env.DB, input.categoryId || null),
    ]);

    return c.json(mapRowToArticle(row!, tags, headerImageUrl, category), 201);
  } catch (error) {
    throwIfUniqueConstraint(error, 'Article with this hash already exists');
  }
});

// Update article
articlesHandler.put('/:hash', async (c) => {
  const hash = c.req.param('hash');
  const input = await c.req.json<Partial<ArticleInput>>();

  const existing = await c.env.DB.prepare(
    'SELECT * FROM articles WHERE hash = ?'
  )
    .bind(hash)
    .first();

  if (!existing) {
    notFound('Article not found');
  }

  const updates: string[] = [];
  const params: (string | null)[] = [];

  // Track if content changed to clear review results
  let contentChanged = false;

  if (input.title !== undefined) {
    updates.push('title = ?');
    params.push(input.title);
    if (input.title !== existing.title) {
      contentChanged = true;
    }
  }
  if (input.description !== undefined) {
    updates.push('description = ?');
    params.push(input.description || null);
  }
  if (input.content !== undefined) {
    updates.push('content = ?');
    params.push(input.content);
    if (input.content !== existing.content) {
      contentChanged = true;
    }
  }
  if (input.headerImageId !== undefined) {
    updates.push('header_image_id = ?');
    params.push(input.headerImageId || null);
  }
  if (input.categoryId !== undefined) {
    updates.push('category_id = ?');
    params.push(input.categoryId || null);
  }
  if (input.slideMode !== undefined) {
    updates.push('slide_mode = ?');
    params.push(input.slideMode ? '1' : '0');
  }

  // Clear review results if title or content changed
  if (contentChanged) {
    updates.push('review_result = ?');
    params.push(null);
    updates.push('review_updated_at = ?');
    params.push(null);
  }

  if (updates.length > 0) {
    params.push(existing.id as string);
    await c.env.DB.prepare(
      `UPDATE articles SET ${updates.join(', ')} WHERE id = ?`
    )
      .bind(...params)
      .run();
  }

  if (input.tags !== undefined) {
    await syncArticleTags(c.env.DB, existing.id as string, input.tags);
  }

  const row = await c.env.DB.prepare('SELECT * FROM articles WHERE hash = ?')
    .bind(hash)
    .first();
  const [tags, headerImageUrl, category] = await Promise.all([
    getArticleTags(c.env.DB, row!.id as string),
    getHeaderImageUrl(c.env.DB, row!.header_image_id as string | null, c.env),
    getArticleCategory(c.env.DB, row!.category_id as string | null),
  ]);

  return c.json(mapRowToArticle(row!, tags, headerImageUrl, category));
});

// Delete article
articlesHandler.delete('/:hash', async (c) => {
  const hash = c.req.param('hash');

  const result = await c.env.DB.prepare('DELETE FROM articles WHERE hash = ?')
    .bind(hash)
    .run();

  if (result.meta.changes === 0) {
    notFound('Article not found');
  }

  return c.json({ success: true });
});

// Publish article
articlesHandler.post('/:hash/publish', async (c) => {
  const hash = c.req.param('hash');

  const result = await c.env.DB.prepare(
    `UPDATE articles SET status = 'published', published_at = ? WHERE hash = ?`
  )
    .bind(new Date().toISOString(), hash)
    .run();

  if (result.meta.changes === 0) {
    notFound('Article not found');
  }

  const row = await c.env.DB.prepare('SELECT * FROM articles WHERE hash = ?')
    .bind(hash)
    .first();
  const [tags, headerImageUrl, category] = await Promise.all([
    getArticleTags(c.env.DB, row!.id as string),
    getHeaderImageUrl(c.env.DB, row!.header_image_id as string | null, c.env),
    getArticleCategory(c.env.DB, row!.category_id as string | null),
  ]);

  return c.json(mapRowToArticle(row!, tags, headerImageUrl, category));
});

// Unpublish article
articlesHandler.post('/:hash/unpublish', async (c) => {
  const hash = c.req.param('hash');

  const result = await c.env.DB.prepare(
    `UPDATE articles SET status = 'draft' WHERE hash = ?`
  )
    .bind(hash)
    .run();

  if (result.meta.changes === 0) {
    notFound('Article not found');
  }

  const row = await c.env.DB.prepare('SELECT * FROM articles WHERE hash = ?')
    .bind(hash)
    .first();
  const [tags, headerImageUrl, category] = await Promise.all([
    getArticleTags(c.env.DB, row!.id as string),
    getHeaderImageUrl(c.env.DB, row!.header_image_id as string | null, c.env),
    getArticleCategory(c.env.DB, row!.category_id as string | null),
  ]);

  return c.json(mapRowToArticle(row!, tags, headerImageUrl, category));
});

// Helper functions

// Single article tag fetch (for single article endpoints)
async function getArticleTags(
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
async function getArticleTagsBatch(
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
async function getArticleCategory(
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
async function getCategoriesBatch(
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

function mapRowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    color: row.color,
    displayOrder: row.display_order,
    createdAt: row.created_at,
  };
}

// Batch fetch header image URLs for multiple articles (avoids N+1)
async function getHeaderImageUrlsBatch(
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
async function syncArticleTags(
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

function mapRowToArticle(
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
    reviewResult: row.review_result ? JSON.parse(row.review_result) : null,
    reviewUpdatedAt: row.review_updated_at,
  };
}

// Single article header image fetch (for single article endpoints)
async function getHeaderImageUrl(
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
