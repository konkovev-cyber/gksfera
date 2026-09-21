/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Loader2, Save, Upload, Trash2, LogOut, ArrowUp, ArrowDown,
  Settings, Image as ImageIcon, LayoutDashboard, Inbox, School,
  Eye, Star, BookOpen, Search, Download, Plus, Newspaper, RefreshCw, ExternalLink, X,
  GraduationCap, HelpCircle, PenTool, Play, CalendarDays, Copy, Sparkles,
  List, Quote, Link2, ArrowLeft, Pencil, ImagePlus, Clock,
} from "lucide-react";
import { gallery as defaultGallery } from "@/data/site";
import { compressImageFile, isVideoSrc, humanSize, IMAGE_MAX, VIDEO_MAX } from "@/lib/compress";
import { slugifyRu, uniqueSlug, newsKey, newsUrl, isVkNews } from "@/lib/news";
import { NewsBody, NewsSourceBadge } from "@/components/site/NewsArticle";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { cn } from "@/lib/utils";

type Tab = "settings" | "hero" | "visibility" | "programs" | "gallery" |
  "teachers" | "reviews" | "learning" | "faq" | "news" | "seo" | "io" | "inbox" | "blocks" | "schedule" | "banners";

type TabCategory = "all" | "leads" | "home" | "study" | "media" | "system";

const CATEGORIES: { id: TabCategory; label: string; icon: any }[] = [
  { id: "all", label: "Все", icon: LayoutDashboard },
  { id: "leads", label: "Заявки", icon: Inbox },
  { id: "home", label: "Главная", icon: Sparkles },
  { id: "study", label: "Учёба", icon: School },
  { id: "media", label: "Медиа", icon: ImageIcon },
  { id: "system", label: "Настройки", icon: Settings },
];

/** Куда в редакторе прикладывается картинка — из медиатеки или с компьютера. */
type FieldKind = "program" | "hero" | "heroList" | "step" | "teacher" | "schedule" | "news" | "newsBody";
/** Ключ занятости загрузки: одно поле показывает спиннер, остальные ждут. */
const busyKey = (kind: FieldKind, index: number) => `${kind}:${index}`;

const TABS: { id: Tab; label: string; icon: any; category: TabCategory; hint: string }[] = [
  // Заявки
  { id: "inbox", label: "Заявки", icon: Inbox, category: "leads", hint: "Обращения с формы «Записаться»: имя, телефон, направление, комментарий. Приходит из формы на сайте и из мессенджеров." },

  // Главная страница
  { id: "hero", label: "Первый экран", icon: LayoutDashboard, category: "home", hint: "Первый экран главной страницы: заголовок, подзаголовок, кнопки и ротация фотографий." },
  { id: "banners", label: "Баннеры", icon: Sparkles, category: "home", hint: "Небольшие «облачные» промо-баннеры в первом экране (карточки-ссылки: Расписание, Пробное занятие и т.п.)." },
  { id: "visibility", label: "Порядок секций", icon: Eye, category: "home", hint: "Включать/скрывать целые блоки главной И переставлять их местами вверх/вниз." },
  { id: "blocks", label: "Блоки контента", icon: List, category: "home", hint: "Дополнительные блоки главной: «с какой задачей пришли», результаты занятий, цифры доверия и девиз студии." },

  // Учебный процесс
  { id: "programs", label: "Направления", icon: School, category: "study", hint: "Карточки учебных и творческих направлений (страницы /programs/…). Название, описание, возраст, цена, фото." },
  { id: "schedule", label: "Расписание", icon: CalendarDays, category: "study", hint: "Расписание занятий по группам (страница /raspisanie). Дни, уроки, время и картинка для печати." },
  { id: "teachers", label: "Педагоги", icon: GraduationCap, category: "study", hint: "Карточки преподавателей: имя, роль, описание, опыт и фото." },
  { id: "learning", label: "Как учим", icon: BookOpen, category: "study", hint: "Секция «Как проходят занятия» на главной: пошаговый путь (шаги с описанием и фото)." },

  // Медиа и статьи
  { id: "gallery", label: "Галерея", icon: ImageIcon, category: "media", hint: "Фото и видео для галереи. Загрузка, порядок и подписи. Полная коллекция — на странице /gallery." },
  { id: "news", label: "Новости", icon: Newspaper, category: "media", hint: "Новости студии: пишутся прямо здесь и подтягиваются из группы ВКонтакте. Лента на главной и архив /news." },
  { id: "reviews", label: "Отзывы", icon: Star, category: "media", hint: "Отзывы родителей — свои или импорт из группы ВКонтакте. Показываются на главной и на /reviews." },
  { id: "faq", label: "Вопросы", icon: HelpCircle, category: "media", hint: "Частые вопросы и ответы (раскрывающийся список на главной и страница вопросов)." },

  // Настройки и система
  { id: "settings", label: "Реквизиты", icon: Settings, category: "system", hint: "Реквизиты студии: название, телефон, адрес, соцсети, часы работы." },
  { id: "seo", label: "SEO", icon: Search, category: "system", hint: "Метаданные для поиска и соцсетей: title, description, Open Graph." },
  { id: "io", label: "Резервные копии", icon: Download, category: "system", hint: "Резервная копия и перенос всего контента в JSON (бэкап или миграция)." },
];

const VIS_LABELS: Record<string, string> = {
  tasks: "С какой задачей пришли", about: "О студии", programs: "Направления",
  results: "Результаты занятий", truststats: "Цифры доверия", learning: "Как проходят занятия",
  gallery: "Галерея", teachers: "Преподаватели", reviews: "Отзывы", news: "Новости",
  faq: "Частые вопросы", events: "События", parentnav: "Навигатор для родителей",
  cta: "CTA-баннер", enrollment: "Форма записи", contacts: "Контакты и карта",
};

/** Подписи всех переставляемых блоков главной (для вкладки «Порядок»). */
const SECTION_LABELS: Record<string, string> = {
  tasks: "Блок «С какой задачей пришли»", about: "О студии", programs: "Направления",
  results: "Результаты занятий", truststats: "Цифры доверия", learning: "Как проходят занятия",
  gallery: "Галерея", teachers: "Преподаватели", reviews: "Отзывы", events: "События",
  news: "Новости", faq: "Частые вопросы", parentnav: "Навигатор для родителей",
  cta: "CTA-баннер", enrollment: "Форма записи", contacts: "Контакты и карта",
};

/** Список иконок для промо-банеров (значения — ключи iconMap). */
const BANNER_ICONS: { value: string; label: string }[] = [
  { value: "CalendarDays", label: "Расписание / календарь" },
  { value: "Sparkles", label: "Искры / «волшебно»" },
  { value: "Compass", label: "Компас / направления" },
  { value: "BookOpen", label: "Книга" },
  { value: "GraduationCap", label: "Выпускная шапка" },
  { value: "Palette", label: "Палитра / творчество" },
  { value: "Languages", label: "Языки" },
  { value: "Users", label: "Люди / группа" },
  { value: "Star", label: "Звезда / отзывы" },
  { value: "HeartHandshake", label: "Забота" },
  { value: "MessageSquare", label: "Сообщение" },
  { value: "HelpCircle", label: "Вопрос" },
];
const BANNER_ACCENTS = [
  { value: "warm", label: "Тёплый" },
  { value: "teal", label: "Бирюзовый" },
  { value: "violet", label: "Сиреневый" },
];

/**
 * Заявки: канал поступления. Переписка остаётся в MAX, в журнал попадает только
 * суть заявки — поэтому у записи должен быть честный источник.
 * Метки в комментарии — аварийный вариант: их пишет API, если колонки source в
 * базе ещё нет (миграция не применена). Иначе интерфейс соврал бы про канал.
 */
