import type { SiteSettings, SiteSettingsInput } from '@blog/cms-types';
import { Hono } from 'hono';
import type { Env } from '../index';
import { validationError } from '../lib/errors';

export const settingsHandler = new Hono<{ Bindings: Env }>();

// Allowed setting keys for validation
const ALLOWED_KEYS = [
  'site_name',
  'site_description',
  'author_name',
  'footer_text',
  'social_github',
  'social_twitter',
  'social_bento',
  'show_rss_link',
] as const;

// URL keys that require scheme validation
const URL_KEYS = ['social_github', 'social_twitter', 'social_bento'] as const;
const ALLOWED_SCHEMES = ['https:', 'http:'];

/**
 * Validate URL scheme for social links
 * Prevents javascript:, data:, vbscript: and other dangerous protocols
 */
function validateUrlScheme(url: string, key: string): void {
  if (!url || url.trim() === '') {
    return; // Empty values are allowed (optional fields)
  }

  try {
    const parsed = new URL(url);
    if (!ALLOWED_SCHEMES.includes(parsed.protocol)) {
      validationError(
        `Invalid URL scheme for ${key}: only http/https are allowed`
      );
    }
  } catch {
    validationError(`Invalid URL format for ${key}`);
  }
}

// Get all settings (public, no auth required)
settingsHandler.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT key, value, updated_at FROM site_settings'
  ).all();

  const settings: Record<string, string> = {};
  let latestUpdatedAt = '';

  for (const row of results || []) {
    settings[row.key as string] = row.value as string;
    const updatedAt = row.updated_at as string;
    if (updatedAt > latestUpdatedAt) {
      latestUpdatedAt = updatedAt;
    }
  }

  return c.json(
    {
      settings: settings as unknown as SiteSettings,
      updatedAt: latestUpdatedAt || null,
    },
    200,
    {
      'Cache-Control': 'public, max-age=60, s-maxage=60',
    }
  );
});

// Update settings (auth required - handled by middleware in index.ts)
settingsHandler.put('/', async (c) => {
  const input = await c.req.json<SiteSettingsInput>();

  // Validate input keys
  for (const key of Object.keys(input)) {
    if (!ALLOWED_KEYS.includes(key as (typeof ALLOWED_KEYS)[number])) {
      validationError(`Unknown setting key: ${key}`);
    }
  }

  // Validate required fields are not empty strings
  if (input.site_name !== undefined && input.site_name.trim() === '') {
    validationError('site_name cannot be empty');
  }

  // Validate URL schemes for social links
  for (const key of URL_KEYS) {
    if (input[key] !== undefined) {
      validateUrlScheme(input[key] as string, key);
    }
  }

  // Batch update using upsert
  const statements = Object.entries(input)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) =>
      c.env.DB.prepare(
        'INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = ?'
      ).bind(key, value, value)
    );

  if (statements.length > 0) {
    await c.env.DB.batch(statements);
  }

  // Return updated settings
  const { results } = await c.env.DB.prepare(
    'SELECT key, value, updated_at FROM site_settings'
  ).all();

  const settings: Record<string, string> = {};
  let latestUpdatedAt = '';

  for (const row of results || []) {
    settings[row.key as string] = row.value as string;
    const updatedAt = row.updated_at as string;
    if (updatedAt > latestUpdatedAt) {
      latestUpdatedAt = updatedAt;
    }
  }

  return c.json({
    settings: settings as unknown as SiteSettings,
    updatedAt: latestUpdatedAt || null,
  });
});
