import type { Metadata } from "next";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description: "Политика конфиденциальности учебно-развивающей студии «Сфера» в Горячем Ключе.",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-neutral max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground mb-6">
        Политика конфиденциальности
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Последнее обновление: {new Date().getFullYear()}
      </p>

      <div className="space-y-6 text-foreground/80 leading-relaxed">
        <p>
          Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных
          пользователей сайта {siteConfig.fullName} (далее — «Студия»).
        </p>

        <h2 className="font-display font-bold text-xl text-foreground">1. Общие положения</h2>
        <p>
          Использование сайта означает безоговорочное согласие пользователя с настоящей Политикой
          и указанными в ней условиями обработки персональных данных.
        </p>

        <h2 className="font-display font-bold text-xl text-foreground">2. Состав персональных данных</h2>
        <p>
          Пользователь, заполняя форму записи на сайте, предоставляет следующие персональные данные:
          имя, возраст ребёнка, контактную информацию (телефон, мессенджер или социальная сеть),
          а также дополнительный комментарий по желанию.
        </p>

        <h2 className="font-display font-bold text-xl text-foreground">3. Цели обработки</h2>
        <p>
          Персональные данные обрабатываются исключительно для связи с пользователем по вопросам
          записи на занятия, консультации и предоставления информации о деятельности Студии.
        </p>

        <h2 className="font-display font-bold text-xl text-foreground">4. Условия обработки</h2>
        <p>
          Обработка персональных данных осуществляется на основе принципов законности и добросовестности.
          Студия не передаёт персональные данные третьим лицам без согласия пользователя,
          за исключением случаев, предусмотренных законодательством РФ.
        </p>

        <h2 className="font-display font-bold text-xl text-foreground">5. Хранение и защита</h2>
        <p>
          Студия принимает необходимые организационные и технические меры для защиты персональных
          данных от неправомерного доступа, изменения или уничтожения.
        </p>

        <h2 className="font-display font-bold text-xl text-foreground">6. Права пользователя</h2>
        <p>
          Пользователь имеет право на доступ к своим персональным данным, их исправление,
          блокирование или удаление. Для реализации этих прав необходимо связаться со Студией
          по телефону {siteConfig.phone} или через социальную сеть {siteConfig.vkDisplay}.
        </p>

        <h2 className="font-display font-bold text-xl text-foreground">7. Контакты</h2>
        <p>
          {siteConfig.fullName}
          <br />
          {siteConfig.city}, {siteConfig.address}
          <br />
          Телефон: {siteConfig.phone}
          <br />
          VK: {siteConfig.vkDisplay}
        </p>
      </div>
    </article>
  );
}
