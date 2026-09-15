# sfera

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-cvdwpp8o)

Сайт центра «Сфера»: Next.js 14 (App Router) + Tailwind + Prisma.

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
