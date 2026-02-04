-- =============================================
-- Life OS New Pillars: Relationships, Finances, Learning
-- =============================================

-- 1. RELATIONSHIPS JOURNEYS
CREATE TABLE public.relationships_journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 1,
  journey_complete BOOLEAN NOT NULL DEFAULT FALSE,
  step_1_vision JSONB DEFAULT '{}'::jsonb,
  step_2_current_state JSONB DEFAULT '{}'::jsonb,
  step_3_family JSONB DEFAULT '{}'::jsonb,
  step_4_partner JSONB DEFAULT '{}'::jsonb,
  step_5_social JSONB DEFAULT '{}'::jsonb,
  step_6_communication JSONB DEFAULT '{}'::jsonb,
  step_7_boundaries JSONB DEFAULT '{}'::jsonb,
  step_8_action_plan JSONB DEFAULT '{}'::jsonb,
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.relationships_journeys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for relationships_journeys
CREATE POLICY "Users can view their own relationship journeys"
  ON public.relationships_journeys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own relationship journeys"
  ON public.relationships_journeys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own relationship journeys"
  ON public.relationships_journeys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own relationship journeys"
  ON public.relationships_journeys FOR DELETE
  USING (auth.uid() = user_id);

-- 2. FINANCE JOURNEYS
CREATE TABLE public.finance_journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 1,
  journey_complete BOOLEAN NOT NULL DEFAULT FALSE,
  step_1_vision JSONB DEFAULT '{}'::jsonb,
  step_2_current_state JSONB DEFAULT '{}'::jsonb,
  step_3_income JSONB DEFAULT '{}'::jsonb,
  step_4_expenses JSONB DEFAULT '{}'::jsonb,
  step_5_savings JSONB DEFAULT '{}'::jsonb,
  step_6_debt JSONB DEFAULT '{}'::jsonb,
  step_7_goals JSONB DEFAULT '{}'::jsonb,
  step_8_action_plan JSONB DEFAULT '{}'::jsonb,
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.finance_journeys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for finance_journeys
CREATE POLICY "Users can view their own finance journeys"
  ON public.finance_journeys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own finance journeys"
  ON public.finance_journeys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own finance journeys"
  ON public.finance_journeys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own finance journeys"
  ON public.finance_journeys FOR DELETE
  USING (auth.uid() = user_id);

-- 3. LEARNING JOURNEYS
CREATE TABLE public.learning_journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 1,
  journey_complete BOOLEAN NOT NULL DEFAULT FALSE,
  step_1_vision JSONB DEFAULT '{}'::jsonb,
  step_2_learning_style JSONB DEFAULT '{}'::jsonb,
  step_3_skills JSONB DEFAULT '{}'::jsonb,
  step_4_reading JSONB DEFAULT '{}'::jsonb,
  step_5_courses JSONB DEFAULT '{}'::jsonb,
  step_6_practice JSONB DEFAULT '{}'::jsonb,
  step_7_goals JSONB DEFAULT '{}'::jsonb,
  step_8_action_plan JSONB DEFAULT '{}'::jsonb,
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.learning_journeys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_journeys
CREATE POLICY "Users can view their own learning journeys"
  ON public.learning_journeys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own learning journeys"
  ON public.learning_journeys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning journeys"
  ON public.learning_journeys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learning journeys"
  ON public.learning_journeys FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Add triggers for updated_at
CREATE TRIGGER update_relationships_journeys_updated_at
  BEFORE UPDATE ON public.relationships_journeys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_finance_journeys_updated_at
  BEFORE UPDATE ON public.finance_journeys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_journeys_updated_at
  BEFORE UPDATE ON public.learning_journeys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();