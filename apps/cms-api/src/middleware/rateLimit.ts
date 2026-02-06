import { RATE_LIMIT } from '@blog/config';
import type { Context, Next } from 'hono';
import type { Env } from '../index';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Separate stores for GET and mutating requests
// GET requests have a higher limit as they don't modify data
const rateLimitStoreGet = new Map<string, RateLimitEntry>();
const rateLimitStoreMutate = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
function cleanup(store: Map<string, RateLimitEntry>) {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}

export async function rateLimitMiddleware(
  c: Context<{ Bindings: Env }>,
  next: Next
) {
  // Get client IP from Cloudflare headers
  const clientIp =
    c.req.header('cf-connecting-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0] ||
    'unknown';

  const method = c.req.method;
  const isReadOnly =
    method === 'GET' || method === 'HEAD' || method === 'OPTIONS';

  // Use different stores and limits for read vs mutating requests
  // GET requests: 5x higher limit (300/min) to allow page navigation and refresh
  // Mutating requests: standard limit (60/min) for DoS protection
  const store = isReadOnly ? rateLimitStoreGet : rateLimitStoreMutate;
  const maxRequests = isReadOnly
    ? RATE_LIMIT.MAX_REQUESTS * 5
    : RATE_LIMIT.MAX_REQUESTS;

  const now = Date.now();
  const entry = store.get(clientIp);

  if (entry && entry.resetAt > now) {
    // Within current window
    if (entry.count >= maxRequests) {
      return c.json(
        { error: 'Too many requests. Please try again later.' },
        429
      );
    }
    entry.count++;
  } else {
    // New window
    store.set(clientIp, {
      count: 1,
      resetAt: now + RATE_LIMIT.WINDOW_MS,
    });
  }

  // Cleanup old entries occasionally (1% of requests)
  if (Math.random() < 0.01) {
    cleanup(rateLimitStoreGet);
    cleanup(rateLimitStoreMutate);
  }

  await next();
}
