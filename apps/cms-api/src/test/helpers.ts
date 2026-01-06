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
import type { Env } from '../index';

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
