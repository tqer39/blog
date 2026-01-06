import type { Tag, TagInput, TagWithCount } from '@blog/cms-types';
import { generateId, slugify } from '@blog/utils';
import { Hono } from 'hono';
import type { Env } from '../index';

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

// Get single tag by slug
tagsHandler.get('/:slug', async (c) => {
  const slug = c.req.param('slug');

  const row = await c.env.DB.prepare('SELECT * FROM tags WHERE slug = ?')
    .bind(slug)
    .first();

  if (!row) {
    return c.json({ error: 'Tag not found' }, 404);
  }

  return c.json(mapRowToTag(row));
});

// Create tag
tagsHandler.post('/', async (c) => {
  const input = await c.req.json<TagInput>();

  if (!input.name) {
    return c.json({ error: 'Name is required' }, 400);
  }

  const id = generateId();
  const slug = input.slug || slugify(input.name);

  try {
    await c.env.DB.prepare('INSERT INTO tags (id, name, slug) VALUES (?, ?, ?)')
      .bind(id, input.name, slug)
      .run();

    const row = await c.env.DB.prepare('SELECT * FROM tags WHERE id = ?')
      .bind(id)
      .first();

    return c.json(mapRowToTag(row!), 201);
  } catch (error) {
    if (String(error).includes('UNIQUE constraint failed')) {
      return c.json(
        { error: 'Tag with this name or slug already exists' },
        409
      );
    }
    throw error;
  }
});

// Update tag
tagsHandler.put('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const input = await c.req.json<TagInput>();

  if (!input.name) {
    return c.json({ error: 'Name is required' }, 400);
  }

  const existing = await c.env.DB.prepare('SELECT * FROM tags WHERE slug = ?')
    .bind(slug)
    .first();

  if (!existing) {
    return c.json({ error: 'Tag not found' }, 404);
  }

  const newSlug = input.slug || slugify(input.name);

  try {
    await c.env.DB.prepare('UPDATE tags SET name = ?, slug = ? WHERE id = ?')
      .bind(input.name, newSlug, existing.id)
      .run();

    const row = await c.env.DB.prepare('SELECT * FROM tags WHERE id = ?')
      .bind(existing.id)
      .first();

    return c.json(mapRowToTag(row!));
  } catch (error) {
    if (String(error).includes('UNIQUE constraint failed')) {
      return c.json(
        { error: 'Tag with this name or slug already exists' },
        409
      );
    }
    throw error;
  }
});

// Delete tag
tagsHandler.delete('/:slug', async (c) => {
  const slug = c.req.param('slug');

  const result = await c.env.DB.prepare('DELETE FROM tags WHERE slug = ?')
    .bind(slug)
    .run();

  if (result.meta.changes === 0) {
    return c.json({ error: 'Tag not found' }, 404);
  }

  return c.json({ success: true });
});

function mapRowToTag(row: Record<string, unknown>): Tag {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    createdAt: row.created_at as string,
  };
}

function mapRowToTagWithCount(row: Record<string, unknown>): TagWithCount {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    createdAt: row.created_at as string,
    articleCount: (row.article_count as number) || 0,
  };
}
