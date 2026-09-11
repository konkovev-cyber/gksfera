import './globals.css';
import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import { siteConfig } from '@/data/site';
import { MotionProvider } from '@/components/site/MotionProvider';
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

export const metadata: Metadata = {
  metadataBase: new URL('https://sfera-goryachiy-klyuch.ru'),
  themeColor: 'hsl(32 85% 52%)',
  title: {
    default:
      'Учебно-развивающая студия «Сфера» — занятия для детей в Горячем Ключе',
    template: '%s — «Сфера» Горячий Ключ',
  },
  description:
    'Учебно-развивающая студия «Сфера» в Горячем Ключе. Подготовка к школе, помощь школьникам, английский язык, чистописание, развивающие занятия, театр. Для детей от 5 до 15 лет.',
  keywords: [
    'развивающие занятия Горячий Ключ',
    'подготовка к школе Горячий Ключ',
    'занятия для детей Горячий Ключ',
    'помощь школьникам Горячий Ключ',
    'английский для детей Горячий Ключ',
    'семейное обучение Горячий Ключ',
    'Сфера Горячий Ключ',
    'учебно-развивающая студия',
  ],
  authors: [{ name: 'Учебно-развивающая студия «Сфера»' }],
  creator: 'Учебно-развивающая студия «Сфера»',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://sfera-goryachiy-klyuch.ru',
    siteName: 'Учебно-развивающая студия «Сфера»',
    title:
      'Учебно-развивающая студия «Сфера» — занятия для детей в Горячем Ключе',
    description:
      'Занятия для дошкольников и школьников: подготовка к школе, помощь в учёбе, английский язык, творчество, театр и другие развивающие направления.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Учебно-развивающая студия «Сфера» — Горячий Ключ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Учебно-развивающая студия «Сфера» — занятия для детей в Горячем Ключе',
    description:
      'Занятия для дошкольников и школьников: подготовка к школе, помощь в учёбе, английский язык, творчество, театр.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icon.svg',
  },
  manifest: '/manifest.webmanifest',
};

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
  telephone: siteConfig.phone,
  sameAs: [siteConfig.vkUrl],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${inter.variable} ${manrope.variable}`}>
      <head>
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
