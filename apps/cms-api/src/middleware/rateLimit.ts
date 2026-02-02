import { RATE_LIMIT } from '@blog/config';
import type { Context, Next } from 'hono';
import type { Env } from '../index';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store for rate limiting
// Note: This is per-isolate in Cloudflare Workers, so not perfectly distributed
// but provides basic DoS protection
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
function cleanup() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
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

  const now = Date.now();
  const entry = rateLimitStore.get(clientIp);

  if (entry && entry.resetAt > now) {
    // Within current window
    if (entry.count >= RATE_LIMIT.MAX_REQUESTS) {
      return c.json(
        { error: 'Too many requests. Please try again later.' },
        429
      );
    }
    entry.count++;
  } else {
    // New window
    rateLimitStore.set(clientIp, {
      count: 1,
      resetAt: now + RATE_LIMIT.WINDOW_MS,
    });
  }

  // Cleanup old entries occasionally (1% of requests)
  if (Math.random() < 0.01) {
    cleanup();
  }

  await next();
}
