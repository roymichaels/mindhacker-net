
-- Add Play-specific columns to user_projects
ALTER TABLE public.user_projects
  ADD COLUMN IF NOT EXISTS project_type text NOT NULL DEFAULT 'strategic',
  ADD COLUMN IF NOT EXISTS play_category text,
  ADD COLUMN IF NOT EXISTS play_intention text,
  ADD COLUMN IF NOT EXISTS play_location text,
  ADD COLUMN IF NOT EXISTS play_recurring text,
  ADD COLUMN IF NOT EXISTS play_duration text,
  ADD COLUMN IF NOT EXISTS play_reflection jsonb;

-- Add index for quick Play queries
CREATE INDEX IF NOT EXISTS idx_user_projects_type ON public.user_projects (project_type);
