import type { Metadata } from "next";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description: "Политика конфиденциальности учебно-развивающей студии «Сфера» в Горячем Ключе — обработка ПДн, cookies, фотографии.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-neutral max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-foreground mb-6 break-words">
        Политика конфиденциальности
      </h1>
      <p className="text-sm text-muted-foreground mb-10">
        Последнее обновление: {new Date().getFullYear()} г.
      </p>

      <div className="space-y-8 text-foreground/80 leading-relaxed">
        <p>
          Настоящая Политика конфиденциальности определена в соответствии с Федеральным законом
          от 27.07.2006 № 152-ФЗ «О персональных данных» и регулирует порядок обработки и защиты
          персональных данных пользователей сайта{" "}
          <strong className="text-foreground">{siteConfig.fullName}</strong>{" "}
          (далее — «Студия»). Политика действует в отношении всей информации, которую Студия может
          получить о посетителе во время использования сайта.
        </p>

        <section>
          <h2 className="font-display font-bold text-xl text-foreground">1. Какие данные мы собираем</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>При записи на занятия:</strong> имя родителя, возраст ребёнка, контактный телефон или адрес мессенджера, выбор направления, комментарий (по желанию).</li>
            <li><strong>Через cookies:</strong> технические параметры (предпочтения темы, статус согласия на аналитику), счётчики посещений.</li>
            <li><strong>Через localStorage:</strong> выбор цветовой темы сайта и разрешение на использование анимаций.</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            Мы не собираем специальные категории персональных данных (расовая, политическая
            принадлежность, состояние здоровья, биометрия) и не осуществляем автоматизированное
            принятие решений, существенно затрагивающих права пользователей.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-xl text-foreground">2. Цели обработки</h2>
          <p>
            Персональные данные обрабатываются исключительно для следующих целей:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Связь с родителем (законным представителем) по вопросам записи на занятия;</li>
            <li>Консультирование по выбору направления и формата занятий;</li>
            <li>Информирование о деятельности Студии (с согласия пользователя);</li>
            <li>Анализ посещаемости сайта для улучшения его удобства (через Яндекс.Метрику).</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-bold text-xl text-foreground">3. Cookies и средства аналитики</h2>
          <p>
            Сайт использует файлы cookie и средства аналитики (в частности,{" "}
            <a href="https://metrika.yandex.ru" target="_blank" rel="noopener noreferrer" className="text-brand-warm-ink hover:underline">
              Яндекс.Метрику
            </a>
            ) для понимания того, как посетители взаимодействуют с ресурсом, и улучшения его удобства.
            Cookie не позволяют идентификации пользователя лично; они хранят только технические
            параметры (предпочтения темы, согласие на аналитику, счётчики посещений).
          </p>
          <p>
            Установка Яндекс.Метрики и связанных с ней cookie происходит только после получения
            явного согласия пользователя через баннер на первой странице сайта. Согласие можно
            отозвать в любой момент, выбрав «Не принимать» в том же баннере; после этого Метрика
            перестаёт собирать данные. Полное удаление cookie осуществляется через настройки
            браузера.
          </p>
          <p>
            Помимо cookies, сайт использует локальное хранилище браузера (localStorage) для
            сохранения технических настроек пользователя: выбор цветовой темы и разрешение на
            использование анимаций. Эти данные не передаются на сервер и не используются
            для идентификации личности.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-xl text-foreground">4. Фотографии несовершеннолетних</h2>
          <p>
            На сайте могут публиковаться фотографии детей, занимающихся в студии, в том числе
            в разделах «Галерея» и «Новости». Размещение таких материалов осуществляется при
            наличии согласия законных представителей (родителей/опекунов) ребёнка. Если вы
            считаете, что какая-либо фотография опубликована без согласия, пожалуйста, сообщите
            нам по телефону <strong className="text-foreground">{siteConfig.phone}</strong> —
            мы оперативно удалим материал.
          </p>
          <p className="text-sm text-muted-foreground">
            В соответствии со ст. 152.1 Гражданского кодекса РФ использование изображения
            гражданина допускается только с его согласия, а после его смерти — с согласия
            лиц, являвшихся его близкими родственниками.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-xl text-foreground">5. Хранение и защита данных</h2>
          <p>
            Персональные данные, переданные через форму записи, хранятся в базе данных{" "}
            <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-brand-warm-ink hover:underline">
              Supabase
            </a>
            {" "}на серверах, расположенных на территории Российской Федерации. Данные шифруются
            при передаче (TLS) и хранятся с применением мер защиты от несанкционированного
            доступа.
          </p>
          <p>
            Срок хранения персональных данных — до момента отзыва согласия или достижения цели
            обработки (связь с родителями по вопросу записи). По достижении цели данные
            анонимируются или удаляются, за исключением случаев, предусмотренных
            законодательством РФ.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-xl text-foreground">6. Права субъекта персональных данных</h2>
          <p>
            В соответствии со ст. 14 152-ФЗ вы имеете право:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Получить информацию о том, какие ваши данные обрабатываются, с какой целью и на каком основании;</li>
            <li>Требовать уточнения, блокирования или уничтожения ваших персональных данных;</li>
            <li>Отозвать данное ранее согласие на обработку — направив письменное заявление по телефону{" "}
              <a href={`tel:${siteConfig.phoneHref.replace("tel:", "")}`} className="text-brand-warm-ink hover:underline">
                {siteConfig.phone}
              </a>{" "}
              или через{" "}
              <a href={siteConfig.vkUrl} target="_blank" rel="noopener noreferrer" className="text-brand-warm-ink hover:underline">
                {siteConfig.vkDisplay}
              </a>
              {siteConfig.maxUrl ? ` или в мессенджере MAX` : ""}
              ;
            </li>
            <li>Обжаловать действия или бездействие Студии в уполномоченный орган по защите прав
              субъектов персональных данных —{" "}
              <a href="https://rkn.gov.ru/" target="_blank" rel="noopener noreferrer" className="text-brand-warm-ink hover:underline">
                Роскомнадзор
              </a>
              .
            </li>
          </ul>
          <p>
            Студия рассматривает обращения о реализации прав в течение 10 рабочих дней с момента
            получения и сообщает заявителю о результатах.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-xl text-foreground">7. Передача данных третьим лицам</h2>
          <p>
            Студия не продаёт, не обменивает и не передает персональные данные третьим лицам
            без согласия пользователя, за исключением следующих случаев:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Передача данных в мессенджер MAX или VK для ответа на заявку (если пользователь указал этот канал связи);</li>
            <li>Передача данных в Telegram для отправки уведомления администратору (только если настроен бот);</li>
            <li>Передача данных по запросу суда или уполномоченных государственных органов в порядке, предусмотренном законодательством РФ.</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            Яндекс.Метрика получает обезличенные данные о поведении на сайте (без указания
            ФИО, телефона и иных идентифицирующих данных). Полная политика Яндекса —{" "}
            <a href="https://yandex.ru/legal/metrika_termsofuse/" target="_blank" rel="noopener noreferrer" className="text-brand-warm-ink hover:underline">
              yandex.ru/legal/metrika_termsofuse
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-xl text-foreground">8. Контакты</h2>
          <p>
            <strong className="text-foreground">{siteConfig.fullName}</strong>
            <br />
            {siteConfig.city}, {siteConfig.address}
            <br />
            Телефон: <a href={`tel:${siteConfig.phoneHref}`} className="text-brand-warm-ink hover:underline">{siteConfig.phone}</a>
            <br />
            VK:{" "}
            <a href={siteConfig.vkUrl} target="_blank" rel="noopener noreferrer" className="text-brand-warm-ink hover:underline">
              {siteConfig.vkDisplay}
            </a>
            {siteConfig.maxUrl && (
              <>
                <br />
                MAX Messenger:{" "}
                <a
                  href={siteConfig.maxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-warm-ink hover:underline"
                >
                  написать в чат
                </a>
              </>
            )}
          </p>
        </section>

        <section className="pt-6 border-t border-border/60">
          <p className="text-xs text-muted-foreground">
            Настоящая политика может быть изменена. Изменения вступают в силу с момента
            публикации новой редакции на сайте. Действующая версия всегда доступна по адресу{" "}
            <a href="/privacy" className="text-brand-warm-ink hover:underline">/privacy</a>.
          </p>
        </section>
      </div>
    </article>
  );
}