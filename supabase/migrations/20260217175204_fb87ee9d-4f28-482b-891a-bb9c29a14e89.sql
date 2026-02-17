
-- Create coaching_journeys table (mirrors business_journeys structure)
CREATE TABLE public.coaching_journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coaching_niche TEXT,
  current_step INTEGER NOT NULL DEFAULT 1,
  journey_complete BOOLEAN NOT NULL DEFAULT false,
  step_1_vision JSONB DEFAULT '{}'::jsonb,
  step_2_niche JSONB DEFAULT '{}'::jsonb,
  step_3_methodology JSONB DEFAULT '{}'::jsonb,
  step_4_ideal_client JSONB DEFAULT '{}'::jsonb,
  step_5_value_proposition JSONB DEFAULT '{}'::jsonb,
  step_6_credentials JSONB DEFAULT '{}'::jsonb,
  step_7_services JSONB DEFAULT '{}'::jsonb,
  step_8_marketing JSONB DEFAULT '{}'::jsonb,
  step_9_operations JSONB DEFAULT '{}'::jsonb,
  step_10_action_plan JSONB DEFAULT '{}'::jsonb,
  ai_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coaching_journeys ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own coaching journeys"
  ON public.coaching_journeys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own coaching journeys"
  ON public.coaching_journeys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coaching journeys"
  ON public.coaching_journeys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own coaching journeys"
  ON public.coaching_journeys FOR DELETE
  USING (auth.uid() = user_id);

-- Updated at trigger
CREATE TRIGGER update_coaching_journeys_updated_at
  BEFORE UPDATE ON public.coaching_journeys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create coach_client_plans table
CREATE TABLE public.coach_client_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  client_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name TEXT,
  plan_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  methodology JSONB DEFAULT '{}'::jsonb,
  coaching_niche TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coach_client_plans ENABLE ROW LEVEL SECURITY;

-- RLS: Coach can manage their own plans
CREATE POLICY "Coaches can view their own client plans"
  ON public.coach_client_plans FOR SELECT
  USING (
    coach_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid())
    OR client_user_id = auth.uid()
  );

CREATE POLICY "Coaches can create client plans"
  ON public.coach_client_plans FOR INSERT
  WITH CHECK (
    coach_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can update their client plans"
  ON public.coach_client_plans FOR UPDATE
  USING (
    coach_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can delete their client plans"
  ON public.coach_client_plans FOR DELETE
  USING (
    coach_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid())
  );

-- Updated at trigger
CREATE TRIGGER update_coach_client_plans_updated_at
  BEFORE UPDATE ON public.coach_client_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
