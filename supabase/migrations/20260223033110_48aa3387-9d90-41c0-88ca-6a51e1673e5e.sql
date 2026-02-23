-- Add bilingual columns to life_plan_milestones
-- Current title/goal/description remain as Hebrew (primary), add English variants
ALTER TABLE public.life_plan_milestones 
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS goal_en TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS tasks_en JSONB;