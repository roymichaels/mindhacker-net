-- Add date tracking columns to aurora_checklist_items
ALTER TABLE public.aurora_checklist_items
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Add date range columns to life_plan_milestones
ALTER TABLE public.life_plan_milestones
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS goal TEXT;

-- Create index for efficient overdue task queries
CREATE INDEX IF NOT EXISTS idx_checklist_items_due_date 
ON public.aurora_checklist_items(due_date) 
WHERE is_completed = false;

-- Create index for milestone date lookups
CREATE INDEX IF NOT EXISTS idx_milestones_dates 
ON public.life_plan_milestones(start_date, end_date);

-- Function to calculate milestone dates when creating a life plan
CREATE OR REPLACE FUNCTION public.calculate_milestone_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate start_date and end_date based on plan start_date and week_number
  IF NEW.start_date IS NULL AND NEW.plan_id IS NOT NULL THEN
    SELECT 
      lp.start_date + ((NEW.week_number - 1) * 7),
      lp.start_date + ((NEW.week_number - 1) * 7) + 6
    INTO NEW.start_date, NEW.end_date
    FROM public.life_plans lp
    WHERE lp.id = NEW.plan_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to auto-calculate milestone dates
DROP TRIGGER IF EXISTS calculate_milestone_dates_trigger ON public.life_plan_milestones;
CREATE TRIGGER calculate_milestone_dates_trigger
BEFORE INSERT ON public.life_plan_milestones
FOR EACH ROW
EXECUTE FUNCTION public.calculate_milestone_dates();

-- Add progress_percentage column to life_plans if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'life_plans' 
    AND column_name = 'progress_percentage'
  ) THEN
    ALTER TABLE public.life_plans ADD COLUMN progress_percentage INTEGER DEFAULT 0;
  END IF;
END $$;