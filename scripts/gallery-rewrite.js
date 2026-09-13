/**
 * Миграция: новая галерея с РАЗНЫМИ ориентациями + чиним скрытый дубль
 * (studio-06.jpg == studio-08.jpg, одинаковые MD5, из-за чего «Нейропсих»
 * и «Как проходят занятия» показывали ОДНУ И ТУ ЖЕ фотографию).
 */
const fs = require('fs');
const { createClient } = require('D:\\sfera\\node_modules\\@supabase\\supabase-js');
const env = fs.readFileSync('D:\\sfera\\.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();
const db = createClient(url, key, { auth: { persistSession: false } });

// === НОВАЯ ГАЛЕРЕЯ (8): 3 portrait + 4 landscape + 1 ultra-wide ===
const GALLERY = [
  { src: "/images/PF6A8076_resized.jpg", alt: "Индивидуальное занятие в «Сфере»", span: "tall", pos: "50% 25%" },
  { src: "/images/studio-04.jpg",        alt: "Рабочая атмосфера в классе",           span: "normal", pos: "50% 25%" },
  { src: "/images/PF6A7622_resized.jpg", alt: "Групповое занятие в студии",           span: "wide",   pos: null },
  { src: "/images/PF6A7681_resized.jpg", alt: "Дети работают в парах",                span: "tall",   pos: null },
  { src: "/images/studio-03.jpg",        alt: "Маленький ученик за партой",           span: "normal", pos: "50% 25%" },
  { src: "/images/PF6A7648_resized.jpg", alt: "Занятие у интерактивной доски",        span: "wide",   pos: null },
  { src: "/images/studio-pano.jpg",      alt: "Панорама учебного зала «Сферы»",       span: "wide",   pos: null },
  { src: "/images/PF6A7999_resized.jpg", alt: "Творческое занятие с материалами",     span: "normal", pos: null },
];

// Learning «Как проходят занятия» — больше НЕ дублирует «Нейропсих» (studio-06 = studio-08)
const LEARNING_IMAGE = "/images/PF6A8218_resized.jpg";
const LEARNING_ALT = "Занятие в учебном классе студии «Сфера»";

(async () => {
  console.log('== 1. Learning: studio-08 → PF6A8218 (чиним дубль со студией-06) ==');
  const curLe = await db.from('site_settings').select('value').eq('key', 'learningExperience').single();
  const leObj = (curLe.data?.value && typeof curLe.data.value === 'object') ? curLe.data.value : { title: "Как проходят занятия", subtitle: "Атмосфера «Сферы»", steps: [] };
  const newLe = { ...leObj, image: LEARNING_IMAGE, imageAlt: LEARNING_ALT };
  const leUpsert = await db.from('site_settings').upsert({ key: 'learningExperience', value: newLe, updated_at: new Date().toISOString() });
  console.log(leUpsert.error ? '  ❌ '+leUpsert.error.message : '  ✅ learning.image → '+LEARNING_IMAGE);

  console.log('\n== 2. Галерея: чистим и добавляем 8 новых с разными ориентациями ==');
  const del = await db.from('gallery_photos').delete().gte('id', 0);
  console.log('  delete:', del.error ? '❌ '+del.error.message : '✅ все старые удалены');
  const rows = GALLERY.map((g, i) => ({ src: g.src, alt: g.alt, span: g.span, pos: g.pos, sort_order: i + 1 }));
  const ins = await db.from('gallery_photos').insert(rows);
  console.log('  insert:', ins.error ? '❌ '+ins.error.message : `✅ ${rows.length} фото`);

  console.log('\n=== ИТОГО: раскладка ориентаций галереи ===');
  const arMap = {
    "PF6A8076_resized.jpg": 0.67, "studio-04.jpg": 0.67, "PF6A7622_resized.jpg": 1.5,
    "PF6A7681_resized.jpg": 1.5, "studio-03.jpg": 0.67, "PF6A7648_resized.jpg": 1.5,
    "studio-pano.jpg": 3.42, "PF6A7999_resized.jpg": 1.5,
  };
  GALLERY.forEach((g, i) => {
    const fname = g.src.split('/').pop();
    const ar = arMap[fname];
    const orient = ar > 1.7 ? '🌄 ultra-wide' : ar > 1.3 ? '↔️ landscape' : ar > 0.9 ? '⬜ square' : '↕️ portrait';
    console.log(`  ${i+1}. ${orient.padEnd(14)} span=${(g.span||'').padEnd(7)} AR=${ar} pos=${g.pos || 'центр'} — ${fname}`);
  });

  const counts = GALLERY.reduce((acc, g) => {
    const fname = g.src.split('/').pop();
    const ar = arMap[fname];
    const orient = ar > 1.7 ? 'ultra-wide' : ar > 1.3 ? 'landscape' : 'portrait';
    acc[orient] = (acc[orient] || 0) + 1;
    return acc;
  }, {});
  console.log('\n  Ориентации:', counts);

  // Проверка: не пересекаются ли с программами/hero
  console.log('\n== 3. Финальная проверка на дубли между секциями ==');
  const progs = await db.from('programs').select('title,image');
  const hero = await db.from('site_settings').select('value').eq('key', 'hero').single();
  const used = new Map();
  for (const p of progs.data || []) {
    const key = p.image.split('/').pop();
    used.set(key, `program: ${p.title}`);
  }
  if (hero.data?.value?.image) used.set(hero.data.value.image.split('/').pop(), 'hero');
  if (LEARNING_IMAGE) used.set(LEARNING_IMAGE.split('/').pop(), 'learning');
  let dups = 0;
  for (const g of GALLERY) {
    const key = g.src.split('/').pop();
    if (used.has(key)) { console.log(`  ⚠️ ДУБЛЬ: ${key} = ${used.get(key)} И gallery`); dups++; }
  }
  console.log(dups === 0 ? '  ✅ Галерея не пересекается с другими секциями' : `  ❌ Найдено ${dups} пересечений`);
})().catch(e => { console.error('FATAL:', e); });
