import type { ArticleInput } from '@blog/cms-types';
import { generateHash, generateId } from '@blog/utils';
import { Hono } from 'hono';
import type { Env } from '../../index';
import {
  getArticleCategory,
  getArticleTags,
  getHeaderImageUrl,
  mapRowToArticle,
  syncArticleTags,
} from '../../lib/article-helpers';
import { throwIfUniqueConstraint, validationError } from '../../lib/errors';

const createHandler = new Hono<{ Bindings: Env }>();

createHandler.post('/', async (c) => {
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
      `INSERT INTO articles (id, hash, title, description, content, status, published_at, header_image_id, category_id, slide_mode, slide_duration)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
        input.slideMode ? 1 : 0,
        input.slideDuration ?? null
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

export { createHandler };
