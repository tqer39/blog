import { Hono } from 'hono';
import type { Env } from '../../index';
import { notFound } from '../../lib/errors';

const deleteHandler = new Hono<{ Bindings: Env }>();

deleteHandler.delete('/:hash', async (c) => {
  const hash = c.req.param('hash');

  const result = await c.env.DB.prepare('DELETE FROM articles WHERE hash = ?')
    .bind(hash)
    .run();

  if (result.meta.changes === 0) {
    notFound('Article not found');
  }

  return c.json({ success: true });
});

export { deleteHandler };
