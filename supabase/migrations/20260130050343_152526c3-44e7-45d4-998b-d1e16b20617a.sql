-- =============================================
-- Launchpad Summaries & Life Plans Tables
-- =============================================

-- Table for storing comprehensive AI-generated Launchpad summaries
CREATE TABLE public.launchpad_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  summary_data JSONB NOT NULL DEFAULT '{}',
  consciousness_score INTEGER DEFAULT 0 CHECK (consciousness_score >= 0 AND consciousness_score <= 100),
  transformation_readiness INTEGER DEFAULT 0 CHECK (transformation_readiness >= 0 AND transformation_readiness <= 100),
  clarity_score INTEGER DEFAULT 0 CHECK (clarity_score >= 0 AND clarity_score <= 100),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Table for storing 3-month life plans
CREATE TABLE public.life_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  summary_id UUID REFERENCES public.launchpad_summaries(id) ON DELETE SET NULL,
  duration_months INTEGER DEFAULT 3,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '90 days')::date,
  plan_data JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'abandoned')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for weekly milestones within a life plan
CREATE TABLE public.life_plan_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES public.life_plans(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 12),
  month_number INTEGER NOT NULL CHECK (month_number >= 1 AND month_number <= 3),
  title TEXT NOT NULL,
  description TEXT,
  focus_area TEXT,
  tasks JSONB DEFAULT '[]',
  goal TEXT,
  challenge TEXT,
  hypnosis_recommendation TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  xp_reward INTEGER DEFAULT 50,
  tokens_reward INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_launchpad_summaries_user_id ON public.launchpad_summaries(user_id);
CREATE INDEX idx_launchpad_summaries_generated_at ON public.launchpad_summaries(generated_at DESC);
CREATE INDEX idx_life_plans_user_id ON public.life_plans(user_id);
CREATE INDEX idx_life_plans_status ON public.life_plans(status);
CREATE INDEX idx_life_plan_milestones_plan_id ON public.life_plan_milestones(plan_id);
CREATE INDEX idx_life_plan_milestones_week ON public.life_plan_milestones(week_number);

-- Enable Row Level Security
ALTER TABLE public.launchpad_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_plan_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for launchpad_summaries
CREATE POLICY "Users can view their own summary"
ON public.launchpad_summaries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own summary"
ON public.launchpad_summaries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own summary"
ON public.launchpad_summaries FOR UPDATE
USING (auth.uid() = user_id);

-- Admin can view all summaries (using user_roles table)
CREATE POLICY "Admins can view all summaries"
ON public.launchpad_summaries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  )
);

-- RLS Policies for life_plans
CREATE POLICY "Users can view their own plans"
ON public.life_plans FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plans"
ON public.life_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
ON public.life_plans FOR UPDATE
USING (auth.uid() = user_id);

-- Admin can view all plans (using user_roles table)
CREATE POLICY "Admins can view all plans"
ON public.life_plans FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  )
);

-- RLS Policies for life_plan_milestones
CREATE POLICY "Users can view their own milestones"
ON public.life_plan_milestones FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.life_plans
    WHERE life_plans.id = life_plan_milestones.plan_id
    AND life_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own milestones"
ON public.life_plan_milestones FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.life_plans
    WHERE life_plans.id = life_plan_milestones.plan_id
    AND life_plans.user_id = auth.uid()
  )
);

-- Admin can view all milestones (using user_roles table)
CREATE POLICY "Admins can view all milestones"
ON public.life_plan_milestones FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  )
);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_launchpad_summaries_updated_at
BEFORE UPDATE ON public.launchpad_summaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_life_plans_updated_at
BEFORE UPDATE ON public.life_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update life plan progress when milestone is completed
CREATE OR REPLACE FUNCTION public.update_life_plan_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_milestones INTEGER;
  completed_milestones INTEGER;
  new_progress INTEGER;
BEGIN
  -- Count total and completed milestones for this plan
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE is_completed = true)
  INTO total_milestones, completed_milestones
  FROM public.life_plan_milestones
  WHERE plan_id = NEW.plan_id;
  
  -- Calculate progress percentage
  IF total_milestones > 0 THEN
    new_progress := (completed_milestones * 100) / total_milestones;
  ELSE
    new_progress := 0;
  END IF;
  
  -- Update the life plan progress
  UPDATE public.life_plans
  SET 
    progress_percentage = new_progress,
    status = CASE 
      WHEN new_progress = 100 THEN 'completed'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = NEW.plan_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to auto-update plan progress
CREATE TRIGGER update_plan_progress_on_milestone_change
AFTER UPDATE OF is_completed ON public.life_plan_milestones
FOR EACH ROW
EXECUTE FUNCTION public.update_life_plan_progress();