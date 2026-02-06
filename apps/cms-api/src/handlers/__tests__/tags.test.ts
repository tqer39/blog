import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Env } from '../../index';
import { withErrorHandler } from '../../test/helpers';
import { tagsHandler } from '../tags';

// Mock generateId to return predictable values
vi.mock('../../lib/utils', async () => {
  const actual = await vi.importActual('../../lib/utils');
  return {
    ...actual,
    generateId: vi.fn(() => 'mock-id-123'),
  };
});

function createMockDB() {
  return {
    prepare: vi.fn(),
  };
}

function createTestApp(mockDB: ReturnType<typeof createMockDB>) {
  const app = new Hono<{ Bindings: Env }>();

  app.use('*', async (c, next) => {
    c.env = {
      DB: mockDB as unknown as D1Database,
      API_KEY: 'test-key',
    } as Env;
    await next();
  });

  app.route('/tags', tagsHandler);
  return withErrorHandler(app);
}

describe('tagsHandler', () => {
  let mockDB: ReturnType<typeof createMockDB>;

  beforeEach(() => {
    mockDB = createMockDB();
    vi.clearAllMocks();
  });

  describe('GET /tags', () => {
    it('should return all tags with article count', async () => {
      const mockTags = [
        {
          id: '1',
          name: 'JavaScript',
          created_at: '2024-01-01',
          article_count: 5,
        },
        {
          id: '2',
          name: 'TypeScript',
          created_at: '2024-01-02',
          article_count: 3,
        },
      ];

      // First call: count query
      mockDB.prepare
        .mockReturnValueOnce({
          first: vi.fn().mockResolvedValue({ total: 2 }),
        })
        // Second call: paginated data query
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            all: vi.fn().mockResolvedValue({ results: mockTags }),
          }),
        });

      const app = createTestApp(mockDB);
      const res = await app.request('/tags');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.tags).toHaveLength(2);
      expect(data.tags[0].name).toBe('JavaScript');
      expect(data.tags[0].articleCount).toBe(5);
      expect(data.tags[1].name).toBe('TypeScript');
      expect(data.tags[1].articleCount).toBe(3);
      expect(data.pagination).toEqual({
        page: 1,
        perPage: 50,
        total: 2,
        totalPages: 1,
      });
    });

    it('should return empty array when no tags exist', async () => {
      // First call: count query
      mockDB.prepare
        .mockReturnValueOnce({
          first: vi.fn().mockResolvedValue({ total: 0 }),
        })
        // Second call: paginated data query
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            all: vi.fn().mockResolvedValue({ results: [] }),
          }),
        });

      const app = createTestApp(mockDB);
      const res = await app.request('/tags');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.tags).toEqual([]);
      expect(data.pagination.total).toBe(0);
    });
  });

  describe('GET /tags/:id', () => {
    it('should return a tag by id', async () => {
      const mockTag = {
        id: '1',
        name: 'JavaScript',
        created_at: '2024-01-01',
      };

      mockDB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(mockTag),
        }),
      });

      const app = createTestApp(mockDB);
      const res = await app.request('/tags/1');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.name).toBe('JavaScript');
      expect(data.id).toBe('1');
    });

    it('should return 404 when tag not found', async () => {
      mockDB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
        }),
      });

      const app = createTestApp(mockDB);
      const res = await app.request('/tags/nonexistent');

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error.code).toBe('NOT_FOUND');
      expect(data.error.message).toBe('Tag not found');
    });
  });

  describe('POST /tags', () => {
    it('should create a new tag', async () => {
      const createdTag = {
        id: 'mock-id-123',
        name: 'React',
        created_at: '2024-01-01',
      };

      mockDB.prepare
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            run: vi.fn().mockResolvedValue({}),
          }),
        })
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue(createdTag),
          }),
        });

      const app = createTestApp(mockDB);
      const res = await app.request('/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'React' }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.name).toBe('React');
      expect(data.id).toBe('mock-id-123');
    });

    it('should return 400 when name is missing', async () => {
      const app = createTestApp(mockDB);
      const res = await app.request('/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details?.name).toBe('Required');
    });

    it('should return 409 when tag already exists', async () => {
      mockDB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          run: vi.fn().mockRejectedValue(new Error('UNIQUE constraint failed')),
        }),
      });

      const app = createTestApp(mockDB);
      const res = await app.request('/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Existing' }),
      });

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.error.code).toBe('CONFLICT');
      expect(data.error.message).toBe('Tag with this name already exists');
    });
  });

  describe('PUT /tags/:id', () => {
    it('should update a tag', async () => {
      const existingTag = {
        id: '1',
        name: 'JavaScript',
        created_at: '2024-01-01',
      };
      const updatedTag = {
        id: '1',
        name: 'JS',
        created_at: '2024-01-01',
      };

      mockDB.prepare
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue(existingTag),
          }),
        })
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            run: vi.fn().mockResolvedValue({}),
          }),
        })
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue(updatedTag),
          }),
        });

      const app = createTestApp(mockDB);
      const res = await app.request('/tags/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'JS' }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.name).toBe('JS');
    });

    it('should return 400 when name is missing', async () => {
      const app = createTestApp(mockDB);
      const res = await app.request('/tags/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details?.name).toBe('Required');
    });

    it('should return 404 when tag not found', async () => {
      mockDB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
        }),
      });

      const app = createTestApp(mockDB);
      const res = await app.request('/tags/nonexistent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Name' }),
      });

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error.code).toBe('NOT_FOUND');
      expect(data.error.message).toBe('Tag not found');
    });

    it('should return 409 when duplicate name', async () => {
      const existingTag = {
        id: '1',
        name: 'JavaScript',
        created_at: '2024-01-01',
      };

      mockDB.prepare
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue(existingTag),
          }),
        })
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            run: vi
              .fn()
              .mockRejectedValue(new Error('UNIQUE constraint failed')),
          }),
        });

      const app = createTestApp(mockDB);
      const res = await app.request('/tags/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'TypeScript' }),
      });

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.error.code).toBe('CONFLICT');
      expect(data.error.message).toBe('Tag with this name already exists');
    });
  });

  describe('DELETE /tags/:id', () => {
    it('should delete a tag', async () => {
      mockDB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
        }),
      });

      const app = createTestApp(mockDB);
      const res = await app.request('/tags/1', { method: 'DELETE' });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('should return 404 when deleting non-existent tag', async () => {
      mockDB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          run: vi.fn().mockResolvedValue({ meta: { changes: 0 } }),
        }),
      });

      const app = createTestApp(mockDB);
      const res = await app.request('/tags/nonexistent', { method: 'DELETE' });

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error.code).toBe('NOT_FOUND');
      expect(data.error.message).toBe('Tag not found');
    });
  });
});
