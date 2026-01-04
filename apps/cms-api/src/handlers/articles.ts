import { Hono } from "hono";
import type { Env } from "../index";
import type {
  Article,
  ArticleInput,
  ArticleListResponse,
} from "@blog/cms-types";
import { generateId, generateHash, slugify } from "../lib/utils";

export const articlesHandler = new Hono<{ Bindings: Env }>();

// List articles
articlesHandler.get("/", async (c) => {
  const status = c.req.query("status");
  const tag = c.req.query("tag");
  const page = Number.parseInt(c.req.query("page") || "1", 10);
  const perPage = Number.parseInt(c.req.query("perPage") || "10", 10);
  const offset = (page - 1) * perPage;

  let query = `
    SELECT DISTINCT a.*
    FROM articles a
  `;
  const params: (string | number)[] = [];
  const conditions: string[] = [];

  if (tag) {
    query += `
      JOIN article_tags at ON a.id = at.article_id
      JOIN tags t ON at.tag_id = t.id
    `;
    conditions.push("t.slug = ?");
    params.push(tag);
  }

  if (status) {
    conditions.push("a.status = ?");
    params.push(status);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  // Count total
  const countQuery = query.replace("SELECT DISTINCT a.*", "SELECT COUNT(DISTINCT a.id) as count");
  const countResult = await c.env.DB.prepare(countQuery).bind(...params).first<{ count: number }>();
  const total = countResult?.count || 0;

  // Get paginated results
  query += " ORDER BY a.published_at DESC, a.created_at DESC LIMIT ? OFFSET ?";
  params.push(perPage, offset);

  const { results } = await c.env.DB.prepare(query).bind(...params).all();

  // Get tags and header image for each article
  const articles: Article[] = await Promise.all(
    (results || []).map(async (row) => {
      const tags = await getArticleTags(c.env.DB, row.id as string);
      const headerImageUrl = await getHeaderImageUrl(c.env.DB, row.header_image_id as string | null, c.env);
      return mapRowToArticle(row, tags, headerImageUrl);
    }),
  );

  const response: ArticleListResponse = {
    articles,
    total,
    page,
    perPage,
  };

  return c.json(response);
});

// Get single article by hash
articlesHandler.get("/:hash", async (c) => {
  const hash = c.req.param("hash");

  const row = await c.env.DB.prepare(
    "SELECT * FROM articles WHERE hash = ?",
  ).bind(hash).first();

  if (!row) {
    return c.json({ error: "Article not found" }, 404);
  }

  const tags = await getArticleTags(c.env.DB, row.id as string);
  const headerImageUrl = await getHeaderImageUrl(c.env.DB, row.header_image_id as string | null, c.env);
  const article = mapRowToArticle(row, tags, headerImageUrl);

  return c.json(article);
});

// Create article
articlesHandler.post("/", async (c) => {
  const input = await c.req.json<ArticleInput>();

  if (!input.title || !input.content) {
    return c.json({ error: "Title and content are required" }, 400);
  }

  const id = generateId();
  const hash = generateHash(10);
  const slug = input.slug || slugify(input.title);
  const status = input.status || "draft";
  const publishedAt = status === "published" ? new Date().toISOString() : null;

  try {
    await c.env.DB.prepare(
      `INSERT INTO articles (id, hash, slug, title, description, content, status, published_at, header_image_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(id, hash, slug, input.title, input.description || null, input.content, status, publishedAt, input.headerImageId || null).run();

    // Handle tags
    if (input.tags && input.tags.length > 0) {
      await syncArticleTags(c.env.DB, id, input.tags);
    }

    const tags = await getArticleTags(c.env.DB, id);
    const row = await c.env.DB.prepare("SELECT * FROM articles WHERE id = ?").bind(id).first();
    const headerImageUrl = await getHeaderImageUrl(c.env.DB, input.headerImageId || null, c.env);

    return c.json(mapRowToArticle(row!, tags, headerImageUrl), 201);
  } catch (error) {
    if (String(error).includes("UNIQUE constraint failed")) {
      return c.json({ error: "Article with this slug or hash already exists" }, 409);
    }
    throw error;
  }
});

// Update article
articlesHandler.put("/:hash", async (c) => {
  const hash = c.req.param("hash");
  const input = await c.req.json<Partial<ArticleInput>>();

  const existing = await c.env.DB.prepare(
    "SELECT * FROM articles WHERE hash = ?",
  ).bind(hash).first();

  if (!existing) {
    return c.json({ error: "Article not found" }, 404);
  }

  const updates: string[] = [];
  const params: (string | null)[] = [];

  if (input.title !== undefined) {
    updates.push("title = ?");
    params.push(input.title);
  }
  if (input.description !== undefined) {
    updates.push("description = ?");
    params.push(input.description || null);
  }
  if (input.content !== undefined) {
    updates.push("content = ?");
    params.push(input.content);
  }
  if (input.slug !== undefined) {
    updates.push("slug = ?");
    params.push(input.slug);
  }
  if (input.headerImageId !== undefined) {
    updates.push("header_image_id = ?");
    params.push(input.headerImageId || null);
  }

  if (updates.length > 0) {
    params.push(existing.id as string);
    await c.env.DB.prepare(
      `UPDATE articles SET ${updates.join(", ")} WHERE id = ?`,
    ).bind(...params).run();
  }

  if (input.tags !== undefined) {
    await syncArticleTags(c.env.DB, existing.id as string, input.tags);
  }

  const row = await c.env.DB.prepare("SELECT * FROM articles WHERE hash = ?").bind(hash).first();
  const tags = await getArticleTags(c.env.DB, row!.id as string);
  const headerImageUrl = await getHeaderImageUrl(c.env.DB, row!.header_image_id as string | null, c.env);

  return c.json(mapRowToArticle(row!, tags, headerImageUrl));
});

// Delete article
articlesHandler.delete("/:hash", async (c) => {
  const hash = c.req.param("hash");

  const result = await c.env.DB.prepare(
    "DELETE FROM articles WHERE hash = ?",
  ).bind(hash).run();

  if (result.meta.changes === 0) {
    return c.json({ error: "Article not found" }, 404);
  }

  return c.json({ success: true });
});

// Publish article
articlesHandler.post("/:hash/publish", async (c) => {
  const hash = c.req.param("hash");

  const result = await c.env.DB.prepare(
    `UPDATE articles SET status = 'published', published_at = ? WHERE hash = ?`,
  ).bind(new Date().toISOString(), hash).run();

  if (result.meta.changes === 0) {
    return c.json({ error: "Article not found" }, 404);
  }

  const row = await c.env.DB.prepare("SELECT * FROM articles WHERE hash = ?").bind(hash).first();
  const tags = await getArticleTags(c.env.DB, row!.id as string);
  const headerImageUrl = await getHeaderImageUrl(c.env.DB, row!.header_image_id as string | null, c.env);

  return c.json(mapRowToArticle(row!, tags, headerImageUrl));
});

// Unpublish article
articlesHandler.post("/:hash/unpublish", async (c) => {
  const hash = c.req.param("hash");

  const result = await c.env.DB.prepare(
    `UPDATE articles SET status = 'draft' WHERE hash = ?`,
  ).bind(hash).run();

  if (result.meta.changes === 0) {
    return c.json({ error: "Article not found" }, 404);
  }

  const row = await c.env.DB.prepare("SELECT * FROM articles WHERE hash = ?").bind(hash).first();
  const tags = await getArticleTags(c.env.DB, row!.id as string);
  const headerImageUrl = await getHeaderImageUrl(c.env.DB, row!.header_image_id as string | null, c.env);

  return c.json(mapRowToArticle(row!, tags, headerImageUrl));
});

// Helper functions
async function getArticleTags(db: D1Database, articleId: string): Promise<string[]> {
  const { results } = await db.prepare(
    `SELECT t.name FROM tags t
     JOIN article_tags at ON t.id = at.tag_id
     WHERE at.article_id = ?`,
  ).bind(articleId).all();

  return (results || []).map((r) => r.name as string);
}

async function syncArticleTags(db: D1Database, articleId: string, tagNames: string[]): Promise<void> {
  // Remove existing tags
  await db.prepare("DELETE FROM article_tags WHERE article_id = ?").bind(articleId).run();

  // Add new tags
  for (const name of tagNames) {
    const tagSlug = slugify(name);

    // Upsert tag
    await db.prepare(
      `INSERT INTO tags (id, name, slug) VALUES (?, ?, ?)
       ON CONFLICT (name) DO NOTHING`,
    ).bind(generateId(), name, tagSlug).run();

    // Get tag id
    const tag = await db.prepare("SELECT id FROM tags WHERE name = ?").bind(name).first<{ id: string }>();

    if (tag) {
      await db.prepare(
        "INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)",
      ).bind(articleId, tag.id).run();
    }
  }
}

function mapRowToArticle(row: Record<string, unknown>, tags: string[], headerImageUrl: string | null = null): Article {
  return {
    id: row.id as string,
    hash: row.hash as string,
    slug: row.slug as string,
    title: row.title as string,
    description: row.description as string | null,
    content: row.content as string,
    status: row.status as "draft" | "published",
    publishedAt: row.published_at as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    tags,
    headerImageId: row.header_image_id as string | null,
    headerImageUrl,
  };
}

async function getHeaderImageUrl(db: D1Database, headerImageId: string | null, env: Env): Promise<string | null> {
  if (!headerImageId) return null;

  const image = await db.prepare(
    "SELECT r2_key FROM images WHERE id = ?"
  ).bind(headerImageId).first<{ r2_key: string }>();

  if (!image) return null;

  if (env.R2_PUBLIC_URL) {
    return `${env.R2_PUBLIC_URL}/${image.r2_key}`;
  }
  if (env.ENVIRONMENT === "development") {
    return `http://localhost:8787/v1/images/file/${image.r2_key}`;
  }
  return `https://cdn.tqer39.dev/${image.r2_key}`;
}
