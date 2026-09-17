import { unstable_cache } from "next/cache";
import { serviceClient } from "./supabase-server";
import * as defaults from "@/data/site";
import type { Program, GalleryItem, Review, NewsItem, FAQItem, ScheduleGroup, HeroBanner, NavItem } from "@/data/site";

export type SiteData = typeof defaults;

export type Visibility = {
  about: boolean;
  programs: boolean;
  learning: boolean;
  gallery: boolean;
  reviews: boolean;
  news: boolean;
  teachers: boolean;
  faq: boolean;
  events: boolean;
  cta: boolean;
  enrollment: boolean;
  contacts: boolean;
  /** Страница /raspisanie: отключение убирает пункт из меню и закрывает страницу. */
  raspisanie: boolean;
};

const service = serviceClient;

/**
 * Собирает снапшот контента: значения из Supabase поверх статических по умолчанию.
 * Вызывается на сервере (page.tsx, layout.tsx), результат передаётся в ContentProvider.
 */
async function _getContent(): Promise<{
  data: SiteData;
  visibility: Visibility;
}> {
  const data = {
    ...defaults,
    siteConfig: { ...defaults.siteConfig },
    heroContent: { ...defaults.heroContent },
    aboutContent: { ...defaults.aboutContent },
    learningExperience: { ...defaults.learningExperience },
    footerLinks: { ...defaults.footerLinks },
    programs: [...defaults.programs] as Program[],
    gallery: [...defaults.gallery] as GalleryItem[],
    teachers: [...defaults.teachers],
    reviews: [...defaults.reviews] as Review[],
    events: [...defaults.events],
    parentOptions: [...defaults.parentOptions],
    navItems: [...defaults.navItems],
    enrollmentInterests: [...defaults.enrollmentInterests],
    faqs: [...defaults.faqs] as FAQItem[],
    parentPains: [...defaults.parentPains],
    resultsAfterLearning: [...defaults.resultsAfterLearning],
    trustStats: [...defaults.trustStats],
    programOutcomes: { ...defaults.programOutcomes },
    studioMotto: defaults.studioMotto,
    news: [...defaults.news] as NewsItem[],
    schedule: [...defaults.schedule] as ScheduleGroup[],
    heroBanners: [...defaults.heroBanners] as HeroBanner[],
    sectionsOrder: [...defaults.sectionsOrder],
  };

  const visibility: Visibility = {
    about: true,
    programs: true,
    learning: true,
    gallery: true,
    reviews: defaults.siteConfig.showReviews,
    news: true,
    teachers: defaults.siteConfig.showTeachers,
    faq: true,
    events: defaults.siteConfig.showEvents,
    cta: true,
    enrollment: true,
    contacts: true,
    raspisanie: true,
  };

  try {
    const db = service();
    const [settingsRes, photosRes, progsRes, reviewsRes, newsRes] = await Promise.all([
      db.from("site_settings").select("key,value"),
      db
        .from("gallery_photos")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true }),
      db
        .from("programs")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true }),
      db
        .from("reviews")
        .select("*")
        .eq("visible", true)
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true }),
      db
        .from("news")
        .select("vk_post_id,title,content,excerpt,image_url,source_url,published_at")
        .eq("visible", true)
        .order("published_at", { ascending: false })
        .limit(12),
    ]);

    for (const row of settingsRes.data ?? []) {
      const { key, value } = row as { key: string; value: unknown };
      if (key === "visibility" && value && typeof value === "object") {
        Object.assign(visibility, value);
      } else if (key === "hero" && value && typeof value === "object") {
        Object.assign(data.heroContent, value);
      } else if (key === "learningExperience" && value && typeof value === "object") {
        Object.assign(data.learningExperience, value);
      } else if (key === "teachers" && Array.isArray(value)) {
        data.teachers = value as typeof defaults.teachers;
      } else if (key === "faqs" && Array.isArray(value)) {
        data.faqs = value as FAQItem[];
      } else if (key === "schedule" && Array.isArray(value)) {
        data.schedule = value as ScheduleGroup[];
      } else if (key === "heroBanners" && Array.isArray(value)) {
        data.heroBanners = value as HeroBanner[];
      } else if (key === "sections" && Array.isArray(value)) {
        // Порядок блоков главной. Оставляем только строки; недостающие ключи
        // допишем ниже (нормализация), лишние отбрасываем.
        data.sectionsOrder = value.map(String);
      } else if (key === "parentPains" && Array.isArray(value)) {
        data.parentPains = value as typeof defaults.parentPains;
      } else if (key === "resultsAfterLearning" && Array.isArray(value)) {
        data.resultsAfterLearning = value as string[];
      } else if (key === "trustStats" && Array.isArray(value)) {
        data.trustStats = value as typeof defaults.trustStats;
      } else if (key === "programOutcomes" && value && typeof value === "object") {
        data.programOutcomes = value as typeof defaults.programOutcomes;
      } else if (key === "studioMotto" && typeof value === "string") {
        data.studioMotto = value;
      } else if (key in data.siteConfig && value != null) {
        (data.siteConfig as unknown as Record<string, unknown>)[key] = value;
      }
    }

    if (photosRes.data && photosRes.data.length > 0) {
      data.gallery = (photosRes.data as Record<string, unknown>[]).map(
        (p) => ({
          src: String(p.src),
          alt: String(p.alt ?? ""),
          span: (p.span as GalleryItem["span"]) ?? "normal",
          pos: (p.pos as string) ?? undefined,
        })
      );
    }

    if (progsRes.data && progsRes.data.length > 0) {
      data.programs = (progsRes.data as Record<string, unknown>[])
        .filter((p) => p.is_visible !== false && p.visible !== false)
        .map((p) => {
          const fallback = defaults.programs.find((s) => s.title === p.title);
          const features = (p.features ?? {}) as Record<string, unknown>;
          // Категория: column → features.category → badge ("educational"/"creative") → fallback default
          const rawCat = (p.category ?? features.category ?? p.badge) as string | undefined;
          const cat: Program["category"] =
            rawCat === "creative" ? "creative" :
            rawCat === "educational" ? "educational" :
            fallback?.category;
          return {
            id: String(p.id),
            title: String(p.title ?? ""),
            ageRange: String(p.age ?? p.age_range ?? fallback?.ageRange ?? ""),
            description: String(
              p.short_desc ?? p.description ?? fallback?.description ?? ""
            ),
            image: String(p.image ?? fallback?.image ?? ""),
            imageAlt: String(p.image_alt ?? fallback?.imageAlt ?? fallback?.title ?? ""),
            icon: String(p.icon ?? features.icon ?? fallback?.icon ?? "Sparkles"),
            featured: Boolean(p.featured),
            category: cat,
            pos: p.pos != null ? String(p.pos) : (features.pos != null ? String(features.pos) : fallback?.pos),
          } satisfies Program;
        });
    }

    if (reviewsRes.data && reviewsRes.data.length > 0) {
      data.reviews = (reviewsRes.data as Record<string, unknown>[]).map(
        (r) => ({
          id: String(r.id ?? ""),
          author: String(r.author ?? ""),
          source: String(r.source ?? ""),
          sourceUrl: String(r.source_url ?? r.sourceUrl ?? "") || undefined,
          text: String(r.text ?? ""),
          childInfo: String(r.child_info ?? r.childInfo ?? "") || undefined,
        } satisfies Review)
      );
    }

    if (newsRes.data && newsRes.data.length > 0) {
      data.news = (newsRes.data as Record<string, unknown>[]).map((n) => ({
        vk_post_id: String(n.vk_post_id ?? ""),
        title: String(n.title ?? ""),
        content: String(n.content ?? ""),
        excerpt: String(n.excerpt ?? ""),
        image_url: n.image_url ? String(n.image_url) : null,
        source_url: String(n.source_url ?? ""),
        published_at: String(n.published_at ?? ""),
      } satisfies NewsItem));
    }

    // Пункты меню скрываем по реальному состоянию видимости блоков (ниже).
  } catch (e) {
    console.error("[content] Supabase недоступен, используем значения по умолчанию:", e);
  }

  // Порядок секций нормализуем: берём сохранённый, добавляем недостающие
  // (появились новые блоки) и убираем несуществующие.
  data.sectionsOrder = reconcileOrder(data.sectionsOrder, defaults.sectionsOrder);

  // Пункты меню (шапка и подвал) скрываем вместе с отключёнными блоками.
  data.navItems = filterNav(data.navItems, visibility);
  data.footerLinks = {
    ...data.footerLinks,
    navigation: filterNav(defaults.footerLinks.navigation, visibility),
  };

  return { data: data as SiteData, visibility };
}

