/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['s.gravatar.com'],
  },
  i18n: {
    locales: ['ja'],
    defaultLocale: 'ja',
  },
};

module.exports = nextConfig;
