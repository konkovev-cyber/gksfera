import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Лицензия и реквизиты — студия «Сфера», Горячий Ключ",
  description:
    "Реквизиты учебно-развивающей студии «Сфера»: информация о руководителе, лицензии, адрес, контакты. Горячий Ключ.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/license" },
};

export default function LicensePage() {
  return (
    <article className="prose prose-neutral max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground mb-8">
        Лицензия и реквизиты
      </h1>
      <p className="text-sm text-muted-foreground mb-10">
        Публикуется в соответствии с п. 3 ч. 2 ст. 43 Федерального закона от 29.12.2012 № 273-ФЗ
        «Об образовании в Российской Федерации» и Приказом Минпросвещения России от 29.09.2023 № 711.
      </p>

      <div className="space-y-8 text-foreground/80 leading-relaxed">
        <section>
          <h2 className="font-display font-bold text-xl text-foreground mt-0">1. Сведения об образовательной организации</h2>
          <ul className="space-y-2">
            <li>
              <strong className="text-foreground">Полное наименование:</strong> Учебно-развивающая студия «Сфера»
            </li>
            <li>
              <strong className="text-foreground">Юридический адрес:</strong>{" "}
              Краснодарский край, г. Горячий Ключ, Спортивный переулок, д. 13 (2 этаж)
            </li>
            <li>
              <strong className="text-foreground">Руководитель:</strong>{" "}
              <em>ФИО указывается после внесения в административную панель</em>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-bold text-xl text-foreground">2. Лицензия</h2>
          <p>
            Деятельность по оказанию дополнительных общеобразовательных программ осуществляется
            на основании лицензии на осуществление образовательной деятельности.
          </p>
          <div className="glass rounded-2xl p-6 mt-4">
            <p className="font-mono text-sm text-foreground/70">
              <strong>Номер лицензии:</strong> <em>указывается после загрузки скана в админку</em>
            </p>
            <p className="font-mono text-sm text-foreground/70 mt-2">
              <strong>Дата выдачи:</strong> <em>—</em>
            </p>
            <p className="font-mono text-sm text-foreground/70 mt-2">
              <strong>Орган, выдавший лицензию:</strong> <em>—</em>
            </p>
            <p className="font-mono text-sm text-foreground/70 mt-2">
              <strong>Срок действия:</strong> <em>—</em>
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Скан лицензии будет опубликован после загрузки через панель администратора.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-xl text-foreground">3. Образовательные программы</h2>
          <p>
            Студия реализует дополнительные общеобразовательные программы общего развития для детей
            в возрасте от 5 до 15 лет. перечень программ доступен на{" "}
            <a href="/programs" className="text-brand-warm-ink hover:underline">
              странице «Направления»
            </a>
            . Программы не подлежат государственной аккредитации, так как не предусматривают
            выдачу документов государственного образца о квалификации.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-xl text-foreground">4. Количество обучающихся</h2>
          <p>
            В настоящее время обучается более 100 детей. Набор в группы ведётся постоянно.
            Максимальный размер группы — до 8 человек, что обеспечивает индивидуальный подход
            к каждому ребёнку.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-xl text-foreground">5. Платные образовательные услуги</h2>
          <p>
            Стоимость обучения зависит от выбранного направления и формы занятий (групповые,
            индивидуальные). Точную цену и актуальные скидки уточняйте у администратора по
            телефону или через мессенджер.
          </p>
          <p className="text-sm text-muted-foreground">
            📞 <a href="tel:+79284349108" className="text-brand-warm-ink hover:underline">+7 (928) 434-91-08</a>
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-xl text-foreground">6. Доступная среда</h2>
          <p>
            Для обеспечения доступности образования лицам с ограниченными возможностями здоровья
            (ОВЗ) Студия предоставляет:
          </p>
          <ul>
            <li>Помещение на 2-м этаже с лифтом (при наличии)</li>
            <li>Вход без ступеней или с пандусом</li>
            <li>Адаптированные программы при необходимости</li>
            <li>Индивидуальный график занятий</li>
          </ul>
          <p>
            По вопросам организации доступной среды обращайтесь по телефону — мы разработаем
            индивидуальные условия для каждого ребёнка.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-xl text-foreground">7. Контакты</h2>
          <ul className="space-y-1">
            <li>📍 Адрес: Краснодарский край, г. Горячий Ключ, Спортивный переулок, д. 13 (2 этаж)</li>
            <li>📞 Телефон: <a href="tel:+79284349108" className="text-brand-warm-ink hover:underline">+7 (928) 434-91-08</a></li>
            <li>💬 VK: <a href="https://vk.ru/sferaznanei" target="_blank" rel="noopener noreferrer" className="text-brand-warm-ink hover:underline">vk.ru/sferaznanei</a></li>
            <li>📧 Email: <a href="mailto:sfera.gk@mail.ru" className="text-brand-warm-ink hover:underline">sfera.gk@mail.ru</a></li>
          </ul>
        </section>

        <section className="pt-4 border-t border-border/60">
          <p className="text-xs text-muted-foreground">
            Информация обновлена: {new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}.
            Актуальные данные публикуются ежегодно.
          </p>
        </section>
      </div>
    </article>
  );
}