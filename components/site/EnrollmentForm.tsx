"use client";

import { useState, useEffect, type FormEvent } from "react";
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
} from "lucide-react";
import { useContent } from "./ContentContext";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

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

const inputClass =
  "w-full h-11 px-3.5 text-sm rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-transparent transition-all";

export function EnrollmentForm() {
  const content = useContent();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

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
      return;
    }
    setStatus("loading");
    setErrorMsg("");

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
        }),
      });

      if (!res.ok) throw new Error("Insert failed");

      setStatus("success");
      setForm(initialState);
    } catch {
      setStatus("error");
      setErrorMsg("Не удалось отправить заявку. Пожалуйста, позвоните нам или напишите в VK.");
    }
  };

  if (status === "success") {
    return (
      <section id="enrollment" className="relative py-16 md:py-20 overflow-hidden">
        <div className="container-max relative z-10">
          <Reveal>
            <div className="max-w-md mx-auto text-center bg-card rounded-2xl p-7 sm:p-9 border border-border/60 shadow-lg">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="font-display font-extrabold text-2xl text-foreground mb-3">
                Спасибо! Заявка отправлена.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Мы свяжемся с вами в ближайшее время.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-6 inline-flex items-center justify-center h-10 px-5 rounded-full border-2 border-border text-foreground font-semibold text-sm hover:border-primary hover:text-primary transition-colors"
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
    <section id="enrollment" className="relative py-16 md:py-20 overflow-hidden">
      <div
        className="absolute top-1/4 -left-32 w-80 h-80 rounded-full bg-brand-warm/8 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div className="container-max relative z-10">
        <div className="grid lg:grid-cols-[1fr_1.25fr] gap-8 lg:gap-12 items-start">
          {/* Левая колонка — заголовок и быстрые контакты */}
          <Reveal>
            <div className="lg:sticky lg:top-24">
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm mb-3">
                Запись
              </p>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground text-balance leading-[1.15]">
                Записаться в «Сферу»
              </h2>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-md">
                Заполните форму — ответим на вопросы и подберём направление.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row lg:flex-col gap-3 max-w-md">
                <a
                  href={content.siteConfig.phoneHref}
                  className="inline-flex items-center gap-3 h-12 px-5 rounded-xl bg-card border border-border/60 font-medium text-sm text-foreground hover:bg-accent transition-colors flex-1"
                >
                  <span className="w-8 h-8 rounded-lg bg-brand-warm/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-brand-warm" />
                  </span>
                  {content.siteConfig.phone}
                </a>
                <a
                  href={content.siteConfig.vkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 h-12 px-5 rounded-xl bg-card border border-border/60 font-medium text-sm text-foreground hover:bg-accent transition-colors flex-1"
                >
                  <span className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-brand-teal" />
                  </span>
                  Написать в VK
                </a>
                {content.siteConfig.maxUrl && (
                  <a
                    href={content.siteConfig.maxUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 h-12 px-5 rounded-xl bg-card border border-border/60 font-medium text-sm text-foreground hover:bg-accent transition-colors flex-1"
                  >
                    <span className="w-8 h-8 rounded-lg bg-brand-warm/10 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-4 h-4 text-brand-warm" />
                    </span>
                    Написать в MAX
                  </a>
                )}
              </div>

              <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 text-brand-warm flex-shrink-0" />
                {content.siteConfig.workingHoursShort} · по предварительной записи
              </p>
            </div>
          </Reveal>

          {/* Правая колонка — компактная форма */}
          <Reveal delay={0.1}>
            <form
              onSubmit={handleSubmit}
              className="bg-card rounded-2xl p-5 sm:p-6 border border-border/60 shadow-lg space-y-4"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="parentName" className="block text-xs font-medium text-foreground mb-1.5">
                    Ваше имя <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    id="parentName"
                    name="parentName"
                    required
                    value={form.parentName}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Как вас зовут?"
                  />
                </div>
                <div>
                  <label htmlFor="childAge" className="block text-xs font-medium text-foreground mb-1.5">
                    Возраст ребёнка <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    id="childAge"
                    name="childAge"
                    required
                    value={form.childAge}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Например: 7 лет"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="interest" className="block text-xs font-medium text-foreground mb-1.5">
                  Что вас интересует? <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <select
                    id="interest"
                    name="interest"
                    required
                    value={form.interest}
                    onChange={handleChange}
                    className={cn(inputClass, "appearance-none pr-10 cursor-pointer")}
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
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="contact" className="block text-xs font-medium text-foreground mb-1.5">
                  Телефон или способ связи <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="contact"
                  name="contact"
                  required
                  value={form.contact}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Телефон, WhatsApp, Telegram или VK"
                />
              </div>

              <div>
                <label htmlFor="comment" className="block text-xs font-medium text-foreground mb-1.5">
                  Комментарий <span className="text-muted-foreground font-normal">(необязательно)</span>
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  rows={2}
                  value={form.comment}
                  onChange={handleChange}
                  className={cn(inputClass, "h-auto py-2.5 resize-none")}
                  placeholder="Дополнительные вопросы или пожелания"
                />
              </div>

              <label htmlFor="consent" className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  id="consent"
                  name="consent"
                  checked={form.consent}
                  onChange={handleChange}
                  className="mt-0.5 w-4 h-4 rounded border-input text-primary focus:ring-ring cursor-pointer flex-shrink-0"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  Согласен(на) на обработку персональных данных согласно{" "}
                  <a href="/privacy" className="text-brand-warm hover:text-primary underline-offset-4 hover:underline">
                    политике конфиденциальности
                  </a>
                </span>
              </label>

              {status === "error" && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{errorMsg}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className={cn(
                  "w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold text-sm",
                  "hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]",
                  "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100",
                  "inline-flex items-center justify-center gap-2"
                )}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Отправляем…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
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
