import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiException } from '../../lib/errors';
import { webhookHandler } from '../webhook';

interface WebhookEnv {
  VERCEL_DEPLOY_HOOK_URL?: string;
  WEBHOOK_SECRET?: string;
}

function createTestApp(env: Partial<WebhookEnv> = {}) {
  const app = new Hono<{ Bindings: WebhookEnv }>();

  app.use('*', async (c, next) => {
    c.env = {
      VERCEL_DEPLOY_HOOK_URL: env.VERCEL_DEPLOY_HOOK_URL,
      WEBHOOK_SECRET: env.WEBHOOK_SECRET,
    };
    await next();
  });

  app.route('/webhook', webhookHandler);

  // Add error handler for structured errors
  app.onError((err, c) => {
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
    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: err.message || 'An unexpected error occurred',
        },
      },
      500
    );
  });

  return app;
}

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('webhookHandler', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('POST /webhook/rebuild', () => {
    it('should trigger rebuild successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ job: { id: 'job-123' } }),
      });

      const app = createTestApp({
        VERCEL_DEPLOY_HOOK_URL: 'https://api.vercel.com/deploy/hook',
      });

      const res = await app.request('/webhook/rebuild', { method: 'POST' });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Rebuild triggered successfully');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.vercel.com/deploy/hook',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should return 500 when VERCEL_DEPLOY_HOOK_URL is not configured', async () => {
      const app = createTestApp({});

      const res = await app.request('/webhook/rebuild', { method: 'POST' });

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error.code).toBe('INTERNAL_ERROR');
      expect(data.error.message).toBe('VERCEL_DEPLOY_HOOK_URL not configured');
    });

    it('should verify webhook secret when configured', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ job: { id: 'job-123' } }),
      });

      const app = createTestApp({
        VERCEL_DEPLOY_HOOK_URL: 'https://api.vercel.com/deploy/hook',
        WEBHOOK_SECRET: 'my-secret',
      });

      // Request with correct secret
      const res = await app.request('/webhook/rebuild', {
        method: 'POST',
        headers: { 'X-Webhook-Secret': 'my-secret' },
      });

      expect(res.status).toBe(200);
    });

    it('should return 401 when webhook secret is invalid', async () => {
      const app = createTestApp({
        VERCEL_DEPLOY_HOOK_URL: 'https://api.vercel.com/deploy/hook',
        WEBHOOK_SECRET: 'my-secret',
      });

      const res = await app.request('/webhook/rebuild', {
        method: 'POST',
        headers: { 'X-Webhook-Secret': 'wrong-secret' },
      });

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
      expect(data.error.message).toBe('Invalid webhook secret');
    });

    it('should return 401 when webhook secret is missing', async () => {
      const app = createTestApp({
        VERCEL_DEPLOY_HOOK_URL: 'https://api.vercel.com/deploy/hook',
        WEBHOOK_SECRET: 'my-secret',
      });

      const res = await app.request('/webhook/rebuild', { method: 'POST' });

      expect(res.status).toBe(401);
    });

    it('should handle Vercel API failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        text: () => Promise.resolve('Internal Server Error'),
      });

      const app = createTestApp({
        VERCEL_DEPLOY_HOOK_URL: 'https://api.vercel.com/deploy/hook',
      });

      const res = await app.request('/webhook/rebuild', { method: 'POST' });

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error.code).toBe('INTERNAL_ERROR');
      expect(data.error.message).toBe('Failed to trigger rebuild');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const app = createTestApp({
        VERCEL_DEPLOY_HOOK_URL: 'https://api.vercel.com/deploy/hook',
      });

      const res = await app.request('/webhook/rebuild', { method: 'POST' });

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error.code).toBe('INTERNAL_ERROR');
      expect(data.error.message).toBe('Failed to trigger rebuild');
    });
  });

  describe('GET /webhook/status', () => {
    it('should return status when webhook is configured', async () => {
      const app = createTestApp({
        VERCEL_DEPLOY_HOOK_URL: 'https://api.vercel.com/deploy/hook',
        WEBHOOK_SECRET: 'my-secret',
      });

      const res = await app.request('/webhook/status');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.configured).toBe(true);
      expect(data.webhookSecretConfigured).toBe(true);
    });

    it('should return status when webhook is not configured', async () => {
      const app = createTestApp({});

      const res = await app.request('/webhook/status');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.configured).toBe(false);
      expect(data.webhookSecretConfigured).toBe(false);
    });

    it('should return partial configuration status', async () => {
      const app = createTestApp({
        VERCEL_DEPLOY_HOOK_URL: 'https://api.vercel.com/deploy/hook',
      });

      const res = await app.request('/webhook/status');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.configured).toBe(true);
      expect(data.webhookSecretConfigured).toBe(false);
    });
  });
});
