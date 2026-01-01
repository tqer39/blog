import { Hono } from "hono";
import type { Env } from "../index";

export const importExportHandler = new Hono<{ Bindings: Env }>();

// Import markdown file
// POST /import/markdown
// Body: { content: string, slug?: string }
importExportHandler.post("/markdown", async (c) => {
  const body = await c.req.json<{
    content: string;
    slug?: string;
  }>();

  if (!body.content) {
    return c.json({ error: "Content is required" }, 400);
  }

  // Parse frontmatter from markdown
  const frontmatterMatch = body.content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!frontmatterMatch) {
    return c.json({ error: "Invalid markdown format. Expected YAML frontmatter." }, 400);
  }

  const [, frontmatterRaw, markdownContent] = frontmatterMatch;

  // Parse YAML frontmatter (simple parser)
  const frontmatter: Record<string, unknown> = {};
  for (const line of frontmatterRaw.split("\n")) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      // Handle arrays like tags: ["Blog", "Next.js"]
      if (value.startsWith("[") && value.endsWith("]")) {
        try {
          frontmatter[key] = JSON.parse(value.replace(/'/g, '"'));
        } catch {
          frontmatter[key] = value;
        }
      } else if (value.startsWith('"') && value.endsWith('"')) {
        frontmatter[key] = value.slice(1, -1);
      } else if (value === "true") {
        frontmatter[key] = true;
      } else if (value === "false") {
        frontmatter[key] = false;
      } else {
        frontmatter[key] = value;
      }
    }
  }

  const title = frontmatter.title as string;
  const description = frontmatter.description as string | undefined;
  const tags = (frontmatter.tags as string[]) || [];
  const published = frontmatter.published as boolean;
  const date = frontmatter.date as string | undefined;

  if (!title) {
    return c.json({ error: "Title is required in frontmatter" }, 400);
  }

  // Generate slug from filename or title
  const slug = body.slug || title.toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 100);

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const status = published ? "published" : "draft";
  const publishedAt = published && date ? new Date(date).toISOString() : (published ? now : null);

  // Insert article
  await c.env.DB.prepare(`
    INSERT INTO articles (id, slug, title, description, content, status, published_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, slug, title, description || null, markdownContent.trim(), status, publishedAt, now, now).run();

  // Handle tags
  for (const tagName of tags) {
    const tagSlug = tagName.toLowerCase().replace(/\s+/g, "-");

    // Get or create tag
    let tag = await c.env.DB.prepare("SELECT id FROM tags WHERE slug = ?").bind(tagSlug).first<{ id: string }>();

    if (!tag) {
      const tagId = crypto.randomUUID();
      await c.env.DB.prepare("INSERT INTO tags (id, name, slug) VALUES (?, ?, ?)").bind(tagId, tagName, tagSlug).run();
      tag = { id: tagId };
    }

    // Link article to tag
    await c.env.DB.prepare("INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)").bind(id, tag.id).run();
  }

  return c.json({
    id,
    slug,
    title,
    status,
    message: "Article imported successfully",
  }, 201);
});

// Export article as markdown
// GET /export/:slug
importExportHandler.get("/:slug", async (c) => {
  const slug = c.req.param("slug");

  const article = await c.env.DB.prepare(`
    SELECT id, slug, title, description, content, status, published_at, created_at
    FROM articles WHERE slug = ?
  `).bind(slug).first<{
    id: string;
    slug: string;
    title: string;
    description: string | null;
    content: string;
    status: string;
    published_at: string | null;
    created_at: string;
  }>();

  if (!article) {
    return c.json({ error: "Article not found" }, 404);
  }

  // Get tags
  const tagsResult = await c.env.DB.prepare(`
    SELECT t.name FROM tags t
    JOIN article_tags at ON t.id = at.tag_id
    WHERE at.article_id = ?
    ORDER BY t.name
  `).bind(article.id).all<{ name: string }>();

  const tags = tagsResult.results.map((t) => t.name);
  const published = article.status === "published";
  const date = article.published_at
    ? new Date(article.published_at).toISOString().split("T")[0]
    : new Date(article.created_at).toISOString().split("T")[0];

  // Generate markdown with frontmatter
  const markdown = `---
title: "${article.title}"
date: "${date}"
published: ${published}
tags: ${JSON.stringify(tags)}
description: "${article.description || ""}"
---

${article.content}`;

  // Return as markdown file
  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.md"`,
    },
  });
});

// Bulk export all articles
// GET /export
importExportHandler.get("/", async (c) => {
  const status = c.req.query("status") || "published";

  const articles = await c.env.DB.prepare(`
    SELECT slug FROM articles
    WHERE status = ?
    ORDER BY published_at DESC, created_at DESC
  `).bind(status).all<{ slug: string }>();

  return c.json({
    articles: articles.results.map((a) => ({
      slug: a.slug,
      exportUrl: `/v1/export/${a.slug}`,
    })),
    total: articles.results.length,
  });
});
