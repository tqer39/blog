import { AwsClient } from 'aws4fetch';
import type { Env } from '../index';

const PRESIGNED_URL_EXPIRY = 3600; // 1 hour

interface PresignedUrlOptions {
  r2Key: string;
  expiresIn?: number;
}

/**
 * Generate a presigned URL for R2 object access.
 * Only works in production with R2 API credentials configured.
 */
export async function generatePresignedUrl(
  env: Env,
  options: PresignedUrlOptions
): Promise<string | null> {
  const { r2Key, expiresIn = PRESIGNED_URL_EXPIRY } = options;

  // Check if R2 presigned URL credentials are configured
  if (
    !env.CLOUDFLARE_ACCOUNT_ID ||
    !env.R2_ACCESS_KEY_ID ||
    !env.R2_SECRET_ACCESS_KEY ||
    !env.R2_BUCKET_NAME
  ) {
    return null;
  }

  const r2 = new AwsClient({
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  });

  const endpoint = `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const url = new URL(`/${env.R2_BUCKET_NAME}/${r2Key}`, endpoint);

  // Add query parameters for presigned URL
  url.searchParams.set('X-Amz-Expires', String(expiresIn));

  const signed = await r2.sign(
    new Request(url.toString(), {
      method: 'GET',
    }),
    {
      aws: { signQuery: true },
    }
  );

  return signed.url;
}

/**
 * Get public URL for an R2 object.
 * - Production with R2 credentials: Presigned URL
 * - Production with R2_PUBLIC_URL: CDN URL
 * - Development: Local API URL
 */
export async function getPublicUrl(env: Env, r2Key: string): Promise<string> {
  // Try presigned URL first (production with credentials)
  const presignedUrl = await generatePresignedUrl(env, { r2Key });
  if (presignedUrl) {
    return presignedUrl;
  }

  // Fall back to CDN URL if configured
  if (env.R2_PUBLIC_URL) {
    return `${env.R2_PUBLIC_URL}/${r2Key}`;
  }

  // Local development: serve via CMS API
  if (env.ENVIRONMENT === 'development') {
    return `http://localhost:3200/v1/images/file/${r2Key}`;
  }

  // Default production CDN
  return `https://cdn.tqer39.dev/${r2Key}`;
}
