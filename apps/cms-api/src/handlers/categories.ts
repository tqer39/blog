import type {
  Category,
  CategoryInput,
  CategoryWithCount,
} from '@blog/cms-types';
import { Hono } from 'hono';
import type { Env } from '../index';
import { createCrudHandlers } from '../lib/crud-factory';
import { validationError } from '../lib/errors';
import {
  type CategoryWithCountRow,
  mapRowToCategory,
  mapRowToCategoryWithCount,
} from '../lib/mappers';
import type { CategoryRow } from '../types/rows';

export const categoriesHandler = new Hono<{ Bindings: Env }>();

const handlers = createCrudHandlers<
  CategoryInput,
  CategoryRow,
  Category,
  CategoryWithCountRow,
  CategoryWithCount
>({
  tableName: 'categories',
  resourceName: 'Category',
  listKey: 'categories',
  listQuery: `
    SELECT c.*, COUNT(a.id) as article_count
    FROM categories c
    LEFT JOIN articles a ON c.id = a.category_id
    GROUP BY c.id
    ORDER BY c.display_order ASC
  `,
  mapListRow: mapRowToCategoryWithCount,
  mapRow: mapRowToCategory,
  validateInput: (input) => {
    const errors: Record<string, string> = {};
    if (!input.name) errors.name = 'Required';
    if (!input.slug) errors.slug = 'Required';
    return Object.keys(errors).length > 0 ? errors : null;
  },
  buildInsert: (id, input) => ({
    sql: 'INSERT INTO categories (id, name, slug, color, display_order) VALUES (?, ?, ?, ?, ?)',
    bindings: [
      id,
      input.name,
      input.slug,
      input.color || '#6B7280',
      input.displayOrder || 0,
    ],
  }),
  buildUpdate: (id, input, existing) => ({
    sql: 'UPDATE categories SET name = ?, slug = ?, color = ?, display_order = ? WHERE id = ?',
    bindings: [
      input.name,
      input.slug,
      input.color || '#6B7280',
      input.displayOrder ?? existing.display_order,
      id,
    ],
  }),
  uniqueConflictMessage: 'Category with this name or slug already exists',
});

// Standard CRUD routes
categoriesHandler.get('/', handlers.list);
categoriesHandler.get('/:id', handlers.getById);
categoriesHandler.post('/', handlers.create);
categoriesHandler.put('/:id', handlers.update);
categoriesHandler.delete('/:id', handlers.delete);

// Custom: Reorder categories (not part of standard CRUD)
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
