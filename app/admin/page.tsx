/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Loader2, Save, Upload, Trash2, LogOut, ArrowUp, ArrowDown,
  Settings, Image as ImageIcon, LayoutDashboard, Inbox, School,
  Eye, Star, BookOpen, Search, Download, Plus, Newspaper, RefreshCw, ExternalLink, X,
  GraduationCap, HelpCircle, PenTool, Play,
} from "lucide-react";
import { gallery as defaultGallery } from "@/data/site";
import { compressImageFile, isVideoSrc, humanSize, IMAGE_MAX, VIDEO_MAX } from "@/lib/compress";

type Tab = "settings" | "hero" | "visibility" | "programs" | "gallery" |
  "teachers" | "reviews" | "learning" | "faq" | "blog" | "news" | "seo" | "io" | "inbox" | "blocks";

const TABS: { id: Tab; label: string; icon: any; hint: string }[] = [
  { id: "settings", label: "Настройки", icon: Settings, hint: "Реквизиты студии: название, телефон, адрес, соцсети, часы работы. Используются в шапке, подвале и на контактах." },
  { id: "hero", label: "Экран", icon: LayoutDashboard, hint: "Первый экран главной страницы: заголовок, подзаголовок, кнопки и ротация фотографий (показывается со сменой кадров)." },
  { id: "visibility", label: "Видимость", icon: Eye, hint: "Включать и скрывать целые разделы главной страницы (блок, форма, карта и т.д.) без удаления контента." },
  { id: "blocks", label: "Контент", icon: LayoutDashboard, hint: "Дополнительные блоки главной: «с какой задачей пришли», результаты занятий, цифры доверия и девиз студии." },
  { id: "programs", label: "Направления", icon: School, hint: "Карточки учебных и творческих направлений (страницы /programs/…). Название, описание, возраст, цена, фото." },
  { id: "gallery", label: "Галерея", icon: ImageIcon, hint: "Фото и видео для раздела «Жизнь „Сферы“». Здесь загрузка (можно сразу несколько), порядок и подпись. На главной — карусель из 4 + кнопка «Смотреть все фото»." },
  { id: "teachers", label: "Педагоги", icon: GraduationCap, hint: "Карточки преподавателей: имя, роль, описание, опыт и фото (блок на главной и страница педагогов)." },
  { id: "reviews", label: "Отзывы", icon: Star, hint: "Отзывы родителей — свои или импорт из группы ВКонтакте. Показываются в блоке отзывов и на /reviews." },
  { id: "learning", label: "Занятия", icon: BookOpen, hint: "Секция «Как проходят занятия» на главной: заголовок и пошаговый путь (шаги с описанием и фото). Это не расписание, а как устроены занятия." },
  { id: "faq", label: "Вопросы", icon: HelpCircle, hint: "Частые вопросы и ответы (раскрывающийся список на главной и страница вопросов)." },
  { id: "blog", label: "Блог", icon: PenTool, hint: "Статьи блога: заголовок, анонс, текст, обложка и дата. Выводятся в разделе блога и на /blog." },
  { id: "news", label: "Новости VK", icon: Newspaper, hint: "Новости из группы ВКонтакте (синхронизация по API). Лента на главной и архив /news." },
  { id: "seo", label: "SEO", icon: Search, hint: "Метаданные для поиска и соцсетей: title, description, Open Graph — чтобы сайт красиво открывался по ссылке и ранжировался." },
  { id: "io", label: "Импорт", icon: Download, hint: "Резервная копия и перенос всего контента в JSON (или отдельно только новостей). Для бэкапа или миграции на другой проект." },
  { id: "inbox", label: "Заявки", icon: Inbox, hint: "Обращения с формы «Записаться»: имя, телефон, направление, комментарий. Приходит из формы на сайте и из Telegram." },
];

const VIS_LABELS: Record<string, string> = {
  about: "О студии", programs: "Направления", learning: "Как проходят занятия",
  gallery: "Галерея", teachers: "Преподаватели", reviews: "Отзывы", news: "Новости VK",
  faq: "Частые вопросы", events: "События", cta: "CTA-баннер", enrollment: "Форма записи", contacts: "Контакты и карта",
};

const SITE_LABELS: Record<string, string> = {
  name: "Название (короткое)",
  fullName: "Полное название",
  tagline: "Слоган",
  secondaryTagline: "Второй слоган",
  city: "Город",
  address: "Адрес",
  addressDetails: "Детали адреса (этаж, офис)",
  addressFull: "Адрес полностью",
  phone: "Телефон",
  phoneHref: "Телефон — ссылка (tel:)",
  vkUrl: "Ссылка на группу VK",
  vkDisplay: "VK — как показывать на сайте",
  maxUrl: "MAX Messenger — ссылка",
  ageRange: "Возраст детей",
  workingHours: "Часы работы (полные)",
  workingHoursShort: "Часы работы (кратко)",
  yearsExperience: "Опыт работы",
  mapQuery: "Адрес для поиска на карте",
  showTeachers: "Блок «Преподаватели»",
  showEvents: "Блок «События»",
  showReviews: "Блок «Отзывы»",
};

const HERO_LABELS: Record<string, string> = {
  badge: "Бейдж над заголовком",
  title: "Заголовок",
  highlight: "Выделенное слово в заголовке",
  tagline: "Слоган (мерцающая строка)",
  description: "Описание под заголовком",
  primaryCta: "Кнопка 1 — главная",
  secondaryCta: "Кнопка 2 — вторичная",
  image: "Фото — URL",
  imageAlt: "Фото — описание (alt)",
};

const PAIN_ICON_OPTIONS = [
  "GraduationCap", "BookOpen", "Languages", "PenLine", "Drama", "Palette",
  "Backpack", "BrainCircuit", "PenTool", "Pencil", "Sparkles", "MessageSquare",
  "Star", "HelpCircle",
];

