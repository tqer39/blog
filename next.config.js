/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['s.gravatar.com'],
  },
};

module.exports = nextConfig;
