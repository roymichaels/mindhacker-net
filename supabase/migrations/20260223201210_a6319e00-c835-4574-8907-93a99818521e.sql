-- Drop the week_number check constraint that limits to 12
ALTER TABLE public.life_plan_milestones DROP CONSTRAINT IF EXISTS life_plan_milestones_week_number_check;