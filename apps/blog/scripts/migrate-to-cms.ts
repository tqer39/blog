/**
 * Migration script: Migrate existing markdown files to CMS API
 *
 * Usage:
 *   cd apps/blog
 *   npx tsx scripts/migrate-to-cms.ts
 *
 * Prerequisites:
 *   - CMS API running at localhost:8787 (just dev-api)
 *   - D1 database initialized (just db-migrate-local)
 */

import fs from "fs";
import matter from "gray-matter";
import path from "path";

const API_URL = process.env.CMS_API_URL || "http://localhost:8787/v1";
const API_KEY = process.env.CMS_API_KEY || "dev-api-key";

interface OldFrontmatter {
  title: string;
  date: string;
  published: boolean;
  tags: string[];
  description: string;
}

interface ArticleInput {
  slug: string;
  title: string;
  description?: string;
  content: string;
  status?: "draft" | "published";
  tags?: string[];
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }

  return response.json();
}

async function createArticle(input: ArticleInput): Promise<void> {
  await fetchApi("/articles", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

async function createTagIfNotExists(tagName: string): Promise<void> {
  const slug = tagName.toLowerCase().replace(/\s+/g, "-");
  try {
    await fetchApi("/tags", {
      method: "POST",
      body: JSON.stringify({ name: tagName, slug }),
    });
    console.log(`  Created tag: ${tagName}`);
  } catch (error) {
    // Tag might already exist, which is fine
    if (error instanceof Error && !error.message.includes("409")) {
      console.log(`  Tag already exists: ${tagName}`);
    }
  }
}

async function migrate(): Promise<void> {
  const contentsDir = path.join(process.cwd(), "src/contents");

  if (!fs.existsSync(contentsDir)) {
    console.log("No contents directory found. Nothing to migrate.");
    return;
  }

  const files = fs
    .readdirSync(contentsDir)
    .filter((f) => f.endsWith(".md"));

  if (files.length === 0) {
    console.log("No markdown files found. Nothing to migrate.");
    return;
  }

  console.log(`Found ${files.length} markdown file(s) to migrate.\n`);

  const allTags = new Set<string>();

  // First pass: collect all tags
  for (const filename of files) {
    const filePath = path.join(contentsDir, filename);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data } = matter(fileContents);
    const frontmatter = data as OldFrontmatter;

    if (frontmatter.tags) {
      frontmatter.tags.forEach((tag) => allTags.add(tag));
    }
  }

  // Create all tags first
  if (allTags.size > 0) {
    console.log(`Creating ${allTags.size} tag(s)...`);
    for (const tag of allTags) {
      await createTagIfNotExists(tag);
    }
    console.log();
  }

  // Migrate articles
  for (const filename of files) {
    const slug = filename.replace(/\.md$/, "");
    const filePath = path.join(contentsDir, filename);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);
    const frontmatter = data as OldFrontmatter;

    console.log(`Migrating: ${filename}`);
    console.log(`  Title: ${frontmatter.title}`);
    console.log(`  Date: ${frontmatter.date}`);
    console.log(`  Published: ${frontmatter.published}`);
    console.log(`  Tags: ${frontmatter.tags.join(", ")}`);

    const input: ArticleInput = {
      slug,
      title: frontmatter.title,
      description: frontmatter.description,
      content: content.trim(),
      status: frontmatter.published ? "published" : "draft",
      tags: frontmatter.tags,
    };

    try {
      await createArticle(input);
      console.log(`  ✓ Migrated successfully\n`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`  ✗ Failed: ${error.message}\n`);
      }
    }
  }

  console.log("Migration complete!");
}

migrate().catch(console.error);
