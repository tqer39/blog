/**
 * Shared constants across the blog monorepo
 */

// ===========================================
// Port Numbers
// ===========================================
export const PORTS = {
  /** Next.js Blog App */
  BLOG: 3100,
  /** Hono CMS API (Cloudflare Workers) */
  CMS_API: 3101,
  /** R2 Local Emulator (MinIO) */
  R2_LOCAL: 3102,
  /** VitePress Documentation */
  DOCS: 3103,
} as const;

// ===========================================
// Base Domain
// ===========================================
export const BASE_DOMAIN = 'tqer39.dev';

// ===========================================
// Domain Configuration
// ===========================================
export const DOMAINS = {
  // Blog Frontend
  BLOG_LOCAL: `http://localhost:${PORTS.BLOG}`,
  BLOG_DEV: `https://blog-dev.${BASE_DOMAIN}`,
  BLOG_PROD: `https://blog.${BASE_DOMAIN}`,

  // CMS API
  CMS_API_LOCAL: `http://localhost:${PORTS.CMS_API}`,
  CMS_API_DEV: `https://cms-api-dev.${BASE_DOMAIN}.workers.dev`,
  CMS_API_PROD: `https://cms-api.${BASE_DOMAIN}.workers.dev`,

  // CDN (R2 Public)
  CDN: `https://cdn.${BASE_DOMAIN}`,
  CDN_DEV: `https://cdn-dev.${BASE_DOMAIN}`,
  R2_LOCAL: `http://localhost:${PORTS.R2_LOCAL}`,
} as const;

// ===========================================
// API Paths
// ===========================================
export const API_PATHS = {
  V1: '/v1',
  IMAGES_FILE: '/v1/images/file',
} as const;

// ===========================================
// CORS Origins for CMS API
// ===========================================
export const CORS_ORIGINS = [
  DOMAINS.BLOG_LOCAL,
  DOMAINS.BLOG_DEV,
  DOMAINS.BLOG_PROD,
] as const;

// ===========================================
// Helper Functions
// ===========================================

/**
 * Get local development image URL
 */
export function getLocalImageUrl(r2Key: string): string {
  return `${DOMAINS.CMS_API_LOCAL}${API_PATHS.IMAGES_FILE}/${r2Key}`;
}

/**
 * Get CDN image URL for production/dev
 * @param r2Key - The R2 key for the image
 * @param env - The environment ('prod' | 'dev')
 */
export function getCdnImageUrl(
  r2Key: string,
  env: 'prod' | 'dev' = 'prod'
): string {
  const cdnDomain = env === 'dev' ? DOMAINS.CDN_DEV : DOMAINS.CDN;
  return `${cdnDomain}/${r2Key}`;
}

// ===========================================
// Legacy exports (for backward compatibility)
// ===========================================

/**
 * Default CMS API URL for local development
 */
export const DEFAULT_API_URL = `${DOMAINS.CMS_API_LOCAL}${API_PATHS.V1}`;

/**
 * Number of articles to display per page
 */
export const ARTICLES_PER_PAGE = 10;

// ===========================================
// Image Upload Configuration
// ===========================================
export const IMAGE_UPLOAD = {
  /** Allowed MIME types for image uploads */
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ] as const,
  /** Maximum file size in bytes (10MB) */
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
} as const;

// ===========================================
// Rate Limiting Configuration
// ===========================================
export const RATE_LIMIT = {
  /** Time window in milliseconds (1 minute) */
  WINDOW_MS: 60 * 1000,
  /** Maximum requests per window */
  MAX_REQUESTS: 60,
} as const;
