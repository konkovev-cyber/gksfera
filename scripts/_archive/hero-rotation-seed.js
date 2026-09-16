/**
 * Заполняем hero.images (ротация) в site_settings, сохраняя
 * текущее выбранное пользователем фото первым кадром.
 * Идемпотентен: если hero.images уже задан и непустой — не трогает.
 */
const fs = require('fs');
const { createClient } = require('D:\\sfera\\node_modules\\@supabase\\supabase-js');
const env = fs.readFileSync('D:\\sfera\\.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();
const db = createClient(url, key, { auth: { persistSession: false } });

// Дополнительные кадры ротации (не заняты в галерее/программах):
const EXTRA = [
  '/images/PF6A7844_resized.jpg',
  '/images/studio-07.jpg',
  '/images/PF6A8152_resized.jpg',
];

(async () => {
  const { data: row } = await db.from('site_settings').select('value').eq('key', 'hero').single();
  const hero = (row && row.value && typeof row.value === 'object') ? row.value : {};

  if (Array.isArray(hero.images) && hero.images.length > 0) {
    console.log('✅ hero.images уже задан:', hero.images.length, 'кадров — пропускаем');
    console.log('  ', hero.images.join('\n   '));
    return;
  }

  const current = hero.image ? String(hero.image) : '/images/gallery-1.jpg';
  const images = [current, ...EXTRA.filter((x) => x !== current)];
  const next = { ...hero, images };
  await db.from('site_settings').upsert({
    key: 'hero', value: next, updated_at: new Date().toISOString(),
  });
  console.log('✅ hero.images записан. Первый кадр — текущее фото пользователя:', current);
  console.log('   Ротация:', images.join('\n   '));

  const { data: check } = await db.from('site_settings').select('value').eq('key', 'hero').single();
  console.log('   Проверка чтения:', (check.value.images || []).length, 'кадров');
})().catch((e) => { console.error('FATAL:', e); process.exit(1); });
