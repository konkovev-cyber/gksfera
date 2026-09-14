/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async redirects() {
    return [
      {
        // Блог закрыт: в таблице 0 записей, раздел на сайте был пустой.
        // Ссылки, которые успели проиндексироваться, ведут в новости —
        // там теперь и редактор, и живые записи.
        source: "/blog/:path*",
        destination: "/news",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
