import type { MetadataRoute } from 'next';
import { SITE_ORIGIN } from '@/data/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    // sitemap обязан смотреть на тот же хост, что отдаёт живой ответ: раньше
    // здесь был вписан домен, который пока не делегирован (NXDOMAIN), и
    // поисковики не находили карту. SITE_ORIGIN = NEXT_PUBLIC_SITE_URL, иначе
    // боевой vercel.app.
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
