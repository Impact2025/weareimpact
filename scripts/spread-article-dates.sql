-- Verspreid alle kennisbank artikeldatums gelijkmatig van 1 dec 2025 t/m 22 april 2026
-- Run dit script in de Neon SQL editor of via psql

-- Stap 1: Bekijk preview van nieuwe datums
WITH ordered_articles AS (
  SELECT
    id,
    title,
    ROW_NUMBER() OVER (ORDER BY created_at ASC) - 1 AS idx,
    COUNT(*) OVER () - 1 AS max_idx
  FROM kb_articles
),
date_calc AS (
  SELECT
    id,
    title,
    idx,
    TIMESTAMP '2025-12-01 09:00:00' +
      (idx::float / GREATEST(max_idx, 1) *
       EXTRACT(EPOCH FROM (TIMESTAMP '2026-04-22 18:00:00' - TIMESTAMP '2025-12-01 09:00:00'))
      ) * INTERVAL '1 second' AS new_published_at
  FROM ordered_articles
)
SELECT
  title,
  TO_CHAR(new_published_at, 'DD Mon YYYY HH24:MI') AS nieuwe_datum
FROM date_calc
ORDER BY new_published_at;

-- Stap 2: Voer de update uit (verwijder het commentaar om te activeren)
/*
BEGIN;

-- Tijdelijk trigger uitschakelen zodat updated_at niet overschreven wordt
ALTER TABLE kb_articles DISABLE TRIGGER update_kb_articles_updated_at;

WITH ordered_articles AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY created_at ASC) - 1 AS idx,
    COUNT(*) OVER () - 1 AS max_idx
  FROM kb_articles
),
date_calc AS (
  SELECT
    id,
    TIMESTAMP '2025-12-01 09:00:00' +
      (idx::float / GREATEST(max_idx, 1) *
       EXTRACT(EPOCH FROM (TIMESTAMP '2026-04-22 18:00:00' - TIMESTAMP '2025-12-01 09:00:00'))
      ) * INTERVAL '1 second' AS new_published_at
  FROM ordered_articles
)
UPDATE kb_articles
SET
  published_at = date_calc.new_published_at,
  updated_at   = date_calc.new_published_at
FROM date_calc
WHERE kb_articles.id = date_calc.id;

-- Trigger weer aanzetten
ALTER TABLE kb_articles ENABLE TRIGGER update_kb_articles_updated_at;

COMMIT;
*/
