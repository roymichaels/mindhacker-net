-- ============================================
-- LAUNCHPAD PROGRESS TABLE
-- Tracks user progress through the 7-step onboarding
-- ============================================
CREATE TABLE public.launchpad_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Step 1: Welcome + Initial Intention
  step_1_welcome BOOLEAN DEFAULT FALSE,
  step_1_intention TEXT,
  step_1_completed_at TIMESTAMPTZ,
  
  -- Step 2: First Chat with AI
  step_2_first_chat BOOLEAN DEFAULT FALSE,
  step_2_summary TEXT,
  step_2_completed_at TIMESTAMPTZ,
  
  -- Step 3: Introspection Questionnaire
  step_3_introspection BOOLEAN DEFAULT FALSE,
  step_3_form_submission_id UUID,
  step_3_completed_at TIMESTAMPTZ,
  
  -- Step 4: Life Plan Questionnaire
  step_4_life_plan BOOLEAN DEFAULT FALSE,
  step_4_form_submission_id UUID,
  step_4_completed_at TIMESTAMPTZ,
  
  -- Step 5: Focus Areas Selection
  step_5_focus_areas BOOLEAN DEFAULT FALSE,
  step_5_focus_areas_selected JSONB DEFAULT '[]'::jsonb,
  step_5_completed_at TIMESTAMPTZ,
  
  -- Step 6: First Week Planning
  step_6_first_week BOOLEAN DEFAULT FALSE,
  step_6_actions JSONB DEFAULT '[]'::jsonb,
  step_6_anchor_habit TEXT,
  step_6_completed_at TIMESTAMPTZ,
  
  -- Step 7: Dashboard Activation
  step_7_dashboard_activated BOOLEAN DEFAULT FALSE,
  step_7_completed_at TIMESTAMPTZ,
  
  -- Overall Progress
  current_step INTEGER DEFAULT 1,
  launchpad_complete BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.launchpad_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own launchpad progress"
  ON public.launchpad_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own launchpad progress"
  ON public.launchpad_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own launchpad progress"
  ON public.launchpad_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_launchpad_progress_user_id ON public.launchpad_progress(user_id);

-- ============================================
-- USER FEATURE UNLOCKS TABLE
-- Tracks which features are unlocked for each user
-- ============================================
CREATE TABLE public.user_feature_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  feature_key TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  unlock_reason TEXT,
  unlock_source TEXT, -- 'launchpad', 'level', 'achievement', 'admin'
  
  UNIQUE(user_id, feature_key)
);

-- Enable RLS
ALTER TABLE public.user_feature_unlocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own feature unlocks"
  ON public.user_feature_unlocks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert feature unlocks"
  ON public.user_feature_unlocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_user_feature_unlocks_user_id ON public.user_feature_unlocks(user_id);
CREATE INDEX idx_user_feature_unlocks_feature ON public.user_feature_unlocks(feature_key);

-- ============================================
-- QUESTIONNAIRE COMPLETIONS TABLE
-- Tracks completed questionnaires with AI analysis
-- ============================================
CREATE TABLE public.questionnaire_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  questionnaire_type TEXT NOT NULL, -- 'introspection', 'life_plan', 'values', 'habits', 'blockers'
  form_submission_id UUID REFERENCES public.form_submissions(id),
  
  -- AI Analysis Results
  analysis JSONB DEFAULT '{}'::jsonb,
  summary TEXT,
  key_insights JSONB DEFAULT '[]'::jsonb,
  blindspots JSONB DEFAULT '[]'::jsonb,
  goals_suggested JSONB DEFAULT '[]'::jsonb,
  habits_suggested JSONB DEFAULT '[]'::jsonb,
  next_actions JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  
  -- Life Model Updates Applied
  life_model_updates_applied BOOLEAN DEFAULT FALSE,
  
  -- XP Tracking
  xp_awarded INTEGER DEFAULT 0,
  tokens_awarded INTEGER DEFAULT 0,
  
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.questionnaire_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own questionnaire completions"
  ON public.questionnaire_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questionnaire completions"
  ON public.questionnaire_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questionnaire completions"
  ON public.questionnaire_completions FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_questionnaire_completions_user_id ON public.questionnaire_completions(user_id);
CREATE INDEX idx_questionnaire_completions_type ON public.questionnaire_completions(questionnaire_type);

