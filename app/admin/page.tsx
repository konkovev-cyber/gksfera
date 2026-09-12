/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Loader2, Save, Upload, Trash2, LogOut, ArrowUp, ArrowDown,
  Settings, Image as ImageIcon, LayoutDashboard, Inbox, School,
  Eye, Star, BookOpen, Search, Download, Plus, Newspaper, RefreshCw, ExternalLink, X,
  GraduationCap,
} from "lucide-react";
import { gallery as defaultGallery } from "@/data/site";

type Tab = "settings" | "hero" | "visibility" | "programs" | "gallery" |
  "teachers" | "reviews" | "learning" | "news" | "seo" | "io" | "inbox";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "settings", label: "Настройки", icon: Settings },
  { id: "hero", label: "Экран", icon: LayoutDashboard },
  { id: "visibility", label: "Блоки", icon: Eye },
  { id: "programs", label: "Направления", icon: School },
  { id: "gallery", label: "Галерея", icon: ImageIcon },
  { id: "teachers", label: "Педагоги", icon: GraduationCap },
  { id: "reviews", label: "Отзывы", icon: Star },
  { id: "learning", label: "Занятия", icon: BookOpen },
  { id: "news", label: "Новости VK", icon: Newspaper },
  { id: "seo", label: "SEO", icon: Search },
  { id: "io", label: "Импорт", icon: Download },
  { id: "inbox", label: "Заявки", icon: Inbox },
];

