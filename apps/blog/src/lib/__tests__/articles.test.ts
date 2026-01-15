import type { Article, Tag } from '@blog/cms-types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getAllArticles,
  getAllTags,
  getArticleByHash,
  getArticlesByTag,
} from '../articles';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

const sampleArticle: Article = {
  id: 'article-1',
  hash: 'testhash123',
  title: 'Test Article',
  description: 'A test article description',
  content: '# Test Content',
  status: 'published',
  tags: ['javascript', 'testing'],
  categoryId: null,
  category: null,
  publishedAt: '2024-01-15T00:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
  headerImageId: null,
  headerImageUrl: null,
  slideMode: false,
  slideDuration: null,
};

const sampleArticle2: Article = {
  id: 'article-2',
  hash: 'anotherhash456',
  title: 'Another Article',
  description: 'Another article description',
  content: '# Another Content',
  status: 'published',
  tags: ['typescript'],
  categoryId: null,
  category: null,
  publishedAt: '2024-01-10T00:00:00Z',
  createdAt: '2024-01-05T00:00:00Z',
  updatedAt: '2024-01-10T00:00:00Z',
  headerImageId: null,
  headerImageUrl: null,
  slideMode: false,
  slideDuration: null,
};

const sampleTags: Tag[] = [
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

describe('articles', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('getAllArticles', () => {
    it('should fetch and return all published articles sorted by date', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            articles: [sampleArticle2, sampleArticle], // Unsorted
            total: 2,
            page: 1,
            perPage: 1000,
          }),
      });

      const result = await getAllArticles();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/articles?status=published&perPage=1000'),
        expect.any(Object)
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toHaveLength(2);
        // Should be sorted by publishedAt descending
        expect(result.data[0].hash).toBe('testhash123'); // 2024-01-15
        expect(result.data[1].hash).toBe('anotherhash456'); // 2024-01-10
      }
    });

    it('should return error result on API error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const result = await getAllArticles();

      expect(result.ok).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should return error result on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const result = await getAllArticles();

      expect(result.ok).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should fallback to createdAt when publishedAt is missing', async () => {
      const articleWithoutPublishedAt = { ...sampleArticle, publishedAt: null };
      const articleWithPublishedAt = sampleArticle2;

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            articles: [articleWithoutPublishedAt, articleWithPublishedAt],
            total: 2,
            page: 1,
            perPage: 1000,
          }),
      });

      const result = await getAllArticles();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toHaveLength(2);
        // articleWithPublishedAt has publishedAt: 2024-01-10
        // articleWithoutPublishedAt falls back to createdAt: 2024-01-01
        expect(result.data[0].hash).toBe('anotherhash456');
        expect(result.data[1].hash).toBe('testhash123');
      }
    });
  });

  describe('getArticleByHash', () => {
    it('should fetch and return a single article', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(sampleArticle),
      });

      const result = await getArticleByHash('testhash123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/articles/testhash123'),
        expect.any(Object)
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toEqual(sampleArticle);
      }
    });

    it('should return ok with null when article not found (404)', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'HTTP 404' }),
      });

      const result = await getArticleByHash('nonexistent');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toBeNull();
      }
    });

    it('should return error result on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const result = await getArticleByHash('testhash123');

      expect(result.ok).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('getAllTags', () => {
    it('should fetch and return sorted tag names', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(sampleTags),
      });

      const result = await getAllTags();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tags'),
        expect.any(Object)
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toEqual(['javascript', 'testing', 'typescript']);
      }
    });

    it('should return error result on error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const result = await getAllTags();

      expect(result.ok).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('getArticlesByTag', () => {
    it('should fetch articles filtered by tag', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            articles: [sampleArticle],
            total: 1,
            page: 1,
            perPage: 1000,
          }),
      });

      const result = await getArticlesByTag('javascript');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          '/articles?status=published&tag=javascript&perPage=1000'
        ),
        expect.any(Object)
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].hash).toBe('testhash123');
      }
    });

    it('should URL encode special characters in tag name', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            articles: [],
            total: 0,
            page: 1,
            perPage: 1000,
          }),
      });

      await getArticlesByTag('C++');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3101/v1/articles?status=published&tag=C%2B%2B&perPage=1000',
        expect.any(Object)
      );
    });

    it('should return error result on error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const result = await getArticlesByTag('javascript');

      expect(result.ok).toBe(false);
      consoleSpy.mockRestore();
    });

    it('should sort articles by date descending', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            articles: [sampleArticle2, sampleArticle],
            total: 2,
            page: 1,
            perPage: 1000,
          }),
      });

      const result = await getArticlesByTag('javascript');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data[0].hash).toBe('testhash123');
        expect(result.data[1].hash).toBe('anotherhash456');
      }
    });
  });
});
