import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Env } from '../../index';
import { rateLimitMiddleware } from '../rateLimit';

function createTestApp() {
  const app = new Hono<{ Bindings: Env }>();

  app.use('*', rateLimitMiddleware);
  app.get('/test', (c) => c.json({ success: true }));
  app.post('/test', (c) => c.json({ success: true }));

  return app;
}

describe('rateLimitMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow requests under the limit', async () => {
    const app = createTestApp();

    const res = await app.request('/test', {
      headers: { 'cf-connecting-ip': '192.168.1.100' },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('should track requests per IP', async () => {
    const app = createTestApp();
    const ip = `test-ip-${Date.now()}`;

    // Make multiple requests
    for (let i = 0; i < 5; i++) {
      const res = await app.request('/test', {
        headers: { 'cf-connecting-ip': ip },
      });
      expect(res.status).toBe(200);
    }
  });

  it('should block POST requests over the limit (60 per minute)', async () => {
    const app = createTestApp();
    const ip = `rate-limit-post-${Date.now()}`;

    // Make 60 POST requests (should all succeed)
    for (let i = 0; i < 60; i++) {
      const res = await app.request('/test', {
        method: 'POST',
        headers: { 'cf-connecting-ip': ip },
      });
      expect(res.status).toBe(200);
    }

    // 61st POST request should be rate limited
    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'cf-connecting-ip': ip },
    });

    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toContain('Too many requests');
  });

  it('should allow more GET requests than POST (300 vs 60 per minute)', async () => {
    const app = createTestApp();
    const ip = `rate-limit-get-${Date.now()}`;

    // Make 100 GET requests (should all succeed since limit is 300)
    for (let i = 0; i < 100; i++) {
      const res = await app.request('/test', {
        headers: { 'cf-connecting-ip': ip },
      });
      expect(res.status).toBe(200);
    }
  });

  it('should use x-forwarded-for if cf-connecting-ip is not present', async () => {
    const app = createTestApp();

    const res = await app.request('/test', {
      headers: { 'x-forwarded-for': '10.0.0.1, 10.0.0.2' },
    });

    expect(res.status).toBe(200);
  });

  it('should handle missing IP headers', async () => {
    const app = createTestApp();

    const res = await app.request('/test');

    expect(res.status).toBe(200);
  });

  it('should allow different IPs independently', async () => {
    const app = createTestApp();
    const timestamp = Date.now();

    // Different IPs should have independent rate limits
    const res1 = await app.request('/test', {
      headers: { 'cf-connecting-ip': `ip-a-${timestamp}` },
    });
    const res2 = await app.request('/test', {
      headers: { 'cf-connecting-ip': `ip-b-${timestamp}` },
    });

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
  });
});
