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
        port: '8787',
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
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://cdn.tqer39.dev https://picsum.photos; font-src 'self'; connect-src 'self' http://localhost:* https://cdn.tqer39.dev; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