const VIS_LABELS: Record<string, string> = {
  about: "О студии", programs: "Направления", learning: "Как проходят занятия",
  gallery: "Галерея", reviews: "Отзывы", news: "Новости VK", teachers: "Преподаватели",
  events: "События", cta: "CTA-баннер", enrollment: "Форма записи", contacts: "Контакты и карта",
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

const inputCls = "w-full h-10 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/60";
const btnCls = "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 w-full sm:w-auto";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs font-medium text-foreground mb-1.5">{label}</span>{children}</label>;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [tab, setTab] = useState<Tab>("settings");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [siteConfig, setSiteConfig] = useState<Record<string, any>>({});
  const [hero, setHero] = useState<Record<string, any>>({});
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [programs, setPrograms] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [learning, setLearning] = useState<{ title: string; description: string; steps: any[] }>({ title: "", description: "", steps: [] });
  const [teachers, setTeachers] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [vkDomain, setVkDomain] = useState("");
  const [pickerFor, setPickerFor] = useState<null | { kind: "program" | "hero" | "step" | "teacher"; index: number }>(null);

  const flash = (t: string) => { setMsg(t); setTimeout(() => setMsg(""), 2500); };

  const loadAll = useCallback(async () => {
    const [s, p, e, r, n] = await Promise.all([
      fetch("/api/admin/settings").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/programs").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/enrollments").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/reviews").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/news").then((r) => (r.ok ? r.json() : null)),
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
    setLearning(s.learningExperience ?? { title: "", description: "", steps: [] });
    setTeachers(s.teachers ?? []);
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
      body: JSON.stringify({ settings: siteConfig, hero, visibility, learningExperience: learning, teachers }),
    });
    setSaving(false);
    flash(res.ok ? "Сохранено ✓" : "Ошибка");
  };

  const savePrograms = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/programs", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: programs.map((p, i) => ({ id: p.id, title: p.title, ageRange: p.age_range, description: p.description, image: p.image, imageAlt: p.image_alt, visible: p.visible !== false, sortOrder: i + 1 })) }),
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

  const uploadPhoto = async (file: File, alt: string) => {
    setSaving(true);
    const fd = new FormData(); fd.append("file", file); fd.append("alt", alt);
    const res = await fetch("/api/admin/photos", { method: "POST", body: fd });
    const j = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.ok) { setPhotos((prev) => [...prev, j.photo]); flash("Фото загружено ✓"); }
    else flash(j.error ?? "Ошибка загрузки");
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
    if (!confirm("Импорт ЗАМЕНИТ все данные сайта (контент, фото, направления, отзывы). Продолжить?")) return;
    setSaving(true);
    const text = await file.text();
    const body = JSON.parse(text);
    const res = await fetch("/api/admin/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    if (res.ok) { flash("Импорт выполнен ✓"); await loadAll(); }
    else flash("Ошибка импорта");
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

  const applyPhoto = (src: string) => {
    if (!pickerFor) return;
    const { kind, index } = pickerFor;
    if (kind === "program") {
      setPrograms((prev) => prev.map((x, j) => (j === index ? { ...x, image: src } : x)));
    } else if (kind === "hero") {
      setHero((prev) => ({ ...prev, image: src }));
    } else if (kind === "step") {
      setLearning((p) => ({ ...p, steps: p.steps.map((s, j) => (j === index ? { ...s, image: src } : s)) }));
    } else if (kind === "teacher") {
      setTeachers((prev) => prev.map((x, j) => (j === index ? { ...x, photo: src } : x)));
    }
    setPickerFor(null);
    flash("Фото выбрано ✓");
  };

  const pickBtn = (kind: "program" | "hero" | "step" | "teacher", index: number) => (
    <button
      type="button"
      onClick={() => setPickerFor({ kind, index })}
      className="h-10 px-3 rounded-lg border border-border hover:bg-accent inline-flex items-center gap-1.5 text-sm shrink-0"
      title="Выбрать из загруженных фото"
    >
      <ImageIcon className="w-4 h-4" /> Выбрать
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
        {/* Навигация по вкладкам: горизонтальный скролл на мобильных */}
        <nav className="flex overflow-x-auto flex-nowrap gap-1.5 sm:gap-2 mb-5 pb-2 sm:pb-0 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={"inline-flex items-center gap-1.5 h-9 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 " + (tab === t.id ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:bg-accent")}>
              <t.icon className="w-4 h-4 shrink-0" /><span className="hidden min-[380px]:inline">{t.label}</span>
            </button>
          ))}
        </nav>

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
                <div className="sm:col-span-2"><Field label="Описание"><textarea rows={2} className={inputCls + " h-auto py-2"} value={p.description ?? ""} onChange={(e) => setPrograms((prev) => prev.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} /></Field></div>
                <div className="sm:col-span-2"><Field label="Фото URL">
                  <div className="flex gap-2">
                    <input className={inputCls + " flex-1"} value={p.image ?? ""} onChange={(e) => setPrograms((prev) => prev.map((x, j) => j === i ? { ...x, image: e.target.value } : x))} />
                    {pickBtn("program", i)}
                  </div>
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
                <Upload className="w-4 h-4" /> Загрузить фото
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f, ""); e.target.value = ""; }} />
              </label>
              <span className="text-xs text-muted-foreground">Пока нет фото — показывается галерея по умолчанию</span>
            </div>
            {photos.map((ph, i) => (
              <div key={ph.id} className="bg-card rounded-2xl border border-border/60 p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ph.src} alt="" className="w-full sm:w-20 h-32 sm:h-14 object-cover rounded-lg border border-border shrink-0" />
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
            ))}
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
            <div className="flex gap-3">
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
              <h3 className="font-display font-bold text-base mb-2">Экспорт</h3>
              <p className="text-sm text-muted-foreground mb-3">Скачать полный бэкап сайта: настройки, направления, галерея, отзывы, видимость блоков.</p>
              <button onClick={doExport} className={btnCls}><Download className="w-4 h-4" /> Скачать JSON-бэкап</button>
            </div>
            <hr className="border-border" />
            <div>
              <h3 className="font-display font-bold text-base mb-2">Импорт</h3>
              <p className="text-sm text-muted-foreground mb-3">Загрузить ранее экспортированный JSON. <strong className="text-destructive">Все текущие данные будут заменены.</strong></p>
              <label className={btnCls + " cursor-pointer"}><Upload className="w-4 h-4" /> Загрузить JSON<input type="file" accept=".json" className="hidden" ref={fileRef} onChange={(e) => { const f = e.target.files?.[0]; if (f) doImport(f); e.target.value = ""; }} /></label>
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
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setPickerFor(null)}>
            <div className="bg-card rounded-2xl border border-border p-5 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-base">Выберите фото</h3>
                <button onClick={() => setPickerFor(null)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground" title="Закрыть">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {photos.length === 0 && defaultGallery.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  Сначала загрузите фото во вкладке «Галерея» — потом их можно будет выбрать здесь.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {photos.map((ph) => (
                    <button
                      key={ph.id}
                      type="button"
                      onClick={() => applyPhoto(ph.src)}
                      className={"group rounded-xl overflow-hidden border-2 transition-colors " + (ph.src === (pickerFor.kind === "hero" ? hero.image : "") ? "border-brand-warm" : "border-transparent hover:border-brand-warm")}
                      title={ph.src}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ph.src} alt="" className="w-full aspect-square object-cover" />
                    </button>
                  ))}
                  {defaultGallery.map((g, gi) => (
                    <button
                      key={"static-" + gi}
                      type="button"
                      onClick={() => applyPhoto(g.src)}
                      className="group rounded-xl overflow-hidden border-2 border-transparent hover:border-brand-warm transition-colors"
                      title={g.src}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={g.src} alt="" className="w-full aspect-square object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
