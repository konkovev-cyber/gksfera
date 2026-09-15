"use client";

import { useEffect, useRef } from "react";
import { Phone, MessageCircle, MapPin, Navigation, Clock } from "lucide-react";
import { useContent } from "./ContentContext";

import { Reveal } from "./Reveal";

/**
 * «Где нас найти» — та же стеклоткань, что и в форме записи: слева стеклянная
 * карточка с волосяными разделителями, справа карта в такой же рамке. Секция
 * больше не лежит на кремовой полосе: поверх mesh-фона полосы читались
 * инородными, а стеклу нужен прозрачный задник, чтобы blur было видно.
 * Иконки в кружках — brand-warm на 12% и «чернильный» знак: сам янтарь как
 * мелкий текст на белом даёт 2.46:1.
 */
export function Contact() {
  const content = useContent();
  const mapsLink = `https://yandex.ru/maps/?text=${encodeURIComponent(content.siteConfig.mapQuery)}`;
  const routeLink = `https://yandex.ru/maps/?rtext=~${encodeURIComponent(content.siteConfig.mapQuery)}`;
  const mapRef = useRef<HTMLDivElement>(null);

  // Официальный скрипт конструктора карт Яндекса (точное расположение студии).
  // Созданную скриптом карту (500x400) растягиваем на весь контейнер через CSS.
  useEffect(() => {
    const container = mapRef.current;
    if (!container) return;
    container.innerHTML = "";
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.charset = "utf-8";
    script.async = true;
    script.src =
      "https://api-maps.yandex.ru/services/constructor/1.0/js/?um=constructor%3Ad3f3eb39182b3e71170e5ef69aed2b44de44fcead1b8d9d1786563aa6328b3fe&width=500&height=400&lang=ru_RU&scroll=true";
    container.appendChild(script);
    return () => {
      container.innerHTML = "";
    };
  }, []);

  const rows = [
    {
      icon: MapPin,
      tone: "warm" as const,
      label: "Адрес",
      value: `${content.siteConfig.city}, ${content.siteConfig.address}`,
      note: content.siteConfig.addressDetails,
    },
    {
      icon: Phone,
      tone: "warm" as const,
      label: "Телефон",
      value: content.siteConfig.phone,
      href: content.siteConfig.phoneHref,
    },
    {
      icon: MessageCircle,
      tone: "teal" as const,
      label: "Социальная сеть",
      value: content.siteConfig.vkDisplay,
      href: content.siteConfig.vkUrl,
      external: true,
    },
    {
      icon: Clock,
      tone: "teal" as const,
      label: "Режим работы",
      value: content.siteConfig.workingHoursShort,
      note: "По предварительной записи",
    },
  ];

  return (
    <section id="contacts" className="section-padding relative overflow-hidden">
      {/* Световые пятна задника — те же, что в блоке доверия */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-20 -top-10 h-72 w-72 rounded-full bg-brand-warm/12 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-brand-teal/12 blur-3xl" />
      </div>

      <div className="container-max relative z-10">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm-ink mb-3">
            Контакты
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground text-balance leading-[1.15]">
            Где нас найти
          </h2>
        </Reveal>

        <div className="mt-12 grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Контактная информация */}
          <Reveal>
            <div className="flex flex-col gap-5">
              <div className="glass rounded-2xl p-6 sm:p-7">
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  {content.siteConfig.fullName}
                </h3>

                <div className="divide-y divide-hairline/60">
                  {rows.map(({ icon: Icon, tone, label, value, note, href, external }) => (
                    <div key={label} className="flex items-start gap-3.5 py-4 first:pt-2 last:pb-0">
                      <div
                        className={cnIcon(tone)}
                        aria-hidden
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-h-[44px] flex flex-col justify-center">
                        <p className="text-xs uppercase tracking-wider font-semibold text-foreground/60">
                          {label}
                        </p>
                        {href ? (
                          <a
                            href={href}
                            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            className="text-base font-medium text-foreground hover:text-brand-warm-ink dark:hover:text-brand-warm-ink transition-colors inline-flex items-center min-h-[28px]"
                          >
                            {value}
                          </a>
                        ) : (
                          <p className="text-base font-medium text-foreground">{value}</p>
                        )}
                        {note && (
                          <p className="text-xs text-foreground/60 mt-0.5">{note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <a
                    href={content.siteConfig.phoneHref}
                    className="btn-cta h-12 px-5 font-semibold text-sm flex-1"
                  >
                    <Phone className="w-4 h-4" />
                    Позвонить
                  </a>
                  <a
                    href={content.siteConfig.vkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline h-12 px-5 font-semibold text-sm flex-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Написать
                  </a>
                </div>
              </div>

              {/* Кнопки карты */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill-contact flex-1 justify-center text-sm font-semibold text-foreground"
                >
                  <span className="grid place-items-center w-9 h-9 rounded-full bg-brand-warm/12 ring-1 ring-brand-warm/25 flex-shrink-0">
                    <MapPin className="w-4 h-4 text-brand-warm-ink" />
                  </span>
                  Открыть на карте
                </a>
                <a
                  href={routeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill-contact flex-1 justify-center text-sm font-semibold text-foreground"
                >
                  <span className="grid place-items-center w-9 h-9 rounded-full bg-brand-teal/12 ring-1 ring-brand-teal/25 flex-shrink-0">
                    <Navigation className="w-4 h-4 text-brand-teal-ink" />
                  </span>
                  Построить маршрут
                </a>
              </div>
            </div>
          </Reveal>

          {/* Карта — конструктор Яндекса */}
          <Reveal delay={0.1}>
            <div className="relative w-full h-full min-h-[420px] lg:min-h-0 rounded-2xl overflow-hidden glass p-1.5">
              <style
                dangerouslySetInnerHTML={{
                  __html:
                    ".ymaps-constructor>iframe{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;border:0!important;}",
                }}
              />
              <div
                ref={mapRef}
                className="ymaps-constructor absolute inset-1.5 overflow-hidden rounded-xl bg-surface"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** Кружок иконки: тёплый/холодный акцент, знак — «чернильным» тоном. */
function cnIcon(tone: "warm" | "teal") {
  return tone === "warm"
    ? "flex-shrink-0 grid place-items-center w-10 h-10 rounded-full bg-brand-warm/12 text-brand-warm-ink ring-1 ring-brand-warm/25"
    : "flex-shrink-0 grid place-items-center w-10 h-10 rounded-full bg-brand-teal/12 text-brand-teal-ink ring-1 ring-brand-teal/25";
}
