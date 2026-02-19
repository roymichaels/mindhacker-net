
-- Admin Journeys table
CREATE TABLE public.admin_journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 1,
  journey_complete BOOLEAN NOT NULL DEFAULT false,
  step_1_vision JSONB DEFAULT '{}'::jsonb,
  step_2_team JSONB DEFAULT '{}'::jsonb,
  step_3_branding JSONB DEFAULT '{}'::jsonb,
  step_4_products JSONB DEFAULT '{}'::jsonb,
  step_5_content JSONB DEFAULT '{}'::jsonb,
  step_6_landing JSONB DEFAULT '{}'::jsonb,
  step_7_marketing JSONB DEFAULT '{}'::jsonb,
  step_8_operations JSONB DEFAULT '{}'::jsonb,
  ai_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own admin journeys"
  ON public.admin_journeys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own admin journeys"
  ON public.admin_journeys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own admin journeys"
  ON public.admin_journeys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_admin_journeys_updated_at
  BEFORE UPDATE ON public.admin_journeys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Projects Journeys table
CREATE TABLE public.projects_journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 1,
  journey_complete BOOLEAN NOT NULL DEFAULT false,
  step_1_vision JSONB DEFAULT '{}'::jsonb,
  step_2_first_project JSONB DEFAULT '{}'::jsonb,
  step_3_goals JSONB DEFAULT '{}'::jsonb,
  step_4_tasks JSONB DEFAULT '{}'::jsonb,
  step_5_milestones JSONB DEFAULT '{}'::jsonb,
  step_6_collaboration JSONB DEFAULT '{}'::jsonb,
  step_7_tracking JSONB DEFAULT '{}'::jsonb,
  step_8_aurora JSONB DEFAULT '{}'::jsonb,
  ai_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects_journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects journeys"
  ON public.projects_journeys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects journeys"
  ON public.projects_journeys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects journeys"
  ON public.projects_journeys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_projects_journeys_updated_at
  BEFORE UPDATE ON public.projects_journeys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
