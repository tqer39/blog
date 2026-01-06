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
  publishedAt: '2024-01-15T00:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
  headerImageId: null,
  headerImageUrl: null,
};

const sampleArticle2: Article = {
  id: 'article-2',
  hash: 'anotherhash456',
  title: 'Another Article',
  description: 'Another article description',
  content: '# Another Content',
  status: 'published',
  tags: ['typescript'],
  publishedAt: '2024-01-10T00:00:00Z',
  createdAt: '2024-01-05T00:00:00Z',
  updatedAt: '2024-01-10T00:00:00Z',
  headerImageId: null,
  headerImageUrl: null,
};

const sampleTags: Tag[] = [
  {
    id: 'tag-1',
    name: 'javascript',
    slug: 'javascript',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tag-2',
    name: 'typescript',
    slug: 'typescript',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tag-3',
    name: 'testing',
    slug: 'testing',
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

      const articles = await getAllArticles();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/articles?status=published&perPage=1000'),
        expect.any(Object)
      );
      expect(articles).toHaveLength(2);
      // Should be sorted by publishedAt descending
      expect(articles[0].hash).toBe('testhash123'); // 2024-01-15
      expect(articles[1].hash).toBe('anotherhash456'); // 2024-01-10
    });

    it('should return empty array on API error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const articles = await getAllArticles();

      expect(articles).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should return empty array on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const articles = await getAllArticles();

      expect(articles).toEqual([]);
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

      const articles = await getAllArticles();

      expect(articles).toHaveLength(2);
      // articleWithPublishedAt has publishedAt: 2024-01-10
      // articleWithoutPublishedAt falls back to createdAt: 2024-01-01
      expect(articles[0].hash).toBe('anotherhash456');
      expect(articles[1].hash).toBe('testhash123');
    });
  });

  describe('getArticleByHash', () => {
    it('should fetch and return a single article', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(sampleArticle),
      });

      const article = await getArticleByHash('testhash123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/articles/testhash123'),
        expect.any(Object)
      );
      expect(article).toEqual(sampleArticle);
    });

    it('should return null when article not found', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const article = await getArticleByHash('nonexistent');

      expect(article).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should return null on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const article = await getArticleByHash('testhash123');

      expect(article).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe('getAllTags', () => {
    it('should fetch and return sorted tag names', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(sampleTags),
      });

      const tags = await getAllTags();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tags'),
        expect.any(Object)
      );
      expect(tags).toEqual(['javascript', 'testing', 'typescript']);
    });

    it('should return empty array on error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const tags = await getAllTags();

      expect(tags).toEqual([]);
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

      const articles = await getArticlesByTag('javascript');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          '/articles?status=published&tag=javascript&perPage=1000'
        ),
        expect.any(Object)
      );
      expect(articles).toHaveLength(1);
      expect(articles[0].hash).toBe('testhash123');
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
        'http://localhost:8787/v1/articles?status=published&tag=C%2B%2B&perPage=1000',
        expect.any(Object)
      );
    });

    it('should return empty array on error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const articles = await getArticlesByTag('javascript');

      expect(articles).toEqual([]);
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

      const articles = await getArticlesByTag('javascript');

      expect(articles[0].hash).toBe('testhash123');
      expect(articles[1].hash).toBe('anotherhash456');
    });
  });
});
