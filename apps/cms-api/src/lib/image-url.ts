import { getCdnImageUrl, getLocalImageUrl } from '@blog/config';
import type { Env } from '../index';

/**
 * Get public URL for an R2 image.
 * Images are always publicly accessible via CDN.
 * - Development: Local API URL
 * - Production/Staging: CDN URL
 */
export function getImageUrl(env: Env, r2Key: string): string {
  // R2_PUBLIC_URL override (for custom CDN)
  if (env.R2_PUBLIC_URL) {
    return `${env.R2_PUBLIC_URL}/${r2Key}`;
  }

  // Local development: serve via CMS API
  if (env.ENVIRONMENT === 'development') {
    return getLocalImageUrl(r2Key);
  }

  // Production/Staging: use default CDN
  return getCdnImageUrl(r2Key);
}
