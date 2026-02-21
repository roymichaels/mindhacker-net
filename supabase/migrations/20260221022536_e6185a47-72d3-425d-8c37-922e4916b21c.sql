
-- Add schedule-block helper columns to action_items
ALTER TABLE public.action_items
  ADD COLUMN IF NOT EXISTS scheduled_date DATE,
  ADD COLUMN IF NOT EXISTS start_time TIME,
  ADD COLUMN IF NOT EXISTS end_time TIME;

-- Index for efficient timeline queries
CREATE INDEX IF NOT EXISTS idx_action_items_schedule 
  ON public.action_items (user_id, scheduled_date, start_time) 
  WHERE scheduled_date IS NOT NULL;

-- Add schedule_settings JSONB column to life_plans for commitment data
ALTER TABLE public.life_plans
  ADD COLUMN IF NOT EXISTS schedule_settings JSONB DEFAULT '{}'::jsonb;

-- Drop the protocol tables that are no longer needed
DROP TABLE IF EXISTS public.protocol_compliance CASCADE;
DROP TABLE IF EXISTS public.protocol_blocks CASCADE;
DROP TABLE IF EXISTS public.life_protocols CASCADE;
