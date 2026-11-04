"use client";

import { Phone, MessageCircle, MapPin, Navigation, Clock, ExternalLink } from "lucide-react";
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
    // Порядок отражает реальность связи: из мессенджеров в России штатно работает
    // MAX, поэтому он идёт первым, а VK — как соцсеть, вторым. Если ссылки в
    // настройках нет, строку не показываем (пустая ссылка = битая кнопка).
    ...(content.siteConfig.maxUrl
      ? [
          {
            icon: MessageCircle,
            tone: "teal" as const,
            label: "Мессенджер",
            value: "MAX Messenger",
            href: content.siteConfig.maxUrl,
            external: true,
          },
        ]
      : []),
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
                  {content.siteConfig.maxUrl && (
                    <a
                      href={content.siteConfig.maxUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline h-12 px-5 font-semibold text-sm flex-1"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Написать в MAX
                    </a>
                  )}
                  <a
                    href={content.siteConfig.vkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline h-12 px-5 font-semibold text-sm flex-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Написать в VK
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

          {/* Карта — без рекламы, обёрнутая в прямую ссылку на Яндекс Карты */}
          <Reveal delay={0.1}>
            <div className="relative w-full h-full min-h-[420px] lg:min-h-0 rounded-2xl overflow-hidden glass p-1.5 flex flex-col">
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                title="Открыть расположение на Яндекс Картах"
                className="group relative block w-full flex-1 min-h-[380px] rounded-xl overflow-hidden bg-muted cursor-pointer"
              >
                {/* Фоновая карта высокого разрешения */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/map-sfera.png"
                  alt={`Карта проезда: ${content.siteConfig.city}, ${content.siteConfig.address}`}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                {/* Легкое затемнение при наведении */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                {/* Фирменная карточка-метка */}
                <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-xs z-10 pointer-events-none">
                  <div className="bg-card/95 backdrop-blur-md border border-border/80 shadow-lg rounded-xl p-3 sm:p-3.5 transition-transform duration-300 group-hover:-translate-y-0.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold text-sm">
                        СФ
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-foreground truncate">
                          {content.siteConfig.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {content.siteConfig.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Плашка действия внизу карты */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card/95 backdrop-blur-md border border-border/80 text-xs font-semibold text-foreground shadow-md transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    Открыть в Яндекс Картах
                    <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur text-[11px] text-white/90">
                    Нажмите для перехода
                  </span>
                </div>
              </a>
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
