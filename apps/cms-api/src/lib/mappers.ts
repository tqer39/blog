/**
 * Shared mapper functions for converting database rows to API types.
 * These mappers handle the transformation from snake_case DB columns to camelCase API types.
 */
import type {
  Category,
  CategoryWithCount,
  Tag,
  TagWithCount,
} from '@blog/cms-types';
import type { CategoryRow, TagRow, TagWithCountRow } from '../types/rows';

// ===========================================
// Tag Mappers
// ===========================================

/**
 * Map a database tag row to a Tag API type.
 */
export function mapRowToTag(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  };
}

/**
 * Map a database tag row with count to a TagWithCount API type.
 */
export function mapRowToTagWithCount(row: TagWithCountRow): TagWithCount {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    articleCount: row.article_count || 0,
  };
}

// ===========================================
// Category Mappers
// ===========================================

/**
 * Row type for category with article count (extends CategoryRow)
 */
export interface CategoryWithCountRow extends CategoryRow {
  article_count: number;
}

/**
 * Map a database category row to a Category API type.
 */
export function mapRowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    color: row.color,
    displayOrder: row.display_order,
    createdAt: row.created_at,
  };
}

/**
 * Map a database category row with count to a CategoryWithCount API type.
 */
export function mapRowToCategoryWithCount(
  row: CategoryWithCountRow
): CategoryWithCount {
  return {
    ...mapRowToCategory(row),
    articleCount: row.article_count || 0,
  };
}
