import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, ExternalLink, MessageCircle } from "lucide-react";
import { getContent, getNewsByKey } from "@/lib/content";
import { newsUrl } from "@/lib/news";
import { ldScript } from "@/lib/utils";
import { ContentProvider } from "@/components/site/ContentContext";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileCTA } from "@/components/site/MobileCTA";
import { NewsBody, NewsSourceBadge } from "@/components/site/NewsArticle";
import { SITE_ORIGIN } from "@/data/site";

type Props = { params: { id: string } };

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    datePublished: news.published_at,
    dateModified: news.published_at,
    description: news.excerpt,
    image: ogImage(news, siteUrl) ? [ogImage(news, siteUrl)] : undefined,
    inLanguage: "ru",
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}${newsUrl(news)}` },
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

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground mb-3">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <time dateTime={news.published_at.slice(0, 10)}>{fmtDate(news.published_at)}</time>
            </span>
            <NewsSourceBadge item={news} />
          </div>

          <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-foreground text-balance leading-tight">
            {news.title}
          </h1>

          {news.image_url && (
            <div className="mt-8 w-full rounded-2xl border border-border/60 overflow-hidden bg-brand-cream/50 max-h-[600px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={news.image_url}
                alt={news.title}
                className="w-full h-full object-contain"
              />
            </div>
          )}

          <NewsBody item={news} className="mt-8" />

          <div className="mt-10 flex flex-wrap gap-3">
            {news.source_url && (
              <a
                href={news.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-full border-2 border-border bg-card text-sm font-semibold hover:border-brand-warm hover:text-brand-warm-ink transition-colors"
              >
                Обсудить в VK <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {/* Обсуждение обсуждением, а вопрос по делу лучше задать в MAX:
                из мессенджеров у нас стабильно работает только он. */}
            {data.siteConfig.maxUrl && (
              <a
                href={data.siteConfig.maxUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-full border-2 border-border bg-card text-sm font-semibold hover:border-brand-teal hover:text-brand-teal-ink transition-colors"
              >
                Задать вопрос в MAX <MessageCircle className="w-4 h-4" />
              </a>
            )}
          </div>
        </article>
      </main>
      <Footer />
      <MobileCTA />
    </ContentProvider>
  );
}
