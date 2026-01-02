import { vi } from "vitest";
import type { Env } from "../index";

/**
 * Mock D1 prepared statement
 */
export function createMockStatement(options: {
  first?: unknown;
  all?: { results: unknown[] };
  run?: { meta: { changes: number } };
}) {
  return {
    bind: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue(options.first ?? null),
    all: vi.fn().mockResolvedValue(options.all ?? { results: [] }),
    run: vi.fn().mockResolvedValue(options.run ?? { meta: { changes: 0 } }),
  };
}

/**
 * Create a mock D1Database
 */
export function createMockDB() {
  const mockStatements = new Map<string, ReturnType<typeof createMockStatement>>();

  return {
    prepare: vi.fn((sql: string) => {
      // Return existing mock if set, otherwise create a default one
      const existing = mockStatements.get(sql);
      if (existing) return existing;

      // Default mock that returns empty results
      return createMockStatement({});
    }),
    // Helper to set up specific query responses
    mockQuery: (sql: string, response: Parameters<typeof createMockStatement>[0]) => {
      mockStatements.set(sql, createMockStatement(response));
    },
    // Helper to get the mock for assertions
    getMock: () => mockStatements,
  };
}

/**
 * Create mock environment bindings
 */
export function createMockEnv(overrides?: Partial<Env>): Env {
  return {
    DB: createMockDB() as unknown as D1Database,
    BUCKET: {} as R2Bucket,
    API_KEY: "test-api-key",
    VERCEL_DEPLOY_HOOK_URL: "https://api.vercel.com/test-hook",
    PUBLIC_URL: "http://localhost:8787",
    ...overrides,
  };
}

/**
 * Create authorization header
 */
export function authHeader(apiKey = "test-api-key") {
  return { Authorization: `Bearer ${apiKey}` };
}

/**
 * Sample article data for tests
 */
export const sampleArticle = {
  id: "test-article-id",
  slug: "test-article",
  title: "Test Article",
  description: "A test article",
  content: "# Test Content",
  status: "draft",
  published_at: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

/**
 * Sample tag data for tests
 */
export const sampleTag = {
  id: "test-tag-id",
  name: "Test Tag",
  slug: "test-tag",
  created_at: "2024-01-01T00:00:00Z",
};
