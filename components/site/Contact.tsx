"use client";

import { Phone, MessageCircle, MapPin, Navigation, Clock } from "lucide-react";
import { siteConfig } from "@/data/site";
import { Reveal } from "./Reveal";

export function Contact() {
  const mapsLink = `https://yandex.ru/maps/?text=${encodeURIComponent(siteConfig.mapQuery)}`;
  const routeLink = `https://yandex.ru/maps/?rtext=~${encodeURIComponent(siteConfig.mapQuery)}`;
  const mapEmbed = `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(siteConfig.mapQuery)}&z=17`;

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
                  {siteConfig.fullName}
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-warm/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-brand-warm" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Адрес</p>
                      <p className="text-base font-medium text-foreground">
                        {siteConfig.city}, {siteConfig.address}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{siteConfig.addressDetails}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-warm/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-brand-warm" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Телефон</p>
                      <a
                        href={siteConfig.phoneHref}
                        className="text-base font-medium text-foreground hover:text-brand-warm transition-colors"
                      >
                        {siteConfig.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-warm/10 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-brand-warm" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Социальная сеть</p>
                      <a
                        href={siteConfig.vkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-medium text-foreground hover:text-brand-warm transition-colors"
                      >
                        {siteConfig.vkDisplay}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-warm/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-brand-warm" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Режим работы</p>
                      <p className="text-base font-medium text-foreground">
                        {siteConfig.workingHoursShort}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">По предварительной записи</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <a
                    href={siteConfig.phoneHref}
                    className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex-1"
                  >
                    <Phone className="w-4 h-4" />
                    Позвонить
                  </a>
                  <a
                    href={siteConfig.vkUrl}
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

          {/* Карта */}
          <Reveal delay={0.1}>
            <div className="relative aspect-square lg:aspect-auto lg:min-h-[420px] rounded-3xl overflow-hidden border border-border/60 shadow-lg">
              <iframe
                src={mapEmbed}
                className="w-full h-full"
                style={{ border: 0 }}
                title="Карта — Учебно-развивающая студия «Сфера»"
                loading="lazy"
                allowFullScreen
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
