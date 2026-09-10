"use client";

import { useState, type FormEvent } from "react";
import { Send, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { enrollmentInterests, siteConfig } from "@/data/site";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase-client";

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

export function EnrollmentForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

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
      const { error: insertError } = await supabase.from("enrollments").insert({
        parent_name: form.parentName,
        child_age: form.childAge,
        interest: form.interest,
        contact: form.contact,
        comment: form.comment,
      });

      if (insertError) throw insertError;

      setStatus("success");
      setForm(initialState);
    } catch {
      setStatus("error");
      setErrorMsg("Не удалось отправить заявку. Пожалуйста, позвоните нам или напишите во VK.");
    }
  };

  if (status === "success") {
    return (
      <section id="enrollment" className="section-padding relative overflow-hidden">
        <div className="container-max relative z-10">
          <Reveal>
            <div className="max-w-xl mx-auto text-center bg-card rounded-3xl p-8 sm:p-12 border border-border/60 shadow-lg">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground mb-4">
                Спасибо! Заявка отправлена.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Мы получили ваши данные для связи и свяжемся с вами в ближайшее время.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-8 inline-flex items-center justify-center h-11 px-6 rounded-full border-2 border-border text-foreground font-semibold text-sm hover:border-primary hover:text-primary transition-colors"
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
      <div
        className="absolute top-1/4 -left-32 w-80 h-80 rounded-full bg-brand-warm/8 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div className="container-max relative z-10">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <div className="text-center mb-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm mb-3">
                Запись
              </p>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance leading-[1.15]">
                Записаться в «Сферу»
              </h2>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Заполните форму — и мы свяжемся с вами, чтобы ответить на вопросы и подобрать направление.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <form
              onSubmit={handleSubmit}
              className="bg-card rounded-3xl p-6 sm:p-8 border border-border/60 shadow-lg space-y-5"
            >
              {/* Имя родителя */}
              <div>
                <label htmlFor="parentName" className="block text-sm font-medium text-foreground mb-2">
                  Ваше имя <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="parentName"
                  name="parentName"
                  required
                  value={form.parentName}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  placeholder="Как вас зовут?"
                />
              </div>

              {/* Возраст ребёнка */}
              <div>
                <label htmlFor="childAge" className="block text-sm font-medium text-foreground mb-2">
                  Возраст ребёнка <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="childAge"
                  name="childAge"
                  required
                  value={form.childAge}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  placeholder="Например: 7 лет"
                />
              </div>

              {/* Интересующее направление */}
              <div>
                <label htmlFor="interest" className="block text-sm font-medium text-foreground mb-2">
                  Что вас интересует? <span className="text-destructive">*</span>
                </label>
                <select
                  id="interest"
                  name="interest"
                  required
                  value={form.interest}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                >
                  <option value="" disabled>
                    Выберите направление
                  </option>
                  {enrollmentInterests.map((interest) => (
                    <option key={interest} value={interest}>
                      {interest}
                    </option>
                  ))}
                </select>
              </div>

              {/* Телефон / способ связи */}
              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-foreground mb-2">
                  Телефон или способ связи <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="contact"
                  name="contact"
                  required
                  value={form.contact}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  placeholder="Телефон, WhatsApp, Telegram или VK"
                />
              </div>

              {/* Комментарий */}
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-foreground mb-2">
                  Комментарий <span className="text-muted-foreground font-normal">(необязательно)</span>
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  rows={3}
                  value={form.comment}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none"
                  placeholder="Дополнительные вопросы или пожелания"
                />
              </div>

              {/* Согласие */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  name="consent"
                  checked={form.consent}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 rounded border-input text-primary focus:ring-ring cursor-pointer"
                />
                <label htmlFor="consent" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                  Я согласен(на) на обработку персональных данных в соответствии с{" "}
                  <a href="/privacy" className="text-brand-warm hover:text-primary underline-offset-4 hover:underline">
                    политикой конфиденциальности
                  </a>
                </label>
              </div>

              {/* Ошибка */}
              {status === "error" && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{errorMsg}</p>
                </div>
              )}

              {/* Кнопка отправки */}
              <button
                type="submit"
                disabled={status === "loading"}
                className={cn(
                  "w-full h-13 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-base",
                  "hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  "inline-flex items-center justify-center gap-2"
                )}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Отправляем…
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Отправить заявку
                  </>
                )}
              </button>

              <p className="text-center text-xs text-muted-foreground">
                Или позвоните нам:{" "}
                <a href={siteConfig.phoneHref} className="font-medium text-brand-warm hover:text-primary transition-colors">
                  {siteConfig.phone}
                </a>
              </p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
