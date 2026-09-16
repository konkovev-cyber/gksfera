"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronDown,
  Phone,
  MessageCircle,
  Clock,
  User,
  Baby,
  Compass,
  MessageSquare,
} from "lucide-react";
import { useContent } from "./ContentContext";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { FloatingDecorations } from "./FloatingDecorations";

type FormState = {
  parentName: string;
  childAge: string;
  interest: string;
  contact: string;
  comment: string;
  consent: boolean;
};

const initialState: FormState = {
  parentName: "",
  childAge: "",
  interest: "",
  contact: "",
  comment: "",
  consent: false,
};

type SubmitStatus = "idle" | "loading" | "success" | "error";

/* Поля больше не «белые с рамкой»: заливка --surface, плавающий лейбл и
   иконка внутри — вся механика в .field/.field-input/.field-label из
   globals.css. Placeholder обязан быть одним пробелом: на :placeholder-shown
   держится весь трюк с всплытием лейбла. */
function Field({
  id,
  label,
  icon: Icon,
  required,
  as = "input",
  type = "text",
  value,
  onChange,
  autoComplete,
  rows,
}: {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  required?: boolean;
  as?: "input" | "textarea";
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  autoComplete?: string;
  rows?: number;
}) {
  return (
    <div className="field">
      {as === "textarea" ? (
        <textarea
          id={id}
          name={id}
          rows={rows ?? 3}
          value={value}
          onChange={onChange}
          placeholder=" "
          className="field-input peer resize-none"
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder=" "
          className="field-input"
        />
      )}
      <Icon className="field-icon" aria-hidden />
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
    </div>
  );
}

