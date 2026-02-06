import type { Article, ArticleListResponse } from '@blog/cms-types';
import { Hono } from 'hono';
import type { Env } from '../../index';
import {
  getArticleTagsBatch,
  getCategoriesBatch,
  getHeaderImageUrlsBatch,
  mapRowToArticle,
} from '../../lib/article-helpers';

const listHandler = new Hono<{ Bindings: Env }>();

listHandler.get('/', async (c) => {
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

export { listHandler };
