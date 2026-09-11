/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

module.exports = nextConfig;
