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

type MediaEntry = { type: "image" | "video" | "document"; src: string };

/**
 * Резервное разложение медиа по URL из текста новости (когда таблицы
 * news_media ещё нет). VK-видео — страница vk.com/video..., встраивается
 * через video_ext.php; картинки — по расширению файла.
 */
function parseMediaFromContent(content: string): MediaEntry[] {
  const seen = new Set<string>();
  const out: MediaEntry[] = [];
  const urls = content.match(/https?:\/\/[^\s]+/g) ?? [];
  for (const raw of urls) {
    const url = raw.replace(/[)\]}.,]+$/g, "");
    const key = url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    if (/\/video(-?\d+)_(\d+)/i.test(url) || /vkvideo\.ru/i.test(url)) {
      out.push({ type: "video", src: url });
    } else if (/\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(url)) {
      out.push({ type: "image", src: url });
    }
  }
  return out;
}

/** Ссылка на страницу VK-видео → embed для iframe. */
function vkVideoEmbed(url: string): string | null {
  const m = url.match(/video(-?\d+)_(\d+)/i);
  if (!m) return null;
  return `https://vk.com/video_ext.php?oid=${encodeURIComponent(m[1])}&id=${encodeURIComponent(m[2])}&hd=2`;
}

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

  // Все мультимедиа новости: сначала из news_media (если таблица создана),
  // иначе — разложение по URL из текста. Дубли убираем, обложку из галереи исключаем.
  const mediaItems: MediaEntry[] = (() => {
    const items = news.media?.length
      ? news.media.map((m) => ({
          type: m.media_type,
          src: m.media_url,
        } as MediaEntry))
      : parseMediaFromContent(String(news.content || ""));
    const seen = new Set<string>();
    return items.filter((it) => {
      if (!it.src) return false;
      const key = `${it.type}:${it.src}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })();
  const cover = news.image_url;
  const galleryImages = mediaItems.filter(
    (m) => m.type === "image" && m.src !== cover
  );
  const videos = mediaItems.filter((m) => m.type === "video");

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

          {(videos.length > 0 || galleryImages.length > 0) && (
            <div className="mt-10 space-y-8">
              {videos.length > 0 && (
                <section className="space-y-4" aria-label="Видеоматериалы">
                  <h2 className="font-display font-bold text-lg text-foreground">Видеоматериалы</h2>
                  <div className="space-y-5">
                    {videos.map((vid, idx) => {
                      const embed = vkVideoEmbed(vid.src);
                      return (
                        <div
                          key={idx}
                          className="w-full aspect-video rounded-2xl overflow-hidden bg-muted border border-border/60"
                        >
                          {embed ? (
                            <iframe
                              src={embed}
                              title={`Видео ${idx + 1}`}
                              className="w-full h-full"
                              allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock"
                              allowFullScreen
                            />
                          ) : (
                            <a
                              href={vid.src}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center h-full text-sm font-semibold text-brand-warm-ink hover:text-brand-warm transition-colors"
                            >
                              Открыть видео в VK <ExternalLink className="w-4 h-4 ml-1" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {galleryImages.length > 0 && (
                <section className="space-y-4" aria-label="Фотогалерея">
                  <h2 className="font-display font-bold text-lg text-foreground">Фотогалерея</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {galleryImages.map((img, idx) => (
                      <a
                        key={idx}
                        href={img.src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aspect-square rounded-xl overflow-hidden border border-border/50 bg-brand-cream/50 cursor-zoom-in"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.src}
                          alt={`${news.title} — фото ${idx + 1}`}
                          loading="lazy"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

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
