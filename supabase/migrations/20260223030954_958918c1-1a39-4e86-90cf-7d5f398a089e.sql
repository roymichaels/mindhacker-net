-- Remove the check constraint on life_plans.status to allow 'archived'
ALTER TABLE public.life_plans DROP CONSTRAINT IF EXISTS life_plans_status_check;

-- Add updated constraint that includes 'archived'
ALTER TABLE public.life_plans ADD CONSTRAINT life_plans_status_check 
  CHECK (status IN ('active', 'completed', 'paused', 'archived'));