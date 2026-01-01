import { Hono } from "hono";
import type { Env } from "../index";
import type { Tag, TagInput } from "@blog/cms-types";
import { generateId, slugify } from "../lib/utils";

export const tagsHandler = new Hono<{ Bindings: Env }>();

// List all tags
tagsHandler.get("/", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM tags ORDER BY name ASC",
  ).all();

  const tags: Tag[] = (results || []).map(mapRowToTag);

  return c.json({ tags });
});

// Get single tag by slug
tagsHandler.get("/:slug", async (c) => {
  const slug = c.req.param("slug");

  const row = await c.env.DB.prepare(
    "SELECT * FROM tags WHERE slug = ?",
  ).bind(slug).first();

  if (!row) {
    return c.json({ error: "Tag not found" }, 404);
  }

  return c.json(mapRowToTag(row));
});

// Create tag
tagsHandler.post("/", async (c) => {
  const input = await c.req.json<TagInput>();

  if (!input.name) {
    return c.json({ error: "Name is required" }, 400);
  }

  const id = generateId();
  const slug = input.slug || slugify(input.name);

  try {
    await c.env.DB.prepare(
      "INSERT INTO tags (id, name, slug) VALUES (?, ?, ?)",
    ).bind(id, input.name, slug).run();

    const row = await c.env.DB.prepare("SELECT * FROM tags WHERE id = ?").bind(id).first();

    return c.json(mapRowToTag(row!), 201);
  } catch (error) {
    if (String(error).includes("UNIQUE constraint failed")) {
      return c.json({ error: "Tag with this name or slug already exists" }, 409);
    }
    throw error;
  }
});

// Delete tag
tagsHandler.delete("/:slug", async (c) => {
  const slug = c.req.param("slug");

  const result = await c.env.DB.prepare(
    "DELETE FROM tags WHERE slug = ?",
  ).bind(slug).run();

  if (result.meta.changes === 0) {
    return c.json({ error: "Tag not found" }, 404);
  }

  return c.json({ success: true });
});

function mapRowToTag(row: Record<string, unknown>): Tag {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    createdAt: row.created_at as string,
  };
}
