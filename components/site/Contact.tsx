"use client";

import { useEffect, useRef } from "react";
import { Phone, MessageCircle, MapPin, Navigation, Clock } from "lucide-react";
import { useContent } from "./ContentContext";

import { Reveal } from "./Reveal";

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

  return (
    <section id="contacts" className="section-padding bg-brand-cream/50 relative overflow-hidden">
      <div className="container-max relative z-10">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-warm mb-3">
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
              <div className="bg-card rounded-2xl p-6 border border-border/60">
                <h3 className="font-display font-bold text-lg text-foreground mb-4">
                  {content.siteConfig.fullName}
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-warm/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-brand-warm" />
                    </div>
                    <div className="min-h-[44px] flex flex-col justify-center">
                      <p className="text-sm text-muted-foreground">Адрес</p>
                      <p className="text-base font-medium text-foreground">
                        {content.siteConfig.city}, {content.siteConfig.address}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{content.siteConfig.addressDetails}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-warm/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-brand-warm" />
                    </div>
                    <div className="min-h-[44px] flex flex-col justify-center">
                      <p className="text-sm text-muted-foreground">Телефон</p>
                      <a
                        href={content.siteConfig.phoneHref}
                        className="text-base font-medium text-foreground hover:text-brand-warm transition-colors inline-flex items-center min-h-[28px]"
                      >
                        {content.siteConfig.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-warm/10 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-brand-warm" />
                    </div>
                    <div className="min-h-[44px] flex flex-col justify-center">
                      <p className="text-sm text-muted-foreground">Социальная сеть</p>
                      <a
                        href={content.siteConfig.vkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-medium text-foreground hover:text-brand-warm transition-colors inline-flex items-center min-h-[28px]"
                      >
                        {content.siteConfig.vkDisplay}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-warm/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-brand-warm" />
                    </div>
                    <div className="min-h-[44px] flex flex-col justify-center">
                      <p className="text-sm text-muted-foreground">Режим работы</p>
                      <p className="text-base font-medium text-foreground">
                        {content.siteConfig.workingHoursShort}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">По предварительной записи</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <a
                    href={content.siteConfig.phoneHref}
                    className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex-1"
                  >
                    <Phone className="w-4 h-4" />
                    Позвонить
                  </a>
                  <a
                    href={content.siteConfig.vkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border-2 border-border text-foreground font-semibold text-sm hover:border-primary hover:text-primary transition-colors flex-1"
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
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-card border border-border/60 text-foreground font-medium text-sm hover:bg-accent transition-colors flex-1"
                >
                  <MapPin className="w-4 h-4 text-brand-warm" />
                  Открыть на карте
                </a>
                <a
                  href={routeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-card border border-border/60 text-foreground font-medium text-sm hover:bg-accent transition-colors flex-1"
                >
                  <Navigation className="w-4 h-4 text-brand-warm" />
                  Построить маршрут
                </a>
              </div>
            </div>
          </Reveal>

          {/* Карта — конструктор Яндекса */}
          <Reveal delay={0.1}>
            <div className="relative w-full h-full min-h-[420px] lg:min-h-0 rounded-3xl overflow-hidden border border-border/60 shadow-lg">
              <style
                dangerouslySetInnerHTML={{
                  __html:
                    ".ymaps-constructor>iframe{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;border:0!important;}",
                }}
              />
              <div ref={mapRef} className="ymaps-constructor absolute inset-0" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