/**
 * Кэшированная версия _getContent (TTL 60 с, тег «content»).
 * После сохранения в админке revalidatePath('/', 'layout') сбрасывает кэш немедленно.
 */
export const getContent = unstable_cache(
  _getContent,
  ["site-content"],
  { revalidate: 60, tags: ["content"] },
);


/**
 * Рекурсивно убирает пункты, чей блок видимости отключён. Родитель с выпадающим
 * списком остаётся, если живёт хотя бы один потомок (или есть своя ссылка),
 * иначе исчезает целиком.
 */
function filterNav(items: NavItem[], vis: Visibility): NavItem[] {
  const on = (key?: string) => (key ? vis[key as keyof Visibility] !== false : true);
  const out: NavItem[] = [];
  for (const item of items) {
    if (!on(item.vis)) continue;
    if (item.children?.length) {
      const children = filterNav(item.children, vis);
      if (children.length === 0 && !item.href) continue; // пустой дропдаун не показываем
      out.push({ ...item, children });
    } else {
      out.push({ ...item });
    }
  }
  return out;
}

/** Приводит сохранённый порядок к полному: известные — как задано, новые — в хвосте. */
function reconcileOrder(order: string[], base: string[]): string[] {
  const known = new Set(base);
  const out = order.filter((k, i) => known.has(k) && order.indexOf(k) === i); // уникальные известные
  for (const k of base) if (!out.includes(k)) out.push(k);
  return out;
}

