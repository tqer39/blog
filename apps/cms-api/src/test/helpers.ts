/**
 * Re-export shared test utilities from @blog/test-utils
 * with CMS API specific bindings
 */
export {
  createMockStatement,
  createMockDB,
  createMockR2Bucket,
  createMockEnv,
  authHeader,
  jsonAuthHeaders,
  sampleArticle,
  sampleArticle2,
  sampleArticleRow,
  sampleTag,
  sampleTagRow,
  sampleTags,
} from '@blog/test-utils';

import { createMockDB, createMockR2Bucket } from '@blog/test-utils';
import type { Hono } from 'hono';
import type { Env } from '../index';
import { ApiException } from '../lib/errors';

/**
 * Create mock environment bindings with CMS API Env type
 */
export function createCmsApiEnv(overrides?: Partial<Env>): Env {
  return {
    DB: createMockDB() as unknown as D1Database,
    R2_BUCKET: createMockR2Bucket() as unknown as R2Bucket,
    API_KEY: 'test-api-key',
    ENVIRONMENT: 'development',
    R2_PUBLIC_URL: 'https://cdn.example.com',
    ...overrides,
  } as Env;
}

/**
 * Add the global error handler to a Hono app for testing.
 * This ensures ApiException errors are returned in the standard format.
 */
export function withErrorHandler<T extends { Bindings: Env }>(
  app: Hono<T>
): Hono<T> {
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
