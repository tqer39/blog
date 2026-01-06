import { createMockDB, createMockR2Bucket } from './db';

/**
 * CMS API environment type (simplified for testing)
 */
export interface MockEnv {
  DB: ReturnType<typeof createMockDB>;
  R2_BUCKET: ReturnType<typeof createMockR2Bucket>;
  API_KEY: string;
  ENVIRONMENT?: string;
  R2_PUBLIC_URL?: string;
  VERCEL_DEPLOY_HOOK_URL?: string;
  WEBHOOK_SECRET?: string;
  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;
}

/**
 * Create mock environment bindings for CMS API tests
 */
export function createMockEnv(overrides: Partial<MockEnv> = {}): MockEnv {
  return {
    DB: createMockDB(),
    R2_BUCKET: createMockR2Bucket(),
    API_KEY: 'test-api-key',
    ENVIRONMENT: 'development',
    R2_PUBLIC_URL: 'https://cdn.example.com',
    ...overrides,
  };
}
