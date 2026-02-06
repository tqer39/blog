import { Hono } from 'hono';
import type { Env } from '../../index';
import {
  getArticleCategory,
  getArticleTags,
  getHeaderImageUrl,
  mapRowToArticle,
} from '../../lib/article-helpers';
import { notFound } from '../../lib/errors';

const publishHandler = new Hono<{ Bindings: Env }>();

// Publish article
publishHandler.post('/:hash/publish', async (c) => {
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
publishHandler.post('/:hash/unpublish', async (c) => {
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

export { publishHandler };
