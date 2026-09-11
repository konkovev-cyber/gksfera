// Создаёт таблицы и bucket для админки «Сферы».
// Запуск: $env:PGURL="postgresql://..."; node scripts/admin-migrate.mjs
import pg from "pg";

const url = process.env.PGURL;
if (!url) {
  console.error("PGURL не задан");
  process.exit(1);
}

const SQL = `
create table if not exists site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

create table if not exists gallery_photos (
  id bigint generated always as identity primary key,
  src text not null,
  alt text default '',
  span text default 'normal',
  pos text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists programs (
  id bigint generated always as identity primary key,
  title text not null,
  age_range text default '',
  description text default '',
  image text default '',
  image_alt text default '',
  icon text default 'Sparkles',
  featured boolean default false,
  visible boolean default true,
  sort_order int default 0
);

alter table enrollments add column if not exists status text default 'new';

-- колонки фото для существующей таблицы programs (старая схема без них)
alter table programs add column if not exists image text default '';
alter table programs add column if not exists image_alt text default '';

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;
`;

const client = new pg.Client({ connectionString: url });
try {
  await client.connect();
  await client.query(SQL);
  console.log("Миграция выполнена: site_settings, gallery_photos, programs, storage bucket 'media', enrollments.status");
} catch (e) {
  console.error("Ошибка миграции:", e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
