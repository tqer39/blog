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
  'author_avatar_id',
  'footer_text',
  'social_github',
  'social_twitter',
  'social_bento',
  'social_bluesky',
  'social_threads',
  'social_linkedin',
  'social_wantedly',
  'social_lapras',
  'social_devto',
  'social_hackernews',
  'social_hatena',
  'social_medium',
  'social_note',
  'social_qiita',
  'social_reddit',
  'social_techfeed',
  'social_zenn',
  'show_rss_link',
  'show_github_link',
  'show_twitter_link',
  'show_bento_link',
  'show_bluesky_link',
  'show_threads_link',
  'show_linkedin_link',
  'show_wantedly_link',
  'show_lapras_link',
  'show_devto_link',
  'show_hackernews_link',
  'show_hatena_link',
  'show_medium_link',
  'show_note_link',
  'show_qiita_link',
  'show_reddit_link',
  'show_techfeed_link',
  'show_zenn_link',
  'ai_openai_api_key',
  'ai_anthropic_api_key',
  'ai_gemini_api_key',
  'ga_measurement_id',
] as const;

// API key management fields (managed by /api/api-key/* endpoints)
// These should be filtered out from settings update to prevent accidental overwrites
const API_KEY_MANAGEMENT_KEYS = [
  'cms_api_key_hash',
  'cms_api_key_created_at',
  'cms_api_key_enabled',
];

// API keys that need masking in GET response
const API_KEY_FIELDS = [
  'ai_openai_api_key',
  'ai_anthropic_api_key',
  'ai_gemini_api_key',
] as const;

// URL keys that require scheme validation
const URL_KEYS = [
  'social_github',
  'social_twitter',
  'social_bento',
  'social_bluesky',
  'social_threads',
  'social_linkedin',
  'social_wantedly',
  'social_lapras',
  'social_devto',
  'social_hackernews',
  'social_hatena',
  'social_medium',
  'social_note',
  'social_qiita',
  'social_reddit',
  'social_techfeed',
  'social_zenn',
] as const;
const ALLOWED_SCHEMES = ['https:', 'http:'];

/**
 * Mask an API key value for safe display
 * Shows first 4 characters followed by ****
 */
function maskApiKeyValue(value: string): string {
  if (!value || value.length < 4) {
    return '****';
  }
  return `${value.slice(0, 4)}****`;
}

/**
 * Check if a value is a masked API key value that should be ignored
 */
function isMaskedValue(value: string): boolean {
  return value.endsWith('****');
}

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

  // Filter out API key management fields (managed by /api/api-key/*)
  const filteredInput = Object.fromEntries(
    Object.entries(input).filter(
      ([key]) => !API_KEY_MANAGEMENT_KEYS.includes(key)
    )
  ) as SiteSettingsInput;

  // Validate input keys
  for (const key of Object.keys(filteredInput)) {
    if (!ALLOWED_KEYS.includes(key as (typeof ALLOWED_KEYS)[number])) {
      validationError(`Unknown setting key: ${key}`);
    }
  }

  // Validate required fields are not empty strings
  if (
    filteredInput.site_name !== undefined &&
    filteredInput.site_name.trim() === ''
  ) {
    validationError('site_name cannot be empty');
  }

  // Validate URL schemes for social links
  for (const key of URL_KEYS) {
    if (filteredInput[key] !== undefined) {
      validateUrlScheme(filteredInput[key] as string, key);
    }
  }

  // Batch update using upsert
  // For API keys: skip masked values, but allow empty strings (for deletion)
  const upsertStatements = Object.entries(filteredInput)
    .filter(([key, value]) => {
      if (value === undefined) return false;

      // For API key fields, skip masked values but allow empty strings
      if (API_KEY_FIELDS.includes(key as (typeof API_KEY_FIELDS)[number])) {
        // Skip masked values (user didn't change the key)
        if (isMaskedValue(value as string)) {
          return false;
        }
        // Empty strings will be handled separately as DELETE
        if (value === '') {
          return false;
        }
      }

      return true;
    })
    .map(([key, value]) =>
      c.env.DB.prepare(
        'INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = ?'
      ).bind(key, value, value)
    );

  // Delete API keys that are set to empty string
  const deleteStatements = Object.entries(filteredInput)
    .filter(([key, value]) => {
      if (value === undefined) return false;
      if (!API_KEY_FIELDS.includes(key as (typeof API_KEY_FIELDS)[number])) {
        return false;
      }
      return value === '';
    })
    .map(([key]) =>
      c.env.DB.prepare('DELETE FROM site_settings WHERE key = ?').bind(key)
    );

  const allStatements = [...upsertStatements, ...deleteStatements];
  if (allStatements.length > 0) {
    await c.env.DB.batch(allStatements);
  }

  // Return updated settings
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

  return c.json({
    settings: settings as unknown as SiteSettings,
    updatedAt: latestUpdatedAt || null,
  });
});
