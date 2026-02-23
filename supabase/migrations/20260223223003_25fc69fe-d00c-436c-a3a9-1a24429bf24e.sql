-- Fix: expand month_number constraint to support 100-day plans (up to 4 months)
ALTER TABLE public.life_plan_milestones DROP CONSTRAINT life_plan_milestones_month_number_check;
ALTER TABLE public.life_plan_milestones ADD CONSTRAINT life_plan_milestones_month_number_check CHECK (month_number >= 1 AND month_number <= 4);