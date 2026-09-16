-- Добавляем колонку category для разделения на "учебное"/"творческое"
ALTER TABLE programs
ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'educational'
  CHECK (category IN ('educational', 'creative'));

-- Отмечаем творческие направления
UPDATE programs SET category = 'creative'
WHERE title ILIKE '%Театр%'
   OR title ILIKE '%Риторик%'
   OR title ILIKE '%Декор%'
   OR title ILIKE '%Писательск%';
