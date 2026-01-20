// Environment configuration (synced with packages/config/src/constants.ts)
const PORTS = {
  BLOG: 3100,
  CMS_API: 3101,
  R2_LOCAL: 3102,
};
const BASE_DOMAIN = 'tqer39.dev';
const DOMAINS = {
  CDN: `https://cdn.${BASE_DOMAIN}`,
  CMS_API_LOCAL: `http://localhost:${PORTS.CMS_API}`,
};

const isDev = process.env.NODE_ENV !== 'production';

// Build CSP header based on environment
const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    'https://cdn.jsdelivr.net',
    'https://www.googletagmanager.com',
    // unsafe-inline needed for Next.js hydration scripts
    "'unsafe-inline'",
    // unsafe-eval only in development
    ...(isDev ? ["'unsafe-eval'"] : []),
  ],
  'style-src': [
    "'self'",
    // unsafe-inline only in development (needed for Mermaid SVG styles in production too)
    "'unsafe-inline'",
    // Google Fonts for react-chrono
    'https://fonts.googleapis.com',
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    DOMAINS.CDN,
    'https://picsum.photos',
    'https://*.picsum.photos',
    'https://images.unsplash.com',
    ...(isDev ? [DOMAINS.CMS_API_LOCAL] : []),
  ],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'connect-src': [
    "'self'",
    DOMAINS.CDN,
    'https://www.google-analytics.com',
    'https://analytics.google.com',
    'https://raw.githubusercontent.com',
    'https://raw.githack.com',
    ...(isDev ? ['http://localhost:*'] : []),
  ],
  'worker-src': ["'self'", 'blob:'],
  'frame-ancestors': ["'none'"],
};

const cspHeader = Object.entries(cspDirectives)
  .map(([key, values]) => `${key} ${values.join(' ')}`)
  .join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3101',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3102',
      },
      {
        protocol: 'https',
        hostname: `cdn.${BASE_DOMAIN}`,
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
