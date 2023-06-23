/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['s.gravatar.com'],
  },
};

module.exports = nextConfig;
