/**
 * Миграция: раскидываем фото чтобы не было дублей между секциями.
 * - Программы: все 10 уникальны
 * - Галерея: только НЕ программные фото
 * - Hero: фото, не дублирующее карточки программ
 * - Learning: уникальное фото
 */
const fs = require('fs');
const { createClient } = require('D:\\sfera\\node_modules\\@supabase\\supabase-js');
const env = fs.readFileSync('D:\\sfera\\.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();
const db = createClient(url, key, { auth: { persistSession: false } });

// Назначения фото — все уникальны
const PROGRAM_IMAGES = {
  "Подготовка к школе": "/images/letters.jpg",           // обучение буквам — школьная доска
  "Начальная ступень (1–4 классы)": "/images/elementary.jpg",
  "Средняя ступень (5–9 классы)": "/images/middle-school.jpg",
  "Английский язык": "/images/english.jpg",
  "Чистописание": "/images/studio-05.jpg",               // было studio-09 → дублировалось визуально
  "Нейропсихологическая коррекция": "/images/studio-06.jpg", // было studio-11
  "Театр": "/images/theater.jpg",
  "Психологический театр": "/images/psycho-theater.jpg",
  "Риторика": "/images/rhetoric.jpg",
  "Декор": "/images/decor.jpg",
};

// Hero — школьное фото из новых, но такое, чтобы НЕ совпадало ни с чем
const HERO_IMAGE = "/images/gallery-1.jpg";   // ребёнок на занятии, вертикальное
const HERO_ALT = "Ребёнок на занятии в учебной студии «Сфера»";

// Learning (Как проходят занятия) — уникальное панорамное
const LEARNING_IMAGE = "/images/studio-08.jpg";
const LEARNING_ALT = "Занятие в учебном классе студии «Сфера»";

// Галерея — только studio-XX, НЕ программные, НЕ hero/learning
const GALLERY_ITEMS = [
  { src: "/images/gallery-2.jpg", alt: "Работа с педагогом один на один", span: "normal" },
  { src: "/images/studio-01.jpg", alt: "Вход в студию «Сфера»", span: "tall" },
  { src: "/images/studio-02.jpg", alt: "Уголок для занятий", span: "normal" },
  { src: "/images/studio-03.jpg", alt: "Дети занимаются в учебной студии", span: "normal" },
  { src: "/images/studio-07.jpg", alt: "Материалы для занятий", span: "wide" },
  { src: "/images/studio-09.jpg", alt: "Творческая мастерская", span: "normal" },
  { src: "/images/studio-10.jpg", alt: "Рабочая обстановка в студии", span: "tall" },
  { src: "/images/studio-11.jpg", alt: "Панорама зала", span: "normal" },
];

(async () => {
  console.log('1. Обновляем фото программ...');
  let progUpdates = 0;
  for (const [title, image] of Object.entries(PROGRAM_IMAGES)) {
    const { error } = await db.from('programs').update({ image }).eq('title', title);
    if (error) console.log(`  ❌ ${title}: ${error.message}`);
    else { progUpdates++; console.log(`  ✅ ${title} → ${image}`); }
  }

  console.log('\n2. Обновляем Hero (site_settings.hero.image)...');
  const curHero = await db.from('site_settings').select('value').eq('key', 'hero').single();
  const heroObj = (curHero.data?.value && typeof curHero.data.value === 'object') ? curHero.data.value : {};
  const newHero = { ...heroObj, image: HERO_IMAGE, imageAlt: HERO_ALT };
  const heroUpsert = await db.from('site_settings').upsert({
    key: 'hero', value: newHero, updated_at: new Date().toISOString(),
  });
  console.log(heroUpsert.error ? '  ❌ '+heroUpsert.error.message : `  ✅ hero.image → ${HERO_IMAGE}`);

  console.log('\n3. Обновляем Learning Experience (site_settings.learningExperience.image)...');
  const curLe = await db.from('site_settings').select('value').eq('key', 'learningExperience').single();
  const leObj = (curLe.data?.value && typeof curLe.data.value === 'object') ? curLe.data.value : { title: "Как проходят занятия", subtitle: "Атмосфера «Сферы»", steps: [] };
  const newLe = { ...leObj, image: LEARNING_IMAGE, imageAlt: LEARNING_ALT };
  const leUpsert = await db.from('site_settings').upsert({
    key: 'learningExperience', value: newLe, updated_at: new Date().toISOString(),
  });
  console.log(leUpsert.error ? '  ❌ '+leUpsert.error.message : `  ✅ learning.image → ${LEARNING_IMAGE}`);

  console.log('\n4. Чистим и наполняем gallery_photos...');
  await db.from('gallery_photos').delete().gte('id', 0);
  const gRows = GALLERY_ITEMS.map((g, i) => ({ ...g, sort_order: i + 1 }));
  const gIns = await db.from('gallery_photos').insert(gRows);
  console.log(gIns.error ? '  ❌ '+gIns.error.message : `  ✅ Gallery: ${gIns.data?.length ?? 0} unique photos`);

  // Финальный отчёт: собираем все использованные пути
  console.log('\n=== ИТОГО: все фото должны быть уникальны ===');
  const used = new Set();
  for (const img of Object.values(PROGRAM_IMAGES)) {
    if (used.has(img)) console.log('  ⚠️ PROGRAM DUP: ' + img);
    used.add(img);
  }
  [HERO_IMAGE, LEARNING_IMAGE].forEach(i => { if (used.has(i)) console.log('  ⚠️ OVERLAP: '+i); used.add(i); });
  for (const g of GALLERY_ITEMS) {
    if (used.has(g.src)) console.log('  ⚠️ GALLERY OVERLAPS PROGRAM: ' + g.src);
    used.add(g.src);
  }
  console.log(`  Всего уникальных фото: ${used.size}`);
})().catch(e => { console.error('FATAL:', e.message); });
