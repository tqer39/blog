import { describe, expect, it, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { importExportHandler } from "../import-export";
import type { Env } from "../../index";

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

  app.route("/import", importExportHandler);
  app.route("/export", importExportHandler);
  return app;
}

const validMarkdown = `---
title: "Test Article"
date: "2024-01-15"
published: true
tags: ["JavaScript", "Testing"]
description: "A test article"
---

# Hello World

This is the content.`;

const validMarkdownDraft = `---
title: "Draft Article"
date: "2024-01-15"
published: false
tags: []
description: ""
---

Draft content here.`;

describe("importExportHandler", () => {
  let mockDB: ReturnType<typeof createMockDB>;

  beforeEach(() => {
    mockDB = createMockDB();
    vi.clearAllMocks();
  });

  describe("POST /import/markdown", () => {
    it("should import a valid markdown file", async () => {
      // Mock INSERT article
      mockDB.prepare
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            run: vi.fn().mockResolvedValue({}),
          }),
        })
        // Mock SELECT tag (not found)
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue(null),
          }),
        })
        // Mock INSERT tag
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            run: vi.fn().mockResolvedValue({}),
          }),
        })
        // Mock INSERT article_tags
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            run: vi.fn().mockResolvedValue({}),
          }),
        })
        // Mock SELECT tag (not found) for second tag
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue(null),
          }),
        })
        // Mock INSERT tag
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            run: vi.fn().mockResolvedValue({}),
          }),
        })
        // Mock INSERT article_tags
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            run: vi.fn().mockResolvedValue({}),
          }),
        });

      const app = createTestApp(mockDB);
      const res = await app.request("/import/markdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: validMarkdown }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.title).toBe("Test Article");
      expect(data.status).toBe("published");
      expect(data.message).toBe("Article imported successfully");
    });

    it("should import a draft article", async () => {
      mockDB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          run: vi.fn().mockResolvedValue({}),
        }),
      });

      const app = createTestApp(mockDB);
      const res = await app.request("/import/markdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: validMarkdownDraft }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.status).toBe("draft");
    });

    it("should use provided slug", async () => {
      mockDB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          run: vi.fn().mockResolvedValue({}),
        }),
      });

      const app = createTestApp(mockDB);
      const res = await app.request("/import/markdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: validMarkdownDraft, slug: "custom-slug" }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.slug).toBe("custom-slug");
    });

    it("should return 400 when content is missing", async () => {
      const app = createTestApp(mockDB);
      const res = await app.request("/import/markdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Content is required");
    });

    it("should return 400 for invalid markdown format", async () => {
      const app = createTestApp(mockDB);
      const res = await app.request("/import/markdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "No frontmatter here" }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Invalid markdown format");
    });

    it("should return 400 when title is missing in frontmatter", async () => {
      const markdownWithoutTitle = `---
date: "2024-01-15"
published: true
---

Content without title.`;

      const app = createTestApp(mockDB);
      const res = await app.request("/import/markdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: markdownWithoutTitle }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Title is required in frontmatter");
    });

    it("should reuse existing tags", async () => {
      // Mock INSERT article
      mockDB.prepare
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            run: vi.fn().mockResolvedValue({}),
          }),
        })
        // Mock SELECT tag (found existing)
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue({ id: "existing-tag-id" }),
          }),
        })
        // Mock INSERT article_tags
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            run: vi.fn().mockResolvedValue({}),
          }),
        })
        // Mock SELECT tag (found existing) for second tag
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue({ id: "existing-tag-id-2" }),
          }),
        })
        // Mock INSERT article_tags
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            run: vi.fn().mockResolvedValue({}),
          }),
        });

      const app = createTestApp(mockDB);
      const res = await app.request("/import/markdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: validMarkdown }),
      });

      expect(res.status).toBe(201);
    });
  });

  describe("GET /export/:slug", () => {
    it("should export an article as markdown", async () => {
      mockDB.prepare
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue({
              id: "article-1",
              slug: "test-article",
              title: "Test Article",
              description: "A test description",
              content: "# Hello World",
              status: "published",
              published_at: "2024-01-15T00:00:00Z",
              created_at: "2024-01-10T00:00:00Z",
            }),
          }),
        })
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            all: vi.fn().mockResolvedValue({
              results: [{ name: "JavaScript" }, { name: "Testing" }],
            }),
          }),
        });

      const app = createTestApp(mockDB);
      const res = await app.request("/export/test-article");

      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
      expect(res.headers.get("Content-Disposition")).toBe('attachment; filename="test-article.md"');

      const markdown = await res.text();
      expect(markdown).toContain('title: "Test Article"');
      expect(markdown).toContain('date: "2024-01-15"');
      expect(markdown).toContain("published: true");
      expect(markdown).toContain('["JavaScript","Testing"]');
      expect(markdown).toContain("# Hello World");
    });

    it("should return 404 when article not found", async () => {
      mockDB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
        }),
      });

      const app = createTestApp(mockDB);
      const res = await app.request("/export/nonexistent");

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe("Article not found");
    });

    it("should use created_at date for drafts without published_at", async () => {
      mockDB.prepare
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue({
              id: "article-1",
              slug: "draft-article",
              title: "Draft Article",
              description: null,
              content: "Draft content",
              status: "draft",
              published_at: null,
              created_at: "2024-01-10T00:00:00Z",
            }),
          }),
        })
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            all: vi.fn().mockResolvedValue({ results: [] }),
          }),
        });

      const app = createTestApp(mockDB);
      const res = await app.request("/export/draft-article");

      expect(res.status).toBe(200);
      const markdown = await res.text();
      expect(markdown).toContain('date: "2024-01-10"');
      expect(markdown).toContain("published: false");
    });
  });

  describe("GET /export", () => {
    it("should list all exportable articles", async () => {
      mockDB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: [
              { slug: "article-1" },
              { slug: "article-2" },
            ],
          }),
        }),
      });

      const app = createTestApp(mockDB);
      const res = await app.request("/export");

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.articles).toHaveLength(2);
      expect(data.articles[0].slug).toBe("article-1");
      expect(data.articles[0].exportUrl).toBe("/v1/export/article-1");
      expect(data.total).toBe(2);
    });

    it("should filter by status", async () => {
      mockDB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({
            results: [{ slug: "draft-article" }],
          }),
        }),
      });

      const app = createTestApp(mockDB);
      const res = await app.request("/export?status=draft");

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.articles).toHaveLength(1);
    });

    it("should return empty list when no articles", async () => {
      mockDB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({ results: [] }),
        }),
      });

      const app = createTestApp(mockDB);
      const res = await app.request("/export");

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.articles).toHaveLength(0);
      expect(data.total).toBe(0);
    });
  });
});
