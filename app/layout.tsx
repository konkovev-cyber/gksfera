import './globals.css';
import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import { MotionProvider } from '@/components/site/MotionProvider';
import { getContent } from '@/lib/content';

const inter = Inter({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-inter',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getContent();
  const cfg = data.siteConfig as Record<string, unknown>;

  const title = String(cfg.seoTitle || 'Учебно-развивающая студия «Сфера» — занятия для детей в Горячем Ключе');
  const titleTemplate = String(cfg.seoTitleTemplate || '%s — «Сфера» Горячий Ключ');
  const description = String(cfg.seoDescription || 'Учебно-развивающая студия «Сфера» в Горячем Ключе. Подготовка к школе, помощь школьникам, английский язык, чистописание, развивающие занятия, театр. Для детей от 5 до 15 лет.');
  const keywords = String(cfg.seoKeywords || 'развивающие занятия Горячий Ключ,подготовка к школе Горячий Ключ,занятия для детей Горячий Ключ,Сфера Горячий Ключ');
  const ogImage = String(cfg.seoOgImage || '/og-image.png');
  const themeColor = String(cfg.seoThemeColor || 'hsl(32 85% 52%)');

  return {
    metadataBase: new URL('https://sfera-goryachiy-klyuch.ru'),
    title: { default: title, template: titleTemplate },
    description,
    keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
    authors: [{ name: 'Учебно-развивающая студия «Сфера»' }],
    creator: 'Учебно-развивающая студия «Сфера»',
    alternates: { canonical: '/' },
    themeColor,
    openGraph: {
      type: 'website',
      locale: 'ru_RU',
      url: 'https://sfera-goryachiy-klyuch.ru',
      siteName: 'Учебно-развивающая студия «Сфера»',
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'Учебно-развивающая студия «Сфера» — Горячий Ключ' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '32x32', type: 'image/png' },
        { url: '/icon.svg', type: 'image/svg+xml' },
      ],
      apple: '/apple-touch-icon.png',
      shortcut: '/favicon.ico',
    },
    manifest: '/manifest.webmanifest',
  };
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Учебно-развивающая студия «Сфера»',
  alternateName: 'Сфера',
  description:
    'Учебно-развивающая студия для детей в Горячем Ключе. Подготовка к школе, помощь школьникам, английский язык, чистописание, развивающие занятия, театр, семейное обучение.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Спортивный переулок, 13',
    addressLocality: 'Горячий Ключ',
    addressRegion: 'Краснодарский край',
    addressCountry: 'RU',
  },
  telephone: '+7 (918) 345-67-89',
  sameAs: ['https://vk.com/sfera_gk'],
  areaServed: 'Горячий Ключ',
  knowsAbout: [
    'Подготовка к школе',
    'Помощь школьникам',
    'Английский язык',
    'Чистописание',
    'Развивающие занятия',
    'Театральное направление',
    'Семейное обучение',
  ],
};

const themeScript = `(function(){try{var t=localStorage.getItem('sfera-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${inter.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
