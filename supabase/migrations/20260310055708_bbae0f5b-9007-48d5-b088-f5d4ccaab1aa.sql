-- Delete duplicate aurora action_items, keeping only the first one per title+date combo
DELETE FROM action_items
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY title, scheduled_date ORDER BY created_at ASC) as rn
    FROM action_items
    WHERE source = 'aurora' AND status = 'done' AND scheduled_date = '2026-03-08'
  ) sub
  WHERE rn > 1
);