export function EnrollmentForm() {
  const content = useContent();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Защита от спама: штамп времени открытия формы + honeypot-поле
  const mountedAt = useRef(0);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const startedRef = useRef(false);
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  // Автоподбор направления из query-параметра (?interest=...)
  useEffect(() => {
    const interest = searchParams.get("interest");
    if (interest && content.enrollmentInterests.includes(interest)) {
      setForm((prev) => ({ ...prev, interest }));
      // Убираем параметр из URL, чтобы при обновлении не сбрасывался
      const url = new URL(window.location.href);
      url.searchParams.delete("interest");
      router.replace(url.pathname + url.hash, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    // form_start — ровно один раз, на первом осмысленном действии: по нему судят,
    // сколько людей дошли до формы и не начали.
    if (!startedRef.current && !(type === "checkbox" && !checked)) {
      startedRef.current = true;
      trackEvent("form_start", { field: name });
    }
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.consent) {
      setStatus("error");
      setErrorMsg("Необходимо согласие на обработку персональных данных");
      trackEvent("form_error", { reason: "no_consent" });
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    trackEvent("form_submit", {
      // Только направление и длина — сами имя и телефон в аналитику не едут.
      interest_len: form.interest.length,
      has_comment: form.comment.trim().length > 0,
    });

    try {
      const res = await fetch("/api/enrollment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parent_name: form.parentName,
          child_age: form.childAge,
          interest: form.interest,
          interest_label: form.interest,
          phone: form.contact,
          comment: form.comment,
          consent: form.consent,                 // сервер требует согласие
          elapsed: Date.now() - mountedAt.current, // сколько мс форма была открыта (анти-бот, без учёта часов сервера)
          company_website: honeypotRef.current?.value ?? "", // скрытое поле: заполняют только боты
        }),
      });

      const j = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        throw new Error(j?.error || "Insert failed");
      }

      setStatus("success");
      setForm(initialState);
      startedRef.current = false;
      trackEvent("form_success", {});
    } catch (err) {
      setStatus("error");
      const msg = err instanceof Error && err.message && err.message !== "Insert failed"
        ? err.message
        : "Не удалось отправить заявку. Пожалуйста, позвоните нам или напишите в VK.";
      setErrorMsg(msg);
      trackEvent("form_error", { reason: msg.slice(0, 60) });
    }
  };

  if (status === "success") {
    return (
      <section id="enrollment" className="section-padding relative overflow-hidden">
        <div className="container-max relative z-10">
          <Reveal>
            <div className="glass max-w-md mx-auto text-center rounded-2xl p-7 sm:p-9" role="status" aria-live="polite">
              {/* Чип успеха был green-100/600 — единственный «несайтовый» цвет
                  на странице; в палитре из двух акцентов роль успеха играет тил. */}
              <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-brand-teal/12 ring-1 ring-brand-teal/30">
                <CheckCircle2 className="w-7 h-7 text-brand-teal-ink" />
              </div>
              <h2 className="font-display font-extrabold text-2xl text-foreground mb-3">
                Спасибо! Заявка отправлена.
              </h2>
              <p className="text-foreground/70 leading-relaxed">
                Мы свяжемся с вами в ближайшее время.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="btn-outline mt-6 h-10 px-5 font-semibold text-sm"
              >
                Отправить ещё одну заявку
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section id="enrollment" className="section-padding relative overflow-hidden">
      <FloatingDecorations />
      <div
        className="absolute top-1/4 -left-32 w-80 h-80 rounded-full bg-brand-warm/8 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div className="container-max relative z-10">
        <div className="grid lg:grid-cols-[1fr_1.25fr] gap-8 lg:gap-12 items-start">
          {/* Левая колонка — заголовок и быстрые контакты */}
          <Reveal>
            <div className="lg:sticky lg:top-24">
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm-ink mb-3">
                Запись
              </p>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground text-balance leading-[1.15]">
                Записаться или задать вопрос
              </h2>
              <p className="mt-4 text-base text-foreground/70 leading-relaxed max-w-md">
                Оставьте имя и контакт — перезвоним или напишем в течение рабочего дня,
                ответим на вопросы и подберём направление. Никакого спама.
              </p>

              {/* Быстрые контакты — пилюли: иконка в цветном круге, при наведении
                  пилюля приподнимается, рамка теплеет и появляется свечение. */}
              <div className="mt-7 flex flex-col sm:flex-row lg:flex-col gap-3 max-w-md">
                <a
                  href={content.siteConfig.phoneHref}
                  className="pill-contact flex-1 justify-center lg:justify-start"
                >
                  <span className="grid place-items-center w-9 h-9 rounded-full bg-brand-warm/12 ring-1 ring-brand-warm/25 flex-shrink-0">
                    <Phone className="w-4 h-4 text-brand-warm-ink" />
                  </span>
                  <span className="font-semibold text-sm text-foreground tabular-nums">
                    {content.siteConfig.phone}
                  </span>
                </a>
                {/* MAX первым — надёжный канал; бирюзовая подложка у него и в
                    других блоках, VK — тёплой. */}
                {content.siteConfig.maxUrl && (
                  <a
                    href={content.siteConfig.maxUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pill-contact flex-1 justify-center lg:justify-start"
                  >
                    <span className="grid place-items-center w-9 h-9 rounded-full bg-brand-teal/12 ring-1 ring-brand-teal/25 flex-shrink-0">
                      <MessageCircle className="w-4 h-4 text-brand-teal-ink" />
                    </span>
                    <span className="font-semibold text-sm text-foreground">Написать в MAX</span>
                  </a>
                )}
                <a
                  href={content.siteConfig.vkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill-contact flex-1 justify-center lg:justify-start"
                >
                  <span className="grid place-items-center w-9 h-9 rounded-full bg-brand-warm/12 ring-1 ring-brand-warm/25 flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-brand-warm-ink" />
                  </span>
                  <span className="font-semibold text-sm text-foreground">Написать в VK</span>
                </a>
              </div>

              <p className="mt-4 flex items-center gap-2 text-sm text-foreground/70">
                <Clock className="w-4 h-4 text-brand-warm-ink flex-shrink-0" />
                {content.siteConfig.workingHoursShort} · по предварительной записи
              </p>
            </div>
          </Reveal>

          {/* Правая колонка — компактная форма */}
          <Reveal delay={0.1}>
            <form
              onSubmit={handleSubmit}
              className="glass rounded-2xl p-5 sm:p-7 space-y-4"
            >
              {/* Honeypot: скрыт от людей, приманка для ботов. Не трогать. */}
              <div aria-hidden="true" className="absolute w-0 h-0 overflow-hidden opacity-0 pointer-events-none select-none" tabIndex={-1}>
                <label htmlFor="company_website">Не заполнять это поле</label>
                <input
                  ref={honeypotRef}
                  type="text"
                  id="company_website"
                  name="company_website"
                  tabIndex={-1}
                  autoComplete="off"
                  defaultValue=""
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  id="parentName"
                  label="Ваше имя"
                  icon={User}
                  autoComplete="name"
                  required
                  value={form.parentName}
                  onChange={handleChange}
                />
                <Field
                  id="childAge"
                  label="Возраст ребёнка"
                  icon={Baby}
                  required
                  value={form.childAge}
                  onChange={handleChange}
                />
              </div>

              {/* Select: значение всегда либо выбрано, либо пустое — ловить
                  :placeholder-shown здесь не на что, поэтому лейбл держим
                  всплывшим всегда (модификатор --filled). */}
              <div className="field">
                <select
                  id="interest"
                  name="interest"
                  required
                  value={form.interest}
                  onChange={handleChange}
                  className={cn("field-input field-input--filled appearance-none pr-10 cursor-pointer")}
                >
                  <option value="" disabled>
                    Выберите направление
                  </option>
                  {content.enrollmentInterests.map((interest) => (
                    <option key={interest} value={interest}>
                      {interest}
                    </option>
                  ))}
                </select>
                <Compass className="field-icon" aria-hidden />
                <label htmlFor="interest" className="field-label">
                  Что вас интересует? <span className="text-destructive">*</span>
                </label>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>

              <Field
                id="contact"
                label="Телефон или способ связи"
                icon={Phone}
                autoComplete="tel"
                required
                value={form.contact}
                onChange={handleChange}
              />

              <Field
                id="comment"
                label="Комментарий (необязательно)"
                icon={MessageSquare}
                as="textarea"
                rows={3}
                value={form.comment}
                onChange={handleChange}
              />

              {/* Согласие: accent-color красит нативный чекбокс брендом, а
                  color-scheme: dark в тёмной теме делает его тёмным — раньше
                  галочка оставалась системно-синей на графите. */}
              <label htmlFor="consent" className="flex items-start gap-2.5 cursor-pointer py-2.5 -my-2.5">
                <input
                  type="checkbox"
                  id="consent"
                  name="consent"
                  checked={form.consent}
                  onChange={handleChange}
                  className="mt-0.5 w-[18px] h-[18px] rounded-md border-border cursor-pointer flex-shrink-0 accent-[hsl(var(--brand-warm))]"
                />
                <span className="text-xs text-foreground/70 leading-relaxed">
                  Согласен(на) на обработку персональных данных согласно{" "}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-warm-ink underline decoration-brand-warm/40 decoration-1 underline-offset-2 hover:decoration-brand-warm">
                    политике конфиденциальности
                  </a>
                </span>
              </label>

              {status === "error" && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/25" role="alert">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{errorMsg}</p>
                </div>
              )}

              <button type="submit" disabled={status === "loading"} className="btn-cta w-full h-12 font-semibold text-sm">
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Отправляем…
                  </>
                ) : (
                  <>
                    <Send className="btn-arrow w-4 h-4" />
                    Отправить заявку
                  </>
                )}
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
