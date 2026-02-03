import type { Tag, TagInput, TagWithCount } from '@blog/cms-types';
import { Hono } from 'hono';
import type { Env } from '../index';
import { createCrudHandlers } from '../lib/crud-factory';
import { mapRowToTag, mapRowToTagWithCount } from '../lib/mappers';
import type { TagRow, TagWithCountRow } from '../types/rows';

export const tagsHandler = new Hono<{ Bindings: Env }>();

const handlers = createCrudHandlers<
  TagInput,
  TagRow,
  Tag,
  TagWithCountRow,
  TagWithCount
>({
  tableName: 'tags',
  resourceName: 'Tag',
  listKey: 'tags',
  listQuery: `
    SELECT t.*, COUNT(at.article_id) as article_count
    FROM tags t
    LEFT JOIN article_tags at ON t.id = at.tag_id
    GROUP BY t.id
    ORDER BY t.name ASC
  `,
  mapListRow: mapRowToTagWithCount,
  mapRow: mapRowToTag,
  validateInput: (input) => (input.name ? null : { name: 'Required' }),
  buildInsert: (id, input) => ({
    sql: 'INSERT INTO tags (id, name) VALUES (?, ?)',
    bindings: [id, input.name],
  }),
  buildUpdate: (id, input) => ({
    sql: 'UPDATE tags SET name = ? WHERE id = ?',
    bindings: [input.name, id],
  }),
  uniqueConflictMessage: 'Tag with this name already exists',
});

tagsHandler.get('/', handlers.list);
tagsHandler.get('/:id', handlers.getById);
tagsHandler.post('/', handlers.create);
tagsHandler.put('/:id', handlers.update);
tagsHandler.delete('/:id', handlers.delete);
