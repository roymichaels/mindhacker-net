-- Add missing columns to mini_milestones for execution templates
ALTER TABLE public.mini_milestones 
  ADD COLUMN IF NOT EXISTS execution_template text DEFAULT 'step_by_step',
  ADD COLUMN IF NOT EXISTS action_type text;