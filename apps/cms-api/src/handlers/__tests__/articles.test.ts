import { describe, expect, it, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { articlesHandler } from "../articles";
import type { Env } from "../../index";

// Mock generateId to return predictable values
vi.mock("../../lib/utils", async () => {
  const actual = await vi.importActual("../../lib/utils");
  return {
    ...actual,
    generateId: vi.fn(() => "mock-id-123"),
  };
});

function createMockDB() {
  return {
    prepare: vi.fn(),
  };
}

function createTestApp(mockDB: ReturnType<typeof createMockDB>) {
  const app = new Hono<{ Bindings: Env }>();

  app.use("*", async (c, next) => {
    c.env = {
      DB: mockDB as unknown as D1Database,
      API_KEY: "test-key",
    } as Env;
    await next();
  });

  app.route("/articles", articlesHandler);
  return app;
}

const sampleArticle = {
  id: "article-1",
  slug: "test-article",
  title: "Test Article",
  description: "A test article",
  content: "# Test Content",
  status: "draft",
  published_at: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("articlesHandler", () => {
  let mockDB: ReturnType<typeof createMockDB>;

  beforeEach(() => {
    mockDB = createMockDB();
    vi.clearAllMocks();
  });

  describe("GET /articles", () => {
    it("should return paginated articles", async () => {
      // Mock count query
      const mockPrepare = vi.fn();
      mockPrepare
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue({ count: 1 }),
          }),
        })
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            all: vi.fn().mockResolvedValue({ results: [sampleArticle] }),
          }),
        })
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            all: vi.fn().mockResolvedValue({ results: [] }),
          }),
        });

      mockDB.prepare = mockPrepare;

      const app = createTestApp(mockDB);
      const res = await app.request("/articles");

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.articles).toHaveLength(1);
      expect(data.total).toBe(1);
      expect(data.page).toBe(1);
      expect(data.perPage).toBe(10);
    });

    it("should filter by status", async () => {
      const mockPrepare = vi.fn();
      mockPrepare
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue({ count: 0 }),
          }),
        })
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            all: vi.fn().mockResolvedValue({ results: [] }),
          }),
        });

      mockDB.prepare = mockPrepare;

      const app = createTestApp(mockDB);
      const res = await app.request("/articles?status=published");

      expect(res.status).toBe(200);
      // Verify status filter was applied
      expect(mockPrepare).toHaveBeenCalled();
    });
  });

  describe("GET /articles/:slug", () => {
    it("should return an article by slug", async () => {
      mockDB.prepare
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue(sampleArticle),
          }),
        })
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            all: vi.fn().mockResolvedValue({ results: [{ name: "javascript" }] }),
          }),
        });

      const app = createTestApp(mockDB);
      const res = await app.request("/articles/test-article");

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.title).toBe("Test Article");
      expect(data.slug).toBe("test-article");
      expect(data.tags).toContain("javascript");
    });

    it("should return 404 when article not found", async () => {
      mockDB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
        }),
      });

      const app = createTestApp(mockDB);
      const res = await app.request("/articles/nonexistent");

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe("Article not found");
    });
  });

  describe("POST /articles", () => {
    it("should create a new article", async () => {
      const createdArticle = {
        ...sampleArticle,
        id: "mock-id-123",
      };

      mockDB.prepare
        // INSERT
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            run: vi.fn().mockResolvedValue({}),
          }),
        })
        // Get tags (empty)
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            all: vi.fn().mockResolvedValue({ results: [] }),
          }),
        })
        // SELECT created article
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue(createdArticle),
          }),
        });

      const app = createTestApp(mockDB);
      const res = await app.request("/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Test Article",
          content: "# Test Content",
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.title).toBe("Test Article");
    });

    it("should return 400 when title is missing", async () => {
      const app = createTestApp(mockDB);
      const res = await app.request("/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "Some content" }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Title and content are required");
    });

    it("should return 400 when content is missing", async () => {
      const app = createTestApp(mockDB);
      const res = await app.request("/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Some title" }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Title and content are required");
    });

    it("should return 409 when slug already exists", async () => {
      mockDB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          run: vi.fn().mockRejectedValue(new Error("UNIQUE constraint failed")),
        }),
      });

      const app = createTestApp(mockDB);
      const res = await app.request("/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Test Article",
          content: "Content",
          slug: "existing-slug",
        }),
      });

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.error).toBe("Article with this slug already exists");
    });
  });

  describe("DELETE /articles/:slug", () => {
    it("should delete an article", async () => {
      mockDB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
        }),
      });

      const app = createTestApp(mockDB);
      const res = await app.request("/articles/test-article", { method: "DELETE" });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it("should return 404 when deleting non-existent article", async () => {
      mockDB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          run: vi.fn().mockResolvedValue({ meta: { changes: 0 } }),
        }),
      });

      const app = createTestApp(mockDB);
      const res = await app.request("/articles/nonexistent", { method: "DELETE" });

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe("Article not found");
    });
  });

  describe("POST /articles/:slug/publish", () => {
    it("should publish an article", async () => {
      const publishedArticle = { ...sampleArticle, status: "published", published_at: "2024-01-02" };

      mockDB.prepare
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
          }),
        })
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue(publishedArticle),
          }),
        })
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            all: vi.fn().mockResolvedValue({ results: [] }),
          }),
        });

      const app = createTestApp(mockDB);
      const res = await app.request("/articles/test-article/publish", { method: "POST" });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("published");
    });

    it("should return 404 when publishing non-existent article", async () => {
      mockDB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          run: vi.fn().mockResolvedValue({ meta: { changes: 0 } }),
        }),
      });

      const app = createTestApp(mockDB);
      const res = await app.request("/articles/nonexistent/publish", { method: "POST" });

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe("Article not found");
    });
  });

  describe("POST /articles/:slug/unpublish", () => {
    it("should unpublish an article", async () => {
      const unpublishedArticle = { ...sampleArticle, status: "draft" };

      mockDB.prepare
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
          }),
        })
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue(unpublishedArticle),
          }),
        })
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            all: vi.fn().mockResolvedValue({ results: [] }),
          }),
        });

      const app = createTestApp(mockDB);
      const res = await app.request("/articles/test-article/unpublish", { method: "POST" });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("draft");
    });
  });
});
