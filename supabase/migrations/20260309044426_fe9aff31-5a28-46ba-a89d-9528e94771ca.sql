
-- Freelancer journeys table
CREATE TABLE public.freelancer_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  freelancer_name TEXT,
  current_step INT NOT NULL DEFAULT 1,
  journey_complete BOOLEAN NOT NULL DEFAULT false,
  step_1_vision JSONB,
  step_2_skills JSONB,
  step_3_portfolio JSONB,
  step_4_target_clients JSONB,
  step_5_pricing JSONB,
  step_6_marketing JSONB,
  step_7_operations JSONB,
  ai_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.freelancer_journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own freelancer journeys" ON public.freelancer_journeys
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own freelancer journeys" ON public.freelancer_journeys
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own freelancer journeys" ON public.freelancer_journeys
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Creator journeys table
CREATE TABLE public.creator_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_name TEXT,
  current_step INT NOT NULL DEFAULT 1,
  journey_complete BOOLEAN NOT NULL DEFAULT false,
  step_1_vision JSONB,
  step_2_niche JSONB,
  step_3_content_strategy JSONB,
  step_4_audience JSONB,
  step_5_monetization JSONB,
  step_6_platforms JSONB,
  step_7_growth JSONB,
  ai_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.creator_journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own creator journeys" ON public.creator_journeys
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own creator journeys" ON public.creator_journeys
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own creator journeys" ON public.creator_journeys
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Therapist journeys table (separate from coaching)
CREATE TABLE public.therapist_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_name TEXT,
  current_step INT NOT NULL DEFAULT 1,
  journey_complete BOOLEAN NOT NULL DEFAULT false,
  step_1_vision JSONB,
  step_2_specialization JSONB,
  step_3_methodology JSONB,
  step_4_ideal_client JSONB,
  step_5_credentials JSONB,
  step_6_services JSONB,
  step_7_operations JSONB,
  ai_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.therapist_journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own therapist journeys" ON public.therapist_journeys
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own therapist journeys" ON public.therapist_journeys
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own therapist journeys" ON public.therapist_journeys
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
