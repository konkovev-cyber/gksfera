import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import Script from 'next/script';
import { MotionProvider } from '@/components/site/MotionProvider';
import { AnalyticsTracker } from '@/components/site/AnalyticsTracker';
import { CookieConsent } from '@/components/site/CookieConsent';
import { getContent } from '@/lib/content';
import { ldScript } from '@/lib/utils';
import { SITE_ORIGIN, siteConfig } from '@/data/site';

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

  return {
    metadataBase: new URL(SITE_ORIGIN),
    title: { default: title, template: titleTemplate },
    description,
    keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
    authors: [{ name: 'Учебно-развивающая студия «Сфера»' }],
    creator: 'Учебно-развивающая студия «Сфера»',
    // Canonical задаётся каждой страницей отдельно. В корневом layout его быть
    // не должно: значение наследовалось всеми маршрутами без своего canonical,
    // и /privacy со /consent официально считались дублями главной.
    // OG-изображение берётся из /og-image.png: мы не генерируем картинку
    // динамически, поэтому универсальный превью-образ подходит всем разделам.
    openGraph: {
      type: 'website',
      locale: 'ru_RU',
      url: SITE_ORIGIN,
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
        { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
        { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
        { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.webmanifest',
  };
}

export async function generateViewport(): Promise<Viewport> {
  const { data } = await getContent();
  const cfg = data.siteConfig as Record<string, unknown>;
  return {
    // Один theme-color на обе темы: переключатель темы сайта — ручной тумблер в
    // localStorage, а не prefers-color-scheme, поэтому media-вариант попадал бы
    // мимо. Значение — бренд, а не фон: подкрашивает адресную строку мобильных.
    themeColor: String(cfg.seoThemeColor || '#F28C28'),
    width: 'device-width',
    initialScale: 1,
  };
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  '@id': `${SITE_ORIGIN}/#organization`,
  name: 'Учебно-развивающая студия «Сфера»',
  alternateName: 'Сфера',
  url: SITE_ORIGIN,
  // logo и image — реальные файлы из public/; без них поисковик и мессенджеры
  // не связывают организацию с узнаваемым образом (og:image уже отсюда же).
  logo: `${SITE_ORIGIN}/icon-512.png`,
  image: `${SITE_ORIGIN}/og-image.png`,
  description:
    'Учебно-развивающая студия для детей в Горячем Ключе. Подготовка к школе, помощь школьникам, английский язык, чистописание, развивающие занятия, театр, семейное обучение.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Спортивный переулок, 13',
    addressLocality: 'Горячий Ключ',
    addressRegion: 'Краснодарский край',
    addressCountry: 'RU',
  },
  // Телефон и соцсети берём из data/site.ts: раньше здесь был вписан номер-
  // заглушка (+7 918 345-…) и несуществующая группа vk.com/sfera_gk — поисковики
  // отдавали их как реквизиты организации. Актуальные правки контактов в админке
  // попадают на страницы, а в этот блок — после обновления дефолтов.
  telephone: siteConfig.phone,
  sameAs: [siteConfig.vkUrl, siteConfig.maxUrl].filter(Boolean),
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

// До гидрации применяем оба пользовательских выбора: тему и «пауза анимаций».
// Иначе первый кадр мелькает в другой теме и с уже крутящейся лентой.
// Тёмная тема — основная: если пользователь ещё не менял её вручную, сразу ставим dark.
const themeScript = `(function(){try{var t=localStorage.getItem('sfera-theme');var d=t?t==='dark':true;document.documentElement.classList.toggle('dark',d);if(localStorage.getItem('sfera-motion')==='paused'){document.documentElement.dataset.motion='paused';}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={manrope.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldScript(jsonLd) }}
        />
        {/* Метрика ставится только после явного согласия пользователя —
            требование Яндекса с мая 2023 и практика соответствия 152-ФЗ.
            Баннер CookieConsent (client component) записывает выбор в
            localStorage; здесь мы читаем его через check() и, если
            согласия нет, просто не вызываем ym(). Скрипт tag.js всё равно
            загружается (lazyOnload), но без init счётчик не работает. */}
        <Script
          id="yandex-metrika"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t);a=e.getElementsByTagName(t)[0];k.async=1;k.src=r;a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=112781836','ym');try{if(localStorage.getItem('sfera_cookie_consent')){var c=JSON.parse(localStorage.getItem('sfera_cookie_consent'));if(c&&c.accept)ym(112781836,'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});}}catch(e){}

`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        {/* Skip-link: позволяет пользователю с клавиатурой или скринридером
            мгновенно перейти к основному контенту, минуя шапку и навигацию.
            Требование доступности (Приказ Минкульти № 526, ГОСТ Р 52872-2019). */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg"
        >
          Перейти к основному содержанию
        </a>
        <MotionProvider>
          <AnalyticsTracker />
          <main id="main-content">{children}</main>
          <CookieConsent />
        </MotionProvider>
      </body>
    </html>
  );
}
