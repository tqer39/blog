import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Env } from '../../index';
import { withErrorHandler } from '../../test/helpers';
import { imagesHandler } from '../images';

// Mock ID generation to return predictable values
vi.mock('@blog/utils', async () => {
  const actual = await vi.importActual('@blog/utils');
  return {
    ...actual,
    generateId: vi.fn(() => 'mock-image-id'),
    generateImageId: vi.fn(
      () => '550e8400-e29b-41d4-a716-446655440000' // Mock UUIDv4
    ),
  };
});

function createMockDB() {
  return {
    prepare: vi.fn(),
  };
}

function createMockR2Bucket() {
  return {
    put: vi.fn().mockResolvedValue(undefined),
    get: vi.fn(),
    delete: vi.fn().mockResolvedValue(undefined),
  };
}

function createTestApp(
  mockDB: ReturnType<typeof createMockDB>,
  mockR2: ReturnType<typeof createMockR2Bucket>,
  env: Partial<Env> = {}
) {
  const app = new Hono<{ Bindings: Env }>();

  app.use('*', async (c, next) => {
    c.env = {
      DB: mockDB as unknown as D1Database,
      R2_BUCKET: mockR2 as unknown as R2Bucket,
      API_KEY: 'test-key',
      ENVIRONMENT: 'development',
      R2_PUBLIC_URL: 'https://cdn.example.com',
      ...env,
    } as Env;
    await next();
  });

  app.route('/images', imagesHandler);
  return withErrorHandler(app);
}

function createMockFile(name: string, type: string, size: number): File {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], name, { type });
}

const sampleImage = {
  id: 'image-1',
  article_id: 'article-1',
  filename: '550e8400-e29b-41d4-a716-446655440000.jpg',
  original_filename: 'test.jpg',
  r2_key: 'i/550e8400-e29b-41d4-a716-446655440000.jpg',
  mime_type: 'image/jpeg',
  size_bytes: 1024,
  alt_text: 'Test image',
  created_at: '2024-01-01T00:00:00Z',
};

