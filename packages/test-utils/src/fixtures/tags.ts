import type { Tag } from '@blog/cms-types';

/**
 * Sample tag for database row format (snake_case)
 */
export const sampleTagRow = {
  id: 'test-tag-id',
  name: 'javascript',
  created_at: '2024-01-01T00:00:00Z',
};

/**
 * Sample tag for API format
 */
export const sampleTag: Tag = {
  id: 'test-tag-id',
  name: 'javascript',
  createdAt: '2024-01-01T00:00:00Z',
};

/**
 * Collection of sample tags for list testing
 */
export const sampleTags: Tag[] = [
  {
    id: 'tag-1',
    name: 'javascript',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tag-2',
    name: 'typescript',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tag-3',
    name: 'testing',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

/**
 * Create a custom tag with overrides
 */
export function createTag(overrides: Partial<Tag> = {}): Tag {
  return {
    ...sampleTag,
    ...overrides,
  };
}

/**
 * Create multiple tags for list testing
 */
export function createTags(names: string[]): Tag[] {
  return names.map((name, i) => ({
    id: `tag-${i + 1}`,
    name,
    createdAt: '2024-01-01T00:00:00Z',
  }));
}
