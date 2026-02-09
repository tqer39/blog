import { CORS_ORIGINS } from '@blog/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { aiHandler } from './handlers/ai';
import { apiKeyHandler } from './handlers/api-key';
import { articlesHandler } from './handlers/articles';
import { categoriesHandler } from './handlers/categories';
import { imagesHandler } from './handlers/images';
import { importExportHandler } from './handlers/import-export';
import { settingsHandler } from './handlers/settings';
import { tagsHandler } from './handlers/tags';
import { webhookHandler } from './handlers/webhook';
import { ApiException } from './lib/errors';
import { authMiddleware } from './middleware/auth';
import { basicAuthMiddleware } from './middleware/basicAuth';
import { rateLimitMiddleware } from './middleware/rateLimit';

export interface Env {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  API_KEY: string;
  ENVIRONMENT: string;
  R2_PUBLIC_URL?: string;
  VERCEL_DEPLOY_HOOK_URL?: string;
  WEBHOOK_SECRET?: string;
  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  // Basic Auth for dev environment
  BASIC_AUTH_ENABLED?: string;
  BASIC_AUTH_USER?: string;
  BASIC_AUTH_PASS?: string;
}

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', basicAuthMiddleware);
app.use('*', rateLimitMiddleware);
app.use(
  '*',
  cors({
    origin: [...CORS_ORIGINS],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check (no auth required)
app.get('/health', (c) => c.json({ status: 'ok' }));

// API keys that need masking in public endpoint
const API_KEY_FIELDS = [
  'ai_openai_api_key',
  'ai_anthropic_api_key',
  'ai_gemini_api_key',
] as const;

function maskApiKeyValue(value: string): string {
  if (!value || value.length < 10) {
    return '****';
  }
  return `${value.slice(0, 10)}****`;
}

// Public settings endpoint (no auth required for reading)
app.get('/v1/settings', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT key, value, updated_at FROM site_settings'
  ).all();

  const settings: Record<string, string> = {};
  let latestUpdatedAt = '';

  for (const row of results || []) {
    const key = row.key as string;
    let value = row.value as string;

    // Mask API key values for safe display
    if (
      API_KEY_FIELDS.includes(key as (typeof API_KEY_FIELDS)[number]) &&
      value
    ) {
      value = maskApiKeyValue(value);
    }

    settings[key] = value;
    const updatedAt = row.updated_at as string;
    if (updatedAt > latestUpdatedAt) {
      latestUpdatedAt = updatedAt;
    }
  }

  return c.json(
    {
      settings,
      updatedAt: latestUpdatedAt || null,
    },
    200,
    {
      'Cache-Control': 'public, max-age=60, s-maxage=60',
    }
  );
});

// Public image serving (no auth required, for local development)
app.get('/v1/images/file/*', async (c) => {
  const r2Key = c.req.path.replace('/v1/images/file/', '');
  const object = await c.env.R2_BUCKET.get(r2Key);

  if (!object) {
    return c.json(
      { error: { code: 'NOT_FOUND', message: 'Image not found' } },
      404
    );
  }

  const headers = new Headers();
  headers.set(
    'Content-Type',
    object.httpMetadata?.contentType || 'application/octet-stream'
  );
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  return new Response(object.body, { headers });
});

// Public image serving by ID (no auth required)
app.get('/v1/images/:id/file', async (c) => {
  const id = c.req.param('id');

  const row = await c.env.DB.prepare('SELECT r2_key FROM images WHERE id = ?')
    .bind(id)
    .first<{ r2_key: string }>();

  if (!row) {
    return c.json(
      { error: { code: 'NOT_FOUND', message: 'Image not found' } },
      404
    );
  }

  const object = await c.env.R2_BUCKET.get(row.r2_key);

  if (!object) {
    return c.json(
      { error: { code: 'NOT_FOUND', message: 'Image file not found' } },
      404
    );
  }

  const headers = new Headers();
  headers.set(
    'Content-Type',
    object.httpMetadata?.contentType || 'application/octet-stream'
  );
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  return new Response(object.body, { headers });
});

// API v1 routes (auth required)
const v1 = new Hono<{ Bindings: Env }>();
v1.use('*', authMiddleware);
v1.route('/ai', aiHandler);
v1.route('/api-key', apiKeyHandler);
v1.route('/articles', articlesHandler);
v1.route('/categories', categoriesHandler);
v1.route('/tags', tagsHandler);
v1.route('/images', imagesHandler);
v1.route('/import', importExportHandler);
v1.route('/export', importExportHandler);
v1.route('/webhook', webhookHandler);
v1.route('/settings', settingsHandler);

app.route('/v1', v1);

// 404 handler
app.notFound((c) =>
  c.json(
    {
      error: {
        code: 'NOT_FOUND',
        message: 'Not Found',
      },
    },
    404
  )
);

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);

  // Handle structured API exceptions
  if (err instanceof ApiException) {
    return c.json(
      {
        error: {
          code: err.code,
          message: err.message,
          ...(err.details && { details: err.details }),
        },
      },
      err.status as 400 | 401 | 404 | 409 | 500
    );
  }

  // Handle unexpected errors
  const message =
    c.env.ENVIRONMENT === 'prod'
      ? 'An unexpected error occurred'
      : err.message || 'An unexpected error occurred';

  return c.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message,
      },
    },
    500
  );
});

export default app;
