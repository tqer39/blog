import type {
  Category,
  CategoryInput,
  CategoryWithCount,
} from '@blog/cms-types';
import { generateId } from '@blog/utils';
import { Hono } from 'hono';
import type { Env } from '../index';
import { conflict, notFound, validationError } from '../lib/errors';

export const categoriesHandler = new Hono<{ Bindings: Env }>();

// List all categories with article count
categoriesHandler.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT c.*, COUNT(a.id) as article_count
     FROM categories c
     LEFT JOIN articles a ON c.id = a.category_id
     GROUP BY c.id
     ORDER BY c.display_order ASC`
  ).all();

  const categories: CategoryWithCount[] = (results || []).map(
    mapRowToCategoryWithCount
  );

  return c.json({ categories });
});

// Get single category by id
categoriesHandler.get('/:id', async (c) => {
  const id = c.req.param('id');

  const row = await c.env.DB.prepare('SELECT * FROM categories WHERE id = ?')
    .bind(id)
    .first();

  if (!row) {
    notFound('Category not found');
  }

  return c.json(mapRowToCategory(row));
});

// Create category
categoriesHandler.post('/', async (c) => {
  const input = await c.req.json<CategoryInput>();

  if (!input.name || !input.slug) {
    validationError('Invalid input', {
      ...(input.name ? {} : { name: 'Required' }),
      ...(input.slug ? {} : { slug: 'Required' }),
    });
  }

  const id = generateId();

  try {
    await c.env.DB.prepare(
      'INSERT INTO categories (id, name, slug, color, display_order) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(
        id,
        input.name,
        input.slug,
        input.color || '#6B7280',
        input.displayOrder || 0
      )
      .run();

    const row = await c.env.DB.prepare('SELECT * FROM categories WHERE id = ?')
      .bind(id)
      .first();

    return c.json(mapRowToCategory(row!), 201);
  } catch (error) {
    if (String(error).includes('UNIQUE constraint failed')) {
      conflict('Category with this name or slug already exists');
    }
    throw error;
  }
});

// Update category
categoriesHandler.put('/:id', async (c) => {
  const id = c.req.param('id');
  const input = await c.req.json<CategoryInput>();

  if (!input.name || !input.slug) {
    validationError('Invalid input', {
      ...(input.name ? {} : { name: 'Required' }),
      ...(input.slug ? {} : { slug: 'Required' }),
    });
  }

  const existing = await c.env.DB.prepare(
    'SELECT * FROM categories WHERE id = ?'
  )
    .bind(id)
    .first();

  if (!existing) {
    notFound('Category not found');
  }

  try {
    await c.env.DB.prepare(
      'UPDATE categories SET name = ?, slug = ?, color = ?, display_order = ? WHERE id = ?'
    )
      .bind(
        input.name,
        input.slug,
        input.color || '#6B7280',
        input.displayOrder ?? (existing.display_order as number),
        id
      )
      .run();

    const row = await c.env.DB.prepare('SELECT * FROM categories WHERE id = ?')
      .bind(id)
      .first();

    return c.json(mapRowToCategory(row!));
  } catch (error) {
    if (String(error).includes('UNIQUE constraint failed')) {
      conflict('Category with this name or slug already exists');
    }
    throw error;
  }
});

// Reorder categories
categoriesHandler.patch('/reorder', async (c) => {
  const { orderedIds } = await c.req.json<{ orderedIds: string[] }>();

  if (!orderedIds || !Array.isArray(orderedIds)) {
    validationError('Invalid input', { orderedIds: 'Required array of IDs' });
  }

  const statements = orderedIds.map((id, index) =>
    c.env.DB.prepare(
      'UPDATE categories SET display_order = ? WHERE id = ?'
    ).bind(index, id)
  );

  await c.env.DB.batch(statements);

  return c.json({ success: true });
});

// Delete category
categoriesHandler.delete('/:id', async (c) => {
  const id = c.req.param('id');

  const result = await c.env.DB.prepare('DELETE FROM categories WHERE id = ?')
    .bind(id)
    .run();

  if (result.meta.changes === 0) {
    notFound('Category not found');
  }

  return c.json({ success: true });
});

function mapRowToCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    color: row.color as string,
    displayOrder: row.display_order as number,
    createdAt: row.created_at as string,
  };
}

function mapRowToCategoryWithCount(
  row: Record<string, unknown>
): CategoryWithCount {
  return {
    ...mapRowToCategory(row),
    articleCount: (row.article_count as number) || 0,
  };
}