const inputCls = "w-full h-10 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/60";
const btnCls = "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 w-full sm:w-auto";
const btnSecondaryCls = "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-full border-2 border-border text-sm font-semibold hover:border-primary hover:text-primary disabled:opacity-50 w-full sm:w-auto";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs font-medium text-foreground mb-1.5">{label}</span>{children}</label>;
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl border border-border/60 p-5 space-y-4">
      <div>
        <h3 className="font-display font-bold text-base">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [tab, setTab] = useState<Tab>("settings");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [uploadQueue, setUploadQueue] = useState<{ name: string; status: "pending" | "compressing" | "uploading" | "done" | "error"; message?: string; saved?: number }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Плавающая кнопка «наверх»: появляется после прокрутки длинной формы
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [siteConfig, setSiteConfig] = useState<Record<string, any>>({});
  const [hero, setHero] = useState<Record<string, any>>({});
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [programs, setPrograms] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [learning, setLearning] = useState<{ title: string; description: string; steps: any[] }>({ title: "", description: "", steps: [] });
  const [teachers, setTeachers] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [parentPains, setParentPains] = useState<any[]>([]);
  const [resultsAfterLearning, setResultsAfterLearning] = useState<string[]>([]);
  const [trustStats, setTrustStats] = useState<any[]>([]);
  const [programOutcomes, setProgramOutcomes] = useState<Record<string, string[]>>({});
  const [studioMotto, setStudioMotto] = useState("");
  const [news, setNews] = useState<any[]>([]);
  const [vkReviews, setVkReviews] = useState<any[]>([]);
  const [syncingReviews, setSyncingReviews] = useState(false);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [vkDomain, setVkDomain] = useState("");
  const [pickerFor, setPickerFor] = useState<null | { kind: "program" | "hero" | "heroList" | "step" | "teacher"; index: number }>(null);
  const [pickerFiles, setPickerFiles] = useState<{ src: string; size: number }[]>([]);
  const [pickerFilter, setPickerFilter] = useState("");

  const flash = (t: string) => { setMsg(t); setTimeout(() => setMsg(""), 2500); };

  const loadAll = useCallback(async () => {
    const [s, p, e, r, n, b] = await Promise.all([
      fetch("/api/admin/settings").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/programs").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/enrollments").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/reviews").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/news").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/blog").then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]);
    if (!s) { setAuthed(false); return; }
    setAuthed(true);
    setSiteConfig(s.siteConfig ?? {});
    setHero(s.heroContent ?? {});
    setVisibility(s.visibility ?? {});
    setPrograms(p?.programs ?? []);
    setEnrollments(e?.enrollments ?? []);
    setReviews(r?.reviews ?? []);
    setNews(n?.news ?? []);
    setBlogPosts(b?.posts ?? []);
    setLearning(s.learningExperience ?? { title: "", description: "", steps: [] });
    setTeachers(s.teachers ?? []);
    setFaqs(s.faqs ?? []);
    setParentPains(s.parentPains ?? []);
    setResultsAfterLearning(s.resultsAfterLearning ?? []);
    setTrustStats(s.trustStats ?? []);
    setProgramOutcomes(s.programOutcomes ?? {});
    setStudioMotto(s.studioMotto ?? "");
    const g = await fetch("/api/admin/photos").then((r) => (r.ok ? r.json() : null));
    setPhotos(g?.photos ?? []);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const login = async () => {
    setLoginErr("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (res.ok) { setPassword(""); await loadAll(); }
    else { const j = await res.json().catch(() => ({})); setLoginErr(j.error ?? "Ошибка входа"); }
  };

  const logout = async () => { await fetch("/api/admin/logout", { method: "POST" }); setAuthed(false); };

  const saveSettings = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: siteConfig, hero, visibility, learningExperience: learning, teachers, faqs, parentPains, resultsAfterLearning, trustStats, programOutcomes, studioMotto }),
    });
    setSaving(false);
    flash(res.ok ? "Сохранено ✓" : "Ошибка");
  };

  const savePrograms = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/programs", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: programs.map((p, i) => ({ id: p.id, title: p.title, ageRange: p.age_range, description: p.description, image: p.image, imageAlt: p.image_alt, category: p.category ?? "educational", pos: p.pos ?? "", visible: p.visible !== false, sortOrder: i + 1 })) }),
    });
    setSaving(false);
    flash(res.ok ? "Сохранено ✓" : "Ошибка");
  };

  const savePhotoOrder = async (items: any[]) => {
    setSaving(true);
    const res = await fetch("/api/admin/photos", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items.map((p, i) => ({ id: p.id, alt: p.alt ?? "", span: p.span ?? "normal", pos: p.pos || null, sort_order: i + 1 })) }),
    });
    setSaving(false);
    flash(res.ok ? "Сохранено ✓" : "Ошибка");
  };

  const updateQueueItem = (idx: number, patch: Partial<{ status: "pending" | "compressing" | "uploading" | "done" | "error"; message?: string; saved?: number }>) => {
    setUploadQueue((prev) => prev.map((x, j) => (j === idx ? { ...x, ...patch } : x)));
  };

  /** Загрузить файл через signed URL (обходит лимит тела функции Vercel),
   *  предварительно сжав изображения на клиенте. */
  const uploadSingle = async (rawFile: File, idx: number) => {
    const isVideo = rawFile.type.startsWith("video/");
    const maxBytes = isVideo ? VIDEO_MAX : IMAGE_MAX;
    if (rawFile.size > maxBytes) {
      updateQueueItem(idx, { status: "error", message: `${humanSize(rawFile.size)} > лимита ${humanSize(maxBytes)}` });
      return;
    }

    let file = rawFile;
    if (!isVideo) {
      updateQueueItem(idx, { status: "compressing" });
      const res = await compressImageFile(rawFile);
      file = res.file;
      if (res.savedBytes > 0) {
        updateQueueItem(idx, { saved: res.savedBytes });
      }
    }

    updateQueueItem(idx, { status: "uploading" });

    // 1. подписать URL
    const signRes = await fetch("/api/admin/photos/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, size: file.size, contentType: file.type }),
    });
    const sign = await signRes.json().catch(() => ({}));
    if (!signRes.ok || sign.error) {
      updateQueueItem(idx, { status: "error", message: sign.error ?? "не удалось получить ссылку" });
      return;
    }

    // 2. PUT файла напрямую в Supabase Storage через signed URL
    const putRes = await fetch(sign.signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || (isVideoSrc(sign.publicUrl) ? "video/mp4" : "image/jpeg"),
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""}`,
        "x-upsert": "false",
      },
      body: file,
    });
    if (!putRes.ok) {
      const txt = await putRes.text().catch(() => "");
      updateQueueItem(idx, { status: "error", message: txt || `upload HTTP ${putRes.status}` });
      return;
    }

    // 3. зарегистрировать строку в gallery_photos
    const regRes = await fetch("/api/admin/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ src: sign.publicUrl, alt: "", span: "normal" }),
    });
    const reg = await regRes.json().catch(() => ({}));
    if (!regRes.ok) {
      updateQueueItem(idx, { status: "error", message: reg.error ?? "не удалось добавить в галерею" });
      return;
    }
    setPhotos((prev) => [...prev, reg.photo]);
    updateQueueItem(idx, { status: "done" });
  };

  /** Массовая загрузка: обрабатываем файлы последовательно, чтобы
   *  не завалить браузер и Supabase, и показывать прогресс. */
  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/") || /\.(jpe?g|png|webp|gif|mp4|webm|mov|m4v)$/i.test(f.name));
    if (list.length === 0) { flash("Нет подходящих файлов (только jpg/png/webp/gif/mp4/webm/mov)"); return; }
    setUploadQueue(list.map((f) => ({ name: f.name, status: "pending" as const })));
    for (let i = 0; i < list.length; i++) {
      await uploadSingle(list[i], i);
    }
    const ok = list.length;
    const failed = uploadQueue.filter((x) => x.status === "error").length;
    flash(
      failed === 0
        ? `Загружено ${ok} файл${ok === 1 ? "" : ok < 5 ? "а" : "ов"} ✓`
        : `Загружено ${ok - failed}, ошибок: ${failed}`,
    );
    // Автоскрытие очереди через 5 секунд
    setTimeout(() => setUploadQueue([]), 5000);
  };

  const uploadPhoto = async (file: File, alt: string) => {
    if (alt) {
      // single-shot совместимость (например, из picker):
      setSaving(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("alt", alt);
      const res = await fetch("/api/admin/photos", { method: "POST", body: fd });
      const j = await res.json().catch(() => ({}));
      setSaving(false);
      if (res.ok) { setPhotos((prev) => [...prev, j.photo]); flash("Фото загружено ✓"); }
      else flash(j.error ?? "Ошибка загрузки");
    } else {
      uploadFiles([file]);
    }
  };

  const deletePhoto = async (id: number) => {
    if (!confirm("Удалить фото?")) return;
    await fetch(`/api/admin/photos?id=${id}`, { method: "DELETE" });
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    flash("Удалено");
  };

  const saveReviews = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/reviews", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: reviews.map((r, i) => ({ author: r.author, source: r.source, sourceUrl: r.source_url ?? r.sourceUrl, text: r.text, childInfo: r.child_info ?? r.childInfo, visible: r.visible !== false, sortOrder: i + 1 })) }),
    });
    setSaving(false);
    flash(res.ok ? "Отзывы сохранены ✓" : "Ошибка");
  };

  const move = (arr: any[], i: number, dir: -1 | 1, setter: (v: any[]) => void) => {
    const j = i + dir; if (j < 0 || j >= arr.length) return;
    const copy = [...arr]; [copy[i], copy[j]] = [copy[j], copy[i]]; setter(copy);
  };

  const doExport = async () => {
    const res = await fetch("/api/admin/export");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `sfera-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    flash("Экспорт скачан ✓");
  };

  const doImport = async (file: File) => {
    if (!confirm("Импорт ЗАМЕНИТ все данные сайта (контент, направления, галерею, отзывы, новости, SEO, заявки). Продолжить?")) return;
    setSaving(true);
    const text = await file.text();
    const body = JSON.parse(text);
    const res = await fetch("/api/admin/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    if (res.ok) { flash("Импорт выполнен ✓"); await loadAll(); }
    else flash("Ошибка импорта");
  };

  /** Скачиваем только новости в отдельный JSON. */
  const exportNews = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/news");
    const j = await res.json().catch(() => ({}));
    setSaving(false);
    const list: any[] = j?.news ?? [];
    if (list.length === 0) { flash("Новостей нет — нечего выгружать"); return; }
    const payload = { exported_at: new Date().toISOString(), count: list.length, news: list };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sfera-news-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash(`Экспортировано ${list.length} новость/й ✓`);
  };

  /** Импорт JSON с новостями (из «Новости VK» или внешнего файла).
   *  По умолчанию REPLACES текущие. Опция Append — добавляет. */
  const importNews = async (file: File) => {
    let parsed: { news?: any[] };
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      flash("Не удалось прочитать JSON: файл повреждён");
      return;
    }
    const items = Array.isArray(parsed.news) ? parsed.news : Array.isArray(parsed) ? parsed : null;
    if (!items || items.length === 0) {
      flash("В файле нет массива news");
      return;
    }
    const append = confirm(
      `Найдено ${items.length} записей новостей.\n\n` +
      `«OK» = ДОБАВИТЬ к текущим (${news.length})\n` +
      `«Отмена» = ЗАМЕНИТЬ все новости`,
    );
    setSaving(true);
    const res = await fetch("/api/admin/news" + (append ? "?append=1" : ""), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ news: items }),
    });
    const j = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) { flash(j?.error ?? "Ошибка импорта"); return; }
    const refreshed = await fetch("/api/admin/news").then((r) => r.json()).catch(() => ({ news: [] }));
    setNews(refreshed?.news ?? []);
    flash(`Импортировано ${j.count ?? items.length} новость/й ${append ? "(добавлены)" : "(заменены все)"} ✓`);
  };

  const syncVK = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/news/sync", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: vkDomain || undefined, count: 10 }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) {
        flash(`Синхронизировано: ${j.imported ?? 0} новых из ${j.total ?? 0}`);
        const n = await fetch("/api/admin/news").then((r) => r.json());
        setNews(n?.news ?? []);
      } else flash(j.error ?? "Ошибка синхронизации");
    } catch {
      flash("Ошибка сети");
    }
    setSyncing(false);
  };

  const toggleNewsVisible = async (id: string, visible: boolean) => {
    setNews((prev) => prev.map((n) => n.id === id ? { ...n, visible } : n));
    await fetch("/api/admin/news", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, visible }),
    });
  };

  const deleteNewsItem = async (id: string) => {
    if (!confirm("Удалить новость?")) return;
    await fetch(`/api/admin/news?id=${id}`, { method: "DELETE" });
    setNews((prev) => prev.filter((n) => n.id !== id));
  };

  const syncVkReviews = async () => {
    setSyncingReviews(true);
    try {
      const res = await fetch("/api/admin/reviews/sync", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 20 }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) {
        setVkReviews(j.posts ?? []);
        flash(`Найдено ${j.posts?.length ?? 0} постов — выберите отзывы`);
      } else flash(j.error ?? "Ошибка загрузки");
    } catch { flash("Ошибка сети"); }
    setSyncingReviews(false);
  };

  const importVkReview = (post: any) => {
    const text = post.fullText || post.text;
    const lines = text.split("\n").filter((l: string) => l.trim());
    const authorGuess = lines[0]?.length < 40 ? lines[0] : "Родитель";
    setReviews((prev) => [...prev, {
      author: authorGuess,
      source: "VK",
      source_url: post.sourceUrl,
      text: text.slice(0, 500),
      child_info: "",
      visible: true,
    }]);
    setVkReviews((prev) => prev.filter((p) => p.id !== post.id));
    flash("Отзыв добавлен ✓");
  };

  const saveBlog = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/blog", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: blogPosts }),
    });
    setSaving(false);
    if (res.ok) {
      flash("Сохранено ✓");
      const b = await fetch("/api/admin/blog").then((r) => r.json()).catch(() => null);
      setBlogPosts(b?.posts ?? []);
    } else flash("Ошибка");
  };

  const deleteBlogPost = async (id: string) => {
    if (!confirm("Удалить статью?")) return;
    await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
    setBlogPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const applyPhoto = (src: string) => {
    if (!pickerFor) return;
    const { kind, index } = pickerFor;
    if (kind === "program") {
      setPrograms((prev) => prev.map((x, j) => (j === index ? { ...x, image: src } : x)));
    } else if (kind === "hero") {
      setHero((prev) => ({ ...prev, image: src }));
    } else if (kind === "heroList") {
      setHero((prev) => {
        const list: string[] = Array.isArray(prev.images) ? [...prev.images] : [];
        if (index >= 0 && index < list.length) list[index] = src;
        else list.push(src);
        return { ...prev, images: list };
      });
    } else if (kind === "step") {
      setLearning((p) => ({ ...p, steps: p.steps.map((s, j) => (j === index ? { ...s, image: src } : s)) }));
    } else if (kind === "teacher") {
      setTeachers((prev) => prev.map((x, j) => (j === index ? { ...x, photo: src } : x)));
    }
    setPickerFor(null);
    flash("Фото выбрано ✓");
  };

  const pickBtn = (kind: "program" | "hero" | "heroList" | "step" | "teacher", index: number, label = "Выбрать") => (
    <button
      type="button"
      onClick={() => { setPickerFor({ kind, index }); if (pickerFiles.length === 0) fetch("/api/admin/files").then(r => r.ok ? r.json() : null).then(j => setPickerFiles(j?.files ?? [])); }}
      className="h-10 px-3 rounded-lg border border-border hover:bg-accent inline-flex items-center gap-1.5 text-sm shrink-0"
      title="Выбрать из загруженных фото"
    >
      <ImageIcon className="w-4 h-4" /> {label}
    </button>
  );

  if (authed === null) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-brand-warm" /></div>;

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm bg-card rounded-2xl border border-border/60 shadow-lg p-6">
        <h1 className="font-display font-extrabold text-xl mb-1">Админ-панель «Сферы»</h1>
        <p className="text-sm text-muted-foreground mb-5">Введите пароль администратора</p>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} className={inputCls} placeholder="Пароль" autoFocus />
        {loginErr && <p className="mt-2 text-sm text-destructive">{loginErr}</p>}
        <button onClick={login} className={btnCls + " w-full justify-center mt-4"}>Войти</button>
      </div>
    </div>
  );

  const cfgEntries = Object.entries(siteConfig).filter(([, v]) => ["string", "number", "boolean"].includes(typeof v));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-card/90 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
          <span className="font-display font-extrabold text-sm sm:text-base truncate">Админка «Сферы»</span>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {msg && <span className="text-xs sm:text-sm text-green-600 font-medium truncate max-w-[120px] sm:max-w-none">{msg}</span>}
            <a href="/" target="_blank" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground hidden sm:inline">Сайт ↗</a>
            <button onClick={logout} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive"><LogOut className="w-4 h-4" /> Выйти</button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Навигация по вкладкам: сетка, которая переносится на всех
            размерах экрана — ни одна вкладка не прячется за скроллом. */}
        <nav className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} title={t.hint}
              className={"inline-flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 " + (tab === t.id ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:bg-accent")}>
              <t.icon className="w-4 h-4 shrink-0" /><span>{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Подсказка: что редактирует текущий раздел и где это на сайте */}
        {(() => {
          const cur = TABS.find((t) => t.id === tab);
          if (!cur) return null;
          return (
            <div className="flex items-start gap-3 mb-5 rounded-2xl border border-border/60 bg-accent/50 px-4 py-3">
              <span className="mt-0.5 inline-flex w-8 h-8 rounded-xl bg-primary/10 text-primary items-center justify-center shrink-0">
                <cur.icon className="w-5 h-5" />
              </span>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                <span className="font-semibold text-foreground">{cur.label}. </span>
                {cur.hint}
              </p>
            </div>
          );
        })()}

        {/* ─── Настройки ─── */}
        {tab === "settings" && (
          <div className="grid sm:grid-cols-2 gap-4 bg-card rounded-2xl border border-border/60 p-5">
            {cfgEntries.map(([k, v]) => (
              <Field key={k} label={SITE_LABELS[k] ?? k}>
                {typeof v === "boolean" ? (
                  <label className="inline-flex items-center gap-2 h-10 text-sm">
                    <input type="checkbox" checked={v} onChange={(e) => setSiteConfig((p) => ({ ...p, [k]: e.target.checked }))} className="w-4 h-4" />
                    {v ? "вкл" : "выкл"}
                  </label>
                ) : (
                  <input className={inputCls} value={String(v ?? "")} onChange={(e) => setSiteConfig((p) => ({ ...p, [k]: e.target.value }))} />
                )}
              </Field>
            ))}
            <div className="sm:col-span-2"><button onClick={saveSettings} disabled={saving} className={btnCls}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Сохранить</button></div>
          </div>
        )}

        {/* ─── Hero ─── */}
        {tab === "hero" && (
          <div className="grid sm:grid-cols-2 gap-4 bg-card rounded-2xl border border-border/60 p-5">
            {Object.entries(hero).filter(([, v]) => typeof v === "string").map(([k, v]) => (
              <Field key={k} label={HERO_LABELS[k] ?? k}>
                {k === "image" ? (
                  <div className="flex gap-2">
                    <input className={inputCls + " flex-1"} value={String(v ?? "")} onChange={(e) => setHero((p) => ({ ...p, [k]: e.target.value }))} />
                    {pickBtn("hero", 0)}
                  </div>
                ) : (
                  <input className={inputCls} value={String(v ?? "")} onChange={(e) => setHero((p) => ({ ...p, [k]: e.target.value }))} />
                )}
              </Field>
            ))}

            {/* ─── Ротация фото в Hero ─── */}
            <div className="sm:col-span-2 mt-2 border-t border-border pt-4">
              <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                <h4 className="font-display font-bold text-sm">Ротация фото в Hero</h4>
                {pickBtn("heroList", -1, "Добавить фото")}
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Если тут 2+ фото — они плавно чередуются в шапке сайта (раз в ~7 секунд).
                Одно фото = статичная картинка. Одиночное поле «Фото» выше — запасной вариант.
              </p>
              {Array.isArray(hero.images) && hero.images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {hero.images.map((src: string, i: number) => (
                    <div key={i} className="rounded-xl border border-border overflow-hidden bg-muted/40">
                      <div className="relative aspect-[4/3]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        <span className="absolute top-1 left-1 text-[10px] font-bold bg-black/60 text-white rounded px-1.5 py-0.5">#{i + 1}</span>
                      </div>
                      <div className="p-1.5 flex items-center gap-1">
                        <button type="button" title="Заменить фото" onClick={() => setPickerFor({ kind: "heroList", index: i })} className="flex-1 text-[11px] h-7 rounded hover:bg-accent truncate">Заменить</button>
                        <button type="button" title="Выше" disabled={i === 0} onClick={() => setHero((p) => { const a = [...p.images]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return { ...p, images: a }; })} className="w-7 h-7 rounded hover:bg-accent disabled:opacity-30 inline-flex items-center justify-center"><ArrowUp className="w-3.5 h-3.5" /></button>
                        <button type="button" title="Ниже" disabled={i === hero.images.length - 1} onClick={() => setHero((p) => { const a = [...p.images]; [a[i + 1], a[i]] = [a[i], a[i + 1]]; return { ...p, images: a }; })} className="w-7 h-7 rounded hover:bg-accent disabled:opacity-30 inline-flex items-center justify-center"><ArrowDown className="w-3.5 h-3.5" /></button>
                        <button type="button" title="Удалить" onClick={() => setHero((p) => ({ ...p, images: p.images.filter((_: string, j: number) => j !== i) }))} className="w-7 h-7 rounded hover:bg-destructive/10 text-destructive inline-flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Ротации нет — показывается только одиночное фото.</p>
              )}
            </div>

            <div className="sm:col-span-2"><button onClick={saveSettings} disabled={saving} className={btnCls}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Сохранить</button></div>
          </div>
        )}

        {/* ─── Visibility ─── */}
        {tab === "visibility" && (
          <div className="bg-card rounded-2xl border border-border/60 p-5 space-y-3 max-w-md">
            {Object.keys(VIS_LABELS).map((k) => (
              <label key={k} className="flex items-center justify-between text-sm">
                <span>{VIS_LABELS[k]}</span>
                <input type="checkbox" checked={visibility[k] !== false} onChange={(e) => setVisibility((p) => ({ ...p, [k]: e.target.checked }))} className="w-4 h-4" />
              </label>
            ))}
            <button onClick={saveSettings} disabled={saving} className={btnCls}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Сохранить</button>
          </div>
        )}

        {/* ─── Programs ─── */}
        {tab === "programs" && (
          <div className="space-y-4">
            {programs.map((p, i) => (
              <div key={p.id ?? i} className="bg-card rounded-2xl border border-border/60 p-4 grid sm:grid-cols-2 gap-3">
                <Field label="Название"><input className={inputCls} value={p.title ?? ""} onChange={(e) => setPrograms((prev) => prev.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} /></Field>
                <Field label="Возраст"><input className={inputCls} value={p.age_range ?? ""} onChange={(e) => setPrograms((prev) => prev.map((x, j) => j === i ? { ...x, age_range: e.target.value } : x))} /></Field>
                <div className="sm:col-span-2">
                  <Field label="Категория (раздел)">
                    <select className={inputCls} value={p.category ?? "educational"} onChange={(e) => setPrograms((prev) => prev.map((x, j) => j === i ? { ...x, category: e.target.value } : x))}>
                      <option value="educational">Учебное направление</option>
                      <option value="creative">Творческий факультатив</option>
                    </select>
                  </Field>
                </div>
                <div className="sm:col-span-2"><Field label="Описание"><textarea rows={2} className={inputCls + " h-auto py-2"} value={p.description ?? ""} onChange={(e) => setPrograms((prev) => prev.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} /></Field></div>
                <div className="sm:col-span-2"><Field label="Фото URL">
                  <div className="flex gap-2">
                    <input className={inputCls + " flex-1"} value={p.image ?? ""} onChange={(e) => setPrograms((prev) => prev.map((x, j) => j === i ? { ...x, image: e.target.value } : x))} />
                    {pickBtn("program", i)}
                  </div>
                </Field></div>
                <div className="sm:col-span-2"><Field label="Точка фокуса при кадрировании (object-position)">
                  <div className="flex items-center gap-2 flex-wrap">
                    <select className={inputCls + " w-auto"} value={p.pos ?? "50% 50%"} onChange={(e) => setPrograms((prev) => prev.map((x, j) => j === i ? { ...x, pos: e.target.value === "50% 50%" ? "" : e.target.value } : x))}>
                      <option value="50% 50%">центр (по умолчанию)</option>
                      <option value="50% 15%">верх — если вверху лицо</option>
                      <option value="50% 25%">верх-чуть-ниже</option>
                      <option value="50% 75%">низ — если объект внизу</option>
                      <option value="25% 50%">левая треть</option>
                      <option value="75% 50%">правая треть</option>
                    </select>
                    <input className={inputCls + " flex-1 min-w-[130px]"} placeholder="50% 20%" value={p.pos ?? ""} onChange={(e) => setPrograms((prev) => prev.map((x, j) => j === i ? { ...x, pos: e.target.value } : x))} />
                    {p.image && (
                      <div className="relative w-16 h-10 rounded-lg overflow-hidden border border-border shrink-0" title="Превью с учётом фокуса">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: p.pos || "50% 50%" }} />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Если фото вертикальное и обрезается голова/лицо — поставьте <code className="px-1 bg-accent rounded">50% 15%</code>.</p>
                </Field></div>
                <div className="flex items-end gap-4">
                  <label className="inline-flex items-center gap-2 text-sm h-10"><input type="checkbox" checked={p.visible !== false} onChange={(e) => setPrograms((prev) => prev.map((x, j) => j === i ? { ...x, visible: e.target.checked } : x))} className="w-4 h-4" />показывать</label>
                  <button onClick={() => move(programs, i, -1, setPrograms)} className="p-2 rounded-lg hover:bg-accent"><ArrowUp className="w-4 h-4" /></button>
                  <button onClick={() => move(programs, i, 1, setPrograms)} className="p-2 rounded-lg hover:bg-accent"><ArrowDown className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            <button onClick={savePrograms} disabled={saving} className={btnCls}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Сохранить</button>
          </div>
        )}

        {/* ─── Gallery ─── */}
        {tab === "gallery" && (
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border/60 p-4 flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 h-10 px-4 rounded-full border-2 border-border text-sm font-semibold cursor-pointer hover:border-primary hover:text-primary">
                <Upload className="w-4 h-4" /> Загрузить фото или видео
                <input
                  type="file"
                  accept="image/*,video/mp4,video/webm,video/quicktime,video/x-m4v"
                  multiple
                  className="hidden"
                  disabled={uploadQueue.some((q) => q.status === "uploading" || q.status === "compressing")}
                  onChange={(e) => {
                    const fs = e.target.files;
                    if (fs && fs.length > 0) uploadFiles(fs);
                    e.target.value = "";
                  }}
                />
              </label>
              <span className="text-[10px] text-muted-foreground">
                картинки до {IMAGE_MAX / 1024 / 1024}MB · видео до {VIDEO_MAX / 1024 / 1024}MB
              </span>
              {photos.length > 0 ? (
                <span className="text-xs text-muted-foreground">
                  В базе <b className="text-foreground">{photos.length}</b> медиа · они показываются в галерее на сайте.
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Пока нет своих файлов — на сайте показывается <b>галерея по умолчанию</b> из
                  <code className="text-[10px] px-1 mx-1 bg-accent rounded">data/site.ts</code>.
                  Загрузите свои — они заменят дефолт.
                </span>
              )}
            </div>

            {/* Прогресс загрузки */}
            {uploadQueue.length > 0 && (
              <div className="bg-card rounded-2xl border border-border/60 p-3">
                <div className="text-xs font-semibold mb-2 text-muted-foreground">Очередь загрузки</div>
                <ul className="space-y-1 text-xs max-h-40 overflow-auto">
                  {uploadQueue.map((q, i) => {
                    const icon = q.status === "done"
                      ? <span className="text-emerald-500">✓</span>
                      : q.status === "error"
                        ? <span className="text-destructive">✕</span>
                        : q.status === "uploading" || q.status === "compressing"
                          ? <Loader2 className="w-3 h-3 animate-inline inline-block" />
                          : <span className="text-muted-foreground">•</span>;
                    const status = q.status === "pending" ? "в очереди"
                      : q.status === "compressing" ? "сжимаю…"
                      : q.status === "uploading" ? "загружаю…"
                      : q.status === "done" ? (q.saved ? `готово (сэкономлено ${humanSize(q.saved)})` : "готово")
                      : `ошибка: ${q.message ?? ""}`;
                    return (
                      <li key={i} className="flex items-center gap-2">
                        {icon}
                        <span className="flex-1 truncate">{q.name}</span>
                        <span className={q.status === "error" ? "text-destructive" : "text-muted-foreground"}>{status}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            <style jsx>{`
              @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
              .animate-inline { animation: spin 1s linear infinite; }
            `}</style>
            {photos.length > 0 ? (
              photos.map((ph, i) => (
                <div key={ph.id} className="bg-card rounded-2xl border border-border/60 p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <div className="relative w-full sm:w-24 shrink-0">
                    {isVideoSrc(ph.src) ? (
                      <>
                        <video src={ph.src} muted playsInline preload="metadata" className="w-full sm:h-16 h-32 object-cover rounded-lg border border-border bg-black" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-lg bg-black/20">
                          <Play className="w-6 h-6 text-white drop-shadow" fill="currentColor" />
                        </div>
                        <span className="absolute top-1 left-1 text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-black/70 text-white">видео</span>
                      </>
                    ) : (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={ph.src} alt="" className="w-full sm:h-16 h-32 object-cover rounded-lg border border-border" />
                        {ph.src?.startsWith("/images/") && (
                          <span className="absolute top-1 left-1 text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-black/70 text-white" title="Файл лежит в /public/images/ на сервере сайта. Для замены — загрузите новый вариант через кнопку выше.">
                            файл
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                    <input className={inputCls} placeholder="alt" value={ph.alt ?? ""} onChange={(e) => setPhotos((prev) => prev.map((x, j) => j === i ? { ...x, alt: e.target.value } : x))} />
                    <select className={inputCls} value={ph.span ?? "normal"} onChange={(e) => setPhotos((prev) => prev.map((x, j) => j === i ? { ...x, span: e.target.value } : x))}><option value="normal">обычное</option><option value="wide">широкое</option><option value="tall">высокое</option></select>
                    <input className={inputCls} placeholder="50% 20%" value={ph.pos ?? ""} onChange={(e) => setPhotos((prev) => prev.map((x, j) => j === i ? { ...x, pos: e.target.value } : x))} />
                  </div>
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                    <button onClick={() => move(photos, i, -1, setPhotos)} className="p-2 rounded-lg hover:bg-accent"><ArrowUp className="w-4 h-4" /></button>
                    <button onClick={() => move(photos, i, 1, setPhotos)} className="p-2 rounded-lg hover:bg-accent"><ArrowDown className="w-4 h-4" /></button>
                    <button onClick={() => deletePhoto(ph.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-card rounded-2xl border border-dashed border-border/70 p-6">
                <p className="text-sm font-semibold mb-3">Текущая галерея на сайте (дефолт из data/site.ts):</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {defaultGallery.map((g, gi) => (
                    <div key={gi} className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={g.src} alt={g.alt} className="w-full aspect-square object-cover rounded-lg border border-border" />
                      <span className="absolute bottom-1 left-1 text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-black/70 text-white">
                        {g.src.split('/').pop()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {photos.length > 0 && <button onClick={() => savePhotoOrder(photos)} disabled={saving} className={btnCls}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Сохранить</button>}
          </div>
        )}

        {/* ─── Teachers ─── */}
        {tab === "teachers" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Добавьте карточки педагогов. Блок появится на сайте, когда в настройках включён переключатель «Блок «Преподаватели»».</p>
            {teachers.map((t, i) => (
              <div key={t.id ?? i} className="bg-card rounded-2xl border border-border/60 p-4 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Имя и фамилия"><input className={inputCls} value={t.name ?? ""} onChange={(e) => setTeachers((prev) => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} /></Field>
                  <Field label="Должность / направление"><input className={inputCls} value={t.role ?? ""} onChange={(e) => setTeachers((prev) => prev.map((x, j) => j === i ? { ...x, role: e.target.value } : x))} /></Field>
                </div>
                <Field label="О педагоге"><textarea rows={2} className={inputCls + " h-auto py-2"} value={t.bio ?? ""} onChange={(e) => setTeachers((prev) => prev.map((x, j) => j === i ? { ...x, bio: e.target.value } : x))} /></Field>
                <Field label="Фото URL">
                  <div className="flex gap-2">
                    <input className={inputCls + " flex-1"} value={t.photo ?? ""} onChange={(e) => setTeachers((prev) => prev.map((x, j) => j === i ? { ...x, photo: e.target.value } : x))} />
                    {pickBtn("teacher", i)}
                  </div>
                </Field>
                <div className="flex items-center gap-2">
                  <button onClick={() => move(teachers, i, -1, setTeachers)} className="p-2 rounded-lg hover:bg-accent"><ArrowUp className="w-4 h-4" /></button>
                  <button onClick={() => move(teachers, i, 1, setTeachers)} className="p-2 rounded-lg hover:bg-accent"><ArrowDown className="w-4 h-4" /></button>
                  <button onClick={() => setTeachers((prev) => prev.filter((_, j) => j !== i))} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setTeachers((prev) => [...prev, { id: `new-${Date.now()}`, name: "", role: "", bio: "", photo: "" }])} className={btnCls + " bg-card border border-border text-foreground hover:bg-accent"}><Plus className="w-4 h-4" /> Добавить педагога</button>
              <button onClick={saveSettings} disabled={saving} className={btnCls}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Сохранить</button>
            </div>
          </div>
        )}

        {/* ─── Reviews ─── */}
        {tab === "reviews" && (
          <div className="space-y-4">
            {/* VK-импорт */}
            <div className="bg-card rounded-2xl border border-border/60 p-4 sm:p-5">
              <h3 className="font-display font-bold text-base mb-2">Импорт из VK</h3>
              <p className="text-sm text-muted-foreground mb-3">Загрузить посты из вашей группы VK. Выберите те, которые являются отзывами родителей — они добавятся в список ниже.</p>
              <button onClick={syncVkReviews} disabled={syncingReviews} className={btnCls}>
                {syncingReviews ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {syncingReviews ? "Загрузка…" : "Загрузить посты из VK"}
              </button>
            </div>

            {vkReviews.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Найденные посты (нажмите «Добавить» на отзывах):</p>
                {vkReviews.map((post) => (
                  <div key={post.id} className="bg-card rounded-2xl border border-border/60 p-4 flex gap-3 items-start">
                    {post.cover && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.cover} alt="" className="w-16 h-12 object-cover rounded-lg border border-border shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">{post.date}</p>
                      <p className="text-sm text-foreground line-clamp-3">{post.text}</p>
                    </div>
                    <button onClick={() => importVkReview(post)} className="shrink-0 h-8 px-3 rounded-full bg-brand-warm/10 text-brand-warm text-xs font-semibold hover:bg-brand-warm/20 transition-colors">
                      Добавить
                    </button>
                  </div>
                ))}
              </div>
            )}

            <hr className="border-border/60" />

            {/* Существующие отзывы */}
            {reviews.map((r, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border/60 p-4 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Автор"><input className={inputCls} value={r.author ?? ""} onChange={(e) => setReviews((prev) => prev.map((x, j) => j === i ? { ...x, author: e.target.value } : x))} /></Field>
                  <Field label="Источник (jsprav.ru, VK…)"><input className={inputCls} value={r.source ?? ""} onChange={(e) => setReviews((prev) => prev.map((x, j) => j === i ? { ...x, source: e.target.value } : x))} /></Field>
                </div>
                <Field label="Ссылка на источник"><input className={inputCls} value={r.source_url ?? r.sourceUrl ?? ""} onChange={(e) => setReviews((prev) => prev.map((x, j) => j === i ? { ...x, source_url: e.target.value } : x))} /></Field>
                <Field label="Текст отзыва"><textarea rows={3} className={inputCls + " h-auto py-2"} value={r.text ?? ""} onChange={(e) => setReviews((prev) => prev.map((x, j) => j === i ? { ...x, text: e.target.value } : x))} /></Field>
                <Field label="Информация о ребёнке (необязательно)"><input className={inputCls} value={r.child_info ?? r.childInfo ?? ""} onChange={(e) => setReviews((prev) => prev.map((x, j) => j === i ? { ...x, child_info: e.target.value } : x))} /></Field>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-sm h-10"><input type="checkbox" checked={r.visible !== false} onChange={(e) => setReviews((prev) => prev.map((x, j) => j === i ? { ...x, visible: e.target.checked } : x))} className="w-4 h-4" />показывать</label>
                  <button onClick={() => move(reviews, i, -1, setReviews)} className="p-2 rounded-lg hover:bg-accent"><ArrowUp className="w-4 h-4" /></button>
                  <button onClick={() => move(reviews, i, 1, setReviews)} className="p-2 rounded-lg hover:bg-accent"><ArrowDown className="w-4 h-4" /></button>
                  <button onClick={() => setReviews((prev) => prev.filter((_, j) => j !== i))} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setReviews((prev) => [...prev, { author: "", source: "", source_url: "", text: "", child_info: "", visible: true }])} className={btnCls + " bg-card border border-border text-foreground hover:bg-accent"}><Plus className="w-4 h-4" /> Добавить отзыв</button>
              <button onClick={saveReviews} disabled={saving} className={btnCls}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Сохранить</button>
            </div>
          </div>
        )}

        {/* ─── Learning Experience ─── */}
        {tab === "learning" && (
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border/60 p-5 space-y-4">
              <Field label="Заголовок секции"><input className={inputCls} value={learning.title} onChange={(e) => setLearning((p) => ({ ...p, title: e.target.value }))} /></Field>
              <Field label="Описание"><textarea rows={2} className={inputCls + " h-auto py-2"} value={learning.description} onChange={(e) => setLearning((p) => ({ ...p, description: e.target.value }))} /></Field>
            </div>
            {(learning.steps ?? []).map((step, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border/60 p-4 space-y-3">
                <Field label={`Шаг ${i + 1} — заголовок`}><input className={inputCls} value={step.title ?? ""} onChange={(e) => setLearning((p) => ({ ...p, steps: p.steps.map((s, j) => j === i ? { ...s, title: e.target.value } : s) }))} /></Field>
                <Field label="Описание шага"><textarea rows={2} className={inputCls + " h-auto py-2"} value={step.description ?? ""} onChange={(e) => setLearning((p) => ({ ...p, steps: p.steps.map((s, j) => j === i ? { ...s, description: e.target.value } : s) }))} /></Field>
                <Field label="Фото URL">
                  <div className="flex gap-2">
                    <input className={inputCls + " flex-1"} value={step.image ?? ""} onChange={(e) => setLearning((p) => ({ ...p, steps: p.steps.map((s, j) => j === i ? { ...s, image: e.target.value } : s) }))} />
                    {pickBtn("step", i)}
                  </div>
                </Field>
                <div className="flex gap-2">
                  <button onClick={() => setLearning((p) => { const s = [...p.steps]; const j = i - 1; if (j >= 0) { [s[i], s[j]] = [s[j], s[i]]; } return { ...p, steps: s }; })} className="p-2 rounded-lg hover:bg-accent"><ArrowUp className="w-4 h-4" /></button>
                  <button onClick={() => setLearning((p) => { const s = [...p.steps]; const j = i + 1; if (j < s.length) { [s[i], s[j]] = [s[j], s[i]]; } return { ...p, steps: s }; })} className="p-2 rounded-lg hover:bg-accent"><ArrowDown className="w-4 h-4" /></button>
                  <button onClick={() => setLearning((p) => ({ ...p, steps: p.steps.filter((_, j) => j !== i) }))} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            <div className="flex gap-3">
              <button onClick={() => setLearning((p) => ({ ...p, steps: [...(p.steps ?? []), { title: "", description: "", image: "" }] }))} className={btnCls + " bg-card border border-border text-foreground hover:bg-accent"}><Plus className="w-4 h-4" /> Добавить шаг</button>
              <button onClick={saveSettings} disabled={saving} className={btnCls}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Сохранить</button>
            </div>
          </div>
        )}

        {/* ─── Контент-блоки ─── */}
        {tab === "blocks" && (
          <div className="space-y-6">

            {/* Задачи родителя */}
            <Section title="«С какой задачей пришли?»" subtitle="Карточки-ссылки на странице, по 1 эмодзи + заголовок + подзаголовок + ссылка">
              {parentPains.map((pain, i) => (
                <div key={i} className="bg-card rounded-2xl border border-border/60 p-4 grid sm:grid-cols-4 gap-3">
                  <Field label="Иконка">
                    <select className={inputCls} value={pain.icon ?? "Sparkles"} onChange={(e) => setParentPains((p) => p.map((x, j) => j === i ? { ...x, icon: e.target.value } : x))}>
                      {PAIN_ICON_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </Field>
                  <Field label="Заголовок"><input className={inputCls} value={pain.title ?? ""} onChange={(e) => setParentPains((p) => p.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} /></Field>
                  <Field label="Подзаголовок"><input className={inputCls} value={pain.subtitle ?? ""} onChange={(e) => setParentPains((p) => p.map((x, j) => j === i ? { ...x, subtitle: e.target.value } : x))} /></Field>
                  <Field label="Ссылка"><input className={inputCls} value={pain.href ?? ""} onChange={(e) => setParentPains((p) => p.map((x, j) => j === i ? { ...x, href: e.target.value } : x))} /></Field>
                  <Field label="Цвет">
                    <select className={inputCls} value={pain.color ?? "amber"} onChange={(e) => setParentPains((p) => p.map((x, j) => j === i ? { ...x, color: e.target.value } : x))}>
                      {["amber", "blue", "emerald", "purple", "rose", "orange"].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <div className="sm:col-span-4 flex gap-2">
                    <button onClick={() => move(parentPains, i, -1, setParentPains)} className="p-2 rounded-lg hover:bg-accent"><ArrowUp className="w-4 h-4" /></button>
                    <button onClick={() => move(parentPains, i, 1, setParentPains)} className="p-2 rounded-lg hover:bg-accent"><ArrowDown className="w-4 h-4" /></button>
                    <button onClick={() => setParentPains((p) => p.filter((_, j) => j !== i))} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              <button onClick={() => setParentPains((p) => [...p, { icon: "Sparkles", title: "", subtitle: "", href: "/", color: "amber" }])} className={btnCls + " bg-card border border-border text-foreground hover:bg-accent"}><Plus className="w-4 h-4" /> Добавить карточку</button>
            </Section>

            {/* Цитата-миссия */}
            <Section title="Миссия студии" subtitle="Позиционирующая цитата в блоке «Почему нас выбирают» и TaskPicker">
              <Field label="Цитата"><textarea rows={3} className={inputCls + " h-auto py-2"} value={studioMotto} onChange={(e) => setStudioMotto(e.target.value)} placeholder="Мы не пытаемся…" /></Field>
            </Section>

            {/* Результаты */}
            <Section title="«Что изменится у ребёнка»" subtitle="Конкретные результаты — показываем в блоке Results на главной">
              {resultsAfterLearning.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <input className={inputCls + " flex-1"} value={r} onChange={(e) => setResultsAfterLearning((p) => p.map((x, j) => j === i ? e.target.value : x))} />
                  <button onClick={() => setResultsAfterLearning((p) => p.filter((_, j) => j !== i))} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive shrink-0"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={() => setResultsAfterLearning((p) => [...p, ""])} className={btnCls + " bg-card border border-border text-foreground hover:bg-accent"}><Plus className="w-4 h-4" /> Добавить результат</button>
            </Section>

            {/* Статистика доверия */}
            <Section title="«Коротко, по делу» — статистика" subtitle="4 карточки: цифра + подпись + описание">
              {trustStats.map((s, i) => (
                <div key={i} className="bg-card rounded-2xl border border-border/60 p-4 grid grid-cols-3 gap-3">
                  <Field label="Число"><input className={inputCls} value={s.value ?? ""} onChange={(e) => setTrustStats((p) => p.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} /></Field>
                  <Field label="Подпись"><input className={inputCls} value={s.label ?? ""} onChange={(e) => setTrustStats((p) => p.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} /></Field>
                  <Field label="Описание"><input className={inputCls} value={s.description ?? ""} onChange={(e) => setTrustStats((p) => p.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} /></Field>
                  <div className="col-span-3 flex gap-2">
                    <button onClick={() => move(trustStats, i, -1, setTrustStats)} className="p-2 rounded-lg hover:bg-accent"><ArrowUp className="w-4 h-4" /></button>
                    <button onClick={() => move(trustStats, i, 1, setTrustStats)} className="p-2 rounded-lg hover:bg-accent"><ArrowDown className="w-4 h-4" /></button>
                    <button onClick={() => setTrustStats((p) => p.filter((_, j) => j !== i))} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              <button onClick={() => setTrustStats((p) => [...p, { value: "", label: "", description: "" }])} className={btnCls + " bg-card border border-border text-foreground hover:bg-accent"}><Plus className="w-4 h-4" /> Добавить карточку</button>
            </Section>

            {/* Результаты по направлениям */}
            <Section title="Результаты по направлениям" subtitle="Для страниц /programs/[slug] — 4–6 пунктов «Что сможет ребёнок»">
              <p className="text-xs text-muted-foreground mb-3">Если направление не указано, на его странице показываются общие результаты из блока выше.</p>
              {Object.entries(programOutcomes).map(([title, items]) => (
                <div key={title} className="bg-card rounded-2xl border border-border/60 p-4 space-y-2">
                  <p className="font-semibold text-sm text-foreground">{title}</p>
                  {items.map((item, j) => (
                    <div key={j} className="flex gap-2">
                      <input className={inputCls + " flex-1"} value={item} onChange={(e) => setProgramOutcomes((p) => ({ ...p, [title]: p[title].map((x, k) => k === j ? e.target.value : x) }))} />
                      <button onClick={() => setProgramOutcomes((p) => ({ ...p, [title]: p[title].filter((_, k) => k !== j) }))} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive shrink-0"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button onClick={() => setProgramOutcomes((p) => ({ ...p, [title]: [...(p[title] ?? []), ""] }))} className="text-xs text-brand-warm hover:underline mt-1">+ Добавить пункт</button>
                </div>
              ))}
            </Section>

            <button onClick={saveSettings} disabled={saving} className={btnCls}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Сохранить всё</button>
          </div>
        )}

        {/* ─── FAQ ─── */}
        {tab === "faq" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Вопросы и ответы показываются на сайте с разметкой для Яндекса и Google (богатые сниппеты).</p>
            {faqs.map((faq, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border/60 p-4 space-y-3">
                <Field label="Вопрос"><input className={inputCls} value={faq.question ?? ""} onChange={(e) => setFaqs((prev) => prev.map((x, j) => j === i ? { ...x, question: e.target.value } : x))} /></Field>
                <Field label="Ответ"><textarea rows={3} className={inputCls + " h-auto py-2"} value={faq.answer ?? ""} onChange={(e) => setFaqs((prev) => prev.map((x, j) => j === i ? { ...x, answer: e.target.value } : x))} /></Field>
                <div className="flex items-center gap-2">
                  <button onClick={() => move(faqs, i, -1, setFaqs)} className="p-2 rounded-lg hover:bg-accent"><ArrowUp className="w-4 h-4" /></button>
                  <button onClick={() => move(faqs, i, 1, setFaqs)} className="p-2 rounded-lg hover:bg-accent"><ArrowDown className="w-4 h-4" /></button>
                  <button onClick={() => setFaqs((prev) => prev.filter((_, j) => j !== i))} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setFaqs((prev) => [...prev, { question: "", answer: "" }])} className={btnCls + " bg-card border border-border text-foreground hover:bg-accent"}><Plus className="w-4 h-4" /> Добавить вопрос</button>
              <button onClick={saveSettings} disabled={saving} className={btnCls}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Сохранить</button>
            </div>
          </div>
        )}

        {/* ─── Blog ─── */}
        {tab === "blog" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">SEO-статьи для блога. Пишите полезный контент для родителей — он привлечёт трафик из поиска.</p>
            {blogPosts.map((post, i) => (
              <div key={post.id ?? i} className="bg-card rounded-2xl border border-border/60 p-4 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Заголовок"><input className={inputCls} value={post.title ?? ""} onChange={(e) => setBlogPosts((prev) => prev.map((x, j) => j === i ? { ...x, title: e.target.value, slug: x.slug || e.target.value.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, "-").replace(/^-|-$/g, "").slice(0, 80) } : x))} /></Field>
                  <Field label="Slug (URL)"><input className={inputCls} value={post.slug ?? ""} onChange={(e) => setBlogPosts((prev) => prev.map((x, j) => j === i ? { ...x, slug: e.target.value } : x))} placeholder="avtomaticheski-iz-nazvaniya" /></Field>
                </div>
                <Field label="Краткое описание (excerpt)"><textarea rows={2} className={inputCls + " h-auto py-2"} value={post.excerpt ?? ""} onChange={(e) => setBlogPosts((prev) => prev.map((x, j) => j === i ? { ...x, excerpt: e.target.value } : x))} /></Field>
                <Field label="Обложка (URL)">
                  <div className="flex gap-2">
                    <input className={inputCls + " flex-1"} value={post.cover ?? ""} onChange={(e) => setBlogPosts((prev) => prev.map((x, j) => j === i ? { ...x, cover: e.target.value } : x))} />
                    {pickBtn("blog" as any, i)}
                  </div>
                </Field>
                <Field label="Текст статьи (Markdown: # заголовок, **жирный**, - список, [ссылка](url))">
                  <textarea rows={10} className={inputCls + " h-auto py-2 font-mono text-xs leading-relaxed"} value={post.content ?? ""} onChange={(e) => setBlogPosts((prev) => prev.map((x, j) => j === i ? { ...x, content: e.target.value } : x))} placeholder="# Заголовок статьи&#10;&#10;Первый абзац с **важным** текстом.&#10;&#10;## Подзаголовок&#10;&#10;- Пункт списка&#10;- Ещё пункт" />
                </Field>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-sm h-10"><input type="checkbox" checked={post.visible !== false} onChange={(e) => setBlogPosts((prev) => prev.map((x, j) => j === i ? { ...x, visible: e.target.checked } : x))} className="w-4 h-4" />опубликована</label>
                  <button onClick={() => deleteBlogPost(post.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
                  {post.slug && (
                    <a href={`/blog/${post.slug}`} target="_blank" className="text-xs text-brand-warm hover:underline">Посмотреть →</a>
                  )}
                </div>
              </div>
            ))}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setBlogPosts((prev) => [...prev, { slug: "", title: "", excerpt: "", content: "", cover: "", visible: true }])} className={btnCls + " bg-card border border-border text-foreground hover:bg-accent"}><Plus className="w-4 h-4" /> Новая статья</button>
              <button onClick={saveBlog} disabled={saving} className={btnCls}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Сохранить</button>
            </div>
          </div>
        )}

        {/* ─── News VK ─── */}
        {tab === "news" && (
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border/60 p-5">
              <h3 className="font-display font-bold text-base mb-3">Синхронизация с VK</h3>
              <p className="text-sm text-muted-foreground mb-4">Загрузить последние новости из сообщества VK. Фото, заголовки и текст извлекаются автоматически.</p>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[200px]">
                  <Field label="VK-домен (необязательно)">
                    <input className={inputCls} value={vkDomain} onChange={(e) => setVkDomain(e.target.value)} placeholder="sfera_gk" />
                  </Field>
                </div>
                <button onClick={syncVK} disabled={syncing} className={btnCls}>
                  {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {syncing ? "Синхронизация…" : "Загрузить из VK"}
                </button>
              </div>
            </div>

            {news.length === 0 && !syncing && (
              <p className="text-sm text-muted-foreground">Новостей пока нет. Нажмите «Загрузить из VK» чтобы получить новости.</p>
            )}
            {news.map((n) => (
              <div key={n.id} className="bg-card rounded-2xl border border-border/60 p-3 sm:p-4">
                <div className="flex gap-3">
                  {n.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={n.image_url} alt="" className="w-16 h-12 sm:w-20 sm:h-14 object-cover rounded-lg border border-border shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">
                        {n.published_at ? new Date(n.published_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" }) : ""}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground line-clamp-2">{n.title}</p>
                    {n.excerpt && <p className="text-xs text-muted-foreground mt-1 line-clamp-1 sm:line-clamp-2">{n.excerpt}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:self-start">
                  <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <input type="checkbox" checked={n.visible !== false} onChange={(e) => toggleNewsVisible(n.id, e.target.checked)} className="w-3.5 h-3.5" />
                    видна
                  </label>
                  {n.source_url && (
                    <a href={n.source_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground" title="Открыть в VK">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button onClick={() => deleteNewsItem(n.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive" title="Удалить">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── SEO ─── */}
        {tab === "seo" && (
          <div className="bg-card rounded-2xl border border-border/60 p-5 space-y-4 max-w-lg">
            <p className="text-xs text-muted-foreground">Эти метки используются в &lt;head&gt; каждой страницы (meta title, description, Open Graph, keywords).</p>
            <Field label="Title (по умолчанию)"><input className={inputCls} value={siteConfig.seoTitle ?? ""} onChange={(e) => setSiteConfig((p) => ({ ...p, seoTitle: e.target.value }))} placeholder="Учебно-развивающая студия «Сфера»…" /></Field>
            <Field label="Title шаблон (для подстраниц)"><input className={inputCls} value={siteConfig.seoTitleTemplate ?? ""} onChange={(e) => setSiteConfig((p) => ({ ...p, seoTitleTemplate: e.target.value }))} placeholder="%s — «Сфера» Горячий Ключ" /></Field>
            <Field label="Description"><textarea rows={2} className={inputCls + " h-auto py-2"} value={siteConfig.seoDescription ?? ""} onChange={(e) => setSiteConfig((p) => ({ ...p, seoDescription: e.target.value }))} /></Field>
            <Field label="Keywords (через запятую)"><input className={inputCls} value={siteConfig.seoKeywords ?? ""} onChange={(e) => setSiteConfig((p) => ({ ...p, seoKeywords: e.target.value }))} /></Field>
            <Field label="OG-изображение (URL)"><input className={inputCls} value={siteConfig.seoOgImage ?? ""} onChange={(e) => setSiteConfig((p) => ({ ...p, seoOgImage: e.target.value }))} placeholder="/og-image.png" /></Field>
            <Field label="Theme Color"><input className={inputCls} value={siteConfig.seoThemeColor ?? ""} onChange={(e) => setSiteConfig((p) => ({ ...p, seoThemeColor: e.target.value }))} placeholder="hsl(32 85% 52%)" /></Field>
            <button onClick={saveSettings} disabled={saving} className={btnCls}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Сохранить</button>
          </div>
        )}

        {/* ─── Import/Export ─── */}
        {tab === "io" && (
          <div className="bg-card rounded-2xl border border-border/60 p-5 space-y-6 max-w-lg">
            <div>
              <h3 className="font-display font-bold text-base mb-2">Полный бэкап сайта</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Экспорт всех данных в JSON: <b>настройки, Hero, видимость, направления, галерея, педагоги,
                отзывы, занятия, вопросы, блог, <u className="decoration-primary">новости</u>, SEO, заявки</b>.
              </p>
              <button onClick={doExport} className={btnCls}><Download className="w-4 h-4" /> Скачать JSON-бэкап</button>
            </div>
            <hr className="border-border" />
            <div>
              <h3 className="font-display font-bold text-base mb-2">Полный импорт</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Восстановление из ранее скачанного бэкапа. <strong className="text-destructive">Все текущие
                данные — включая новости — будут заменены.</strong>
              </p>
              <label className={btnCls + " cursor-pointer"}><Upload className="w-4 h-4" /> Загрузить JSON<input type="file" accept=".json" className="hidden" ref={fileRef} onChange={(e) => { const f = e.target.files?.[0]; if (f) doImport(f); e.target.value = ""; }} /></label>
            </div>
            <hr className="border-border" />
            <div>
              <h3 className="font-display font-bold text-base mb-2 flex items-center gap-2"><Newspaper className="w-4 h-4" /> Только новости</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Экспорт/импорт отдельного файла с новостями. При импорте заменяются <b>только</b> записи в таблице
                <code className="text-[10px] px-1 mx-1 bg-accent rounded">news</code>, остальной контент не трогается.
                Удобно чтобы перенести ленту между проектами или делать точечный бэкап перед синхроном VK.
              </p>
              <div className="flex flex-wrap gap-2">
                <button onClick={exportNews} className={btnSecondaryCls}><Download className="w-4 h-4" /> Скачать новости.json</button>
                <label className={btnSecondaryCls + " cursor-pointer"}>
                  <Upload className="w-4 h-4" /> Импорт новостей
                  <input type="file" accept=".json,application/json" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) await importNews(f); e.target.value = ""; }} />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ─── Inbox ─── */}
        {tab === "inbox" && (
          <div className="space-y-3">
            {enrollments.length === 0 && <p className="text-sm text-muted-foreground">Заявок пока нет.</p>}
            {enrollments.map((en) => (
              <div key={en.id} className="bg-card rounded-2xl border border-border/60 p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{en.parent_name ?? "—"} · {en.phone ?? "—"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {en.child_age && <>ребёнок: {en.child_age} · </>}
                      {en.interest ?? "—"} ·{en.created_at ? " " + new Date(en.created_at).toLocaleString("ru-RU") : ""}
                    </p>
                    {en.comment && <p className="text-sm mt-2">{en.comment}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <select className={inputCls + " flex-1 sm:w-36"} value={en.status ?? "new"} onChange={async (e) => { const status = e.target.value; setEnrollments((prev) => prev.map((x) => x.id === en.id ? { ...x, status } : x)); await fetch("/api/admin/enrollments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: en.id, status }) }); }}>
                      <option value="new">новая</option>
                      <option value="contacted">связались</option>
                      <option value="enrolled">записан</option>
                    </select>
                    <button onClick={async () => { if (!confirm("Удалить?")) return; await fetch(`/api/admin/enrollments?id=${en.id}`, { method: "DELETE" }); setEnrollments((prev) => prev.filter((x) => x.id !== en.id)); }} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive shrink-0"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Пикер фото ─── */}
        {pickerFor && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => { setPickerFor(null); setPickerFilter(""); }}>
            <div className="bg-card rounded-2xl border border-border p-5 max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3 shrink-0">
                <h3 className="font-display font-bold text-base">Выберите фото</h3>
                <button onClick={() => { setPickerFor(null); setPickerFilter(""); }} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground" title="Закрыть">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <input
                className={inputCls + " mb-4 shrink-0"}
                placeholder="Фильтр по имени файла… (например PF6A, studio, theater)"
                value={pickerFilter}
                onChange={(e) => setPickerFilter(e.target.value)}
                autoFocus
              />
              <div className="overflow-auto -mx-1 px-1 flex-1">
                {(() => {
                  const currentSrc = (() => {
                    const { kind, index } = pickerFor;
                    if (kind === "hero") return hero.image;
                    if (kind === "heroList") return Array.isArray(hero.images) ? (hero.images[index] ?? "") : "";
                    if (kind === "teacher" && teachers[index]) return teachers[index].photo;
                    if (kind === "program" && programs[index]) return programs[index].image;
                    return "";
                  })();
                  const filter = (s: string) => !pickerFilter || s.toLowerCase().includes(pickerFilter.toLowerCase());
                  // Соберём все уникальные источники: DB gallery + static gallery + /public/images
                  const dbPhotos = photos.filter(p => filter(p.src));
                  const staticOnly = defaultGallery.filter(g => filter(g.src) && !photos.some(p => p.src === g.src));
                  const allFiles = (pickerFiles || []).filter(f => filter(f.src) && !photos.some(p => p.src === f.src) && !defaultGallery.some(g => g.src === f.src));
                  const empty = dbPhotos.length + staticOnly.length + allFiles.length === 0;
                  const Tile = ({ src, badge }: { src: string; badge?: string }) => (
                    <button
                      type="button"
                      onClick={() => applyPhoto(src)}
                      className={"group relative rounded-xl overflow-hidden border-2 transition-colors " + (src === currentSrc ? "border-brand-warm ring-2 ring-brand-warm/30" : "border-transparent hover:border-brand-warm")}
                      title={src}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" loading="lazy" className="w-full aspect-square object-cover" />
                      {src === currentSrc && (
                        <span className="absolute top-1 left-1 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-brand-warm text-white">текущее</span>
                      )}
                      {badge && (
                        <span className="absolute bottom-1 left-1 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-black/70 text-white">{badge}</span>
                      )}
                    </button>
                  );
                  if (empty) return (
                    <p className="text-sm text-muted-foreground py-6 text-center">
                      {pickerFilter ? "Ничего не найдено по «" + pickerFilter + "»" : "Нет доступных файлов"}
                    </p>
                  );
                  return (
                    <>
                      {dbPhotos.length > 0 && (<>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-1">Галерея ({dbPhotos.length})</p>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">{dbPhotos.map((ph) => <Tile key={"db-"+ph.id} src={ph.src} badge="галерея" />)}</div>
                      </>)}
                      {staticOnly.length > 0 && (<>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">По умолчанию ({staticOnly.length})</p>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">{staticOnly.map((g, gi) => <Tile key={"st-"+gi} src={g.src} />)}</div>
                      </>)}
                      {allFiles.length > 0 && (<>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Все файлы в <code>/public/images/</code> ({allFiles.length})</p>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">{allFiles.map(f => <Tile key={f.src} src={f.src} />)}</div>
                      </>)}
                    </>
                  );
                })()}
              </div>
              <p className="text-xs text-muted-foreground mt-3 shrink-0">
                💡 Если фото вертикальное и обрезается голова — после выбора откройте «Направления» →
                поле «Точка фокуса» → <code>50% 20%</code>.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Плавающая кнопка «наверх» */}
      {showTop && !pickerFor && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Наверх"
          title="Наверх"
          className="fixed bottom-5 right-5 z-40 inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 active:scale-95 transition-all"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
