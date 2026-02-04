-- Add category column to aurora_checklists for mission categorization
ALTER TABLE public.aurora_checklists 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'personal' 
CHECK (category IN ('personal', 'business', 'health'));

-- Add time_scope column for daily/weekly/monthly organization
ALTER TABLE public.aurora_checklists 
ADD COLUMN IF NOT EXISTS time_scope TEXT DEFAULT 'weekly'
CHECK (time_scope IN ('daily', 'weekly', 'monthly'));

-- Add milestone_id for linking to 90-day plan milestones
ALTER TABLE public.aurora_checklists 
ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES public.life_plan_milestones(id) ON DELETE SET NULL;

-- Add priority for sorting
ALTER TABLE public.aurora_checklists 
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_aurora_checklists_category ON public.aurora_checklists(category);
CREATE INDEX IF NOT EXISTS idx_aurora_checklists_time_scope ON public.aurora_checklists(time_scope);
CREATE INDEX IF NOT EXISTS idx_aurora_checklists_milestone ON public.aurora_checklists(milestone_id);