const NEWS_COLUMNS = "id,vk_post_id,title,content,excerpt,image_url,source_url,published_at";

function mapNewsRow(n: Record<string, unknown>): NewsItem {
  return {
    id: n.id != null ? (typeof n.id === "number" ? n.id : String(n.id)) : undefined,
    vk_post_id: String(n.vk_post_id ?? ""),
    title: String(n.title ?? ""),
    content: String(n.content ?? ""),
    excerpt: String(n.excerpt ?? ""),
    image_url: n.image_url ? String(n.image_url) : null,
    source_url: String(n.source_url ?? ""),
    published_at: String(n.published_at ?? ""),
  };
}

/** Все видимые новости (для страницы /news). */
export async function getAllNews(): Promise<NewsItem[]> {
  try {
    const db = service();
    const { data } = await db
      .from("news")
      .select(NEWS_COLUMNS)
      .eq("visible", true)
      .order("published_at", { ascending: false })
      // 50 — потенциально «обрезанный» архив: дальше новости просто не
      // показывались бы. 100 штук с ленивыми картинками страница тянет легко.
      .limit(100);
    return (data ?? []).map(mapNewsRow);
  } catch {
    return [];
  }
}

/**
 * Одна новость по ключу URL. Колонка одна (vk_post_id), поэтому одинаково
 * находится и «130» (пост VK), и «den-otkrytyh-dverey» (slug своей новости).
 */
export async function getNewsByKey(id: string): Promise<NewsItem | null> {
  const key = String(id ?? "").trim();
  if (!key) return null;
  try {
    const db = service();
    const { data } = await db
      .from("news")
      .select(NEWS_COLUMNS)
      .eq("vk_post_id", key)
      .eq("visible", true)
      .maybeSingle();
    return data ? mapNewsRow(data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Все ключи новостей (для generateStaticParams / sitemap). */
export async function getNewsKeys(): Promise<string[]> {
  const all = await getAllNews();
  return all.map((n) => n.vk_post_id).filter(Boolean);
}
