import type { ApiKeyStatus, GenerateApiKeyResponse } from '@blog/cms-types';
import { Hono } from 'hono';
import type { Env } from '../index';

export const apiKeyHandler = new Hono<{ Bindings: Env }>();

/**
 * Generate a cryptographically secure random API key
 */
function generateSecureKey(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
}

/**
 * Hash an API key using SHA-256
 */
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Get API key status
apiKeyHandler.get('/status', async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT key, value FROM site_settings WHERE key IN ('cms_api_key_hash', 'cms_api_key_created_at', 'cms_api_key_enabled')"
  ).all();

  const settings: Record<string, string> = {};
  for (const row of results || []) {
    settings[row.key as string] = row.value as string;
  }

  const status: ApiKeyStatus = {
    hasKey: !!settings.cms_api_key_hash,
    enabled: settings.cms_api_key_enabled !== 'false',
    createdAt: settings.cms_api_key_created_at || null,
  };

  return c.json(status);
});

// Generate new API key
apiKeyHandler.post('/generate', async (c) => {
  const newKey = generateSecureKey();
  const hashedKey = await hashApiKey(newKey);
  const createdAt = new Date().toISOString();

  // Store hashed key in database
  await c.env.DB.batch([
    c.env.DB.prepare(
      'INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = ?'
    ).bind('cms_api_key_hash', hashedKey, hashedKey),
    c.env.DB.prepare(
      'INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = ?'
    ).bind('cms_api_key_created_at', createdAt, createdAt),
    c.env.DB.prepare(
      'INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = ?'
    ).bind('cms_api_key_enabled', 'true', 'true'),
  ]);

  const response: GenerateApiKeyResponse = {
    key: newKey,
    createdAt,
  };

  return c.json(response);
});

// Disable API key
apiKeyHandler.post('/disable', async (c) => {
  await c.env.DB.prepare(
    'INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = ?'
  )
    .bind('cms_api_key_enabled', 'false', 'false')
    .run();

  return c.json({ success: true });
});

// Enable API key
apiKeyHandler.post('/enable', async (c) => {
  await c.env.DB.prepare(
    'INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = ?'
  )
    .bind('cms_api_key_enabled', 'true', 'true')
    .run();

  return c.json({ success: true });
});
