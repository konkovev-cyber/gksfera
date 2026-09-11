/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  Save,
  Upload,
  Trash2,
  LogOut,
  ArrowUp,
  ArrowDown,
  Settings,
  Image as ImageIcon,
  LayoutDashboard,
  Inbox,
  School,
  Eye,
} from "lucide-react";

type Tab = "settings" | "hero" | "visibility" | "programs" | "gallery" | "inbox";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "settings", label: "Настройки", icon: Settings },
  { id: "hero", label: "Главный экран", icon: LayoutDashboard },
  { id: "visibility", label: "Блоки", icon: Eye },
  { id: "programs", label: "Направления", icon: School },
  { id: "gallery", label: "Галерея", icon: ImageIcon },
  { id: "inbox", label: "Заявки", icon: Inbox },
];

const VIS_LABELS: Record<string, string> = {
  about: "О студии",
  programs: "Направления",
  learning: "Как проходят занятия",
  gallery: "Галерея",
  reviews: "Отзывы",
  teachers: "Преподаватели",
  events: "События",
  cta: "CTA-баннер",
  enrollment: "Форма записи",
  contacts: "Контакты и карта",
};

const inputCls =
  "w-full h-10 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/60";
const btnCls =
  "inline-flex items-center gap-2 h-10 px-4 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-foreground mb-1.5">{label}</span>
      {children}
    </label>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [tab, setTab] = useState<Tab>("settings");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [siteConfig, setSiteConfig] = useState<Record<string, any>>({});
  const [hero, setHero] = useState<Record<string, any>>({});
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [programs, setPrograms] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);

  const flash = (t: string) => {
    setMsg(t);
    setTimeout(() => setMsg(""), 2500);
  };

  const loadAll = useCallback(async () => {
    const [s, p, e] = await Promise.all([
      fetch("/api/admin/settings").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/programs").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/enrollments").then((r) => (r.ok ? r.json() : null)),
    ]);
    if (!s) {
      setAuthed(false);
      return;
    }
    setAuthed(true);
    setSiteConfig(s.siteConfig ?? {});
    setHero(s.heroContent ?? {});
    setVisibility(s.visibility ?? {});
    setPrograms(p?.programs ?? []);
    setEnrollments(e?.enrollments ?? []);
    const g = await fetch("/api/admin/photos").then((r) => (r.ok ? r.json() : null));
    setPhotos(g?.photos ?? []);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const login = async () => {
    setLoginErr("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setPassword("");
      await loadAll();
    } else {
      const j = await res.json().catch(() => ({}));
      setLoginErr(j.error ?? "Ошибка входа");
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: siteConfig, hero, visibility }),
    });
    setSaving(false);
    flash(res.ok ? "Сохранено ✓" : "Ошибка сохранения");
  };

  const savePrograms = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/programs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: programs.map((p, i) => ({
          id: p.id,
          title: p.title,
          ageRange: p.age_range,
          description: p.description,
          image: p.image,
          imageAlt: p.image_alt,
          visible: p.visible !== false,
          sortOrder: i + 1,
        })),
      }),
    });
    setSaving(false);
    flash(res.ok ? "Направления сохранены ✓" : "Ошибка сохранения");
  };

  const savePhotoOrder = async (items: any[]) => {
    setSaving(true);
    const res = await fetch("/api/admin/photos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((p, i) => ({
          id: p.id,
          alt: p.alt ?? "",
          span: p.span ?? "normal",
          pos: p.pos || null,
          sort_order: i + 1,
        })),
      }),
    });
    setSaving(false);
    flash(res.ok ? "Порядок сохранён ✓" : "Ошибка сохранения");
  };

  const uploadPhoto = async (file: File, alt: string) => {
    setSaving(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("alt", alt);
    const res = await fetch("/api/admin/photos", { method: "POST", body: fd });
    const j = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.ok) {
      setPhotos((prev) => [...prev, j.photo]);
      flash("Фото загружено ✓");
    } else {
      flash(j.error ?? "Ошибка загрузки");
    }
  };

  const deletePhoto = async (id: number) => {
    if (!confirm("Удалить фото?")) return;
    await fetch(`/api/admin/photos?id=${id}`, { method: "DELETE" });
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    flash("Удалено");
  };

  const move = (arr: any[], i: number, dir: -1 | 1, setter: (v: any[]) => void) => {
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    const copy = [...arr];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setter(copy);
  };

  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-brand-warm" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm bg-card rounded-2xl border border-border/60 shadow-lg p-6">
          <h1 className="font-display font-extrabold text-xl mb-1">Админ-панель «Сферы»</h1>
          <p className="text-sm text-muted-foreground mb-5">Введите пароль администратора</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            className={inputCls}
            placeholder="Пароль"
            autoFocus
          />
          {loginErr && <p className="mt-2 text-sm text-destructive">{loginErr}</p>}
          <button onClick={login} className={btnCls + " w-full justify-center mt-4"}>
            Войти
          </button>
        </div>
      </div>
    );
  }

  const configEntries = Object.entries(siteConfig).filter(
    ([, v]) => ["string", "number", "boolean"].includes(typeof v)
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-card/90 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-display font-extrabold">Админка «Сферы»</span>
          <div className="flex items-center gap-3">
            {msg && <span className="text-sm text-green-600 font-medium">{msg}</span>}
            <a href="/" target="_blank" className="text-sm text-muted-foreground hover:text-foreground">
              Открыть сайт ↗
            </a>
            <button onClick={logout} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive">
              <LogOut className="w-4 h-4" /> Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <nav className="flex flex-wrap gap-2 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                "inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium transition-colors " +
                (tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border hover:bg-accent")
              }
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </nav>

        {tab === "settings" && (
          <div className="grid sm:grid-cols-2 gap-4 bg-card rounded-2xl border border-border/60 p-5">
            {configEntries.map(([k, v]) => (
              <Field key={k} label={k}>
                {typeof v === "boolean" ? (
                  <label className="inline-flex items-center gap-2 h-10 text-sm">
                    <input
                      type="checkbox"
                      checked={v}
                      onChange={(e) =>
                        setSiteConfig((p: any) => ({ ...p, [k]: e.target.checked }))
                      }
                      className="w-4 h-4"
                    />
                    {v ? "включено" : "выключено"}
                  </label>
                ) : (
                  <input
                    className={inputCls}
                    value={String(v ?? "")}
                    onChange={(e) =>
                      setSiteConfig((p: any) => ({ ...p, [k]: e.target.value }))
                    }
                  />
                )}
              </Field>
            ))}
            <div className="sm:col-span-2">
              <button onClick={saveSettings} disabled={saving} className={btnCls}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Сохранить
              </button>
            </div>
          </div>
        )}

        {tab === "hero" && (
          <div className="grid sm:grid-cols-2 gap-4 bg-card rounded-2xl border border-border/60 p-5">
            {Object.entries(hero)
              .filter(([, v]) => typeof v === "string")
              .map(([k, v]) => (
                <Field key={k} label={k}>
                  <input
                    className={inputCls}
                    value={String(v ?? "")}
                    onChange={(e) => setHero((p: any) => ({ ...p, [k]: e.target.value }))}
                  />
                </Field>
              ))}
            <div className="sm:col-span-2">
              <button onClick={saveSettings} disabled={saving} className={btnCls}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Сохранить
              </button>
            </div>
          </div>
        )}

        {tab === "visibility" && (
          <div className="bg-card rounded-2xl border border-border/60 p-5 space-y-3 max-w-md">
            {Object.keys(VIS_LABELS).map((k) => (
              <label key={k} className="flex items-center justify-between text-sm">
                <span>{VIS_LABELS[k]}</span>
                <input
                  type="checkbox"
                  checked={visibility[k] !== false}
                  onChange={(e) =>
                    setVisibility((p) => ({ ...p, [k]: e.target.checked }))
                  }
                  className="w-4 h-4"
                />
              </label>
            ))}
            <button onClick={saveSettings} disabled={saving} className={btnCls}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Сохранить
            </button>
          </div>
        )}

        {tab === "programs" && (
          <div className="space-y-4">
            {programs.map((p, i) => (
              <div key={p.id ?? i} className="bg-card rounded-2xl border border-border/60 p-4 grid sm:grid-cols-2 gap-3">
                <Field label="Название">
                  <input
                    className={inputCls}
                    value={p.title ?? ""}
                    onChange={(e) =>
                      setPrograms((prev) => prev.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))
                    }
                  />
                </Field>
                <Field label="Возраст">
                  <input
                    className={inputCls}
                    value={p.age_range ?? ""}
                    onChange={(e) =>
                      setPrograms((prev) => prev.map((x, j) => (j === i ? { ...x, age_range: e.target.value } : x)))
                    }
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Описание">
                    <textarea
                      rows={2}
                      className={inputCls + " h-auto py-2"}
                      value={p.description ?? ""}
                      onChange={(e) =>
                        setPrograms((prev) => prev.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))
                      }
                    />
                  </Field>
                </div>
                <Field label="Фото (URL)">
                  <input
                    className={inputCls}
                    value={p.image ?? ""}
                    onChange={(e) =>
                      setPrograms((prev) => prev.map((x, j) => (j === i ? { ...x, image: e.target.value } : x)))
                    }
                  />
                </Field>
                <div className="flex items-end gap-4">
                  <label className="inline-flex items-center gap-2 text-sm h-10">
                    <input
                      type="checkbox"
                      checked={p.visible !== false}
                      onChange={(e) =>
                        setPrograms((prev) => prev.map((x, j) => (j === i ? { ...x, visible: e.target.checked } : x)))
                      }
                      className="w-4 h-4"
                    />
                    показывать
                  </label>
                  <button onClick={() => move(programs, i, -1, setPrograms)} className="p-2 rounded-lg hover:bg-accent">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => move(programs, i, 1, setPrograms)} className="p-2 rounded-lg hover:bg-accent">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <button onClick={savePrograms} disabled={saving} className={btnCls}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Сохранить направления
            </button>
          </div>
        )}

        {tab === "gallery" && (
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border/60 p-4 flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 h-10 px-4 rounded-full border-2 border-border text-sm font-semibold cursor-pointer hover:border-primary hover:text-primary">
                <Upload className="w-4 h-4" />
                Загрузить фото
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadPhoto(f, "");
                    e.target.value = "";
                  }}
                />
              </label>
              <span className="text-xs text-muted-foreground">
                Пока нет ни одного загруженного фото — на сайте показывается галерея по умолчанию
              </span>
            </div>
            {photos.map((ph, i) => (
              <div key={ph.id} className="bg-card rounded-2xl border border-border/60 p-4 flex gap-4 items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ph.src} alt="" className="w-20 h-14 object-cover rounded-lg border border-border" />
                <input
                  className={inputCls + " flex-1"}
                  placeholder="Описание (alt)"
                  value={ph.alt ?? ""}
                  onChange={(e) => setPhotos((prev) => prev.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))}
                />
                <select
                  className={inputCls + " w-28"}
                  value={ph.span ?? "normal"}
                  onChange={(e) => setPhotos((prev) => prev.map((x, j) => (j === i ? { ...x, span: e.target.value } : x)))}
                >
                  <option value="normal">обычное</option>
                  <option value="wide">широкое</option>
                  <option value="tall">высокое</option>
                </select>
                <input
                  className={inputCls + " w-32"}
                  placeholder="50% 20%"
                  value={ph.pos ?? ""}
                  onChange={(e) => setPhotos((prev) => prev.map((x, j) => (j === i ? { ...x, pos: e.target.value } : x)))}
                />
                <button onClick={() => move(photos, i, -1, setPhotos)} className="p-2 rounded-lg hover:bg-accent">
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button onClick={() => move(photos, i, 1, setPhotos)} className="p-2 rounded-lg hover:bg-accent">
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button onClick={() => deletePhoto(ph.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {photos.length > 0 && (
              <button onClick={() => savePhotoOrder(photos)} disabled={saving} className={btnCls}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Сохранить галерею
              </button>
            )}
          </div>
        )}

        {tab === "inbox" && (
          <div className="space-y-3">
            {enrollments.length === 0 && (
              <p className="text-sm text-muted-foreground">Заявок пока нет.</p>
            )}
            {enrollments.map((en) => (
              <div key={en.id} className="bg-card rounded-2xl border border-border/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sm">
                      {en.parent_name ?? "—"} · {en.phone ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {en.child_age && <>ребёнок: {en.child_age} · </>}
                      {en.interest ?? "—"} ·{" "}
                      {en.created_at ? new Date(en.created_at).toLocaleString("ru-RU") : ""}
                    </p>
                    {en.comment && <p className="text-sm mt-2">{en.comment}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className={inputCls + " w-36"}
                      value={en.status ?? "new"}
                      onChange={async (e) => {
                        const status = e.target.value;
                        setEnrollments((prev) => prev.map((x) => (x.id === en.id ? { ...x, status } : x)));
                        await fetch("/api/admin/enrollments", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: en.id, status }),
                        });
                      }}
                    >
                      <option value="new">новая</option>
                      <option value="contacted">связались</option>
                      <option value="enrolled">записан</option>
                    </select>
                    <button
                      onClick={async () => {
                        if (!confirm("Удалить заявку?")) return;
                        await fetch(`/api/admin/enrollments?id=${en.id}`, { method: "DELETE" });
                        setEnrollments((prev) => prev.filter((x) => x.id !== en.id));
                      }}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
