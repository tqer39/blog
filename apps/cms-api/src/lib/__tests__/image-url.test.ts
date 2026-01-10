import { describe, expect, it } from 'vitest';
import type { Env } from '../../index';
import { getImageUrl } from '../image-url';

const createMockEnv = (overrides: Partial<Env> = {}): Env =>
  ({
    DB: {} as D1Database,
    R2_BUCKET: {} as R2Bucket,
    R2_PUBLIC_URL: undefined,
    ENVIRONMENT: undefined,
    ...overrides,
  }) as Env;

describe('getImageUrl', () => {
  it('should return CDN URL when R2_PUBLIC_URL is configured', () => {
    const env = createMockEnv({
      R2_PUBLIC_URL: 'https://cdn.example.com',
    });

    const result = getImageUrl(env, 'i/abc123.jpg');
    expect(result).toBe('https://cdn.example.com/i/abc123.jpg');
  });

  it('should return local URL in development environment', () => {
    const env = createMockEnv({
      ENVIRONMENT: 'development',
    });

    const result = getImageUrl(env, 'i/abc123.jpg');
    expect(result).toBe('http://localhost:3200/v1/images/file/i/abc123.jpg');
  });

  it('should return default CDN URL as fallback', () => {
    const env = createMockEnv();

    const result = getImageUrl(env, 'i/abc123.jpg');
    expect(result).toBe('https://cdn.tqer39.dev/i/abc123.jpg');
  });

  it('should prioritize R2_PUBLIC_URL over development URL', () => {
    const env = createMockEnv({
      R2_PUBLIC_URL: 'https://cdn.example.com',
      ENVIRONMENT: 'development',
    });

    const result = getImageUrl(env, 'i/abc123.jpg');
    // Should return CDN URL, not localhost
    expect(result).toBe('https://cdn.example.com/i/abc123.jpg');
  });

  it('should handle legacy image paths', () => {
    const env = createMockEnv({
      R2_PUBLIC_URL: 'https://cdn.example.com',
    });

    const result = getImageUrl(env, 'images/2024/01/legacy.jpg');
    expect(result).toBe('https://cdn.example.com/images/2024/01/legacy.jpg');
  });
});
