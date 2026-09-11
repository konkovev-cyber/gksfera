import { createClient } from "@supabase/supabase-js";
import * as defaults from "@/data/site";
import type { Program, GalleryItem, Review, NewsItem } from "@/data/site";

export type SiteData = typeof defaults;

export type Visibility = {
  about: boolean;
  programs: boolean;
  learning: boolean;
  gallery: boolean;
  reviews: boolean;
  news: boolean;
  teachers: boolean;
  events: boolean;
  cta: boolean;
  enrollment: boolean;
  contacts: boolean;
};

const service = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

/**
 * Собирает снапшот контента: значения из Supabase поверх статических по умолчанию.
 * Вызывается на сервере (page.tsx, layout.tsx), результат передаётся в ContentProvider.
 */
export async function getContent(): Promise<{
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
    news: [...defaults.news] as NewsItem[],
  };

  const visibility: Visibility = {
    about: true,
    programs: true,
    learning: true,
    gallery: true,
    reviews: defaults.siteConfig.showReviews,
    news: true,
    teachers: defaults.siteConfig.showTeachers,
    events: defaults.siteConfig.showEvents,
    cta: true,
    enrollment: true,
    contacts: true,
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
          return {
            id: String(p.id),
            title: String(p.title ?? ""),
            ageRange: String(p.age ?? p.age_range ?? fallback?.ageRange ?? ""),
            description: String(
              p.short_desc ?? p.description ?? fallback?.description ?? ""
            ),
            image: String(p.image ?? fallback?.image ?? ""),
            imageAlt: String(p.image_alt ?? fallback?.imageAlt ?? fallback?.title ?? ""),
            icon: String(p.icon ?? fallback?.icon ?? "Sparkles"),
            featured: Boolean(p.featured),
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

    // Фильтруем navItems по show-функциям серверно и удаляем функции (RSC не сериализует)
    data.navItems = defaults.navItems
      .filter((item) => !item.show || item.show())
      .map(({ show, ...rest }) => rest) as typeof defaults.navItems;
  } catch (e) {
    console.error("[content] Supabase недоступен, используем значения по умолчанию:", e);
    data.navItems = defaults.navItems
      .filter((item) => !item.show || item.show())
      .map(({ show, ...rest }) => rest) as typeof defaults.navItems;
  }

  return { data: data as SiteData, visibility };
}
