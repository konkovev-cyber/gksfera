# `vk/` — три разные вещи в одной папке

Папка исторически смешивает не связанные между собой артефакты. Перед тем
как что-то тут менять, определитесь, к какой из трёх категорий относится файл.

## 1. Рабочий код: Edge-функции Supabase

| Путь | Назначение |
| --- | --- |
| `news-import/index.ts` | Импорт постов в таблицу `posts`. Требует Supabase JWT + роль `admin` в `user_roles`. |
| `vk-batch-fetch/index.ts` | Тянет стену VK через `wall.get`. |

Это единственная часть папки, которая **реально работает**. Разворачивается
не через Next.js, а отдельно — в Supabase Edge Functions (Deno).

> ⚠️ **`vk-batch-fetch/index.ts` содержал service-key VK, зашитый в
> исходник** (строка 10). Ключ попал в git-историю. Он вынесен в
> `Deno.env.get("VK_SERVICE_KEY")`, но **старый ключ нужно отозвать в
> настройках VK** — из истории он никуда не делся.

## 2. Мёртвый код: плагин для WordPress

`import-vk.php`, `settings-page.php`, `readme.txt` и обвязка
(`bootstrap*.{css,js}`, `jquery*.{css,js}`, `moment-with-locales.min.js`,
`main.css`, `main.js`) — это сторонний плагин
[Import VK](https://wordpress.org/plugins/import-vk/) под WordPress.

Сайт работает на Next.js 14. WordPress в проекте нет. **Ни один файл этой
группы не подключён и не исполняется.** Лежат в `_wordpress-plugin/` как
архив — на случай, если понадобится подсмотреть логику разбора ссылок VK.

## 3. Продуктовая логика сайта

Синхронизация новостей, которая действительно работает на сайте, живёт
**не здесь**, а в:

- `lib/vk-sync.ts` — `syncVkNews()`, upsert в таблицу `news`
- `app/api/cron/news-sync/route.ts` — вызов по расписанию (Vercel Cron)
- `app/api/admin/news/sync/route.ts` — ручной триггер из админки
- `lib/mirror-media.ts` — зеркалирование картинок VK к себе

Ключ VK для этого пути берётся из env `VK_SERVICE_KEY`, домен — из
`VK_COMMUNITY_DOMAIN` (по умолчанию `sferaznanei`).