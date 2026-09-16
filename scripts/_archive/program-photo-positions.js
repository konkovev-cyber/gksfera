/**
 * Миграция: свап фото Подготовка ↔ Чистописание + точки фокуса (features.pos).
 * Все значения идут в features JSONB — не требует ALTER TABLE.
 * Идемпотентно.
 */
const fs = require('fs');
const { createClient } = require('D:\\sfera\\node_modules\\@supabase\\supabase-js');
const env = fs.readFileSync('D:\\sfera\\.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();
const db = createClient(url, key, { auth: { persistSession: false } });

// Свап фото: "Подготовка к школе" ← фото текущего "Чистописание"
const IMAGE_SWAPS = {
  "Подготовка к школе": "/images/studio-05.jpg",
  "Чистописание": "/images/letters.jpg",
};

// Точки фокуса (object-position): для портретных фото — сместить вверх,
// чтобы лицо оставалось в кадре. Для landscape — null (центр ок).
const POSITIONS = {
  // Портретные фото с лицом вверху (AR < 1.0):
  "Английский язык": "50% 20%",             // 1094x1920 AR=0.57
  "Психологический театр": "50% 20%",       // 1046x1570 AR=0.67
  "Подготовка к школе": "50% 20%",          // studio-05.jpg 721x1280 AR=0.56 (после свапа)
  // Пейзажные (AR >= 1.4) — центр подходит:
  "Чистописание": null,                      // letters.jpg AR=3.41 (после свапа)
  "Начальная ступень (1–4 классы)": null,   // 1.5
  "Средняя ступень (5–9 классы)": null,     // 1.5
  "Нейропсихологическая коррекция": null,   // 1.5
  "Театр": null,                             // 1.91
  "Риторика": null,                          // 1.5
  "Декор": null,                             // 1.5
};

// Обновлённые alt-тексты (учитывают свап)
const ALT_UPDATES = {
  "Подготовка к школе": "Занятие по подготовке к школе в студии «Сфера»",
  "Чистописание": "Учимся писать красиво и аккуратно",
};

(async () => {
  console.log('== 1. Свап фото ==');
  for (const [title, image] of Object.entries(IMAGE_SWAPS)) {
    const { error } = await db.from('programs').update({ image }).eq('title', title);
    console.log(`  ${error ? '❌ '+title+': '+error.message : '✅ '+title+' → '+image}`);
  }

  console.log('\n== 2. Точки фокуса (features.pos) ==');
  for (const [title, pos] of Object.entries(POSITIONS)) {
    const cur = await db.from('programs').select('features').eq('title', title).single();
    if (cur.error || !cur.data) { console.log('  ❌ '+title+': '+(cur.error?.message ?? 'not found')); continue; }
    const features = (cur.data.features ?? {});
    if (pos) features.pos = pos; else delete features.pos;
    const { error } = await db.from('programs').update({ features }).eq('title', title);
    console.log(`  ${error ? '❌ '+title : (pos ? '✂️ '+title+' pos='+pos : '○ '+title+' центр (по дефолту)')}`);
  }

  console.log('\n== 3. Обновление alt-текстов ==');
  for (const [title, image_alt] of Object.entries(ALT_UPDATES)) {
    const { error } = await db.from('programs').update({ image_alt }).eq('title', title);
    console.log(`  ${error ? '❌ '+title : '✅ '+title}`);
  }

  console.log('\n=== ИТОГО: программы и их фото ===');
  const { data } = await db.from('programs').select('title,image,features,badge').order('sort_order');
  data?.forEach(r => {
    const pos = r.features?.pos;
    const img = r.image.split('/').pop();
    console.log(`  [${r.badge}] ${r.title.padEnd(38)} ${img.padEnd(20)} ${pos ? 'pos='+pos : 'центр'}`);
  });
})().catch(e => { console.error('FATAL:', e); });
