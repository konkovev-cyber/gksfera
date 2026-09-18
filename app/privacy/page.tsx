import type { Metadata } from "next";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description: "Политика конфиденциальности и обработки персональных данных учебно-развивающей студии «Сфера». Полностью соответствует 152-ФЗ.",
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
        Последнее обновление: {new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      <div className="space-y-8 text-foreground/80 leading-relaxed">
        <p>
          Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки и защиты
          персональных данных пользователей сайта{" "}
          <strong className="text-foreground">{siteConfig.fullName}</strong>{" "}
          (домен: <code className="text-sm bg-muted px-1 py-0.5 rounded">gksfera.vercel.app</code>;
          далее — «Сайт»). Политика составлена в соответствии с Федеральным законом
          от 27.07.2006 № 152-ФЗ «О персональных данных» (далее — 152-ФЗ),
          Гражданским кодексом РФ, Конституцией РФ и другими нормативными правовыми актами
          Российской Федерации.
        </p>
        <p>
          Администрация Сайта (далее — «Оператор») гарантирует, что обработка персональных данных
          осуществляется справедливо и законно, только с согласия субъекта персональных данных
          (за исключением случаев, предусмотренных 152-ФЗ), на цели, которые являются заранее
          определёнными и законными.
        </p>

        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="general" aria-labelledby="heading-general">
          <h2 id="heading-general" className="font-display font-bold text-xl text-foreground mt-0">
            1. Общие положения
          </h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Настоящая Политика применяется ко всему Сайту Оператора. Сайт не предназначен для
              детей младше 15 лет. Принадлежности и использование Сайта регулируются условиями
              настоящей Политики, Пользовательского соглашения и иными нормативными документами.
            </li>
            <li>
              Оператор ставит своей важнейшей целью и условием осуществления своей деятельности
              соблюдение прав и свобод человека и гражданина при обработке его персональных данных,
              в том числе защиту прав на неприкосновенность частной жизни, личную и семейную тайну.
            </li>
            <li>
              Настоящая Политика Оператора в отношении обработки персональных данных (далее —
              Политика) применяется только к этому Сайту. Оператор не контролирует и не несёт
              ответственности за сайты третьих лиц, на которые Пользователь может перейти по
              ссылкам, доступным на Сайте.
            </li>
            <li>
              Использование Сервисов означает безоговорочное согласие Пользователя с настоящей
              Политикой и указанными в ней условиями обработки его персональной информации. В случае
              несогласия с этими условиями Пользователь должен воздержаться от использования сервисов.
            </li>
          </ol>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="data-collection" aria-labelledby="heading-data-collection">
          <h2 id="heading-data-collection" className="font-display font-bold text-xl text-foreground">
            2. Какие персональные данные мы обрабатываем
          </h2>
          <p>
            В рамках использования Сайта Оператор может собирать и обрабатывать следующие
            персональные данные Пользователя:
          </p>
          <table className="w-full text-sm my-4 border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-semibold text-foreground">Категория данных</th>
                <th className="text-left py-2 px-3 font-semibold text-foreground">Цель обработки</th>
                <th className="text-left py-2 px-3 font-semibold text-foreground">Срок хранения</th>
              </tr>
            </thead>
            <tbody className="text-foreground/80">
              <tr className="border-b border-border/60">
                <td className="py-2 px-3">Имя родителя (законного представителя)</td>
                <td className="py-2 px-3">Связь по вопросу записи ребёнка</td>
                <td className="py-2 px-3">До отзыва согласия</td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 px-3">Возраст ребёнка</td>
                <td className="py-2 px-3">Подбор подходящего направления</td>
                <td className="py-2 px-3">До отзыва согласия</td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 px-3">Контактный телефон / мессенджер</td>
                <td className="py-2 px-3">Связь с родителем</td>
                <td className="py-2 px-3">До отзыва согласия</td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 px-3">Выбранное направление</td>
                <td className="py-2 px-3">Персонализация записи</td>
                <td className="py-2 px-3">До отзыва согласия</td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 px-3">Комментарий (по желанию)</td>
                <td className="py-2 px-3">Уточнение запроса</td>
                <td className="py-2 px-3">До отзыва согласия</td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 px-3">Технические cookies (тема, согласие)</td>
                <td className="py-2 px-3">Настройки интерфейса</td>
                <td className="py-2 px-3">Пока браузер не удалит</td>
              </tr>
              <tr>
                <td className="py-2 px-3">IP-адрес, данные о браузере (через Яндекс.Метрику)</td>
                <td className="py-2 px-3">Анализ посещаемости</td>
                <td className="py-2 px-3">Согласно политике Яндекса</td>
              </tr>
            </tbody>
          </table>
          <p className="text-sm text-muted-foreground">
            Оператор не обрабатывает специальные категории персональных данных (расовая, политическая
            принадлежность, состояние здоровья, биометрия, религиозные убеждения) и не осуществляет
            автоматизированное принятие решений, существенно затрагивающих права субъектов.
          </p>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="legal-basis" aria-labelledby="heading-legal-basis">
          <h2 id="heading-legal-basis" className="font-display font-bold text-xl text-foreground">
            3. Правовые основания обработки
          </h2>
          <p>Оператор обрабатывает персональные данные Пользователя на следующих правовых основаниях:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              <strong>Согласие субъекта</strong> (п. 1 ч. 1 ст. 6 152-ФЗ) — при заполнении формы
              записи на занятия Пользователь даёт согласие на обработку своих персональных данных
              и персональных данных своего ребёнка.
            </li>
            <li>
              <strong>Согласие на обработку cookies</strong> (ст. 18 152-ФЗ, требование Яндекса) —
              установка средств аналитики осуществляется только после получения явного согласия
              через баннер cookies.
            </li>
            <li>
              <strong>Законный интерес</strong> (ст. 6 152-ФЗ) — техническая работа Сайта,
              обеспечение его функциональности (выбор темы, пауза анимаций) через localStorage.
            </li>
          </ol>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="purposes" aria-labelledby="heading-purposes">
          <h2 id="heading-purposes" className="font-display font-bold text-xl text-foreground">
            4. Цели обработки персональных данных
          </h2>
          <ul className="list-disc pl-6 space-y-1.5">
            <li>Приём и обработка заявок на запись ребёнка на занятия;</li>
            <li>Связь с родителем (законным представителем) для консультации и уточнения деталей;</li>
            <li>Информирование о деятельности Студии, расписании, событиях (при наличии согласия);</li>
            <li>Анализ посещаемости и поведения пользователей для улучшения качества Сайта;</li>
            <li>Предотвращение мошеннических и незаконных действий.</li>
          </ul>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="localization" aria-labelledby="heading-localization">
          <h2 id="heading-localization" className="font-display font-bold text-xl text-foreground">
            5. Локализация баз данных персональных данных
          </h2>
          <p>
            В соответствии с ч. 5 ст. 18 152-ФЗ сбор, запись, систематизация, накопление, хранение,
            уточнение (обновление, изменение) и извлечение персональных данных пользователей Сайта
            осуществляются на серверах, находящихся на территории Российской Федерации.
          </p>
          <p>
            Техническую платформу для хранения и обработки данных обеспечивает{" "}
            <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-brand-warm-ink hover:underline">
              Supabase Inc.
            </a>
            , серверы которого расположены в регионе «Россия» (Москва).
            Аналитические данные (Яндекс.Метрика) обрабатываются на серверах{" "}
            <a href="https://yandex.ru" target="_blank" rel="noopener noreferrer" className="text-brand-warm-ink hover:underline">
              ООО «Яндекс»
            </a>
            {" "}на территории Российской Федерации.
          </p>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="cookies" aria-labelledby="heading-cookies">
          <h2 id="heading-cookies" className="font-display font-bold text-xl text-foreground">
            6. Cookies и средства аналитики
          </h2>
          <p>
            Сайт использует файлы cookie — небольшие текстовые файлы, которые сохраняются в брауузере
            пользователя. Cookie необходимы для корректной работы Сайта и не позволяют однозначно
            идентифицировать пользователя.
          </p>
          <h3 className="font-display font-bold text-base text-foreground mt-4 mb-2">6.1. Необходимые cookies</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Статус согласия на аналитику (<code className="text-xs bg-muted px-1 rounded">sfera_cookie_consent</code>) — срок: 1 год;</li>
            <li>Выбор цветовой темы (<code className="text-xs bg-muted px-1 rounded">sfera-theme</code>) — до удаления пользователем;</li>
            <li>Разрешение на анимации (<code className="text-xs bg-muted px-1 rounded">sfera-motion</code>) — до удаления.</li>
          </ul>
          <h3 className="font-display font-bold text-base text-foreground mt-4 mb-2">6.2. Аналитические cookies</h3>
          <p>
            Яндекс.Метрика использует cookies для анализа поведения пользователей на Сайте
            (посещаемость, источники трафика, взаимодействие с элементами). Сбор данных
            осуществляется только после получения явного согласия через баннер cookies.
            Подробнее:{" "}
            <a href="https://yandex.ru/legal/metrika_termsofuse/" target="_blank" rel="noopener noreferrer" className="text-brand-warm-ink hover:underline">
              политика Яндекс.Метрики
            </a>
            .
          </p>
          <h3 className="font-display font-bold text-base text-foreground mt-4 mb-2">6.3. Управление cookies</h3>
          <p>
            Пользователь может изменить настройки cookies в своём брауузере. Отключение cookies
            может повлиять на функциональность некоторых разделов Сайта. Полное удаление cookies
            осуществляется через настройки браузера.
          </p>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="photos" aria-labelledby="heading-photos">
          <h2 id="heading-photos" className="font-display font-bold text-xl text-foreground">
            7. Обработка изображений несовершеннолетних
          </h2>
          <p>
            На Сайте могут публиковаться фотографии и видеозаписи детей, занимающихся в Студии,
            в разделах «Галерея», «Новости» и на страницах направлений.
          </p>
          <p>
            В соответствии со ст. 152.1 Гражданского кодекса РФ использование изображения
            гражданина допускается только с его согласия, а после его смерти — с согласия лиц,
            являвшихся его близкими родственниками. Для несовершеннолетних согласие дают родители
            (законные представители).
          </p>
          <p>
            Публикация материалов с изображением ребёнка осуществляется исключительно при наличии
            письменного согласия родителей (законных представителей). Если вы считаете, что
            какое-либо изображение опубликовано без согласия, пожалуйста, немедленно сообщите нам —
            мы оперативно удалим материал.
          </p>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="security" aria-labelledby="heading-security">
          <h2 id="heading-security" className="font-display font-bold text-xl text-foreground">
            8. Безопасность и защита персональных данных
          </h2>
          <p>
            Оператор принимает необходимые и достаточные организационные и технические меры для
            защиты персональных данных Пользователя от неправомерного или случайного доступа,
            уничтожения, изменения, блокирования, копирования, распространения, а также от
            иных неправомерных действий с ними третьих лиц.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Передача данных осуществляется по защищённому протоколу TLS (HTTPS);</li>
            <li>Доступ к базе данных ограничен и защищён паролем;</li>
            <li>Административный доступ к данным доступен только уполномоченным лицам;</li>
            <li>Регулярно проводятся аудиты безопасности и обновление защитных механизмов.</li>
          </ul>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="retention" aria-labelledby="heading-retention">
          <h2 id="heading-retention" className="font-display font-bold text-xl text-foreground">
            9. Сроки хранения персональных данных
          </h2>
          <p>
            Персональные данные хранятся не дольше, чем этого требуют цели обработки, если иной
            срок не установлен договором или законодательством РФ.
          </p>
          <p>
            Данные, полученные через форму записи, хранятся до момента достижения цели обработки
            (связь с родителем по вопросу записи) или до момента отзыва согласия. По достижении
            цели данные удаляются или анонимируются.
          </p>
          <p>
            Аналитические данные (Яндекс.Метрика) хранятся в соответствии с политикой
            Яндекс.Метрики (от 3 до 90 дней в зависимости от настроек).
          </p>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="third-parties" aria-labelledby="heading-third-parties">
          <h2 id="heading-third-parties" className="font-display font-bold text-xl text-foreground">
            10. Передача данных третьим лицам
          </h2>
          <p>
            Оператор не продаёт, не обменивает и не передаёт персональные данные третьим лицам
            без согласия субъекта, за исключением следующих случаев:
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Передача данных в мессенджер MAX или VK для ответа на заявку (только если
              пользователь указал этот канал связи как предпочтительный).
            </li>
            <li>
              Передача данных в Telegram для отправки уведомления администратору (только
              если бот настроен). Сообщение содержит только имя, возраст ребёнка,
              направление и контакт — без персональных данных в полном объёме.
            </li>
            <li>
              Передача обезличенных аналитических данных в Яндекс.Метрику (без ФИО,
              телефона и иных идентифицирующих данных).
            </li>
            <li>
              Передача данных по запросу суда или уполномоченных государственных органов
              в порядке, предусмотренном законодательством РФ.
            </li>
          </ol>
          <p className="text-sm text-muted-foreground">
            Перечень обработчиков, используемых Оператором:
          </p>
          <table className="w-full text-sm my-4 border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-semibold text-foreground">Обработчик</th>
                <th className="text-left py-2 px-3 font-semibold text-foreground">Назначение</th>
                <th className="text-left py-2 px-3 font-semibold text-foreground">Юрисдикция</th>
              </tr>
            </thead>
            <tbody className="text-foreground/80">
              <tr className="border-b border-border/60">
                <td className="py-2 px-3">Supabase Inc.</td>
                <td className="py-2 px-3">Хранение заявок</td>
                <td className="py-2 px-3">Россия (Москва)</td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 px-3">ООО «Яндекс»</td>
                <td className="py-2 px-3">Аналитика, карты</td>
                <td className="py-2 px-3">Россия</td>
              </tr>
              <tr>
                <td className="py-2 px-3">Telegram FZ-LLC</td>
                <td className="py-2 px-3">Уведомления</td>
                <td className="py-2 px-3">Россия / ОАЭ</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="rights" aria-labelledby="heading-rights">
          <h2 id="heading-rights" className="font-display font-bold text-xl text-foreground">
            11. Права субъекта персональных данных
          </h2>
          <p>
            В соответствии со ст. 14 152-ФЗ субъект персональных данных имеет право:
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Получать информацию, касающуюся обработки его персональных данных, за исключением
              случаев, предусмотренных федеральными законами. Сведения предоставляются Оператором
              в доступной форме, в том числе в электронном виде.
            </li>
            <li>
              Требовать от Оператора уточнения его персональных данных, их блокирования или
              уничтожения в случае, если они являются неполными, устаревшими, неточными,
              незакономерно полученными или не являются необходимыми для заявленной цели обработки.
            </li>
            <li>
              Отозвать данное согласие на обработку персональных данных, направив письменное
              заявление Оператору. Отзыв согласия осуществляется путём направления заявления
              по телефону <a href={`tel:${siteConfig.phoneHref}`} className="text-brand-warm-ink hover:underline">{siteConfig.phone}</a>
              {" "}или через{" "}
              <a href={siteConfig.vkUrl} target="_blank" rel="noopener noreferrer" className="text-brand-warm-ink hover:underline">
                {siteConfig.vkDisplay}
              </a>
              {siteConfig.maxUrl && ` / мессенджер MAX`}.
            </li>
            <li>
              Обжаловать действия или бездействие Оператора в уполномоченный орган по защите
              прав субъектов персональных данных —{" "}
              <a href="https://rkn.gov.ru/" target="_blank" rel="noopener noreferrer" className="text-brand-warm-ink hover:underline">
                Роскомнадзор
              </a>
              {" "}или в судебном порядке.
            </li>
            <li>
             знакомиться с текстом настоящей Политики, перечнем обрабатываемых персональных
              данных, целями их обработки, способами обработки и сроками хранения.
            </li>
          </ol>
          <p>
            Оператор рассматривает обращения о реализации прав субъектов персональных данных
            в течение 10 рабочих дней с момента получения и сообщает заявителю о результатах
            в письменной или электронной форме.
          </p>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="changes" aria-labelledby="heading-changes">
          <h2 id="heading-changes" className="font-display font-bold text-xl text-foreground">
            12. Изменение Политики конфиденциальности
          </h2>
          <p>
            Оператор имеет право вносить изменения в настоящую Политику конфиденциальности.
            Новая редакция Политики вступает в силу с момента её размещения на Сайте, если иное
            не предусмотрено новой редакцией Политики. Предыдущие версии доступны в архиве.
          </p>
        </section>

        {/* ─────────────────────────────────────────────────────────────────── */}
        <section id="contacts" aria-labelledby="heading-contacts">
          <h2 id="heading-contacts" className="font-display font-bold text-xl text-foreground">
            13. Контакты оператора
          </h2>
          <div className="glass rounded-2xl p-6 my-4">
            <p className="font-display font-bold text-foreground text-lg mb-3">
              {siteConfig.fullName}
            </p>
            <ul className="space-y-2 text-foreground/80">
              <li>
                <strong>Адрес:</strong> Краснодарский край, г. Горячий Ключ, Спортивный переулок, д. 13 (2 этаж)
              </li>
              <li>
                <strong>Телефон:</strong>{" "}
                <a href={`tel:${siteConfig.phoneHref}`} className="text-brand-warm-ink hover:underline">
                  {siteConfig.phone}
                </a>
              </li>
              <li>
                <strong>Email:</strong>{" "}
                <a href="mailto:sfera.gk@mail.ru" className="text-brand-warm-ink hover:underline">
                  sfera.gk@mail.ru
                </a>
              </li>
              <li>
                <strong>VK:</strong>{" "}
                <a href={siteConfig.vkUrl} target="_blank" rel="noopener noreferrer" className="text-brand-warm-ink hover:underline">
                  {siteConfig.vkDisplay}
                </a>
              </li>
              {siteConfig.maxUrl && (
                <li>
                  <strong>MAX Messenger:</strong>{" "}
                  <a href={siteConfig.maxUrl} target="_blank" rel="noopener noreferrer" className="text-brand-warm-ink hover:underline">
                    написать в чат
                  </a>
                </li>
              )}
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">
            По вопросам, связанным с обработкой персональных данных, обращайтесь по указанным
            контактам. Мы ответим в течение 10 рабочих дней.
          </p>
        </section>
      </div>
    </article>
  );
}