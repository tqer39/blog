import type { Image, ImageUploadResponse } from '@blog/cms-types';
import { generateId } from '@blog/utils';
import { Hono } from 'hono';
import type { Env } from '../index';
import { notFound, validationError } from '../lib/errors';
import { getPublicUrl } from '../lib/r2-presigned';

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
    validationError('Invalid input', { file: 'Required' });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    validationError('Invalid input', {
      file: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`,
    });
  }

  if (file.size > MAX_SIZE) {
    validationError('Invalid input', {
      file: `File too large. Max size: ${MAX_SIZE / 1024 / 1024}MB`,
    });
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

  const publicUrl = await getPublicUrl(c.env, r2Key);

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
    notFound('Image not found');
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
    notFound('Image not found');
  }

  const image = await mapRowToImage(row, c.env);

  return c.json(image);
});

// Delete image
imagesHandler.delete('/:id', async (c) => {
  const id = c.req.param('id');

  const row = await c.env.DB.prepare('SELECT r2_key FROM images WHERE id = ?')
    .bind(id)
    .first<{ r2_key: string }>();

  if (!row) {
    notFound('Image not found');
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

  const images: Image[] = await Promise.all(
    (results || []).map((row) => mapRowToImage(row, c.env))
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

async function mapRowToImage(
  row: Record<string, unknown>,
  env: Env
): Promise<Image> {
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
    url: await getPublicUrl(env, r2Key),
  };
}
