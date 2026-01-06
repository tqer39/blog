import { vi } from 'vitest';

/**
 * Options for creating a mock D1 prepared statement
 */
export interface MockStatementOptions {
  first?: unknown;
  all?: { results: unknown[] };
  run?: { meta: { changes: number } };
}

/**
 * Create a mock D1 prepared statement
 */
export function createMockStatement(options: MockStatementOptions = {}) {
  return {
    bind: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue(options.first ?? null),
    all: vi.fn().mockResolvedValue(options.all ?? { results: [] }),
    run: vi.fn().mockResolvedValue(options.run ?? { meta: { changes: 0 } }),
  };
}

/**
 * Create a mock D1Database with query tracking
 */
export function createMockDB() {
  const mockStatements = new Map<
    string,
    ReturnType<typeof createMockStatement>
  >();

  const db = {
    prepare: vi.fn((sql: string) => {
      const existing = mockStatements.get(sql);
      if (existing) return existing;
      return createMockStatement({});
    }),
    /**
     * Set up a specific query response
     */
    mockQuery: (sql: string, response: MockStatementOptions) => {
      mockStatements.set(sql, createMockStatement(response));
    },
    /**
     * Get the internal mock map for assertions
     */
    getMock: () => mockStatements,
    /**
     * Clear all mocked queries
     */
    clearMocks: () => {
      mockStatements.clear();
    },
  };

  return db;
}

/**
 * Create a mock R2 bucket
 */
export function createMockR2Bucket() {
  return {
    put: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(undefined),
    list: vi.fn().mockResolvedValue({ objects: [] }),
  };
}
