# sfera

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-cvdwpp8o)

Сайт центра «Сфера»: Next.js 14 (App Router) + Tailwind + Supabase (Postgres).

> В коде нигде не используется Prisma — данные ходят через `@supabase/supabase-js`.
> Строка про Prisma осталась с ранней версии README и была неверной.

## Быстрый старт

```bash
cp .env.example .env.local   # заполнить значения
npm install
npm run dev                  # http://localhost:3000
```

Обязательные переменные окружения и их смысл — в `.env.example`
(файл самодостаточный, с комментариями по каждой строке).

## Команды

| Команда | Что делает |
| --- | --- |
| `npm run dev` | Dev-сервер |
| `npm run build` | Production-сборка |
| `npm start` | Запуск собранного приложения |
| `npm run lint` | ESLint (`next lint`) |
| `npm run typecheck` | `tsc --noEmit` |

Все три проверки (`lint`, `typecheck`, `build`) гоняются в CI на каждый
push и pull request в `main` — см. `.github/workflows/ci.yml`.

## Структура

| Путь | Что там |
| --- | --- |
| `app/` | Маршруты App Router, включая `api/admin/*` и `api/cron/*` |
| `components/site/` | Продуктовые компоненты сайта |
| `components/ui/` | Примитивы shadcn/ui (47 файлов, подключены частично) |
| `lib/` | Серверная логика: контент, VK-синк, авторизация админки, зеркалирование картинок |
| `data/site.ts` | Статические значения по умол��анию (поверх них — данные из Supabase) |
| `docs/AUTH.md` | Два независимых контура авторизации |
| `scripts/` | Один рабочий скрипт + архив разовых миграций |
| `vk/` | Edge-функции Supabase + архив WordPress-плагина |

## Документация

- [`docs/DESIGN.md`](docs/DESIGN.md) — токены, примитивы, порог контраста.
- [`docs/AUTH.md`](docs/AUTH.md) — почему в проекте две разные авторизации
  и как они соотносятся.
- [`scripts/README.md`](scripts/README.md) — что можно запускать, а что нет.
- [`vk/README.md`](vk/README.md) — что в папке `vk/` живое, а что мёртвое.

## Дизайн

Токены, примитивы и правила контраста — в [docs/DESIGN.md](docs/DESIGN.md).
Кратко: палитра живёт в `app/globals.css` (блоки `:root` и `.dark`), компоненты
не пишут цвета руками и не лепят `dark:` к палитре — тема переключается
токенами. Порог приёмки — WCAG AA, он проверяется машиной, а не глазом:

```bash
npx next build && npx next start -p 3000
node ../pptr-check/redesign-audit.js    # 9 маршрутов × 2 темы, контраст и геометрия
node ../pptr-check/redesign-mobile.js   # 390px
node ../pptr-check/chrome-audit.js      # шапка, футер, оверлеи, наложения текста
node ../pptr-check/pixel-oracle.js      # сверка модели подложки с реальным растром
```