const EN_SOURCES = [
  { value: "max", label: "MAX" },
  { value: "site", label: "С сайта" },
  { value: "phone", label: "Звонок" },
  { value: "vk", label: "ВК" },
];
const EN_SOURCE_LABEL: Record<string, string> = { max: "MAX", site: "С сайта", phone: "Звонок", vk: "ВК" };
const EN_SOURCE_TAG: Record<string, string> = { max: "[MAX]", phone: "[ЗВОНОК]", vk: "[ВК]", site: "" };
const sourceOfEnrollment = (row: { source?: string; comment?: string | null }): string => {
  const direct = String(row?.source ?? "");
  if (EN_SOURCE_LABEL[direct]) return direct;
  const c = String(row?.comment ?? "").trim();
  for (const [key, tag] of Object.entries(EN_SOURCE_TAG)) {
    if (tag && c.toUpperCase().startsWith(tag)) return key;
  }
  return "site";
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

/**
 * Черновик новости в редакторе. published_at хранится в локальном формате
 * input[type=datetime-local] («2026-09-15T14:30»), чтобы поле показывало то же
 * время, что видит человек, а не сдвигалось на часовой пояс сервера.
 */
type NewsDraft = {
  id: number | string | null;
  vk_post_id: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  source_url: string;
  published_at: string;
  visible: boolean;
  /** строка импортирована из VK — текст перезапишет синхронизация */
  fromVk: boolean;
  /** попросить синхронизацию VK эту запись не трогать */
  pinned: boolean;
};

const pad2 = (n: number) => String(n).padStart(2, "0");

function toLocalInput(iso?: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function fromLocalInput(local: string): string {
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

const inputCls = "w-full h-10 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/60";
/**
 * Узкое поле под время («8:30»). ВАЖНО: не строить таким полем через
 * inputCls + " w-20" — inputCls уже содержит w-full, а обе утилиты задают
 * одно и то же свойство width, так что побеждает та, что оказалась позже в
 * сгенерированном CSS. Из-за этого поля времени раздувались до ширины ряда,
 * а поле предмета сжималось до ~26px. Здесь w-full просто нет.
 */
const timeCls = "w-14 shrink-0 min-w-0 h-9 px-1 text-center text-sm tabular-nums rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/60";
const btnCls = "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 w-full sm:w-auto";

/**
 * Имя файла снимка для списка галереи. Загрузка добавляет к имени префикс из
 * миллисекунд (иначе два файла с одним названием столкнулись бы в хранилище),
 * на глаз он только мешает — режем его в подписи, полное имя держим в title.
 */
const photoFileName = (src?: string | null) => String(src || "").split("?")[0].split("#")[0].split("/").pop() || "";
const photoDisplayName = (src?: string | null) => photoFileName(src).replace(/^\d{10,}-/, "") || "(без имени)";

/**
 * Мутация с честным разбором ответа. Раньше админка стреляла fetch'ом «в ответ»
 * (`await fetch(...)` без проверки статуса) и тут же правилa список: если
 * сессия истекла или сервер ответил 500, карточка исчезала, всплывало
 * «Удалено», а в базе фото оставалось — счётчик на сайте не менялся, и после
 * перезагрузки снимок возвращался. Бросаем Error с внятным текстом, чтобы
 * вызывающий код сначала убедился, что всё хорошо.
 */
async function mutate(url: string, init: RequestInit): Promise<any> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new Error("нет связи с сервером");
  }
  const body = await res.json().catch(() => ({} as any));
  if (res.status === 401) throw new Error("сессия истекла — войдите заново");
  if (!res.ok) throw new Error(String(body?.error || `ошибка ${res.status}`));
  return body;
}
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
  const [catFilter, setCatFilter] = useState<TabCategory>("all");
  const [tabSearch, setTabSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgBad, setMsgBad] = useState(false);
  const msgTimer = useRef<number>(0);
  const [uploadQueue, setUploadQueue] = useState<{ name: string; status: "pending" | "compressing" | "uploading" | "done" | "error"; message?: string; saved?: number; stored?: string }[]>([]);
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
  const [schedule, setSchedule] = useState<any[]>([]);
  const [homeOrder, setHomeOrder] = useState<string[]>([]);
  const [heroBanners, setHeroBanners] = useState<any[]>([]);
  const [parentPains, setParentPains] = useState<any[]>([]);
  const [resultsAfterLearning, setResultsAfterLearning] = useState<string[]>([]);
  const [trustStats, setTrustStats] = useState<any[]>([]);
  const [programOutcomes, setProgramOutcomes] = useState<Record<string, string[]>>({});
  const [studioMotto, setStudioMotto] = useState("");
  const [news, setNews] = useState<any[]>([]);
  /** ключи vk_post_id, закреплённые студией (синхронизация VK их не перезапишет) */
  const [newsPinned, setNewsPinned] = useState<string[]>([]);
  const [vkReviews, setVkReviews] = useState<any[]>([]);
  const [syncingReviews, setSyncingReviews] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [vkDomain, setVkDomain] = useState("");
  const [pickerFor, setPickerFor] = useState<null | {
    kind: "program" | "hero" | "heroList" | "step" | "teacher" | "schedule" | "news" | "newsBody";
    index: number;
  }>(null);
  const [pickerFiles, setPickerFiles] = useState<{ src: string; size: number }[]>([]);
  const [pickerFilter, setPickerFilter] = useState("");

  /**
   * Тост в шапке. Разбор по тексту, а не по аргументу: вызовов ~35, и раньше
   * «Ошибка» и «Сохранено ✓» красились одним зелёным — провал читался как
   * успех. Плюс предыдущий таймер больше не гасит новый тост досрочно, а
   * сообщения об ошибке живут дольше, чтобы их успели прочитать.
   */
  const BAD_MSG = /^(Не |Нет связи|Нет подходящих|Ошибка|VK: не|> лимита)|> лимита|ошиб|сессия истекла|поврежд|не удалось/i;
  const flash = (t: string) => {
    const bad = BAD_MSG.test(t);
    setMsg(t);
    setMsgBad(bad);
    clearTimeout(msgTimer.current);
    msgTimer.current = window.setTimeout(() => setMsg(""), bad ? 6000 : 2500);
  };

  const loadAll = useCallback(async () => {
    const [s, p, e, r, n, lock] = await Promise.all([
      fetch("/api/admin/settings").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/programs").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/enrollments").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/reviews").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/news").then((r) => (r.ok ? r.json() : null)),
      // какие VK-новости закреплены — их синхронизация VK не перезапишет
      fetch("/api/admin/news/lock").then((r) => (r.ok ? r.json() : null)).catch(() => null),
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
    setNewsPinned(Array.isArray(lock?.keys) ? lock.keys.map(String) : []);
    setLearning(s.learningExperience ?? { title: "", description: "", steps: [] });
    setTeachers(s.teachers ?? []);
    setFaqs(s.faqs ?? []);
    setSchedule(s.schedule ?? []);
    setHomeOrder(Array.isArray(s.sectionsOrder) && s.sectionsOrder.length ? s.sectionsOrder : Object.keys(SECTION_LABELS));
    setHeroBanners(s.heroBanners ?? []);
    setParentPains(s.parentPains ?? []);
    setResultsAfterLearning(s.resultsAfterLearning ?? []);
    setTrustStats(s.trustStats ?? []);
    setProgramOutcomes(s.programOutcomes ?? {});
    setStudioMotto(s.studioMotto ?? "");
    const g = await fetch("/api/admin/photos").then((r) => (r.ok ? r.json() : null)).catch(() => null);
    setPhotos(Array.isArray(g?.photos) ? g.photos : []);
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
    try {
      await mutate("/api/admin/settings", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: siteConfig, hero, visibility, learningExperience: learning, teachers, faqs, schedule, heroBanners, sectionsOrder: homeOrder, parentPains, resultsAfterLearning, trustStats, programOutcomes, studioMotto }),
      });
      flash("Сохранено ✓");
    } catch (e) {
      flash(`Настройки не сохранены: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const savePrograms = async () => {
    setSaving(true);
    try {
      await mutate("/api/admin/programs", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: programs.map((p, i) => ({ id: p.id, title: p.title, ageRange: p.age_range, description: p.description, image: p.image, imageAlt: p.image_alt, category: p.category ?? "educational", pos: p.pos ?? "", visible: p.visible !== false, sortOrder: i + 1 })) }),
      });
      flash(`Сохранено ✓ ${programs.length} направл.`);
    } catch (e) {
      flash(`Направления не сохранены: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const savePhotoOrder = async (items: any[]) => {
    setSaving(true);
    try {
      await mutate("/api/admin/photos", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((p, i) => ({ id: p.id, alt: p.alt ?? "", span: p.span ?? "normal", pos: p.pos || null, sort_order: i + 1 })) }),
      });
      // Заодно честно проговариваем количество — тот же аргумент, что у жалобы
      // «удалил, а число не поменялось».
      flash(`Сохранено ✓ ${items.length} шт. · страница обновится при ближайшей загрузке`);
    } catch (e) {
      flash(`Не сохранено: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const updateQueueItem = (idx: number, patch: Partial<{ status: "pending" | "compressing" | "uploading" | "done" | "error"; message?: string; saved?: number; stored?: string }>) => {
    setUploadQueue((prev) => prev.map((x, j) => (j === idx ? { ...x, ...patch } : x)));
  };

  /** Загрузить файл через signed URL (обходит лимит тела функции Vercel),
   *  предварительно сжав изображения на клиенте. */
  const uploadSingle = async (rawFile: File, idx: number): Promise<true | string> => {
    const isVideo = rawFile.type.startsWith("video/");
    const maxBytes = isVideo ? VIDEO_MAX : IMAGE_MAX;
    if (rawFile.size > maxBytes) {
      const msg = `${humanSize(rawFile.size)} > лимита ${humanSize(maxBytes)}`;
      updateQueueItem(idx, { status: "error", message: msg });
      return msg;
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
      const msg = sign.error ?? (signRes.status === 401 ? "сессия истекла — войдите заново" : "не удалось получить ссылку");
      updateQueueItem(idx, { status: "error", message: msg });
      return msg;
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
      const msg = txt || `upload HTTP ${putRes.status}`;
      updateQueueItem(idx, { status: "error", message: msg });
      return msg;
    }

    // 3. зарегистрировать строку в gallery_photos
    const regRes = await fetch("/api/admin/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ src: sign.publicUrl, alt: "", span: "normal" }),
    });
    const reg = await regRes.json().catch(() => ({}));
    if (!regRes.ok) {
      const msg = reg.error ?? "файл в хранилище есть, но добавить его в галерею не удалось";
      updateQueueItem(idx, { status: "error", message: msg });
      return msg;
    }
    if (!reg.photo?.src) {
      // Строка создана, но ответа нет: показываем то, что реально вернулось,
      // иначе список «ожмётся» до несуществующего файла.
      const msg = "сервер не вернул данные снимка";
      updateQueueItem(idx, { status: "error", message: msg });
      return msg;
    }
    setPhotos((prev) => [...prev, reg.photo]);
    updateQueueItem(idx, { status: "done", stored: photoFileName(reg.photo.src) });
    return true;
  };

  /** Массовая загрузка: обрабатываем файлы последовательно, чтобы
   *  не завалить браузер и Supabase, и показывать прогресс. */
  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/") || /\.(jpe?g|png|webp|gif|mp4|webm|mov|m4v)$/i.test(f.name));
    if (list.length === 0) { flash("Нет подходящих файлов (только jpg/png/webp/gif/mp4/webm/mov)"); return; }
    setUploadQueue(list.map((f) => ({ name: f.name, status: "pending" as const })));
    // Считаем по фактическому результату каждого файла. Прежняя версия брала
    // «ошибки» из state-массива uploadQueue, который внутри цикла не успевал
    // обновиться (закрытие читало список до загрузки), и итог всегда выглядел
    // как полный успех: «Загружено 8 файлов ✓» при нуле загруженных.
    const errors: string[] = [];
    for (let i = 0; i < list.length; i++) {
      // Сетевую ошибку fetch выбрасывает наружу (заблокированный DNS, обрыв,
      // 5xx на входе в функцию) — без этой обёртки файл навсегда остаётся
      // «загружается…», а итог рисуется как полный успех.
      let r: true | string;
      try {
        r = await uploadSingle(list[i], i);
      } catch (e) {
        r = e instanceof Error ? e.message : "обрыв сети";
        updateQueueItem(i, { status: "error", message: r });
      }
      if (r !== true) errors.push(`${list[i].name}: ${r}`);
    }
    const done = list.length - errors.length;
    flash(
      errors.length === 0
        ? `Загружено ${done} файл${done === 1 ? "" : done < 5 ? "а" : "ов"} ✓`
        : `Загружено ${done} из ${list.length}, ошибок: ${errors.length} · ${errors[0]}${errors.length > 1 ? " (и ещё " + (errors.length - 1) + ")" : ""}`,
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

  const setEnrollmentStatus = async (id: number, status: string) => {
    const prev = enrollments;
    setEnrollments((p) => p.map((x) => x.id === id ? { ...x, status } : x));
    try {
      await mutate("/api/admin/enrollments", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    } catch (e) {
      setEnrollments(prev);
      flash(`Статус не сохранён: ${(e as Error).message}`);
    }
  };

  const deleteEnrollment = async (id: number) => {
    if (!confirm("Удалить?")) return;
    try {
      await mutate(`/api/admin/enrollments?id=${id}`, { method: "DELETE" });
    } catch (e) {
      flash(`Не удалилось: ${(e as Error).message}`);
      return;
    }
    setEnrollments((prev) => prev.filter((x) => x.id !== id));
  };

  // Ручной завод заявки: человек написал в MAX или позвонил — запись появляется
  // в том же журнале, что и заявки с формы. Интеграции нет намеренно: переписка
  // остаётся в мессенджере, на сайте живёт только факт обращения.
  const [showAddEn, setShowAddEn] = useState(false);
  const [savingEn, setSavingEn] = useState(false);
  const emptyEn = { parent_name: "", phone: "", child_age: "", interest: "", comment: "", source: "max", status: "new" };
  const [newEn, setNewEn] = useState(emptyEn);

  const addEnrollment = async () => {
    if (!newEn.parent_name.trim() && !newEn.phone.trim()) {
      flash("Не заведено: укажите имя или контакт");
      return;
    }
    setSavingEn(true);
    let res: { enrollment?: Record<string, unknown>; degraded?: boolean; hint?: string };
    try {
      res = await mutate("/api/admin/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEn),
      }) as typeof res;
    } catch (e) {
      flash(`Не заведено: ${(e as Error).message}`);
      setSavingEn(false);
      return;
    }
    setSavingEn(false);
    if (res?.enrollment) setEnrollments((prev) => [res.enrollment as never, ...prev]);
    setNewEn(emptyEn);
    setShowAddEn(false);
    flash(
      // Заявка всё-таки заведена, поэтому сообщение начинается с результата, а не
      // с «не»: красный тост здесь означал бы «не вышло», хотя вышел только канал.
      res?.degraded
        ? `Заявка заведена · ${res.hint ?? "канал лёг меткой в комментарий"}`
        : `Заявка заведена · всего ${enrollments.length + 1}`,
    );
  };

  const deletePhoto = async (id: number) => {
    if (!confirm("Удалить фото?")) return;
    try {
      await mutate(`/api/admin/photos?id=${id}`, { method: "DELETE" });
    } catch (e) {
      flash(`Не удалилось: ${(e as Error).message}`);
      // Раз список разошёлся с базой — перечитываем его, чтобы админка не
      // показывала «уже удалено» там, где ничего не удалилось.
      const g = await fetch("/api/admin/photos").then((r) => (r.ok ? r.json() : null)).catch(() => null);
      if (Array.isArray(g?.photos)) setPhotos(g.photos);
      return;
    }
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    flash(`Удалено · в галерее осталось ${photos.length - 1}`);
  };

  const saveReviews = async () => {
    setSaving(true);
    try {
      await mutate("/api/admin/reviews", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: reviews.map((r, i) => ({ author: r.author, source: r.source, sourceUrl: r.source_url ?? r.sourceUrl, text: r.text, childInfo: r.child_info ?? r.childInfo, visible: r.visible !== false, sortOrder: i + 1 })) }),
      });
      flash(`Отзывы сохранены ✓ ${reviews.length}`);
    } catch (e) {
      flash(`Отзывы не сохранены: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const move = (arr: any[], i: number, dir: -1 | 1, setter: (v: any[]) => void) => {
    const j = i + dir; if (j < 0 || j >= arr.length) return;
    const copy = [...arr]; [copy[i], copy[j]] = [copy[j], copy[i]]; setter(copy);
  };

  // ─── Расписание: вложенные хелперы (группы → дни → уроки) ───
  const moveIn = <T,>(arr: T[], i: number, dir: -1 | 1): T[] => {
    const j = i + dir; if (j < 0 || j >= arr.length) return arr;
    const copy = [...arr]; [copy[i], copy[j]] = [copy[j], copy[i]]; return copy;
  };
  const patchGroup = (gi: number, patch: Record<string, unknown>) =>
    setSchedule((prev) => prev.map((g, j) => (j === gi ? { ...g, ...patch } : g)));
  const addGroup = () =>
    setSchedule((prev) => [...prev, { id: `grp-${Date.now()}`, title: "Новая группа", note: "", days: [] }]);
  const removeGroup = (gi: number) => setSchedule((prev) => prev.filter((_, j) => j !== gi));
  const duplicateGroup = (gi: number) =>
    setSchedule((prev) => {
      const g = prev[gi];
      const copy = {
        ...g,
        id: `grp-${Date.now()}`,
        title: `${g.title || "Группа"} (копия)`,
        days: (g.days ?? []).map((d: any) => ({ ...d, lessons: [...(d.lessons ?? [])] })),
      };
      const out = [...prev]; out.splice(gi + 1, 0, copy); return out;
    });
  // дни
  const setDays = (gi: number, days: any[]) => patchGroup(gi, { days });
  const addDay = (gi: number) =>
    patchGroup(gi, { days: [...(schedule[gi].days ?? []), { day: "День недели", lessons: [{ time: "", subject: "" }] }] });
  const patchDay = (gi: number, di: number, patch: Record<string, unknown>) =>
    patchGroup(gi, { days: (schedule[gi].days ?? []).map((d: any, k: number) => (k === di ? { ...d, ...patch } : d)) });
  const removeDay = (gi: number, di: number) =>
    setDays(gi, ((schedule[gi].days ?? []) as any[]).filter((_: any, k: number) => k !== di));
  const moveDay = (gi: number, di: number, dir: -1 | 1) => setDays(gi, moveIn(schedule[gi].days ?? [], di, dir));
  // уроки
  const patchLesson = (gi: number, di: number, li: number, patch: Record<string, unknown>) =>
    patchDay(gi, di, { lessons: (schedule[gi].days[di].lessons ?? []).map((l: any, k: number) => (k === li ? { ...l, ...patch } : l)) });
  const addLesson = (gi: number, di: number) =>
    patchDay(gi, di, { lessons: [...(schedule[gi].days[di].lessons ?? []), { time: "", subject: "" }] });
  const removeLesson = (gi: number, di: number, li: number) =>
    patchDay(gi, di, { lessons: ((schedule[gi].days[di].lessons ?? []) as any[]).filter((_: any, k: number) => k !== li) });
  const moveLesson = (gi: number, di: number, li: number, dir: -1 | 1) =>
    patchDay(gi, di, { lessons: moveIn(schedule[gi].days[di].lessons ?? [], li, dir) });

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
        const parts = [`новых ${j.imported ?? 0}`, `обновлено ${j.updated ?? 0}`];
        if (j.skipped) parts.push(`закреплённых пропущено ${j.skipped}`);
        if (j.mirrored) parts.push(`новых фото к себе: ${j.mirrored}`);
        if (j.reused) parts.push(`фото уже у нас: ${j.reused}`);
        flash(`VK: постов ${j.total ?? 0} — ${parts.join(", ")}`);
        const n = await fetch("/api/admin/news").then((r) => r.json()).catch(() => ({}));
        setNews(n?.news ?? []);
      } else flash(j.error ?? "Ошибка синхронизации");
    } catch {
      flash("Ошибка сети");
    }
    setSyncing(false);
  };

  const toggleNewsVisible = async (id: string, visible: boolean) => {
    // id в базе — число, а в обработчик строки мы передаём String(n.id):
    // без String() сравнение не совпадало и галочка в списке не переворачивалась.
    const prev = news;
    setNews((p) => p.map((n) => String(n.id) === String(id) ? { ...n, visible } : n));
    try {
      await mutate("/api/admin/news", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, visible }),
      });
    } catch (e) {
      setNews(prev);
      flash(`Не сохранилось: ${(e as Error).message}`);
    }
  };

  const deleteNewsItem = async (id: string) => {
    if (!confirm("Удалить новость?")) return;
    try {
      await mutate(`/api/admin/news?id=${id}`, { method: "DELETE" });
    } catch (e) {
      flash(`Не удалилось: ${(e as Error).message}`);
      return;
    }
    setNews((prev) => prev.filter((n) => String(n.id) !== String(id)));
    flash("Новость удалена");
  };

  /* ───────────────────── РЕДАКТОР НОВОСТЕЙ ───────────────────── */

  const [newsDraft, setNewsDraft] = useState<NewsDraft | null>(null);
  const [newsDirty, setNewsDirty] = useState(false);
  const [newsBusy, setNewsBusy] = useState(false);
  const [newsError, setNewsError] = useState("");
  /** на узких экранах формы и предпросмотр по очереди */
  const [newsPane, setNewsPane] = useState<"edit" | "preview">("edit");
  const newsBodyRef = useRef<HTMLTextAreaElement>(null);
  const newsCaret = useRef<{ s: number; e: number }>({ s: 0, e: 0 });
  const newsFileRef = useRef<HTMLInputElement>(null);
  const newsBodyFileRef = useRef<HTMLInputElement>(null);

  const patchNews = (p: Partial<NewsDraft>) => {
    setNewsDraft((d) => (d ? { ...d, ...p } : d));
    setNewsDirty(true);
    setNewsError("");
  };

  /** Заголовок сам подсказывает адрес, пока адрес не трогали вручную. */
  const openNewsNew = () => {
    setNewsDraft({
      id: null, vk_post_id: "", title: "", excerpt: "", content: "",
      image_url: "", source_url: "", published_at: toLocalInput(null), visible: true, fromVk: false, pinned: false,
    });
    setNewsDirty(false); setNewsError(""); setNewsPane("edit");
  };

  const openNewsEdit = (n: any) => {
    setNewsDraft({
      id: n.id ?? null,
      vk_post_id: String(n.vk_post_id ?? ""),
      title: String(n.title ?? ""),
      excerpt: String(n.excerpt ?? ""),
      content: String(n.content ?? ""),
      image_url: String(n.image_url ?? ""),
      source_url: String(n.source_url ?? ""),
      published_at: toLocalInput(n.published_at),
      visible: n.visible !== false,
      fromVk: isVkNews(n),
      pinned: newsPinned.includes(String(n.vk_post_id ?? "")),
    });
    setNewsDirty(false); setNewsError(""); setNewsPane("edit");
  };

  const closeNewsEditor = () => {
    if (newsDirty && !confirm("Есть несохранённые изменения. Всё равно закрыть?")) return;
    setNewsDraft(null); setNewsDirty(false); setNewsError("");
  };

  const saveNews = async () => {
    if (!newsDraft) return;
    const title = newsDraft.title.trim();
    if (!title) { setNewsError("Напишите заголовок — по нему генерируется адрес."); newsBodyRef.current?.focus(); return; }

    setNewsBusy(true);
    setNewsError("");
    try {
      const taken = news
        .filter((n: any) => String(n.id) !== String(newsDraft.id))
        .map((n: any) => String(n.vk_post_id ?? ""))
        .filter(Boolean);
      let key = newsDraft.vk_post_id.trim().toLowerCase();
      if (!key) key = uniqueSlug(slugifyRu(title), taken);
      else if (taken.includes(key)) {
        // не молча «другое имя», а явно: человек мог задать адрес намеренно
        if (!confirm(`Адрес «${key}» уже занят. Предложить «${uniqueSlug(key, taken)}»?`)) {
          setNewsBusy(false); return;
        }
        key = uniqueSlug(key, taken);
      }

      const res = await fetch("/api/admin/news", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newsDraft.id,
          vk_post_id: key,
          title,
          content: newsDraft.content,
          excerpt: newsDraft.excerpt.trim() || newsDraft.content.replace(/[#*>`![\]]/g, "").replace(/\s+/g, " ").trim().slice(0, 180),
          image_url: newsDraft.image_url.trim(),
          source_url: newsDraft.source_url.trim(),
          published_at: fromLocalInput(newsDraft.published_at),
          visible: newsDraft.visible,
          pinned: newsDraft.pinned,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { setNewsError(j?.error ?? "Не удалось сохранить"); return; }

      // id из ответа — иначе повторное «Сохранить» создало бы дубль
      setNewsDraft((d) => (d ? { ...d, id: j.news?.id ?? d.id, vk_post_id: j.news?.vk_post_id ?? key } : d));
      setNews((prev) => {
        const rest = prev.filter((n: any) => String(n.id) !== String(j.news?.id));
        return [j.news, ...rest].sort((a: any, b: any) => String(b.published_at).localeCompare(String(a.published_at)));
      });
      if (Array.isArray(j.pinnedKeys)) setNewsPinned(j.pinnedKeys.map(String));
      setNewsDirty(false);
      flash(newsDraft.id ? "Изменения сохранены ✓" : "Новость опубликована ✓");
    } catch {
      setNewsError("Нет связи с сервером — попробуйте ещё раз.");
    } finally {
      setNewsBusy(false);
    }
  };

  /** Обёртка выделения (**текст**) или вставка плейсхолдера вместо пустого. */
  const mdWrap = (before: string, after: string, placeholder: string) => {
    const ta = newsBodyRef.current;
    if (!ta || !newsDraft) return;
    const s = ta.selectionStart, e = ta.selectionEnd, cur = newsDraft.content;
    const sel = cur.slice(s, e) || placeholder;
    const text = cur.slice(0, s) + before + sel + after + cur.slice(e);
    patchNews({ content: text });
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(s + before.length, s + before.length + sel.length); });
  };

  /** Префикс строки: «## », «- », «> ». Повторное нажатие снимает префикс. */
  const mdLinePrefix = (prefix: string) => {
    const ta = newsBodyRef.current;
    if (!ta || !newsDraft) return;
    const s = ta.selectionStart, e = ta.selectionEnd, cur = newsDraft.content;
    const lineStart = cur.lastIndexOf("\n", s - 1) + 1;
    let lineEnd = cur.indexOf("\n", e);
    if (lineEnd === -1) lineEnd = cur.length;
    const line = cur.slice(lineStart, lineEnd);
    const bare = line.replace(/^(#{1,3}\s+|>\s+|[-*]\s+)/, "");
    const had = line !== bare;
    const next = cur.slice(0, lineStart) + (had ? bare : prefix + bare) + cur.slice(lineEnd);
    patchNews({ content: next });
    requestAnimationFrame(() => {
      ta.focus();
      const pos = lineStart + (had ? 0 : prefix.length) + bare.length;
      ta.setSelectionRange(pos, pos);
    });
  };

  const mdLink = () => {
    const ta = newsBodyRef.current;
    if (!ta || !newsDraft) return;
    const s = ta.selectionStart, e = ta.selectionEnd, cur = newsDraft.content;
    const sel = cur.slice(s, e) || "текст ссылки";
    const inserted = `[${sel}](https://)`;
    patchNews({ content: cur.slice(0, s) + inserted + cur.slice(e) });
    // курсор внутрь https:// — править адрес, а не выделять всё
    requestAnimationFrame(() => { ta.focus(); const p = s + sel.length + 3; ta.setSelectionRange(p, p + 8); });
  };

  /** Картинка в тело: своей строкой — рендерер делает из неё figure с подписью. */
  const mdInsertImage = (src: string, alt = "Фото") => {
    setNewsDraft((d) => {
      if (!d) return d;
      const ta = newsBodyRef.current;
      const line = `![${alt}](${src})`;
      if (!ta) return { ...d, content: `${d.content}\n\n${line}\n` };
      const s = newsCaret.current.s, e = newsCaret.current.e, cur = d.content;
      const before = cur.slice(0, s), after = cur.slice(e);
      const lead = before && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
      const tail = after && !after.startsWith("\n") ? "\n\n" : "";
      const merged = before + lead + line + tail + after;
      const pos = (before + lead + line + tail).length;
      requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(pos, pos); });
      return { ...d, content: merged };
    });
    setNewsDirty(true);
    setNewsError("");
  };

  /** Ctrl/Cmd+B, +I, +K прямо в textarea — как в обычном редакторе. */
  const onNewsBodyKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const k = e.key.toLowerCase();
    if (k === "b") { e.preventDefault(); mdWrap("**", "**", "жирный"); }
    else if (k === "i") { e.preventDefault(); mdWrap("*", "*", "курсив"); }
    else if (k === "k") { e.preventDefault(); mdLink(); }
    else if (k === "s") { e.preventDefault(); saveNews(); }
  };

  const rememberCaret = () => {
    const ta = newsBodyRef.current;
    if (ta) newsCaret.current = { s: ta.selectionStart, e: ta.selectionEnd };
  };

  /** Загрузка файла прямо в Storage (через signed URL), строку в галерею НЕ пишем. */
  const uploadNewsImage = async (file: File, where: "cover" | "body") => {
    setNewsBusy(true); setNewsError("");
    try {
      const { file: prepared } = await compressImageFile(file);
      const signRes = await fetch("/api/admin/photos/sign", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: prepared.name, size: prepared.size, contentType: prepared.type }),
      });
      const sign = await signRes.json().catch(() => ({}));
      if (!signRes.ok || sign.error) throw new Error(sign.error ?? "не удалось получить ссылку на загрузку");

      const putRes = await fetch(sign.signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": prepared.type || "image/jpeg",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""}`,
          "x-upsert": "false",
        },
        body: prepared,
      });
      if (!putRes.ok) throw new Error(`загрузка не удалась (HTTP ${putRes.status})`);

      const src = String(sign.publicUrl ?? "");
      if (where === "cover") patchNews({ image_url: src });
      else mdInsertImage(src, "Фото");
      flash(where === "cover" ? "Обложка загружена ✓" : "Фото добавлено в текст ✓");
    } catch (err) {
      setNewsError(err instanceof Error ? err.message : "Ошибка загрузки файла");
    } finally {
      setNewsBusy(false);
      if (newsFileRef.current) newsFileRef.current.value = "";
      if (newsBodyFileRef.current) newsBodyFileRef.current.value = "";
    }
  };

  const newsPreviewItem: any = newsDraft
    ? {
        id: newsDraft.id ?? "draft",
        vk_post_id: newsDraft.vk_post_id || slugifyRu(newsDraft.title || "novost"),
        title: newsDraft.title || "Без заголовка",
        content: newsDraft.content,
        excerpt: newsDraft.excerpt,
        image_url: newsDraft.image_url || null,
        source_url: newsDraft.source_url,
        published_at: fromLocalInput(newsDraft.published_at),
      }
    : null;
  const newsWords = (newsDraft?.content ?? "").trim() ? Math.round((newsDraft?.content ?? "").trim().split(/\s+/).length * 1.1) : 0;


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

  const applyToTarget = (kind: FieldKind, index: number, src: string) => {
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
    } else if (kind === "schedule") {
      setSchedule((prev) => prev.map((x, j) => (j === index ? { ...x, image: src } : x)));
    } else if (kind === "news") {
      setNewsDraft((prev) => (prev ? { ...prev, image_url: src } : prev));
    } else if (kind === "newsBody") {
      mdInsertImage(src, newsDraft?.title ? "Фото к новости" : "Фото");
    }
  };

  const applyPhoto = (src: string) => {
    if (!pickerFor) return;
    applyToTarget(pickerFor.kind, pickerFor.index, src);
    setPickerFor(null);
    flash("Фото выбрано ✓");
  };

  /** Загрузка файла с компьютера прямо в поле. Раньше во всех полях-картинках
   *  был только «Выбрать из загруженных»: картинку расписания приходилось
   *  сначала нести в медиатеку, а потом искать её там. Путь тот же, что у
   *  обложки новости: сжать на клиенте → подписать URL → PUT в Storage.
   *  Для расписания планку ширины поднимаем до 2400px: это таблица, которую
   *  печатают на A4, и при 1920 мелкие строки расплываются. */
  const [imgBusy, setImgBusy] = useState<string | null>(null);
  const uploadImageInto = async (file: File, kind: FieldKind, index: number) => {
    const key = busyKey(kind, index);
    if (file.size > IMAGE_MAX) {
      flash(`${humanSize(file.size)} > лимита ${humanSize(IMAGE_MAX)}`);
      return;
    }
    setImgBusy(key);
    try {
      const { file: prepared } = await compressImageFile(file, kind === "schedule" ? { maxDim: 2400 } : {});
      const signRes = await fetch("/api/admin/photos/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: prepared.name, size: prepared.size, contentType: prepared.type }),
      });
      const sign = await signRes.json().catch(() => ({}));
      if (!signRes.ok || sign.error) throw new Error(sign.error ?? "не удалось получить ссылку на загрузку");

      const putRes = await fetch(sign.signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": prepared.type || "image/jpeg",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""}`,
          "x-upsert": "false",
        },
        body: prepared,
      });
      if (!putRes.ok) throw new Error(`загрузка не удалась (HTTP ${putRes.status})`);

      const src = String(sign.publicUrl ?? "");
      if (!src) throw new Error("сервер не вернул ссылку на файл");
      applyToTarget(kind, index, src);
      flash(prepared === file ? "Картинка загружена ✓" : `Картинка загружена ✓ (сжата на ${humanSize(file.size - prepared.size)})`);
    } catch (err) {
      flash(err instanceof Error ? err.message : "Ошибка загрузки файла");
    } finally {
      setImgBusy(null);
    }
  };

  /**
   * Пара контролов для поля-картинки: выбрать из медиатеки и загрузить с ПК.
   * Раньше во всех таких полях (картинка расписания, фото направления, фото
   * педагога, шаг «как проходит занятие», фото героя) был только выбор из уже
   * загруженного — чтобы положить свежий снимок, его сначала несли в галерею.
   * compact — для тесных рядков (плитка фото в ротации героя).
   */
  const pickBtn = (kind: FieldKind, index: number, label = "Выбрать", opts: { compact?: boolean } = {}) => {
    const busy = imgBusy === busyKey(kind, index);
    const cls = opts.compact
      ? "flex-1 min-w-0 text-[11px] h-7 rounded border border-transparent hover:bg-accent inline-flex items-center justify-center gap-1 truncate"
      : "h-10 px-3 rounded-lg border border-border hover:bg-accent inline-flex items-center gap-1.5 text-sm shrink-0";
    const ico = opts.compact ? "w-3.5 h-3.5" : "w-4 h-4";
    return (
      <>
        <button
          type="button"
          onClick={() => { setPickerFor({ kind, index }); if (pickerFiles.length === 0) fetch("/api/admin/files").then(r => r.ok ? r.json() : null).then(j => setPickerFiles(j?.files ?? [])); }}
          className={cls}
          title="Выбрать из загруженных фото"
        >
          <ImageIcon className={ico} /> {label}
        </button>
        <label
          className={cn(cls, "cursor-pointer", busy && "opacity-60 pointer-events-none")}
          title="Загрузить файл с компьютера"
        >
          {busy ? <Loader2 className={cn(ico, "animate-spin")} /> : <Upload className={ico} />} Загрузить файл
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={imgBusy !== null}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadImageInto(f, kind, index);
              e.target.value = "";
            }}
          />
        </label>
      </>
    );
  };

  if (authed === null) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-brand-warm-ink" /></div>;

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
  const newEnrollmentsCount = enrollments.filter((e) => (e.status ?? "new") === "new").length;
  const filteredTabs = TABS.filter((t) => {
    const matchCat = catFilter === "all" || t.category === catFilter;
    if (!tabSearch.trim()) return matchCat;
    const q = tabSearch.toLowerCase().trim();
    const matchSearch = t.label.toLowerCase().includes(q) || t.hint.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
    return (catFilter === "all" || matchCat) && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-[1280px] mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                <LayoutDashboard className="w-4 h-4 text-primary" />
              </div>
              <span className="font-display font-extrabold text-sm sm:text-base truncate">Сфера · Админ</span>
            </div>
            {newEnrollmentsCount > 0 && (
              <button
                onClick={() => { setTab("inbox"); }}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all shrink-0",
                  tab === "inbox"
                    ? "bg-primary text-primary-foreground"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
                )}
                title="Перейти к новым заявкам"
              >
                <Inbox className="w-3.5 h-3.5" />
                <span className="hidden min-[400px]:inline">Заявки:</span>
                <span className="font-extrabold">{newEnrollmentsCount}</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {msg && (
              <span
                data-admin-msg={msgBad ? "bad" : "ok"}
                className={"text-xs sm:text-sm font-medium max-w-[32ch] truncate " + (msgBad ? "text-destructive" : "text-emerald-500 dark:text-emerald-400")}
              >
                {msg}
              </span>
            )}
            <a href="/" target="_blank" rel="noopener" title="Открыть сайт"
              className="inline-flex items-center gap-1 h-8 px-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors hidden sm:inline-flex">
              Сайт <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <ThemeToggle />
            <button onClick={logout}
              className="inline-flex items-center gap-1.5 h-8 px-2 rounded-lg text-xs sm:text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </header>

      {/* Двухколонный layout: сайдбар + контент */}
      <div className="max-w-[1280px] mx-auto flex gap-0">

        {/* ── Сайдбар: фиксированная навигация (только md+) ── */}
        <aside className="hidden md:flex flex-col w-52 lg:w-60 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-border/60 bg-card/40 py-4 px-2">
          {/* Поиск */}
          <div className="relative mb-3 px-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={tabSearch}
              onChange={(e) => setTabSearch(e.target.value)}
              placeholder="Поиск…"
              className="w-full h-8 pl-8 pr-6 text-xs rounded-lg bg-background border border-border/60 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {tabSearch && (
              <button onClick={() => setTabSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              ><X className="w-3 h-3" /></button>
            )}
          </div>

          {/* Группы и вкладки */}
          <nav className="flex flex-col gap-0.5">
            {tabSearch.trim() ? (
              // Режим поиска: плоский список
              filteredTabs.length > 0 ? filteredTabs.map((t) => {
                const active = tab === t.id;
                const isInbox = t.id === "inbox";
                return (
                  <button key={t.id} onClick={() => setTab(t.id)} title={t.hint}
                    className={cn(
                      "flex items-center gap-2.5 w-full h-9 px-3 rounded-lg text-sm transition-all text-left",
                      active
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <t.icon className="w-4 h-4 shrink-0" />
                    <span className="truncate flex-1">{t.label}</span>
                    {isInbox && newEnrollmentsCount > 0 && (
                      <span className={cn("shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none",
                        active ? "bg-white text-primary" : "bg-amber-500 text-white")}>
                        {newEnrollmentsCount}
                      </span>
                    )}
                  </button>
                );
              }) : (
                <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                  Ничего не найдено<br />
                  <button onClick={() => setTabSearch("")} className="mt-1 text-primary underline">Сбросить</button>
                </div>
              )
            ) : (
              // Обычный режим: категории-группы
              CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
                const catTabs = TABS.filter((t) => t.category === cat.id);
                const hasBadge = cat.id === "leads" && newEnrollmentsCount > 0;
                return (
                  <div key={cat.id} className="mb-1">
                    <div className="flex items-center gap-1.5 px-3 py-1.5">
                      <cat.icon className="w-3.5 h-3.5 text-muted-foreground/70" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">{cat.label}</span>
                      {hasBadge && (
                        <span className="ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-white">{newEnrollmentsCount}</span>
                      )}
                    </div>
                    {catTabs.map((t) => {
                      const active = tab === t.id;
                      const isInbox = t.id === "inbox";
                      return (
                        <button key={t.id} onClick={() => setTab(t.id)} title={t.hint}
                          className={cn(
                            "flex items-center gap-2.5 w-full h-9 px-3 rounded-lg text-sm transition-all text-left mb-0.5",
                            active
                              ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                              : "text-foreground/70 hover:text-foreground hover:bg-accent"
                          )}
                        >
                          <t.icon className="w-4 h-4 shrink-0" />
                          <span className="truncate flex-1">{t.label}</span>
                          {isInbox && newEnrollmentsCount > 0 && (
                            <span className={cn("shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none",
                              active ? "bg-white text-primary" : "bg-amber-500 text-white animate-pulse")}>
                              {newEnrollmentsCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </nav>
        </aside>

        {/* ── Контент ── */}
        <main className="flex-1 min-w-0 px-3 sm:px-4 md:px-5 py-4 sm:py-5">

        {/* Мобильная навигация (только < md) */}
        <div className="md:hidden mb-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {CATEGORIES.map((cat) => {
                const active = catFilter === cat.id;
                const hasBadge = cat.id === "leads" && newEnrollmentsCount > 0;
                return (
                  <button key={cat.id} onClick={() => {
                    setCatFilter(cat.id);
                    if (cat.id !== "all") {
                      const inCat = TABS.filter((t) => t.category === cat.id);
                      if (!inCat.some((t) => t.id === tab) && inCat[0]) setTab(inCat[0].id);
                    }
                  }}
                    className={cn(
                      "inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0",
                      active ? "bg-foreground text-background" : "bg-muted/60 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <cat.icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                    {hasBadge && <span className="ml-0.5 px-1.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">{newEnrollmentsCount}</span>}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {filteredTabs.map((t) => {
                const active = tab === t.id;
                const isInbox = t.id === "inbox";
                return (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all",
                      active ? "bg-primary text-primary-foreground" : "bg-card border border-border/60 text-foreground/70"
                    )}
                  >
                    <t.icon className="w-3.5 h-3.5 shrink-0" />
                    {t.label}
                    {isInbox && newEnrollmentsCount > 0 && (
                      <span className={cn("px-1.5 rounded-full text-[10px] font-bold",
                        active ? "bg-white text-primary" : "bg-amber-500 text-white")}>
                        {newEnrollmentsCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Подсказка: что редактирует текущий раздел */}
        {(() => {
          const cur = TABS.find((t) => t.id === tab);
          if (!cur) return null;
          return (
            <div className="flex items-start gap-3 mb-4 rounded-xl border border-border/60 bg-accent/30 px-4 py-3">
              <span className="mt-0.5 inline-flex w-8 h-8 rounded-lg bg-primary/10 text-primary items-center justify-center shrink-0">
                <cur.icon className="w-4 h-4" />
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed pt-1">
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
                        {pickBtn("heroList", i, "Заменить", { compact: true })}
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

        {/* ─── Visibility & Order ─── */}
        {tab === "visibility" && (
          <div className="bg-card rounded-2xl border border-border/60 p-5 space-y-2 max-w-2xl">
            <p className="text-sm text-muted-foreground mb-3">
              Порядок блоков главной страницы. Стрелками переставляйте сверху вниз, галочкой —
              показывать или скрывать (контент не удаляется). Первый экран и подвал закреплены.
            </p>
            {homeOrder.map((id, i) => {
              const hideable = id in VIS_LABELS;
              const on = hideable ? visibility[id] !== false : true;
              return (
                <div key={id} className="flex items-center gap-2 py-1.5 border-b border-border/40 last:border-0">
                  <span className="w-5 text-center text-xs text-muted-foreground tabular-nums">{i + 1}</span>
                  <div className="flex flex-col">
                    <button onClick={() => move(homeOrder, i, -1, setHomeOrder)} disabled={i === 0} className="p-0.5 rounded hover:bg-accent disabled:opacity-25" title="Выше"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={() => move(homeOrder, i, 1, setHomeOrder)} disabled={i === homeOrder.length - 1} className="p-0.5 rounded hover:bg-accent disabled:opacity-25" title="Ниже"><ArrowDown className="w-3.5 h-3.5" /></button>
                  </div>
                  <span className={"flex-1 text-sm " + (on ? "text-foreground" : "text-muted-foreground line-through")}>
                    {SECTION_LABELS[id] ?? id}
                  </span>
                  {hideable ? (
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                      <input type="checkbox" checked={on} onChange={(e) => setVisibility((p) => ({ ...p, [id]: e.target.checked }))} className="w-4 h-4" />
                      <span className="w-14">виден</span>
                    </label>
                  ) : (
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60 w-14 text-right">всегда</span>
                  )}
                </div>
              );
            })}
            <div className="pt-3 mt-1 border-t border-border/50">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Отдельные страницы
              </p>
              <label className="flex items-center justify-between gap-3 text-sm py-1">
                <span>
                  Расписание <span className="text-xs text-muted-foreground">/raspisanie — страница и пункт меню</span>
                </span>
                <input type="checkbox" checked={visibility.raspisanie !== false} onChange={(e) => setVisibility((p) => ({ ...p, raspisanie: e.target.checked }))} className="w-4 h-4" />
              </label>
              <p className="text-[11px] text-muted-foreground mt-1">
                Если выключить — страница станет недоступна (404), а пункт «Расписание» исчезнет из меню и из подвала.
              </p>
              <p className="text-[11px] text-muted-foreground mt-2">
                Галерея тоже вынесена на отдельную страницу{" "}
                <code className="text-[11px] px-1 bg-accent rounded">/gallery</code>, но её
                включ/выключ — в списке блоков выше (галочка «Галерея»): он скрывает и блок на
                главной, и страницу (404), и пункт меню с ссылкой в подвале.
              </p>
            </div>
            <button onClick={saveSettings} disabled={saving} className={btnCls + " mt-3"}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Сохранить порядок</button>
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
            {/* Число должно быть видно: без него непонятно, применилось ли
                удаление. Это тот же массив, что отдаёт сайту lib/content.ts
                (одна и та же сортировка sort_order ASC, id ASC), поэтому
                количество здесь и на сайте совпадает. */}
            <p className="text-sm text-muted-foreground" data-gallery-total>
              В галерее сейчас{" "}
              <span className="font-semibold tabular-nums text-foreground">{photos.length}</span>{" "}
              — столько же считает сайт: на главной это лента, на <code className="rounded bg-accent px-1">/gallery</code> — сетка вниз, порядок одинаковый.
            </p>
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
                      : q.status === "done" ? [
                          q.saved ? `готово (сэкономлено ${humanSize(q.saved)})` : "готово",
                          // Каким именем файл лег в хранилище: к имени добавлены
                          // миллисекунды, чтобы одноимённые не терли друг друга.
                          q.stored ? `→ ${q.stored}` : null,
                        ].filter(Boolean).join(" ")
                      : `ошибка: ${q.message ?? ""}`;
                    return (
                      <li key={i} className="flex items-center gap-2">
                        {icon}
                        <span className="flex-1 truncate" title={q.name}>{q.name}</span>
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
                  {/* Миниатюра + имя файла. Раньше под картинкой не было ничего,
                      и свежезагруженный снимок приходилось искать «на глаз»:
                      теперь видно, какой это файл, и его место в порядке показа
                      (он совпадает с сайтом: sort_order идёт тем же порядком). */}
                  <div className="relative w-full sm:w-40 shrink-0 flex flex-col gap-1 min-w-0">
                    <div className="relative">
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
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        data-photo-pos
                        className="shrink-0 rounded bg-muted px-1 text-[10px] font-semibold tabular-nums text-muted-foreground"
                        title={`Позиция ${i + 1} из ${photos.length}. На сайте галерея идёт в том же порядке: на главной это лента (крайнее право — ${photos.length}), на /gallery — сетка вниз.`}
                      >
                        {i + 1}
                      </span>
                      <a
                        data-photo-name
                        href={ph.src}
                        target="_blank"
                        rel="noreferrer"
                        title={`${photoFileName(ph.src)} — открыть файл в новой вкладке`}
                        className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground underline decoration-border underline-offset-2 hover:text-foreground hover:decoration-current"
                      >
                        {photoDisplayName(ph.src)}
                      </a>
                    </div>
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
                    <button onClick={() => importVkReview(post)} className="shrink-0 h-8 px-3 rounded-full bg-brand-warm/10 text-brand-warm-ink text-xs font-semibold hover:bg-brand-warm/20 transition-colors">
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
                  <button onClick={() => setProgramOutcomes((p) => ({ ...p, [title]: [...(p[title] ?? []), ""] }))} className="text-xs text-brand-warm-ink hover:underline mt-1">+ Добавить пункт</button>
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

        {/* ─── Banners ─── */}
        {tab === "banners" && (
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border/60 p-4">
              <p className="text-sm text-muted-foreground">
                Небольшие «облачные» баннеры под кнопками первого экрана. Каждый — карточка-ссылка:
                иконка, заголовок, короткая подпись, ссылка (путь <code className="text-[11px] px-1 bg-accent rounded">/raspisanie</code>,
                якорь <code className="text-[11px] px-1 bg-accent rounded">#enrollment</code> или внешний URL) и цвет.
                Порядок — стрелками. Оставьте пустым, чтобы полностью убрать блок из хиро.
              </p>
            </div>

            {heroBanners.map((b, i) => (
              <div key={b.id ?? i} className="bg-card rounded-2xl border border-border/60 p-4 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Заголовок"><input className={inputCls} value={b.title ?? ""} onChange={(e) => setHeroBanners((prev) => prev.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} placeholder="Расписание" /></Field>
                  <Field label="Подпись (необязательно)"><input className={inputCls} value={b.subtitle ?? ""} onChange={(e) => setHeroBanners((prev) => prev.map((x, j) => j === i ? { ...x, subtitle: e.target.value } : x))} placeholder="дни и часы" /></Field>
                  <Field label="Ссылка"><input className={inputCls} value={b.href ?? ""} onChange={(e) => setHeroBanners((prev) => prev.map((x, j) => j === i ? { ...x, href: e.target.value } : x))} placeholder="/raspisanie или #enrollment" /></Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Иконка">
                      <select className={inputCls} value={b.icon ?? "Sparkles"} onChange={(e) => setHeroBanners((prev) => prev.map((x, j) => j === i ? { ...x, icon: e.target.value } : x))}>
                        {BANNER_ICONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </Field>
                    <Field label="Цвет">
                      <select className={inputCls} value={b.accent ?? "warm"} onChange={(e) => setHeroBanners((prev) => prev.map((x, j) => j === i ? { ...x, accent: e.target.value } : x))}>
                        {BANNER_ACCENTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </Field>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground mr-auto">Баннер {i + 1} из {heroBanners.length}</span>
                  <button type="button" onClick={() => move(heroBanners, i, -1, setHeroBanners)} disabled={i === 0} className="p-2 rounded-lg hover:bg-accent disabled:opacity-25" title="Выше"><ArrowUp className="w-4 h-4" /></button>
                  <button type="button" onClick={() => move(heroBanners, i, 1, setHeroBanners)} disabled={i === heroBanners.length - 1} className="p-2 rounded-lg hover:bg-accent disabled:opacity-25" title="Ниже"><ArrowDown className="w-4 h-4" /></button>
                  <button type="button" onClick={() => setHeroBanners((prev) => prev.filter((_, j) => j !== i))} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive" title="Удалить"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setHeroBanners((prev) => [...prev, { id: `b-${Date.now()}`, icon: "Sparkles", title: "", subtitle: "", href: "#enrollment", accent: "warm" }])} className={btnCls + " bg-card border border-border text-foreground hover:bg-accent"}><Plus className="w-4 h-4" /> Добавить баннер</button>
              <button onClick={saveSettings} disabled={saving} className={btnCls}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Сохранить баннеры</button>
            </div>
          </div>
        )}

        {/* ─── Schedule ─── */}
        {tab === "schedule" && (
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border/60 p-4">
              <p className="text-sm text-muted-foreground">
                Расписание показывается на странице <code className="text-[11px] px-1 bg-accent rounded">/raspisanie</code> (пункт меню «Расписание») и <b>не</b> появляется на главной.
                Группа → дни недели → уроки. У каждого урока — время начала, при желании время окончания («до …») и предмет.
                Время окончания <b>последнего</b> урока дня выводится на странице жирной строкой «Окончание уроков» —
                ориентир для родителей, во сколько забирать ребёнка; в карточке дня есть предпросмотр этой строки.
                Можно загрузить картинку-расписание — она выводится под таблицей группы, её удобно скачать и распечатать.
                Кнопка <b>«Загрузить файл»</b> берёт картинку прямо с компьютера (можно и «Выбрать» из медиатеки), перед
                отправкой сжимает её до 2400px по длинной стороне, PNG с прозрачностью остаётся PNG.
                Печатается картинка так: клик по ней открывает полноразмерный файл в новой вкладке.
              </p>
            </div>

            {schedule.map((g, gi) => (
              <div key={g.id ?? gi} className="bg-card rounded-2xl border border-border/60 p-4 sm:p-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Название группы"><input className={inputCls} value={g.title ?? ""} onChange={(e) => patchGroup(gi, { title: e.target.value })} placeholder="Например: Младшая группа" /></Field>
                  <Field label="Подпись под названием (необязательно)"><input className={inputCls} value={g.note ?? ""} onChange={(e) => patchGroup(gi, { note: e.target.value })} placeholder="Например: 2 класс" /></Field>
                </div>

                <Field label="Картинка для печати (необязательно)">
                  <div className="flex flex-wrap items-center gap-2">
                    {g.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={g.image} alt="" className="h-16 w-auto max-w-[160px] rounded-lg border border-border object-contain bg-background" />
                    ) : (
                      <span className="text-xs text-muted-foreground">не задана</span>
                    )}
                    {pickBtn("schedule", gi, g.image ? "Заменить" : "Выбрать картинку")}
                    {g.image && (
                      <button type="button" onClick={() => patchGroup(gi, { image: undefined })} className="h-10 px-3 rounded-lg border border-border hover:bg-destructive/10 hover:text-destructive text-sm inline-flex items-center gap-1.5">
                        <X className="w-4 h-4" /> Убрать
                      </button>
                    )}
                  </div>
                </Field>

                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Дни недели</div>
                  {/* Два дня в ряд на широком экране — карточка перестала
                      растягиваться на всю ширину, ряды читаются целиком. */}
                  <div className="grid gap-2.5 lg:grid-cols-2 items-start">
                    {(g.days ?? []).map((d: any, di: number) => {
                      const lessons = d.lessons ?? [];
                      const pickup = [...lessons].reverse().find((l: any) => l.end)?.end;
                      return (
                        <div key={di} className="rounded-xl border border-border/60 bg-background/50 p-2.5 space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <input
                              aria-label="Название дня"
                              className={inputCls + " h-9 min-w-0 flex-1 px-2.5 text-sm font-semibold"}
                              value={d.day ?? ""}
                              onChange={(e) => patchDay(gi, di, { day: e.target.value })}
                              placeholder="Понедельник"
                            />
                            <button type="button" onClick={() => moveDay(gi, di, -1)} className="p-2 sm:p-1.5 rounded-lg hover:bg-accent" title="Выше"><ArrowUp className="w-4 h-4" /></button>
                            <button type="button" onClick={() => moveDay(gi, di, 1)} className="p-2 sm:p-1.5 rounded-lg hover:bg-accent" title="Ниже"><ArrowDown className="w-4 h-4" /></button>
                            <button type="button" onClick={() => removeDay(gi, di)} className="p-2 sm:p-1.5 rounded-lg hover:bg-destructive/10 text-destructive" title="Удалить день"><Trash2 className="w-4 h-4" /></button>
                          </div>
                          <div className="space-y-1">
                            {lessons.map((l: any, li: number) => (
                              /* flex-wrap: на узких экранах предмет переносится
                                 на вторую строку, а не сжимается в нечитаемое поле. */
                              <div key={li} className="flex flex-wrap items-center gap-1.5">
                                <input aria-label="Время начала" className={timeCls} value={l.time ?? ""} onChange={(e) => patchLesson(gi, di, li, { time: e.target.value })} placeholder="8:30" inputMode="numeric" />
                                <span className="text-[10px] text-muted-foreground shrink-0 cursor-help" title="Если указать время у последнего урока дня, на странице оно выйдет отдельной строкой «Окончание уроков» жирным — для родителей, во сколько забирать ребёнка.">до</span>
                                <input aria-label="Время окончания" className={timeCls} value={l.end ?? ""} onChange={(e) => patchLesson(gi, di, li, { end: e.target.value })} placeholder="—" inputMode="numeric" />
                                <input aria-label="Предмет" className={inputCls + " h-9 min-w-0 flex-1 basis-28 sm:basis-0 px-2.5"} value={l.subject ?? ""} onChange={(e) => patchLesson(gi, di, li, { subject: e.target.value })} placeholder="Математика" />
                                <div className="flex items-center gap-0.5 shrink-0 ml-auto lg:ml-0">
                                  <button type="button" onClick={() => moveLesson(gi, di, li, -1)} className="p-2 sm:p-1.5 rounded-lg hover:bg-accent text-muted-foreground" title="Выше"><ArrowUp className="w-3.5 h-3.5" /></button>
                                  <button type="button" onClick={() => moveLesson(gi, di, li, 1)} className="p-2 sm:p-1.5 rounded-lg hover:bg-accent text-muted-foreground" title="Ниже"><ArrowDown className="w-3.5 h-3.5" /></button>
                                  <button type="button" onClick={() => removeLesson(gi, di, li)} className="p-2 sm:p-1.5 rounded-lg hover:bg-destructive/10 text-destructive" title="Удалить урок"><X className="w-4 h-4" /></button>
                                </div>
                              </div>
                            ))}
                            <button type="button" onClick={() => addLesson(gi, di)} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-warm-ink hover:underline mt-0.5"><Plus className="w-3.5 h-3.5" /> Добавить урок</button>
                          </div>
                          {lessons.length > 0 && (
                            <p className="pt-1.5 border-t border-border/50 flex items-baseline justify-between gap-2 text-[11px] text-muted-foreground">
                              <span>окончание уроков на сайте</span>
                              {pickup ? (
                                <b className="text-foreground text-xs tabular-nums">{pickup}</b>
                              ) : (
                                <span className="text-muted-foreground/60">не указано</span>
                              )}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <button type="button" onClick={() => addDay(gi)} className={btnSecondaryCls + " !h-9 text-xs"}><Plus className="w-4 h-4" /> Добавить день</button>
                </div>

                <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-border/50">
                  <span className="text-xs text-muted-foreground mr-auto">Группа {gi + 1} из {schedule.length}</span>
                  <button type="button" onClick={() => move(schedule, gi, -1, setSchedule)} className="p-2 rounded-lg hover:bg-accent" title="Группу выше"><ArrowUp className="w-4 h-4" /></button>
                  <button type="button" onClick={() => move(schedule, gi, 1, setSchedule)} className="p-2 rounded-lg hover:bg-accent" title="Группу ниже"><ArrowDown className="w-4 h-4" /></button>
                  <button type="button" onClick={() => duplicateGroup(gi)} className="p-2 rounded-lg hover:bg-accent" title="Дублировать группу"><Copy className="w-4 h-4" /></button>
                  <button type="button" onClick={() => removeGroup(gi)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive" title="Удалить группу"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={addGroup} className={btnCls + " bg-card border border-border text-foreground hover:bg-accent"}><Plus className="w-4 h-4" /> Добавить группу</button>
              <button onClick={saveSettings} disabled={saving} className={btnCls}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Сохранить расписание</button>
            </div>
          </div>
        )}


        {/* ─── Новости: свои + импорт из VK ─── */}
        {tab === "news" && newsDraft && newsPreviewItem && (
          <div className="space-y-3">
            {/* Шапка редактора: куда вернёмся и что сохранится */}
            <div className="sticky top-[52px] sm:top-[60px] z-20 -mx-3 px-3 sm:mx-0 sm:px-0 py-2 bg-background/90 backdrop-blur">
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={closeNewsEditor} className={btnSecondaryCls + " !h-9 !px-3 text-xs shrink-0"}>
                  <ArrowLeft className="w-4 h-4" /> К списку
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    {newsDraft.id ? "Редактирование новости" : "Новая новость"}
                    {newsDirty && <span className="ml-2 text-[11px] font-normal text-brand-warm-ink">● не сохранено</span>}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {newsUrl({ vk_post_id: newsDraft.vk_post_id || slugifyRu(newsDraft.title || "novost") })}
                    {newsDraft.visible ? "" : " · скрыта"}
                  </p>
                </div>
                <button onClick={saveNews} disabled={newsBusy} data-news-save className={btnCls + " !h-9 !px-4 text-xs shrink-0"}>
                  {newsBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Сохранить
                </button>
              </div>
            </div>

            {newsError && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {newsError}
              </div>
            )}
            {newsDraft.fromVk && (
              <div
                className={
                  "rounded-xl border px-3 py-2.5 text-xs flex flex-wrap items-center gap-x-3 gap-y-2 " +
                  (newsDraft.pinned
                    ? "border-brand-warm/40 bg-brand-warm/8 text-foreground"
                    : "border-brand-teal/30 bg-brand-teal/5 text-muted-foreground")
                }
              >
                <span className="min-w-[12rem] flex-1">
                  {newsDraft.pinned
                    ? "Новость закреплена: синхронизация VK пройдёт мимо неё — текст, обложка и дата останутся как у вас. Снимете галочку — снова будет браться из поста."
                    : "Заметка импортирована из VK: правки сохранятся, но следующая синхронизация вернёт текст, обложку и дату из поста."}
                </span>
                <label className="inline-flex items-center gap-2 cursor-pointer select-none shrink-0">
                  <input
                    type="checkbox"
                    checked={newsDraft.pinned}
                    onChange={(e) => patchNews({ pinned: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold text-foreground">Закрепить за студией</span>
                </label>
              </div>
            )}

            {/* На узких экранах форма и просмотр по очереди, на широких — рядом */}
            <div className="lg:hidden inline-flex rounded-xl border border-border/60 bg-card p-1 gap-1">
              {(["edit", "preview"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setNewsPane(p)}
                  className={cn(
                    "h-8 px-3 rounded-lg text-xs font-semibold transition-colors",
                    newsPane === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent",
                  )}
                >
                  {p === "edit" ? "Редактор" : "Просмотр"}
                </button>
              ))}
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-4 items-start">
              {/* ── Форма ── */}
              <div className={cn("space-y-3", newsPane === "preview" && "hidden lg:block")}>
                <div className="bg-card rounded-2xl border border-border/60 p-4 space-y-3">
                  <Field label="Заголовок">
                    <input
                      className={inputCls + " font-semibold"}
                      value={newsDraft.title}
                      onChange={(e) => patchNews({ title: e.target.value })}
                      placeholder="Например: День открытых дверей 20 сентября"
                      maxLength={200}
                    />
                  </Field>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Адрес (латиницей)">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground shrink-0">/news/</span>
                        <input
                          className={inputCls + " font-mono text-xs"}
                          value={newsDraft.vk_post_id}
                          onChange={(e) => patchNews({ vk_post_id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                          onBlur={(e) => { if (!e.target.value.trim()) patchNews({ vk_post_id: slugifyRu(newsDraft.title) }); }}
                          placeholder={slugifyRu(newsDraft.title || "avtomaticheski-iz-zagolovka")}
                          disabled={newsDraft.fromVk}
                          title={newsDraft.fromVk ? "У новости из VK адрес — id поста, его менять нельзя" : "Оставьте пустым — возьмём из заголовка"}
                        />
                      </div>
                    </Field>
                    <Field label="Дата публикации">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="datetime-local"
                          className={inputCls}
                          value={newsDraft.published_at}
                          onChange={(e) => patchNews({ published_at: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => patchNews({ published_at: toLocalInput(null) })}
                          className="h-10 px-2.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-accent shrink-0"
                          title="Поставить текущие дату и время"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      </div>
                    </Field>
                  </div>
                  <Field label="Краткое описание (для ленты и поиска)">
                    <textarea
                      rows={2}
                      className={inputCls + " h-auto py-2 leading-snug"}
                      value={newsDraft.excerpt}
                      onChange={(e) => patchNews({ excerpt: e.target.value })}
                      maxLength={400}
                      placeholder="2–3 предложения: что произошло и кому это интересно."
                    />
                  </Field>
                  <p className="text-[11px] text-muted-foreground -mt-1">
                    {newsDraft.excerpt.trim() ? `${newsDraft.excerpt.length} из 400` : "Оставите пустым — возьмём начало текста."}
                  </p>
                </div>

                {/* Обложка */}
                <div className="bg-card rounded-2xl border border-border/60 p-4 space-y-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Обложка</p>
                  <div className="flex items-start gap-3">
                    <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-border bg-brand-cream/60 shrink-0 flex items-center justify-center">
                      {newsDraft.image_url ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={newsDraft.image_url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => patchNews({ image_url: "" })}
                            className="absolute right-1 top-1 p-1 rounded-md bg-black/55 text-white hover:bg-black/75"
                            title="Убрать обложку"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <ImagePlus className="w-6 h-6 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => { rememberCaret(); setPickerFor({ kind: "news", index: -1 }); }} className={btnSecondaryCls + " !h-9 !px-3 text-xs"}>
                          <ImageIcon className="w-4 h-4" /> Из загруженных
                        </button>
                        <label className={btnSecondaryCls + " !h-9 !px-3 text-xs cursor-pointer"}>
                          <Upload className="w-4 h-4" /> Загрузить файл
                          <input
                            ref={newsFileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadNewsImage(f, "cover"); }}
                          />
                        </label>
                        {newsBusy && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground self-center" />}
                      </div>
                      <input
                        className={inputCls + " text-xs font-mono"}
                        value={newsDraft.image_url}
                        onChange={(e) => patchNews({ image_url: e.target.value })}
                        placeholder="или вставьте ссылку https://…"
                      />
                    </div>
                  </div>
                </div>

                {/* Текст */}
                <div className="bg-card rounded-2xl border border-border/60 p-4 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Текст новости</p>
                    <p className="text-[11px] text-muted-foreground">
                      {(newsDraft.content.length / 1000).toFixed(1)}k символов
                      {newsWords > 0 && ` · ~${Math.max(1, Math.round(newsWords / 180))} мин чтения`}
                    </p>
                  </div>

                  {/* Панель форматирования — простые действия, без «изучи markdown» */}
                  <div className="flex flex-wrap items-center gap-1 -mx-1 px-1 pb-1 border-b border-border/50">
                    {[
                      { t: "Жирный (Ctrl+B)", icon: <b className="text-sm leading-none">Ж</b>, on: () => mdWrap("**", "**", "жирный") },
                      { t: "Курсив (Ctrl+I)", icon: <i className="text-sm leading-none font-serif">К</i>, on: () => mdWrap("*", "*", "курсив") },
                      { t: "Заголовок раздела", icon: <span className="text-[11px] font-bold leading-none">H2</span>, on: () => mdLinePrefix("## ") },
                      { t: "Список", icon: <List className="w-4 h-4" />, on: () => mdLinePrefix("- ") },
                      { t: "Цитата", icon: <Quote className="w-4 h-4" />, on: () => mdLinePrefix("> ") },
                      { t: "Ссылка (Ctrl+K)", icon: <Link2 className="w-4 h-4" />, on: mdLink },
                    ].map((b, i) => (
                      <button
                        key={i}
                        type="button"
                        title={b.t}
                        onMouseDown={(e) => e.preventDefault() /* не терять выделение в textarea */}
                        onClick={b.on}
                        className="h-8 min-w-8 px-1.5 rounded-lg hover:bg-accent text-foreground inline-flex items-center justify-center"
                      >
                        {b.icon}
                      </button>
                    ))}
                    <span className="w-px h-5 bg-border/70 mx-1" aria-hidden />
                    <button
                      type="button"
                      title="Фото в текст (встанет отдельным блоком с подписью)"
                      onMouseDown={rememberCaret}
                      onClick={() => { rememberCaret(); setPickerFor({ kind: "newsBody", index: -1 }); }}
                      className="h-8 px-2 rounded-lg hover:bg-accent text-foreground inline-flex items-center gap-1 text-xs"
                    >
                      <ImageIcon className="w-4 h-4" /> Фото
                    </button>
                    <label
                      className="h-8 px-2 rounded-lg hover:bg-accent text-foreground inline-flex items-center gap-1 text-xs cursor-pointer"
                      title="Загрузить фото с компьютера и вставить в текст"
                      onMouseDown={rememberCaret}
                    >
                      <Upload className="w-4 h-4" /> Файл
                      <input
                        ref={newsBodyFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) { rememberCaret(); uploadNewsImage(f, "body"); } }}
                      />
                    </label>
                  </div>

                  <textarea
                    ref={newsBodyRef}
                    rows={14}
                    className={inputCls + " h-auto py-3 leading-relaxed resize-y font-sans text-sm"}
                    value={newsDraft.content}
                    onChange={(e) => patchNews({ content: e.target.value })}
                    onKeyDown={onNewsBodyKeyDown}
                    onSelect={rememberCaret}
                    placeholder={"Расскажите, что произошло.\n\nПустая строка — новый абзац.\n\n- можно списком\n## и заголовком раздела\n\nФото и ссылки добавляются кнопками выше."}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Формат: <code className="font-mono">**жирный**</code>, <code className="font-mono">*курсив*</code>,{" "}
                    <code className="font-mono">- список</code>, <code className="font-mono">## заголовок</code>,{" "}
                    <code className="font-mono">&gt; цитата</code>. HTML вставлять нельзя — текст на сайте экранируется.
                  </p>
                </div>

                <div className="bg-card rounded-2xl border border-border/60 p-4 space-y-3">
                  <label className="inline-flex items-center gap-2.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newsDraft.visible}
                      onChange={(e) => patchNews({ visible: e.target.checked })}
                      className="w-4 h-4"
                    />
                    Показывать на сайте
                  </label>
                  <Field label="Ссылка на пост (необязательно)">
                    <input
                      className={inputCls + " text-xs"}
                      value={newsDraft.source_url}
                      onChange={(e) => patchNews({ source_url: e.target.value })}
                      placeholder="https://vk.com/wall-…_… — тогда внизу появится «Обсудить в VK»"
                    />
                  </Field>
                </div>
              </div>

              {/* ── Живой предпросмотр: тот же код, что рендерит /news/[id] ── */}
              <div className={cn(newsPane === "edit" && "hidden lg:block", "lg:sticky lg:top-28")}>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> Так это увидят на сайте
                </p>
                <div className="bg-card rounded-2xl border border-border/60 p-4 sm:p-5 max-h-[calc(100vh-11rem)] overflow-y-auto">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span>{new Date(newsPreviewItem.published_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</span>
                    <NewsSourceBadge item={newsPreviewItem} />
                  </div>
                  <h3 className="font-display font-extrabold text-xl sm:text-2xl text-foreground text-balance leading-tight">
                    {newsPreviewItem.title}
                  </h3>
                  {newsPreviewItem.image_url && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-border/60 bg-brand-cream/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={newsPreviewItem.image_url} alt="" className="w-full object-contain max-h-64" />
                    </div>
                  )}
                  {newsPreviewItem.excerpt && !newsPreviewItem.content && (
                    <p className="mt-3 text-sm text-muted-foreground italic">{newsPreviewItem.excerpt}</p>
                  )}
                  <NewsBody item={newsPreviewItem} className="mt-4 text-sm [&_*]:text-inherit" />
                  {!newsPreviewItem.content && !newsPreviewItem.excerpt && (
                    <p className="mt-4 text-sm text-muted-foreground/60 italic">Текст пока пуст…</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "news" && !newsDraft && (
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border/60 p-4 sm:p-5 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={openNewsNew} className={btnCls}>
                  <Plus className="w-4 h-4" /> Написать новость
                </button>
                <button onClick={syncVK} disabled={syncing} className={btnSecondaryCls}>
                  {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {syncing ? "Синхронизация…" : "Загрузить из VK"}
                </button>
                <label className={btnSecondaryCls + " cursor-pointer"}>
                  <Upload className="w-4 h-4" /> Импорт JSON
                  <input
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) importNews(f); if (e.target) e.target.value = ""; }}
                  />
                </label>
                <button onClick={exportNews} className={btnSecondaryCls}>
                  <Download className="w-4 h-4" /> Экспорт
                </button>
                <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                  всего {news.length} · видно {news.filter((n) => n.visible !== false).length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                «Написать новость» — свой текст с фото и форматированием. «Загрузить из VK» —
                подтянуть свежие посты группы; они помечены «из VK» и правятся отдельно.
              </p>
              <details className="text-sm">
                <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                  Настройки синхронизации VK
                </summary>
                <div className="mt-2 grid sm:grid-cols-[minmax(0,1fr)_auto] gap-2 items-end">
                  <Field label="VK-домен сообщества (необязательно)">
                    <input className={inputCls} value={vkDomain} onChange={(e) => setVkDomain(e.target.value)} placeholder="sfera_gk" />
                  </Field>
                  <p className="text-[11px] text-muted-foreground pb-2">
                    Пусто — возьмём из настроек сайта.
                  </p>
                </div>
              </details>
            </div>

            {news.length === 0 && !syncing && (
              <div className="bg-card rounded-2xl border border-dashed border-border p-8 text-center">
                <Newspaper className="w-8 h-8 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Новостей пока нет. Напишите свою — или подтяните посты из группы ВКонтакте.
                </p>
              </div>
            )}

            <div className="space-y-2.5">
              {news.map((n: any) => {
                const key = newsKey(n);
                return (
                  <div
                    key={key || String(n.id)}
                    className="bg-card rounded-2xl border border-border/60 p-2.5 sm:p-3 flex flex-wrap sm:flex-nowrap items-start gap-3 hover:border-brand-warm/40 transition-colors"
                  >
                    <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden border border-border bg-brand-cream/60 shrink-0 flex items-center justify-center">
                      {n.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={n.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{n.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                        <span className="tabular-nums">
                          {n.published_at ? new Date(n.published_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" }) : "без даты"}
                        </span>
                        <NewsSourceBadge item={n} />
                        {newsPinned.includes(String(n.vk_post_id ?? "")) && (
                          <span className="text-brand-warm-ink font-semibold" title="Закреплена: синхронизация VK её не перезапишет">
                            закреплена
                          </span>
                        )}
                        {n.visible === false && <span className="text-destructive">скрыта</span>}
                        {key && <code className="font-mono text-[10px] text-muted-foreground/70 truncate max-w-[160px]">{newsUrl(n)}</code>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-auto sm:ml-0">
                      <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground mr-1 cursor-pointer" title="Показывать на сайте">
                        <input type="checkbox" checked={n.visible !== false} onChange={(e) => toggleNewsVisible(String(n.id), e.target.checked)} className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">видна</span>
                      </label>
                      <button onClick={() => openNewsEdit(n)} className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground" title="Редактировать">
                        <Pencil className="w-4 h-4" />
                      </button>
                      {key && (
                        <a href={newsUrl(n)} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-accent text-muted-foreground" title="Открыть на сайте">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button onClick={() => deleteNewsItem(String(n.id))} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive" title="Удалить">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
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
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground" data-enrollments-total>
                В журнале <span className="font-semibold tabular-nums text-foreground">{enrollments.length}</span>
                {" · новых "}
                <span className="font-semibold tabular-nums text-foreground">{enrollments.filter((x) => (x.status ?? "new") === "new").length}</span>
                {" · из MAX "}
                <span className="font-semibold tabular-nums text-foreground">{enrollments.filter((x) => sourceOfEnrollment(x) === "max").length}</span>
              </p>
              <button
                onClick={() => setShowAddEn((v) => !v)}
                className={btnSecondaryCls}
                aria-expanded={showAddEn}
              >
                <Plus className="w-4 h-4" /> {showAddEn ? "Свернуть" : "Добавить заявку"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Переписку в MAX не переносим — в журнале только факт обращения: кто, по какому направлению,
              как с ним связаться и на какой стадии. Заявки с формы попадают сюда сами, источник у них «С сайта».
            </p>

            {showAddEn && (
              <div className="bg-card rounded-2xl border border-border/60 p-4 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Как зовут родителя">
                    <input className={inputCls} value={newEn.parent_name} placeholder="Ольга"
                      onChange={(e) => setNewEn((p) => ({ ...p, parent_name: e.target.value }))} />
                  </Field>
                  <Field label="Контакт (телефон или ник в MAX)">
                    <input className={inputCls} value={newEn.phone} placeholder="+7 … или @nick"
                      onChange={(e) => setNewEn((p) => ({ ...p, phone: e.target.value }))} />
                  </Field>
                  <Field label="Возраст ребёнка">
                    <input className={inputCls} value={newEn.child_age} placeholder="7 лет"
                      onChange={(e) => setNewEn((p) => ({ ...p, child_age: e.target.value }))} />
                  </Field>
                  <Field label="Направление">
                    <input className={inputCls} list="admin-program-titles" value={newEn.interest} placeholder="Подготовка к школе"
                      onChange={(e) => setNewEn((p) => ({ ...p, interest: e.target.value }))} />
                    <datalist id="admin-program-titles">
                      {programs.map((pr) => <option key={pr.id ?? pr.slug ?? pr.title} value={pr.title} />)}
                    </datalist>
                  </Field>
                  <Field label="Откуда пришла">
                    <select className={inputCls} value={newEn.source} onChange={(e) => setNewEn((p) => ({ ...p, source: e.target.value }))}>
                      {EN_SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Стадия">
                    <select className={inputCls} value={newEn.status} onChange={(e) => setNewEn((p) => ({ ...p, status: e.target.value }))}>
                      <option value="new">новая</option>
                      <option value="contacted">связались</option>
                      <option value="enrolled">записан</option>
                    </select>
                  </Field>
                </div>
                <Field label="О чём договорились / что нужно">
                  <textarea className={inputCls} rows={2} value={newEn.comment} placeholder="Спросила про субботу, записали на пробное 12-го"
                    onChange={(e) => setNewEn((p) => ({ ...p, comment: e.target.value }))} />
                </Field>
                <div className="flex gap-2">
                  <button onClick={addEnrollment} disabled={savingEn} className={btnCls}>
                    {savingEn ? "Записываю…" : "Записать заявку"}
                  </button>
                  <button onClick={() => { setShowAddEn(false); setNewEn(emptyEn); }} disabled={savingEn} className={btnSecondaryCls}>
                    Отмена
                  </button>
                </div>
              </div>
            )}

            {enrollments.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Заявок пока нет. Появятся, когда кто-то отправит форму на сайте или вы заведёте обращение вручную.
              </p>
            )}
            {enrollments.map((en) => {
              const src = sourceOfEnrollment(en);
              return (
              <div key={en.id} className="bg-card rounded-2xl border border-border/60 p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm flex flex-wrap items-center gap-2">
                      <span>{en.parent_name ?? "—"} · {en.phone ?? "—"}</span>
                      <span
                        data-en-source={src}
                        className={
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 " +
                          (src === "max" ? "bg-primary/10 ring-primary/25 text-primary"
                            : src === "phone" ? "bg-brand-warm/12 ring-brand-warm/25 text-brand-warm-ink"
                            : src === "vk" ? "bg-brand-teal/12 ring-brand-teal/25 text-brand-teal-ink"
                            : "bg-accent ring-border text-muted-foreground")
                        }
                      >
                        {EN_SOURCE_LABEL[src]}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {en.child_age && en.child_age !== "—" && <>ребёнок: {en.child_age} · </>}
                      {(en.interest_label || en.interest || "—")} ·{en.created_at ? " " + new Date(en.created_at).toLocaleString("ru-RU") : ""}
                    </p>
                    {(() => {
                      // Метку канала из комментария убираем: она служебная, её уже
                      // показывает бейдж над строкой.
                      const raw = String(en.comment ?? "");
                      const tag = EN_SOURCE_TAG[src];
                      const body = tag && raw.toUpperCase().startsWith(tag) ? raw.slice(tag.length).trim() : raw;
                      return body ? <p className="text-sm mt-2">{body}</p> : null;
                    })()}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <select className={inputCls + " flex-1 sm:w-36"} value={en.status ?? "new"} onChange={(e) => setEnrollmentStatus(en.id, e.target.value)}>
                      <option value="new">новая</option>
                      <option value="contacted">связались</option>
                      <option value="enrolled">записан</option>
                    </select>
                    <button onClick={() => deleteEnrollment(en.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive shrink-0"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
              );
            })}
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
                    if (kind === "schedule" && schedule[index]) return schedule[index].image;
                    if (kind === "news" && newsDraft) return newsDraft.image_url;
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
        </main>
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
