import type { Article } from '@blog/cms-types';

/**
 * Sample article for database row format (snake_case)
 */
export const sampleArticleRow = {
  id: 'test-article-id',
  hash: 'testhash123',
  title: 'Test Article',
  description: 'A test article description',
  content: '# Test Content\n\nThis is a test article.',
  status: 'published',
  published_at: '2024-01-15T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
  header_image_id: null,
};

/**
 * Sample article for API format (camelCase)
 */
export const sampleArticle: Article = {
  id: 'test-article-id',
  hash: 'testhash123',
  title: 'Test Article',
  description: 'A test article description',
  content: '# Test Content\n\nThis is a test article.',
  status: 'published',
  tags: ['javascript', 'testing'],
  publishedAt: '2024-01-15T00:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
  headerImageId: null,
  headerImageUrl: null,
};

/**
 * Second sample article for list testing
 */
export const sampleArticle2: Article = {
  id: 'test-article-id-2',
  hash: 'anotherhash456',
  title: 'Another Test Article',
  description: 'Another test article description',
  content: '# Another Content',
  status: 'published',
  tags: ['typescript'],
  publishedAt: '2024-01-10T00:00:00Z',
  createdAt: '2024-01-05T00:00:00Z',
  updatedAt: '2024-01-10T00:00:00Z',
  headerImageId: null,
  headerImageUrl: null,
};

/**
 * Draft article for status testing
 */
export const sampleDraftArticle: Article = {
  id: 'draft-article-id',
  hash: 'testhash789',
  title: 'Draft Article',
  description: 'A draft article',
  content: '# Draft Content',
  status: 'draft',
  tags: [],
  publishedAt: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  headerImageId: null,
  headerImageUrl: null,
};

/**
 * Create a custom article with overrides
 */
export function createArticle(overrides: Partial<Article> = {}): Article {
  return {
    ...sampleArticle,
    ...overrides,
  };
}

/**
 * Create multiple articles for list testing
 */
export function createArticles(count: number): Article[] {
  return Array.from({ length: count }, (_, i) => ({
    ...sampleArticle,
    id: `article-${i + 1}`,
    hash: `hash${i + 1}`,
    title: `Article ${i + 1}`,
  }));
}
