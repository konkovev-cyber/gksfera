/**
 * Фикс span для каждого фото по реальной ориентации.
 * Masonry сетка:
 *   normal → 308×200 (AR 1.54) — для landscape (AR 1.5)
 *   tall   → 308×416 (AR 0.74) — для portrait (AR 0.67)
 *   wide   → 632×200 (AR 3.16) — для ultra-wide (AR 3.42)
 */
const fs = require('fs');
const { createClient } = require('D:\\sfera\\node_modules\\@supabase\\supabase-js');
const env = fs.readFileSync('D:\\sfera\\.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();
const db = createClient(url, key, { auth: { persistSession: false } });

const SPAN_BY_ORIENT = {
  // portrait AR≈0.67 → tall
  "/images/PF6A8076_resized.jpg": "tall",
  "/images/studio-04.jpg":         "tall",
  "/images/studio-03.jpg":         "tall",
  // landscape AR≈1.5 → normal или wide (чередовать для баланса)
  "/images/PF6A7622_resized.jpg": "normal",
  "/images/PF6A7681_resized.jpg": "normal",
  "/images/PF6A7648_resized.jpg": "wide",     // один wide для динамики
  "/images/PF6A7999_resized.jpg": "normal",
  // ultra-wide AR 3.42 → wide
  "/images/studio-pano.jpg":      "wide",
};

(async () => {
  console.log('Обновляем span по реальной ориентации каждого фото:\n');
  for (const [src, span] of Object.entries(SPAN_BY_ORIENT)) {
    const { error } = await db.from('gallery_photos').update({ span }).eq('src', src);
    console.log(`  ${error ? '❌ '+src : '✅ '+src.split('/').pop().padEnd(28)+' → span='+span}`);
  }
  console.log('\n=== ИТОГО: 3 tall (portrait) + 2 wide (ultra-wide+1 landscape) + 3 normal (landscape) ===');
  const { data } = await db.from('gallery_photos').select('src,span').order('sort_order');
  data?.forEach(r => console.log(`  [${r.span.padEnd(6)}] ${r.src}`));
})().catch(e => { console.error('FATAL:', e); });
