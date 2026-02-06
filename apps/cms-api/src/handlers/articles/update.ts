import type { ArticleInput } from '@blog/cms-types';
import { Hono } from 'hono';
import type { Env } from '../../index';
import {
  getArticleCategory,
  getArticleTags,
  getHeaderImageUrl,
  mapRowToArticle,
  syncArticleTags,
} from '../../lib/article-helpers';
import { notFound } from '../../lib/errors';

const updateHandler = new Hono<{ Bindings: Env }>();

updateHandler.put('/:hash', async (c) => {
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
  if (input.slideDuration !== undefined) {
    updates.push('slide_duration = ?');
    params.push(
      input.slideDuration === null ? null : String(input.slideDuration)
    );
  }
  if (input.status !== undefined) {
    updates.push('status = ?');
    params.push(input.status);
    // published の場合は published_at を設定（未設定の場合のみ）
    if (input.status === 'published' && !existing.published_at) {
      updates.push('published_at = ?');
      params.push(new Date().toISOString());
    }
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

export { updateHandler };