describe('imagesHandler', () => {
  let mockDB: ReturnType<typeof createMockDB>;
  let mockR2: ReturnType<typeof createMockR2Bucket>;

  beforeEach(() => {
    mockDB = createMockDB();
    mockR2 = createMockR2Bucket();
    vi.clearAllMocks();
  });

  describe('POST /images', () => {
    it('should upload an image successfully', async () => {
      mockDB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          run: vi.fn().mockResolvedValue({}),
        }),
      });

      const app = createTestApp(mockDB, mockR2);
      const formData = new FormData();
      const file = createMockFile('test.jpg', 'image/jpeg', 1024);
      formData.append('file', file);
      formData.append('articleId', 'article-1');
      formData.append('altText', 'Test image');

      const res = await app.request('/images', {
        method: 'POST',
        body: formData,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.id).toBe('mock-image-id');
      expect(data.mimeType).toBe('image/jpeg');
      expect(data.sizeBytes).toBe(1024);
      expect(mockR2.put).toHaveBeenCalled();
    });

    it('should return 400 when no file is provided', async () => {
      const app = createTestApp(mockDB, mockR2);
      const formData = new FormData();

      const res = await app.request('/images', {
        method: 'POST',
        body: formData,
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details?.file).toBe('Required');
    });

    it('should return 400 for invalid file type', async () => {
      const app = createTestApp(mockDB, mockR2);
      const formData = new FormData();
      const file = createMockFile('test.pdf', 'application/pdf', 1024);
      formData.append('file', file);

      const res = await app.request('/images', {
        method: 'POST',
        body: formData,
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details?.file).toContain('Invalid file type');
    });

    it('should return 400 for file too large', async () => {
      const app = createTestApp(mockDB, mockR2);
      const formData = new FormData();
      // 11MB file (exceeds 10MB limit)
      const file = createMockFile('large.jpg', 'image/jpeg', 11 * 1024 * 1024);
      formData.append('file', file);

      const res = await app.request('/images', {
        method: 'POST',
        body: formData,
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details?.file).toContain('File too large');
    });

    it('should accept all allowed image types', async () => {
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ];

      for (const type of allowedTypes) {
        mockDB.prepare.mockReturnValue({
          bind: vi.fn().mockReturnValue({
            run: vi.fn().mockResolvedValue({}),
          }),
        });
        mockR2.put.mockResolvedValue(undefined);

        const app = createTestApp(mockDB, mockR2);
        const formData = new FormData();
        const ext = type.split('/')[1];
        const file = createMockFile(`test.${ext}`, type, 1024);
        formData.append('file', file);

        const res = await app.request('/images', {
          method: 'POST',
          body: formData,
        });

        expect(res.status).toBe(201);
      }
    });
  });

  describe('GET /images/:id', () => {
    it('should return image metadata', async () => {
      mockDB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(sampleImage),
        }),
      });

      const app = createTestApp(mockDB, mockR2);
      const res = await app.request('/images/image-1');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe('image-1');
      expect(data.filename).toBe('550e8400-e29b-41d4-a716-446655440000.jpg');
      expect(data.mimeType).toBe('image/jpeg');
      expect(data.url).toBe(
        'https://cdn.example.com/i/550e8400-e29b-41d4-a716-446655440000.jpg'
      );
    });

    it('should return 404 when image not found', async () => {
      mockDB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
        }),
      });

      const app = createTestApp(mockDB, mockR2);
      const res = await app.request('/images/nonexistent');

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error.code).toBe('NOT_FOUND');
      expect(data.error.message).toBe('Image not found');
    });
  });

  describe('DELETE /images/:id', () => {
    it('should delete an image', async () => {
      mockDB.prepare
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            first: vi
              .fn()
              .mockResolvedValue({ r2_key: 'images/2024/01/test.jpg' }),
          }),
        })
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            run: vi.fn().mockResolvedValue({}),
          }),
        });

      const app = createTestApp(mockDB, mockR2);
      const res = await app.request('/images/image-1', { method: 'DELETE' });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(mockR2.delete).toHaveBeenCalledWith('images/2024/01/test.jpg');
    });

    it('should return 404 when deleting non-existent image', async () => {
      mockDB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
        }),
      });

      const app = createTestApp(mockDB, mockR2);
      const res = await app.request('/images/nonexistent', {
        method: 'DELETE',
      });

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error.code).toBe('NOT_FOUND');
      expect(data.error.message).toBe('Image not found');
    });
  });

  describe('GET /images/article/:articleId', () => {
    it('should return images for an article', async () => {
      mockDB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: [sampleImage, { ...sampleImage, id: 'image-2' }],
          }),
        }),
      });

      const app = createTestApp(mockDB, mockR2);
      const res = await app.request('/images/article/article-1');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.images).toHaveLength(2);
      expect(data.images[0].id).toBe('image-1');
      expect(data.images[1].id).toBe('image-2');
    });

    it('should return empty array when no images found', async () => {
      mockDB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({ results: [] }),
        }),
      });

      const app = createTestApp(mockDB, mockR2);
      const res = await app.request('/images/article/article-without-images');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.images).toHaveLength(0);
    });
  });

  describe('GET /images/file/*', () => {
    it('should serve an image file', async () => {
      const mockBody = new ReadableStream();
      mockR2.get.mockResolvedValue({
        body: mockBody,
        httpMetadata: { contentType: 'image/jpeg' },
      });

      const app = createTestApp(mockDB, mockR2);
      const res = await app.request('/images/file/images/2024/01/test.jpg');

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('image/jpeg');
      expect(res.headers.get('Cache-Control')).toBe(
        'public, max-age=31536000, immutable'
      );
    });

    it('should return 404 when file not found in R2', async () => {
      mockR2.get.mockResolvedValue(null);

      const app = createTestApp(mockDB, mockR2);
      const res = await app.request(
        '/images/file/images/2024/01/nonexistent.jpg'
      );

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error.code).toBe('NOT_FOUND');
      expect(data.error.message).toBe('Image not found');
    });
  });

  describe('URL generation', () => {
    it('should use R2_PUBLIC_URL when available', async () => {
      mockDB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(sampleImage),
        }),
      });

      const app = createTestApp(mockDB, mockR2, {
        R2_PUBLIC_URL: 'https://custom-cdn.example.com',
      });
      const res = await app.request('/images/image-1');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.url).toBe(
        'https://custom-cdn.example.com/i/550e8400-e29b-41d4-a716-446655440000.jpg'
      );
    });

    it('should use localhost URL in development without R2_PUBLIC_URL', async () => {
      mockDB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(sampleImage),
        }),
      });

      const app = createTestApp(mockDB, mockR2, {
        R2_PUBLIC_URL: undefined,
        ENVIRONMENT: 'development',
      });
      const res = await app.request('/images/image-1');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.url).toBe(
        'http://localhost:3200/v1/images/file/i/550e8400-e29b-41d4-a716-446655440000.jpg'
      );
    });

    it('should use default CDN URL in production without R2_PUBLIC_URL', async () => {
      mockDB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(sampleImage),
        }),
      });

      const app = createTestApp(mockDB, mockR2, {
        R2_PUBLIC_URL: undefined,
        ENVIRONMENT: 'production',
      });
      const res = await app.request('/images/image-1');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.url).toBe(
        'https://cdn.tqer39.dev/i/550e8400-e29b-41d4-a716-446655440000.jpg'
      );
    });
  });
});
