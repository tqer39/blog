/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['s.gravatar.com'],
  },
  i18n: {
    locales: ['ja'],
    defaultLocale: 'ja',
  },
};

module.exports = nextConfig;
