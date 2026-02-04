-- Business Orb Profiles - Visual DNA for each business
CREATE TABLE public.business_orb_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business_journeys(id) ON DELETE CASCADE,
  primary_color TEXT NOT NULL,
  secondary_colors TEXT[] DEFAULT '{}',
  accent_color TEXT NOT NULL,
  morph_intensity NUMERIC DEFAULT 0.15,
  morph_speed NUMERIC DEFAULT 1.0,
  geometry_detail INTEGER DEFAULT 4,
  particle_enabled BOOLEAN DEFAULT true,
  particle_count INTEGER DEFAULT 50,
  computed_from JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id)
);

-- Business Plans - 90-day action plans
CREATE TABLE public.business_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business_journeys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'paused')),
  start_date DATE,
  end_date DATE,
  plan_data JSONB DEFAULT '{}',
  total_weeks INTEGER DEFAULT 12,
  current_week INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Business Plan Milestones - Weekly milestones within a plan
CREATE TABLE public.business_plan_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.business_plans(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  focus_area TEXT,
  tasks JSONB DEFAULT '[]',
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  xp_reward INTEGER DEFAULT 50,
  tokens_reward INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Business Branding - Brand identity for each business
CREATE TABLE public.business_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business_journeys(id) ON DELETE CASCADE,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  font_heading TEXT,
  font_body TEXT,
  brand_voice TEXT,
  tone_keywords TEXT[] DEFAULT '{}',
  tagline TEXT,
  mission_statement TEXT,
  vision_statement TEXT,
  core_values TEXT[] DEFAULT '{}',
  brand_story TEXT,
  target_emotions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id)
);

-- Enable RLS on all tables
ALTER TABLE public.business_orb_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_plan_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_branding ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_orb_profiles
CREATE POLICY "Users can view own business orb profiles"
  ON public.business_orb_profiles FOR SELECT
  USING (business_id IN (SELECT id FROM public.business_journeys WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own business orb profiles"
  ON public.business_orb_profiles FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM public.business_journeys WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own business orb profiles"
  ON public.business_orb_profiles FOR UPDATE
  USING (business_id IN (SELECT id FROM public.business_journeys WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own business orb profiles"
  ON public.business_orb_profiles FOR DELETE
  USING (business_id IN (SELECT id FROM public.business_journeys WHERE user_id = auth.uid()));

-- RLS Policies for business_plans
CREATE POLICY "Users can view own business plans"
  ON public.business_plans FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own business plans"
  ON public.business_plans FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own business plans"
  ON public.business_plans FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own business plans"
  ON public.business_plans FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for business_plan_milestones (via plan ownership)
CREATE POLICY "Users can view own business plan milestones"
  ON public.business_plan_milestones FOR SELECT
  USING (plan_id IN (SELECT id FROM public.business_plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own business plan milestones"
  ON public.business_plan_milestones FOR INSERT
  WITH CHECK (plan_id IN (SELECT id FROM public.business_plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own business plan milestones"
  ON public.business_plan_milestones FOR UPDATE
  USING (plan_id IN (SELECT id FROM public.business_plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own business plan milestones"
  ON public.business_plan_milestones FOR DELETE
  USING (plan_id IN (SELECT id FROM public.business_plans WHERE user_id = auth.uid()));

-- RLS Policies for business_branding
CREATE POLICY "Users can view own business branding"
  ON public.business_branding FOR SELECT
  USING (business_id IN (SELECT id FROM public.business_journeys WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own business branding"
  ON public.business_branding FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM public.business_journeys WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own business branding"
  ON public.business_branding FOR UPDATE
  USING (business_id IN (SELECT id FROM public.business_journeys WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own business branding"
  ON public.business_branding FOR DELETE
  USING (business_id IN (SELECT id FROM public.business_journeys WHERE user_id = auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_business_orb_profiles_updated_at
  BEFORE UPDATE ON public.business_orb_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_plans_updated_at
  BEFORE UPDATE ON public.business_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_plan_milestones_updated_at
  BEFORE UPDATE ON public.business_plan_milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_branding_updated_at
  BEFORE UPDATE ON public.business_branding
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();