/**
 * Миграция: синхронизирует DB programs с новыми статическими дефолтами
 * + использует features->>'category' для хранения категории
 */
const fs = require('fs');
const { createClient } = require('D:\\sfera\\node_modules\\@supabase\\supabase-js');

const env = fs.readFileSync('D:\\sfera\\.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();

const db = createClient(url, key, { auth: { persistSession: false } });

// 10 новых программ (из data/site.ts)
const NEW_PROGRAMS = [
  { title: "Подготовка к школе", age: "5–7 лет · 1 или 2 года",
    description: "Для будущих первоклассников. Помогаем ребёнку уверенно подойти к школьному порогу: чтение, письмо, счёт, развитие внимания и усидчивости. Программа рассчитана на 1 или 2 года.",
    image: "/images/letters.jpg", imageAlt: "Подготовка к школе — обучение буквам в студии «Сфера»", icon: "Backpack", featured: true, category: "educational" },
  { title: "Начальная ступень (1–4 классы)", age: "7–10 лет",
    description: "Поддержка по ключевым предметам для учеников начальной школы. Помогаем разобраться в материале, восполнить пробелы и наладить отношения с учёбой.",
    image: "/images/elementary.jpg", imageAlt: "Занятия в начальной школе в «Сфере»", icon: "Pencil", category: "educational" },
  { title: "Средняя ступень (5–9 классы)", age: "11–15 лет",
    description: "Занятия для учеников средней школы: укрепление знаний, устранение пробелов и рост успеваемости по ключевым предметам.",
    image: "/images/middle-school.jpg", imageAlt: "Занятия для средней школы в «Сфере»", icon: "GraduationCap", category: "educational" },
  { title: "Английский язык", age: "1–9 классы",
    description: "Изучение языка в понятной и интересной форме. Игры, диалоги, живая практика — без скучной зубрёжки.",
    image: "/images/english.jpg", imageAlt: "Занятие по английскому языку в «Сфере»", icon: "Languages", category: "educational" },
  { title: "Чистописание", age: "5–10 лет",
    description: "Коррекция почерка. Работа над красивым, уверенным и аккуратным письмом. Развиваем мелкую моторику и привычку к аккуратности.",
    image: "/images/studio-09.jpg", imageAlt: "Чистописание и развитие мелкой моторики", icon: "PenLine", category: "educational" },
  { title: "Нейропсихологическая коррекция", age: "по запросу",
    description: "Консультация и рекомендации по нейропсихологической коррекции обучения. Помогаем ребёнку справиться с трудностями в учёбе. Уточняйте детали по телефону.",
    image: "/images/studio-11.jpg", imageAlt: "Индивидуальное занятие с педагогом", icon: "BrainCircuit", category: "educational" },
  { title: "Театр", age: "6–15 лет",
    description: "Освоение сценического мастерства, создание спектаклей. Сцена, творчество, речь, взаимодействие и уверенность.",
    image: "/images/theater.jpg", imageAlt: "Театральное занятие в студии «Сфера»", icon: "Drama", category: "creative" },
  { title: "Психологический театр", age: "6–15 лет",
    description: "Работа с эмоциями и страхами через театральные техники. Развиваем эмоциональный интеллект, уверенность в себе и умение понимать других.",
    image: "/images/psycho-theater.jpg", imageAlt: "Психологический театр — работа с эмоциями в «Сфере»", icon: "Sparkles", category: "creative" },
  { title: "Риторика", age: "7–15 лет",
    description: "Учимся говорить уверенно, аргументированно и красиво. Публичные выступления, ведение дискуссий, ораторское мастерство.",
    image: "/images/rhetoric.jpg", imageAlt: "Занятие по риторике в «Сфере»", icon: "MessageSquare", category: "creative" },
  { title: "Декор", age: "6–15 лет",
    description: "Творческая мастерская: создаём своими руками украшения, декор и подарки. Развиваем вкус, аккуратность и пространственное мышление.",
    image: "/images/decor.jpg", imageAlt: "Занятие по декору — творческая мастерская в «Сфере»", icon: "Palette", category: "creative" },
];

(async () => {
  console.log('1. Удаляем старые программы...');
  const del = await db.from('programs').delete().neq('id', 0);
  if (del.error) { console.log('delete err:', del.error.message); }

  console.log('2. Вставляем 10 новых (category хранится в badge как "educational"/"creative")...');
  const rows = NEW_PROGRAMS.map((p, i) => ({
    title: p.title,
    short_desc: p.description,
    full_desc: p.description,
    age: p.age,
    image: p.image,
    image_alt: p.imageAlt,
    badge: p.category,     // используем существующую колонку badge
    accent_color: null,
    features: { icon: p.icon, category: p.category },  // дублируем в jsonb
    schedule_hint: null,
    is_visible: true,
    sort_order: i + 1,
  }));
  const ins = await db.from('programs').insert(rows).select();
  if (ins.error) { console.log('INSERT FAILED:', ins.error.message); return; }
  console.log(`✅ Вставлено ${ins.data?.length ?? 0} записей`);
  ins.data?.forEach(r => console.log(`  ${r.sort_order}. ${r.title} [${r.badge}] — ${r.image}`));

  // Gallery
  console.log('\n3. Обновляем галерею...');
  await db.from('gallery_photos').delete().neq('id', 0);
  const gRows = [
    { src: "/images/letters.jpg", alt: "Групповое занятие в «Сфере»", span: "tall", sort_order: 1 },
    { src: "/images/gallery-1.jpg", alt: "Ребёнок на занятии в «Сфере»", span: "tall", sort_order: 2 },
    { src: "/images/gallery-2.jpg", alt: "Работа с педагогом один на один", span: "normal", sort_order: 3 },
    { src: "/images/elementary.jpg", alt: "Занятие с группой детей", span: "normal", sort_order: 4 },
    { src: "/images/middle-school.jpg", alt: "Творческие занятия в «Сфере»", span: "wide", sort_order: 5 },
    { src: "/images/decor.jpg", alt: "Дети работают за партами", span: "normal", sort_order: 6 },
    { src: "/images/theater.jpg", alt: "Занятие в учебном классе", span: "normal", sort_order: 7 },
    { src: "/images/english.jpg", alt: "Общая атмосфера студии «Сфера»", span: "tall", sort_order: 8 },
  ];
  const gIns = await db.from('gallery_photos').insert(gRows);
  if (gIns.error) console.log('gallery insert err:', gIns.error.message);
  else console.log('✅ Gallery updated: 8 items');
})().catch(e => { console.error('FATAL:', e); });
