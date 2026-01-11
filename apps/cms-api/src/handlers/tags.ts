import type { Tag, TagInput, TagWithCount } from '@blog/cms-types';
import { generateId } from '@blog/utils';
import { Hono } from 'hono';
import type { Env } from '../index';
import {
  notFound,
  throwIfUniqueConstraint,
  validationError,
} from '../lib/errors';
import type { TagRow, TagWithCountRow } from '../types/rows';

export const tagsHandler = new Hono<{ Bindings: Env }>();

// List all tags with article count
tagsHandler.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT t.*, COUNT(at.article_id) as article_count
     FROM tags t
     LEFT JOIN article_tags at ON t.id = at.tag_id
     GROUP BY t.id
     ORDER BY t.name ASC`
  ).all();

  const tags: TagWithCount[] = (results || []).map(mapRowToTagWithCount);

  return c.json({ tags });
});

// Get single tag by id
tagsHandler.get('/:id', async (c) => {
  const id = c.req.param('id');

  const row = await c.env.DB.prepare('SELECT * FROM tags WHERE id = ?')
    .bind(id)
    .first();

  if (!row) {
    notFound('Tag not found');
  }

  return c.json(mapRowToTag(row));
});

// Create tag
tagsHandler.post('/', async (c) => {
  const input = await c.req.json<TagInput>();

  if (!input.name) {
    validationError('Invalid input', { name: 'Required' });
  }

  const id = generateId();

  try {
    await c.env.DB.prepare('INSERT INTO tags (id, name) VALUES (?, ?)')
      .bind(id, input.name)
      .run();

    const row = await c.env.DB.prepare('SELECT * FROM tags WHERE id = ?')
      .bind(id)
      .first();

    return c.json(mapRowToTag(row!), 201);
  } catch (error) {
    throwIfUniqueConstraint(error, 'Tag with this name already exists');
  }
});

// Update tag
tagsHandler.put('/:id', async (c) => {
  const id = c.req.param('id');
  const input = await c.req.json<TagInput>();

  if (!input.name) {
    validationError('Invalid input', { name: 'Required' });
  }

  const existing = await c.env.DB.prepare('SELECT * FROM tags WHERE id = ?')
    .bind(id)
    .first();

  if (!existing) {
    notFound('Tag not found');
  }

  try {
    await c.env.DB.prepare('UPDATE tags SET name = ? WHERE id = ?')
      .bind(input.name, id)
      .run();

    const row = await c.env.DB.prepare('SELECT * FROM tags WHERE id = ?')
      .bind(id)
      .first();

    return c.json(mapRowToTag(row!));
  } catch (error) {
    throwIfUniqueConstraint(error, 'Tag with this name already exists');
  }
});

// Delete tag
tagsHandler.delete('/:id', async (c) => {
  const id = c.req.param('id');

  const result = await c.env.DB.prepare('DELETE FROM tags WHERE id = ?')
    .bind(id)
    .run();

  if (result.meta.changes === 0) {
    notFound('Tag not found');
  }

  return c.json({ success: true });
});

function mapRowToTag(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  };
}

function mapRowToTagWithCount(row: TagWithCountRow): TagWithCount {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    articleCount: row.article_count || 0,
  };
}
