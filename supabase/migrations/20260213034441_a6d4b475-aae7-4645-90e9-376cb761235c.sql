
-- Create user_projects table for managing personal projects
CREATE TABLE public.user_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'personal',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  -- Journey data (collected during add-project wizard)
  vision TEXT,
  why_it_matters TEXT,
  desired_outcome TEXT,
  timeline TEXT,
  key_milestones JSONB DEFAULT '[]'::jsonb,
  resources_needed TEXT,
  potential_blockers TEXT,
  linked_life_areas TEXT[] DEFAULT '{}',
  -- Progress & integration
  progress_percentage INTEGER DEFAULT 0,
  linked_goal_ids UUID[] DEFAULT '{}',
  linked_checklist_ids UUID[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  cover_color TEXT DEFAULT '#d4a574',
  -- Timestamps
  target_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own projects"
  ON public.user_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON public.user_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON public.user_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON public.user_projects FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update timestamps
CREATE TRIGGER update_user_projects_updated_at
  BEFORE UPDATE ON public.user_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_user_projects_user_id ON public.user_projects(user_id);
CREATE INDEX idx_user_projects_status ON public.user_projects(user_id, status);
