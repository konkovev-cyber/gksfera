import type { Metadata } from "next";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Согласие на обработку персональных данных",
  description: "Согласие на обработку персональных данных учебно-развивающей студии «Сфера» в Горячем Ключе.",
  robots: { index: false, follow: false },
};

export default function ConsentPage() {
  return (
    <article className="prose prose-neutral max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground mb-6">
        Согласие на обработку персональных данных
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Последнее обновление: {new Date().getFullYear()}
      </p>

      <div className="space-y-6 text-foreground/80 leading-relaxed">
        <p>
          Отправляя форму записи на сайте {siteConfig.fullName} (далее — «Студия»),
          пользователь даёт своё согласие на обработку персональных данных на следующих условиях.
        </p>

        <h2 className="font-display font-bold text-xl text-foreground">1. Предмет согласия</h2>
        <p>
          Согласие даётся на обработку следующих персональных данных: имя, возраст ребёнка,
          контактная информация (телефон, мессенджер, социальная сеть), текст комментария.
        </p>

        <h2 className="font-display font-bold text-xl text-foreground">2. Цель обработки</h2>
        <p>
          Обработка осуществляется в целях связи с пользователем для записи на занятия,
          предоставления консультации и информирования о деятельности Студии.
        </p>

        <h2 className="font-display font-bold text-xl text-foreground">3. Способы обработки</h2>
        <p>
          Обработка персональных данных может осуществляться как с использованием средств автоматизации,
          так и без их использования. Персональные данные не передаются третьим лицам без согласия пользователя,
          за исключением случаев, предусмотренных законодательством РФ.
        </p>

        <h2 className="font-display font-bold text-xl text-foreground">4. Срок действия согласия</h2>
        <p>
          Согласие действует до момента его отзыва пользователем. Отзыв согласия осуществляется
          путём направления заявления в Студию по телефону {siteConfig.phone} или через {siteConfig.vkDisplay}.
        </p>

        <h2 className="font-display font-bold text-xl text-foreground">5. Контакты</h2>
        <p>
          {siteConfig.fullName}
          <br />
          {siteConfig.city}, {siteConfig.address}
          <br />
          Телефон: {siteConfig.phone}
        </p>
      </div>
    </article>
  );
}
