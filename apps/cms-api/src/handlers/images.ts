import type { Image, ImageUploadResponse } from '@blog/cms-types';
import { Hono } from 'hono';
import type { Env } from '../index';
import { generateId } from '../lib/utils';

export const imagesHandler = new Hono<{ Bindings: Env }>();

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// Upload image
imagesHandler.post('/', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;
  const articleId = formData.get('articleId') as string | null;
  const altText = formData.get('altText') as string | null;

  if (!file) {
    return c.json({ error: 'No file provided' }, 400);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return c.json(
      { error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}` },
      400
    );
  }

  if (file.size > MAX_SIZE) {
    return c.json(
      { error: `File too large. Max size: ${MAX_SIZE / 1024 / 1024}MB` },
      400
    );
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const id = generateId();
  const ext =
    getExtension(file.name) || getExtensionFromMime(file.type) || 'bin';
  const filename = `${id}.${ext}`;
  const r2Key = `images/${year}/${month}/${filename}`;

  // Upload to R2
  const arrayBuffer = await file.arrayBuffer();
  await c.env.R2_BUCKET.put(r2Key, arrayBuffer, {
    httpMetadata: {
      contentType: file.type,
      cacheControl: 'public, max-age=31536000, immutable',
    },
  });

  // Save metadata to D1
  await c.env.DB.prepare(
    `INSERT INTO images (id, article_id, filename, original_filename, r2_key, mime_type, size_bytes, alt_text)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      articleId,
      filename,
      file.name,
      r2Key,
      file.type,
      file.size,
      altText
    )
    .run();

  const publicUrl = getPublicUrl(c.env, r2Key);

  const response: ImageUploadResponse = {
    id,
    url: publicUrl,
    filename,
    mimeType: file.type,
    sizeBytes: file.size,
  };

  return c.json(response, 201);
});

// Serve image file (for local development)
imagesHandler.get('/file/*', async (c) => {
  const r2Key = c.req.path.replace('/v1/images/file/', '');

  const object = await c.env.R2_BUCKET.get(r2Key);

  if (!object) {
    return c.json({ error: 'Image not found' }, 404);
  }

  const headers = new Headers();
  headers.set(
    'Content-Type',
    object.httpMetadata?.contentType || 'application/octet-stream'
  );
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  return new Response(object.body, { headers });
});

// Get image metadata
imagesHandler.get('/:id', async (c) => {
  const id = c.req.param('id');

  const row = await c.env.DB.prepare('SELECT * FROM images WHERE id = ?')
    .bind(id)
    .first();

  if (!row) {
    return c.json({ error: 'Image not found' }, 404);
  }

  const image = mapRowToImage(row, c.env);

  return c.json(image);
});

// Delete image
imagesHandler.delete('/:id', async (c) => {
  const id = c.req.param('id');

  const row = await c.env.DB.prepare('SELECT r2_key FROM images WHERE id = ?')
    .bind(id)
    .first<{ r2_key: string }>();

  if (!row) {
    return c.json({ error: 'Image not found' }, 404);
  }

  // Delete from R2
  await c.env.R2_BUCKET.delete(row.r2_key);

  // Delete from D1
  await c.env.DB.prepare('DELETE FROM images WHERE id = ?').bind(id).run();

  return c.json({ success: true });
});

// List images for an article
imagesHandler.get('/article/:articleId', async (c) => {
  const articleId = c.req.param('articleId');

  const { results } = await c.env.DB.prepare(
    'SELECT * FROM images WHERE article_id = ? ORDER BY created_at DESC'
  )
    .bind(articleId)
    .all();

  const images: Image[] = (results || []).map((row) =>
    mapRowToImage(row, c.env)
  );

  return c.json({ images });
});

function getExtension(filename: string): string | null {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || null : null;
}

function getExtensionFromMime(mimeType: string): string | null {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  };
  return map[mimeType] || null;
}

function getPublicUrl(env: Env, r2Key: string): string {
  if (env.R2_PUBLIC_URL) {
    return `${env.R2_PUBLIC_URL}/${r2Key}`;
  }
  // Local development: serve via CMS API
  if (env.ENVIRONMENT === 'development') {
    return `http://localhost:8787/v1/images/file/${r2Key}`;
  }
  return `https://cdn.tqer39.dev/${r2Key}`;
}

function mapRowToImage(row: Record<string, unknown>, env: Env): Image {
  const r2Key = row.r2_key as string;
  return {
    id: row.id as string,
    articleId: row.article_id as string | null,
    filename: row.filename as string,
    originalFilename: row.original_filename as string,
    r2Key,
    mimeType: row.mime_type as string,
    sizeBytes: row.size_bytes as number,
    altText: row.alt_text as string | null,
    createdAt: row.created_at as string,
    url: getPublicUrl(env, r2Key),
  };
}
