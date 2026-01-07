import type { Article, Tag } from '@blog/cms-types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createArticle,
  createTag,
  deleteArticle,
  deleteImage,
  deleteTag,
  getArticle,
  getArticles,
  getTags,
  publishArticle,
  reviewArticle,
  suggestContinuation,
  unpublishArticle,
  updateArticle,
  uploadImage,
} from '../client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

const sampleArticle: Article = {
  id: 'article-1',
  slug: 'test-article',
  title: 'Test Article',
  description: 'A test article',
  content: '# Test Content',
  status: 'published',
  tags: ['javascript'],
  publishedAt: '2024-01-15T00:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
};

const sampleTag: Tag = {
  id: 'tag-1',
  name: 'JavaScript',
  slug: 'javascript',
  createdAt: '2024-01-01T00:00:00Z',
};

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('Articles', () => {
    describe('getArticles', () => {
      it('should fetch articles without params', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: () =>
            Promise.resolve({
              articles: [sampleArticle],
              total: 1,
              page: 1,
              perPage: 10,
            }),
        });

        const result = await getArticles();

        expect(mockFetch).toHaveBeenCalledWith('/api/articles', {
          headers: {},
        });
        expect(result.articles).toHaveLength(1);
      });

      it('should fetch articles with params', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: () =>
            Promise.resolve({
              articles: [],
              total: 0,
              page: 2,
              perPage: 20,
            }),
        });

        await getArticles({
          status: 'draft',
          tag: 'javascript',
          page: 2,
          perPage: 20,
        });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('status=draft'),
          expect.any(Object)
        );
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('tag=javascript'),
          expect.any(Object)
        );
      });
    });

    describe('getArticle', () => {
      it('should fetch a single article', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(sampleArticle),
        });

        const result = await getArticle('test-article');

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/articles/test-article'),
          expect.any(Object)
        );
        expect(result.title).toBe('Test Article');
      });

      it('should throw error when article not found', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 404,
          json: () =>
            Promise.resolve({
              error: { code: 'NOT_FOUND', message: 'Article not found' },
            }),
        });

        await expect(getArticle('nonexistent')).rejects.toThrow(
          'Article not found'
        );
      });
    });

    describe('createArticle', () => {
      it('should create an article', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(sampleArticle),
        });

        const result = await createArticle({
          title: 'Test Article',
          content: '# Test Content',
        });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/articles'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          })
        );
        expect(result.title).toBe('Test Article');
      });
    });

    describe('updateArticle', () => {
      it('should update an article', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: () =>
            Promise.resolve({ ...sampleArticle, title: 'Updated Title' }),
        });

        const result = await updateArticle('test-article', {
          title: 'Updated Title',
        });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/articles/test-article'),
          expect.objectContaining({ method: 'PUT' })
        );
        expect(result.title).toBe('Updated Title');
      });
    });

    describe('deleteArticle', () => {
      it('should delete an article', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

        await deleteArticle('test-article');

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/articles/test-article'),
          expect.objectContaining({ method: 'DELETE' })
        );
      });
    });

    describe('publishArticle', () => {
      it('should publish an article', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: () =>
            Promise.resolve({ ...sampleArticle, status: 'published' }),
        });

        const result = await publishArticle('test-article');

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/articles/test-article/publish'),
          expect.objectContaining({ method: 'POST' })
        );
        expect(result.status).toBe('published');
      });
    });

    describe('unpublishArticle', () => {
      it('should unpublish an article', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ ...sampleArticle, status: 'draft' }),
        });

        const result = await unpublishArticle('test-article');

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/articles/test-article/unpublish'),
          expect.objectContaining({ method: 'POST' })
        );
        expect(result.status).toBe('draft');
      });
    });
  });

  describe('Tags', () => {
    describe('getTags', () => {
      it('should fetch all tags', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ tags: [sampleTag] }),
        });

        const result = await getTags();

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/tags'),
          expect.any(Object)
        );
        expect(result.tags).toHaveLength(1);
      });
    });

    describe('createTag', () => {
      it('should create a tag', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(sampleTag),
        });

        const result = await createTag({ name: 'JavaScript' });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/tags'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          })
        );
        expect(result.name).toBe('JavaScript');
      });
    });

    describe('deleteTag', () => {
      it('should delete a tag', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

        await deleteTag('javascript');

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/tags/javascript'),
          expect.objectContaining({ method: 'DELETE' })
        );
      });
    });
  });

  describe('Images', () => {
    describe('uploadImage', () => {
      it('should upload an image', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 'image-1',
              url: 'https://cdn.example.com/image.jpg',
              filename: 'image.jpg',
              mimeType: 'image/jpeg',
              sizeBytes: 1024,
            }),
        });

        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        const result = await uploadImage(file, 'article-1', 'Test image');

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/images'),
          expect.objectContaining({
            method: 'POST',
            body: expect.any(FormData),
          })
        );
        expect(result.id).toBe('image-1');
      });

      it('should upload an image without optional params', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 'image-1',
              url: 'https://cdn.example.com/image.jpg',
              filename: 'image.jpg',
              mimeType: 'image/jpeg',
              sizeBytes: 1024,
            }),
        });

        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        await uploadImage(file);

        expect(mockFetch).toHaveBeenCalled();
      });
    });

    describe('deleteImage', () => {
      it('should delete an image', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

        await deleteImage('image-1');

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/images/image-1'),
          expect.objectContaining({ method: 'DELETE' })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors with error message', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () =>
          Promise.resolve({
            error: { code: 'VALIDATION_ERROR', message: 'Validation failed' },
          }),
      });

      await expect(getArticle('test')).rejects.toThrow('Validation failed');
    });

    it('should handle API errors without error message', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(getArticle('test')).rejects.toThrow('Unknown error');
    });
  });

  describe('AI', () => {
    describe('reviewArticle', () => {
      it('should review an article', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: () =>
            Promise.resolve({
              summary: 'Good article',
              overallScore: 85,
              items: [],
            }),
        });

        const result = await reviewArticle({
          title: 'Test Article',
          content: '# Test Content',
        });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/ai/review-article'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          })
        );
        expect(result.overallScore).toBe(85);
      });
    });

    describe('suggestContinuation', () => {
      it('should suggest continuation', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: () =>
            Promise.resolve({
              suggestions: [{ text: 'Continue here', confidence: 0.9 }],
            }),
        });

        const result = await suggestContinuation({
          title: 'Test Article',
          content: '# Test',
          cursorPosition: 10,
        });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/ai/suggest-continuation'),
          expect.objectContaining({
            method: 'POST',
          })
        );
        expect(result.suggestions).toHaveLength(1);
      });
    });
  });
});
