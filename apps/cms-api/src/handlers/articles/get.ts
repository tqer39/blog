import { Hono } from 'hono';
import type { Env } from '../../index';
import {
  getArticleCategory,
  getArticleTags,
  getHeaderImageUrl,
  mapRowToArticle,
} from '../../lib/article-helpers';
import { notFound } from '../../lib/errors';

const getHandler = new Hono<{ Bindings: Env }>();

getHandler.get('/:hash', async (c) => {
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

export { getHandler };
