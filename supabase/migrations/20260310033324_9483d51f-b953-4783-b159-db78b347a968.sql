
-- Clean up duplicate user_milestone and journey_completion notifications (keep newest per user)
DELETE FROM admin_notifications
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY metadata->>'user_id', type
      ORDER BY created_at DESC
    ) as rn
    FROM admin_notifications
    WHERE type IN ('user_milestone', 'journey_completion')
  ) dupes
  WHERE rn > 1
);

-- Also delete the old-style user_milestone type entirely (redundant with onboarding_completed)
DELETE FROM admin_notifications WHERE type = 'user_milestone';
DELETE FROM admin_notifications WHERE type = 'journey_completion';
