import type { Context, Next } from 'hono';
import type { Env } from '../index';
import { unauthorized } from '../lib/errors';

/**
 * Hash an API key using SHA-256 (same as in api-key handler)
 */
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Compare with dummy to maintain constant time
    const dummy = 'x'.repeat(a.length);
    let result = 0;
    for (let i = 0; i < dummy.length; i++) {
      result |= dummy.charCodeAt(i) ^ a.charCodeAt(i);
    }
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function authMiddleware(
  c: Context<{ Bindings: Env }>,
  next: Next
) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    unauthorized('Missing or invalid token');
  }

  const token = authHeader.slice(7);

  // 1. Check environment variable API key first (timing-safe)
  if (c.env.API_KEY && timingSafeEqual(token, c.env.API_KEY)) {
    await next();
    return;
  }

  // 2. Check database stored API key
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT key, value FROM site_settings WHERE key IN ('cms_api_key_hash', 'cms_api_key_enabled')"
    ).all();

    const settings: Record<string, string> = {};
    for (const row of results || []) {
      settings[row.key as string] = row.value as string;
    }

    const storedHash = settings.cms_api_key_hash;
    const isEnabled = settings.cms_api_key_enabled !== 'false';

    if (storedHash && isEnabled) {
      const tokenHash = await hashApiKey(token);
      if (timingSafeEqual(tokenHash, storedHash)) {
        await next();
        return;
      }
    }
  } catch {
    // Database error, fall through to unauthorized
  }

  unauthorized('Invalid API key');
}
