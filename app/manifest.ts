import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Учебно-развивающая студия «Сфера»',
    short_name: 'Сфера',
    description: 'Занятия для детей в Горячем Ключе — подготовка к школе, помощь школьникам, английский, театр и другие развивающие направления.',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf8f4',
    theme_color: '#e8821e',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
    lang: 'ru',
  };
}
