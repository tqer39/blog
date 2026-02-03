import type {
  Image,
  ImageListResponse,
  ImageUploadResponse,
} from '@blog/cms-types';
import { IMAGE_UPLOAD } from '@blog/config';
import { generateId, generateImageId } from '@blog/utils';
import { Hono } from 'hono';
import type { Env } from '../index';
import { notFound, validationError } from '../lib/errors';
import { getImageUrl } from '../lib/image-url';

export const imagesHandler = new Hono<{ Bindings: Env }>();

// List all images with pagination
imagesHandler.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1', 10);
  const perPage = parseInt(c.req.query('perPage') || '50', 10);

  // Get total count
  const countResult = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM images'
  ).first<{ count: number }>();
  const total = countResult?.count || 0;
  const totalPages = Math.ceil(total / perPage);

  // Get paginated images
  const offset = (page - 1) * perPage;
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM images ORDER BY created_at DESC LIMIT ? OFFSET ?'
  )
    .bind(perPage, offset)
    .all();

  const images: Image[] = (results || []).map((row) =>
    mapRowToImage(row, c.env)
  );

  const response: ImageListResponse = {
    images,
    pagination: {
      page,
      perPage,
      total,
      totalPages,
    },
  };

  return c.json(response);
});

// Upload image
imagesHandler.post('/', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;
  const articleId = formData.get('articleId') as string | null;
  const altText = formData.get('altText') as string | null;

  if (!file) {
    validationError('Invalid input', { file: 'Required' });
  }

  if (
    !IMAGE_UPLOAD.ALLOWED_TYPES.includes(
      file.type as (typeof IMAGE_UPLOAD.ALLOWED_TYPES)[number]
    )
  ) {
    validationError('Invalid input', {
      file: `Invalid file type. Allowed: ${IMAGE_UPLOAD.ALLOWED_TYPES.join(', ')}`,
    });
  }

  if (file.size > IMAGE_UPLOAD.MAX_SIZE_BYTES) {
    validationError('Invalid input', {
      file: `File too large. Max size: ${IMAGE_UPLOAD.MAX_SIZE_BYTES / 1024 / 1024}MB`,
    });
  }

  const id = generateId();
  const imageId = generateImageId(); // ULID for time-sortable, unpredictable URL path
  const ext =
    getExtension(file.name) || getExtensionFromMime(file.type) || 'bin';
  const filename = `${imageId}.${ext}`;
  const r2Key = `i/${filename}`;

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

  const publicUrl = getImageUrl(c.env, r2Key);

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
    url: getImageUrl(env, r2Key),
  };
}
