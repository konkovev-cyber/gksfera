import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getContent, getNewsByKey } from "@/lib/content";
import { newsUrl } from "@/lib/news";
import { ldScript } from "@/lib/utils";
import { ContentProvider } from "@/components/site/ContentContext";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileCTA } from "@/components/site/MobileCTA";
import { NewsDetailClient } from "@/components/site/NewsDetailClient";
import { SITE_ORIGIN } from "@/data/site";

type Props = { params: { id: string } };

function ogImage(item: { image_url: string | null }, siteUrl: string): string | undefined {
  if (!item.image_url) return undefined;
  return item.image_url.startsWith("http") ? item.image_url : `${siteUrl}${item.image_url}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const news = await getNewsByKey(params.id);
  if (!news) return { title: "Новость не найдена", robots: { index: false } };
  const siteUrl = SITE_ORIGIN;
  const ogImg = ogImage(news, siteUrl);
  return {
    title: news.title,
    description: news.excerpt,
    alternates: { canonical: newsUrl(news) },
    openGraph: {
      type: "article",
      title: news.title,
      description: news.excerpt,
      publishedTime: news.published_at,
      modifiedTime: news.published_at,
      url: `${siteUrl}${newsUrl(news)}`,
      images: ogImg
        ? [
            { url: ogImg },
            { url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: "Студия «Сфера»" },
          ]
        : [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: "Студия «Сфера»" }],
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const [{ data }, news] = await Promise.all([getContent(), getNewsByKey(params.id)]);
  if (!news) notFound();

  const siteUrl = SITE_ORIGIN;
  const currentUrl = `${siteUrl}${newsUrl(news)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    datePublished: news.published_at,
    dateModified: news.published_at,
    description: news.excerpt,
    image: ogImage(news, siteUrl) ? [ogImage(news, siteUrl)] : undefined,
    inLanguage: "ru",
    mainEntityOfPage: { "@type": "WebPage", "@id": currentUrl },
    author: { "@type": "Organization", name: "Учебно-развивающая студия «Сфера»" },
    publisher: { "@type": "Organization", name: "Учебно-развивающая студия «Сфера»" },
  };

  return (
    <ContentProvider value={data}>
      <Header />
      <main className="min-h-screen pt-28 md:pt-36 pb-20">
        <article className="container-page max-w-3xl">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: ldScript(jsonLd) }}
          />

          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 min-h-[44px] -my-2 text-sm text-muted-foreground hover:text-brand-warm-ink transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Все новости
          </Link>

          <NewsDetailClient
            news={news}
            maxUrl={data.siteConfig.maxUrl}
            shareUrl={currentUrl}
          />
        </article>
      </main>
      <Footer />
      <MobileCTA />
    </ContentProvider>
  );
}
