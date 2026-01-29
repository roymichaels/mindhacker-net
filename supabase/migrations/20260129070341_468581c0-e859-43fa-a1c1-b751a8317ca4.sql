-- =====================================================
-- AURORA LIFE COACHING SCHEMA
-- 12 new tables + profile extensions + RLS + realtime
-- =====================================================

-- 1. Extend profiles table with Aurora-specific columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS aurora_preferences JSONB DEFAULT '{"tone": "warm", "intensity": "balanced"}'::jsonb;

-- 2. Aurora Life Direction (core orientation)
CREATE TABLE public.aurora_life_direction (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  clarity_score INTEGER DEFAULT 0 CHECK (clarity_score >= 0 AND clarity_score <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Aurora Identity Elements (values, principles, self-concepts)
CREATE TABLE public.aurora_identity_elements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  element_type TEXT NOT NULL CHECK (element_type IN ('value', 'principle', 'self_concept', 'vision_statement')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Aurora Life Visions (5-year, 10-year goals)
CREATE TABLE public.aurora_life_visions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timeframe TEXT NOT NULL CHECK (timeframe IN ('5_year', '10_year')),
  title TEXT NOT NULL,
  description TEXT,
  focus_areas TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Aurora Commitments (active life directions)
CREATE TABLE public.aurora_commitments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Aurora Energy Patterns (sleep, nutrition, movement, stress)
CREATE TABLE public.aurora_energy_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('sleep', 'nutrition', 'movement', 'stress')),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Aurora Behavioral Patterns (focus, avoidance, discipline, etc.)
CREATE TABLE public.aurora_behavioral_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('focus', 'avoidance', 'discipline', 'resistance', 'strength')),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Aurora Focus Plans (short-term focus periods)
CREATE TABLE public.aurora_focus_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Aurora Daily Minimums (non-negotiable daily anchors)
CREATE TABLE public.aurora_daily_minimums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Aurora Onboarding Progress (Life Model completion tracking)
CREATE TABLE public.aurora_onboarding_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  direction_clarity TEXT NOT NULL DEFAULT 'incomplete' CHECK (direction_clarity IN ('incomplete', 'emerging', 'stable')),
  identity_understanding TEXT NOT NULL DEFAULT 'shallow' CHECK (identity_understanding IN ('shallow', 'partial', 'clear')),
  energy_patterns_status TEXT NOT NULL DEFAULT 'unknown' CHECK (energy_patterns_status IN ('unknown', 'partial', 'mapped')),
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Aurora Checklists (task lists created manually or by Aurora)
CREATE TABLE public.aurora_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  origin TEXT NOT NULL DEFAULT 'manual' CHECK (origin IN ('manual', 'aurora')),
  context TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Aurora Checklist Items (individual tasks)
CREATE TABLE public.aurora_checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID NOT NULL REFERENCES public.aurora_checklists(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on all Aurora tables
ALTER TABLE public.aurora_life_direction ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aurora_identity_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aurora_life_visions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aurora_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aurora_energy_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aurora_behavioral_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aurora_focus_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aurora_daily_minimums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aurora_onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aurora_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aurora_checklist_items ENABLE ROW LEVEL SECURITY;

-- aurora_life_direction policies
CREATE POLICY "Users can view own life direction" ON public.aurora_life_direction FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own life direction" ON public.aurora_life_direction FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own life direction" ON public.aurora_life_direction FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own life direction" ON public.aurora_life_direction FOR DELETE USING (auth.uid() = user_id);

-- aurora_identity_elements policies
CREATE POLICY "Users can view own identity elements" ON public.aurora_identity_elements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own identity elements" ON public.aurora_identity_elements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own identity elements" ON public.aurora_identity_elements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own identity elements" ON public.aurora_identity_elements FOR DELETE USING (auth.uid() = user_id);

-- aurora_life_visions policies
CREATE POLICY "Users can view own life visions" ON public.aurora_life_visions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own life visions" ON public.aurora_life_visions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own life visions" ON public.aurora_life_visions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own life visions" ON public.aurora_life_visions FOR DELETE USING (auth.uid() = user_id);

-- aurora_commitments policies
CREATE POLICY "Users can view own commitments" ON public.aurora_commitments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own commitments" ON public.aurora_commitments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own commitments" ON public.aurora_commitments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own commitments" ON public.aurora_commitments FOR DELETE USING (auth.uid() = user_id);

-- aurora_energy_patterns policies
CREATE POLICY "Users can view own energy patterns" ON public.aurora_energy_patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own energy patterns" ON public.aurora_energy_patterns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own energy patterns" ON public.aurora_energy_patterns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own energy patterns" ON public.aurora_energy_patterns FOR DELETE USING (auth.uid() = user_id);

-- aurora_behavioral_patterns policies
CREATE POLICY "Users can view own behavioral patterns" ON public.aurora_behavioral_patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own behavioral patterns" ON public.aurora_behavioral_patterns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own behavioral patterns" ON public.aurora_behavioral_patterns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own behavioral patterns" ON public.aurora_behavioral_patterns FOR DELETE USING (auth.uid() = user_id);

-- aurora_focus_plans policies
CREATE POLICY "Users can view own focus plans" ON public.aurora_focus_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own focus plans" ON public.aurora_focus_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own focus plans" ON public.aurora_focus_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own focus plans" ON public.aurora_focus_plans FOR DELETE USING (auth.uid() = user_id);

-- aurora_daily_minimums policies
CREATE POLICY "Users can view own daily minimums" ON public.aurora_daily_minimums FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily minimums" ON public.aurora_daily_minimums FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily minimums" ON public.aurora_daily_minimums FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own daily minimums" ON public.aurora_daily_minimums FOR DELETE USING (auth.uid() = user_id);

-- aurora_onboarding_progress policies
CREATE POLICY "Users can view own onboarding progress" ON public.aurora_onboarding_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own onboarding progress" ON public.aurora_onboarding_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own onboarding progress" ON public.aurora_onboarding_progress FOR UPDATE USING (auth.uid() = user_id);

-- aurora_checklists policies
CREATE POLICY "Users can view own checklists" ON public.aurora_checklists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checklists" ON public.aurora_checklists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checklists" ON public.aurora_checklists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own checklists" ON public.aurora_checklists FOR DELETE USING (auth.uid() = user_id);

-- aurora_checklist_items policies (via checklist ownership)
CREATE POLICY "Users can view own checklist items" ON public.aurora_checklist_items 
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.aurora_checklists WHERE id = checklist_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own checklist items" ON public.aurora_checklist_items 
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.aurora_checklists WHERE id = checklist_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own checklist items" ON public.aurora_checklist_items 
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.aurora_checklists WHERE id = checklist_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own checklist items" ON public.aurora_checklist_items 
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.aurora_checklists WHERE id = checklist_id AND user_id = auth.uid()));

-- =====================================================
-- REALTIME ENABLEMENT
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.aurora_life_direction;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aurora_identity_elements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aurora_life_visions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aurora_commitments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aurora_energy_patterns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aurora_behavioral_patterns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aurora_focus_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aurora_daily_minimums;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aurora_onboarding_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aurora_checklists;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aurora_checklist_items;

-- =====================================================
-- HELPER FUNCTION: Award XP for Aurora interactions
-- =====================================================

CREATE OR REPLACE FUNCTION public.aurora_award_xp(
  p_user_id UUID,
  p_amount INT,
  p_reason TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET experience = COALESCE(experience, 0) + p_amount,
      updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER: Auto-update updated_at on aurora_life_direction
-- =====================================================

CREATE TRIGGER update_aurora_life_direction_updated_at
  BEFORE UPDATE ON public.aurora_life_direction
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_aurora_onboarding_progress_updated_at
  BEFORE UPDATE ON public.aurora_onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();