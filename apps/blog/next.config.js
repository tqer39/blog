/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/blog-images/**",
      },
      {
        protocol: "https",
        hostname: "cdn.tqer39.dev",
        pathname: "/images/**",
      },
    ],
  },
};

module.exports = nextConfig;
