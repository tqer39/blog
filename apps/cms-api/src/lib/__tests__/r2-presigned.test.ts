import { describe, expect, it, vi } from 'vitest';
import { generatePresignedUrl, getPublicUrl } from '../r2-presigned';
import type { Env } from '../../index';

// Mock aws4fetch
vi.mock('aws4fetch', () => ({
  AwsClient: class MockAwsClient {
    sign() {
      return Promise.resolve({
        url: 'https://signed-url.example.com/bucket/key?signature=xxx',
      });
    }
  },
}));

const createMockEnv = (overrides: Partial<Env> = {}): Env =>
  ({
    DB: {} as D1Database,
    R2_BUCKET: {} as R2Bucket,
    CLOUDFLARE_ACCOUNT_ID: undefined,
    R2_ACCESS_KEY_ID: undefined,
    R2_SECRET_ACCESS_KEY: undefined,
    R2_BUCKET_NAME: undefined,
    R2_PUBLIC_URL: undefined,
    ENVIRONMENT: undefined,
    ...overrides,
  }) as Env;

describe('generatePresignedUrl', () => {
  it('should return null when CLOUDFLARE_ACCOUNT_ID is missing', async () => {
    const env = createMockEnv({
      R2_ACCESS_KEY_ID: 'key',
      R2_SECRET_ACCESS_KEY: 'secret',
      R2_BUCKET_NAME: 'bucket',
    });

    const result = await generatePresignedUrl(env, { r2Key: 'test/key.png' });
    expect(result).toBeNull();
  });

  it('should return null when R2_ACCESS_KEY_ID is missing', async () => {
    const env = createMockEnv({
      CLOUDFLARE_ACCOUNT_ID: 'account',
      R2_SECRET_ACCESS_KEY: 'secret',
      R2_BUCKET_NAME: 'bucket',
    });

    const result = await generatePresignedUrl(env, { r2Key: 'test/key.png' });
    expect(result).toBeNull();
  });

  it('should return null when R2_SECRET_ACCESS_KEY is missing', async () => {
    const env = createMockEnv({
      CLOUDFLARE_ACCOUNT_ID: 'account',
      R2_ACCESS_KEY_ID: 'key',
      R2_BUCKET_NAME: 'bucket',
    });

    const result = await generatePresignedUrl(env, { r2Key: 'test/key.png' });
    expect(result).toBeNull();
  });

  it('should return null when R2_BUCKET_NAME is missing', async () => {
    const env = createMockEnv({
      CLOUDFLARE_ACCOUNT_ID: 'account',
      R2_ACCESS_KEY_ID: 'key',
      R2_SECRET_ACCESS_KEY: 'secret',
    });

    const result = await generatePresignedUrl(env, { r2Key: 'test/key.png' });
    expect(result).toBeNull();
  });

  it('should return presigned URL when all credentials are configured', async () => {
    const env = createMockEnv({
      CLOUDFLARE_ACCOUNT_ID: 'account',
      R2_ACCESS_KEY_ID: 'key',
      R2_SECRET_ACCESS_KEY: 'secret',
      R2_BUCKET_NAME: 'bucket',
    });

    const result = await generatePresignedUrl(env, { r2Key: 'test/key.png' });
    expect(result).toBe(
      'https://signed-url.example.com/bucket/key?signature=xxx'
    );
  });

  it('should use custom expiresIn when provided', async () => {
    const env = createMockEnv({
      CLOUDFLARE_ACCOUNT_ID: 'account',
      R2_ACCESS_KEY_ID: 'key',
      R2_SECRET_ACCESS_KEY: 'secret',
      R2_BUCKET_NAME: 'bucket',
    });

    const result = await generatePresignedUrl(env, {
      r2Key: 'test/key.png',
      expiresIn: 7200,
    });
    expect(result).toBe(
      'https://signed-url.example.com/bucket/key?signature=xxx'
    );
  });
});

describe('getPublicUrl', () => {
  it('should return presigned URL when credentials are configured', async () => {
    const env = createMockEnv({
      CLOUDFLARE_ACCOUNT_ID: 'account',
      R2_ACCESS_KEY_ID: 'key',
      R2_SECRET_ACCESS_KEY: 'secret',
      R2_BUCKET_NAME: 'bucket',
    });

    const result = await getPublicUrl(env, 'images/2024/01/test.png');
    expect(result).toBe(
      'https://signed-url.example.com/bucket/key?signature=xxx'
    );
  });

  it('should return CDN URL when R2_PUBLIC_URL is configured but no credentials', async () => {
    const env = createMockEnv({
      R2_PUBLIC_URL: 'https://cdn.example.com',
    });

    const result = await getPublicUrl(env, 'images/2024/01/test.png');
    expect(result).toBe('https://cdn.example.com/images/2024/01/test.png');
  });

  it('should return local URL in development environment', async () => {
    const env = createMockEnv({
      ENVIRONMENT: 'development',
    });

    const result = await getPublicUrl(env, 'images/2024/01/test.png');
    expect(result).toBe(
      'http://localhost:8787/v1/images/file/images/2024/01/test.png'
    );
  });

  it('should return default CDN URL as fallback', async () => {
    const env = createMockEnv();

    const result = await getPublicUrl(env, 'images/2024/01/test.png');
    expect(result).toBe('https://cdn.tqer39.dev/images/2024/01/test.png');
  });

  it('should prioritize presigned URL over CDN URL', async () => {
    const env = createMockEnv({
      CLOUDFLARE_ACCOUNT_ID: 'account',
      R2_ACCESS_KEY_ID: 'key',
      R2_SECRET_ACCESS_KEY: 'secret',
      R2_BUCKET_NAME: 'bucket',
      R2_PUBLIC_URL: 'https://cdn.example.com',
    });

    const result = await getPublicUrl(env, 'images/2024/01/test.png');
    // Should return presigned URL, not CDN URL
    expect(result).toBe(
      'https://signed-url.example.com/bucket/key?signature=xxx'
    );
  });

  it('should prioritize CDN URL over development URL', async () => {
    const env = createMockEnv({
      R2_PUBLIC_URL: 'https://cdn.example.com',
      ENVIRONMENT: 'development',
    });

    const result = await getPublicUrl(env, 'images/2024/01/test.png');
    // Should return CDN URL, not localhost
    expect(result).toBe('https://cdn.example.com/images/2024/01/test.png');
  });
});