-- ============================================
-- FUNCTION: Complete Launchpad Step
-- Awards XP and tokens, unlocks features
-- ============================================
CREATE OR REPLACE FUNCTION public.complete_launchpad_step(
  p_user_id UUID,
  p_step INTEGER,
  p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_xp INTEGER := 0;
  v_tokens INTEGER := 0;
  v_unlock TEXT;
  v_result JSONB;
BEGIN
  -- Define XP and tokens per step
  CASE p_step
    WHEN 1 THEN v_xp := 25; v_tokens := 0; v_unlock := 'aurora_chat_basic';
    WHEN 2 THEN v_xp := 50; v_tokens := 0; v_unlock := 'introspection_questionnaire';
    WHEN 3 THEN v_xp := 100; v_tokens := 10; v_unlock := 'life_plan_questionnaire';
    WHEN 4 THEN v_xp := 100; v_tokens := 15; v_unlock := 'focus_areas_selection';
    WHEN 5 THEN v_xp := 50; v_tokens := 0; v_unlock := 'first_week_planning';
    WHEN 6 THEN v_xp := 75; v_tokens := 0; v_unlock := 'dashboard_full';
    WHEN 7 THEN v_xp := 100; v_tokens := 25; v_unlock := 'life_os_complete';
    ELSE v_xp := 0; v_tokens := 0;
  END CASE;
  
  -- Update launchpad_progress based on step
  CASE p_step
    WHEN 1 THEN
      UPDATE launchpad_progress 
      SET step_1_welcome = TRUE, 
          step_1_intention = p_data->>'intention',
          step_1_completed_at = NOW(),
          current_step = GREATEST(current_step, 2),
          updated_at = NOW()
      WHERE user_id = p_user_id;
    WHEN 2 THEN
      UPDATE launchpad_progress 
      SET step_2_first_chat = TRUE, 
          step_2_summary = p_data->>'summary',
          step_2_completed_at = NOW(),
          current_step = GREATEST(current_step, 3),
          updated_at = NOW()
      WHERE user_id = p_user_id;
    WHEN 3 THEN
      UPDATE launchpad_progress 
      SET step_3_introspection = TRUE, 
          step_3_form_submission_id = (p_data->>'form_submission_id')::UUID,
          step_3_completed_at = NOW(),
          current_step = GREATEST(current_step, 4),
          updated_at = NOW()
      WHERE user_id = p_user_id;
    WHEN 4 THEN
      UPDATE launchpad_progress 
      SET step_4_life_plan = TRUE, 
          step_4_form_submission_id = (p_data->>'form_submission_id')::UUID,
          step_4_completed_at = NOW(),
          current_step = GREATEST(current_step, 5),
          updated_at = NOW()
      WHERE user_id = p_user_id;
    WHEN 5 THEN
      UPDATE launchpad_progress 
      SET step_5_focus_areas = TRUE, 
          step_5_focus_areas_selected = COALESCE(p_data->'focus_areas', '[]'::jsonb),
          step_5_completed_at = NOW(),
          current_step = GREATEST(current_step, 6),
          updated_at = NOW()
      WHERE user_id = p_user_id;
    WHEN 6 THEN
      UPDATE launchpad_progress 
      SET step_6_first_week = TRUE, 
          step_6_actions = COALESCE(p_data->'actions', '[]'::jsonb),
          step_6_anchor_habit = p_data->>'anchor_habit',
          step_6_completed_at = NOW(),
          current_step = GREATEST(current_step, 7),
          updated_at = NOW()
      WHERE user_id = p_user_id;
    WHEN 7 THEN
      UPDATE launchpad_progress 
      SET step_7_dashboard_activated = TRUE, 
          step_7_completed_at = NOW(),
          launchpad_complete = TRUE,
          completed_at = NOW(),
          current_step = 8,
          updated_at = NOW()
      WHERE user_id = p_user_id;
  END CASE;
  
  -- Award XP using unified function
  IF v_xp > 0 THEN
    PERFORM award_unified_xp(p_user_id, v_xp, 'launchpad', 'Completed Launchpad step ' || p_step);
  END IF;
  
  -- Award tokens
  IF v_tokens > 0 THEN
    UPDATE profiles SET tokens = COALESCE(tokens, 0) + v_tokens WHERE id = p_user_id;
  END IF;
  
  -- Unlock feature
  IF v_unlock IS NOT NULL THEN
    INSERT INTO user_feature_unlocks (user_id, feature_key, unlock_reason, unlock_source)
    VALUES (p_user_id, v_unlock, 'Completed Launchpad step ' || p_step, 'launchpad')
    ON CONFLICT (user_id, feature_key) DO NOTHING;
  END IF;
  
  v_result := jsonb_build_object(
    'success', TRUE,
    'step', p_step,
    'xp_awarded', v_xp,
    'tokens_awarded', v_tokens,
    'feature_unlocked', v_unlock
  );
  
  RETURN v_result;
END;
$$;

-- ============================================
-- FUNCTION: Initialize Launchpad for New User
-- ============================================
CREATE OR REPLACE FUNCTION public.initialize_launchpad()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO launchpad_progress (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to initialize launchpad on new profile
CREATE TRIGGER on_profile_created_init_launchpad
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_launchpad();

-- ============================================
-- FUNCTION: Get User Tier
-- Returns the user's current tier based on level and launchpad
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_tier(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_level INTEGER;
  v_launchpad_complete BOOLEAN;
  v_streak INTEGER;
BEGIN
  SELECT 
    COALESCE(p.level, 1),
    COALESCE(lp.launchpad_complete, FALSE),
    COALESCE(p.session_streak, 0)
  INTO v_level, v_launchpad_complete, v_streak
  FROM profiles p
  LEFT JOIN launchpad_progress lp ON lp.user_id = p.id
  WHERE p.id = p_user_id;
  
  -- Tier 4: Mastery (Level 10+)
  IF v_level >= 10 THEN
    RETURN 'mastery';
  -- Tier 3: Consistency (Level 7-9 + 7+ day streak)
  ELSIF v_level >= 7 AND v_streak >= 7 THEN
    RETURN 'consistency';
  -- Tier 2: Structure (Level 4-6 + Launchpad Complete)
  ELSIF v_level >= 4 AND v_launchpad_complete THEN
    RETURN 'structure';
  -- Tier 1: Clarity (Default)
  ELSE
    RETURN 'clarity';
  END IF;
END;
$$;

-- Update timestamp trigger
CREATE TRIGGER update_launchpad_progress_updated_at
  BEFORE UPDATE ON public.launchpad_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();