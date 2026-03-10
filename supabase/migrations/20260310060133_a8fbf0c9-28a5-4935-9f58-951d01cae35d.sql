-- Fix plan start_date: user says today (March 10) is day 3, so start should be March 8
UPDATE life_plans 
SET start_date = '2026-03-08', updated_at = now()
WHERE user_id = '299f9800-48d9-4429-958b-b661595bd2dd' 
  AND status = 'active'
  AND start_date = '2026-03-07';
