import type { MetadataRoute } from 'next';
import { getContent, getAllNews } from '@/lib/content';
import { newsUrl } from '@/lib/news';
import { slugify } from '@/lib/utils';
import { SITE_ORIGIN } from '@/data/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_ORIGIN;
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/news`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/consent`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  try {
    const [{ data, visibility }, news] = await Promise.all([getContent(), getAllNews()]);
    // Страница расписания: только если раздел не отключён в админке.
    if (visibility.raspisanie !== false) {
      entries.push({
        url: `${baseUrl}/raspisanie`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
    // Страница галереи — по тому же принципу.
    if (visibility.gallery !== false) {
      entries.push({
        url: `${baseUrl}/gallery`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
    for (const p of data.programs) {
      entries.push({
        url: `${baseUrl}/programs/${slugify(p.title)}`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.9,
      });
    }
    for (const n of news) {
      const href = newsUrl(n);
      if (href === "/news") continue; // строка без ключа — ссылаться некуда
      entries.push({
        url: `${baseUrl}${href}`,
        lastModified: new Date(n.published_at),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  } catch {
    // БД недоступна — отдаём базовые страницы
  }

  return entries;
}
