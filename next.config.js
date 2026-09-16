/** @type {import('next').NextConfig} */
const nextConfig = {
  // eslint.ignoreDuringBuilds снят: линт проходит чисто (next lint — 0 warnings),
  // а отключённая проверка на сборке позволяла предупреждениям копиться незаметно.
  // Оптимизация изображений включена: с unoptimized:true главная тянула ~5.7 МБ
  // оригиналов (геро-ротация — фото по 800–980 КБ), что роняло LCP на мобильном.
  // На Vercel это даёт AVIF/WebP + srcset под реальный размер блока. Разрешены
  // ровно те хосты, с которых реально берутся <Image>: свой домен и Supabase
  // Storage (карточки направлений, галерея, педагоги). Картинки внутри текстов
  // новостей — обычные <img> из VK, оптимизатору не передаются и не требуют
  // разрешения. Wildcard для supabase.co — на случай переноса проекта.
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "gksfera.vercel.app" },
      { protocol: "https", hostname: "sfera-goryachiy-klyuch.ru" },
    ],
    deviceSizes: [360, 420, 540, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [160, 220, 300, 400, 640, 800],
    minimumCacheTTL: 60 * 60 * 24, // сутки: фото меняются редко, пережатие дорогое
  },
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
