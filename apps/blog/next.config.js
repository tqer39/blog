const isDev = process.env.NODE_ENV !== 'production';

// Build CSP header based on environment
const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    'https://cdn.jsdelivr.net',
    'https://www.googletagmanager.com',
    // unsafe-eval and unsafe-inline only in development
    ...(isDev ? ["'unsafe-eval'", "'unsafe-inline'"] : []),
  ],
  'style-src': [
    "'self'",
    // unsafe-inline only in development (needed for Mermaid SVG styles in production too)
    "'unsafe-inline'",
  ],
  'img-src': [
    "'self'",
    'data:',
    'https://cdn.tqer39.dev',
    'https://picsum.photos',
    ...(isDev ? ['http://localhost:3200'] : []),
  ],
  'font-src': ["'self'"],
  'connect-src': [
    "'self'",
    'https://cdn.tqer39.dev',
    'https://www.google-analytics.com',
    'https://analytics.google.com',
    ...(isDev ? ['http://localhost:*'] : []),
  ],
  'frame-ancestors': ["'none'"],
};

const cspHeader = Object.entries(cspDirectives)
  .map(([key, values]) => `${key} ${values.join(' ')}`)
  .join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/blog-images/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3200',
        pathname: '/v1/images/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.tqer39.dev',
        pathname: '/**',
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
