-- Add new columns for Personal Profile step (between step 1 and current step 2)
-- We'll add step_2_profile columns and keep the existing column names as-is
-- The function will handle the logic for the new 8-step flow

-- Add new step 2 columns for Personal Profile
ALTER TABLE public.launchpad_progress
  ADD COLUMN IF NOT EXISTS step_2_profile BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS step_2_profile_data JSONB,
  ADD COLUMN IF NOT EXISTS step_2_profile_completed_at TIMESTAMPTZ;

-- Drop and recreate the complete_launchpad_step function with updated step numbers
-- The column mapping is now:
-- Step 1: step_1_* (Welcome)
-- Step 2: step_2_profile_* (Personal Profile - NEW!)
-- Step 3: step_2_* (First Chat - using old step_2 columns)
-- Step 4: step_3_* (Introspection)
-- Step 5: step_4_* (Life Plan)
-- Step 6: step_5_* (Focus Areas)
-- Step 7: step_6_* (First Week)
-- Step 8: step_7_* (Dashboard Activation)

DROP FUNCTION IF EXISTS public.complete_launchpad_step(UUID, INTEGER, JSONB);

CREATE OR REPLACE FUNCTION public.complete_launchpad_step(
  p_user_id UUID,
  p_step INTEGER,
  p_data JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_progress launchpad_progress%ROWTYPE;
  v_xp_awarded INTEGER := 0;
  v_tokens_awarded INTEGER := 0;
  v_feature_unlocked TEXT := NULL;
  v_result JSONB;
BEGIN
  -- Get or create progress record
  SELECT * INTO v_progress FROM launchpad_progress WHERE user_id = p_user_id;
  
  IF v_progress IS NULL THEN
    INSERT INTO launchpad_progress (user_id) VALUES (p_user_id)
    RETURNING * INTO v_progress;
  END IF;
  
  -- Verify step is the current step
  IF p_step != v_progress.current_step THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid step number',
      'expected_step', v_progress.current_step
    );
  END IF;
  
  -- Update based on step number (now 8 steps with new mapping)
  CASE p_step
    WHEN 1 THEN
      -- Welcome
      UPDATE launchpad_progress SET
        step_1_welcome = true,
        step_1_intention = p_data->>'intention',
        step_1_completed_at = NOW(),
        current_step = 2,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 25;
      v_feature_unlocked := 'personal_profile';
      
    WHEN 2 THEN
      -- Personal Profile (NEW!)
      UPDATE launchpad_progress SET
        step_2_profile = true,
        step_2_profile_data = p_data,
        step_2_profile_completed_at = NOW(),
        current_step = 3,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 40;
      v_tokens_awarded := 5;
      v_feature_unlocked := 'aurora_chat_basic';
      
    WHEN 3 THEN
      -- First Chat (was step 2, uses step_2_* columns)
      UPDATE launchpad_progress SET
        step_2_first_chat = true,
        step_2_summary = p_data->>'summary',
        step_2_completed_at = NOW(),
        current_step = 4,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 50;
      v_feature_unlocked := 'introspection_questionnaire';
      
    WHEN 4 THEN
      -- Introspection (was step 3, uses step_3_* columns)
      UPDATE launchpad_progress SET
        step_3_introspection = true,
        step_3_form_submission_id = (p_data->>'form_submission_id')::UUID,
        step_3_completed_at = NOW(),
        current_step = 5,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 100;
      v_tokens_awarded := 10;
      v_feature_unlocked := 'life_plan_questionnaire';
      
    WHEN 5 THEN
      -- Life Plan (was step 4, uses step_4_* columns)
      UPDATE launchpad_progress SET
        step_4_life_plan = true,
        step_4_form_submission_id = (p_data->>'form_submission_id')::UUID,
        step_4_completed_at = NOW(),
        current_step = 6,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 100;
      v_tokens_awarded := 15;
      v_feature_unlocked := 'focus_areas_selection';
      
    WHEN 6 THEN
      -- Focus Areas (was step 5, uses step_5_* columns)
      UPDATE launchpad_progress SET
        step_5_focus_areas = true,
        step_5_focus_areas_selected = p_data->'focus_areas',
        step_5_completed_at = NOW(),
        current_step = 7,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 50;
      v_feature_unlocked := 'first_week_planning';
      
    WHEN 7 THEN
      -- First Week (was step 6, uses step_6_* columns)
      UPDATE launchpad_progress SET
        step_6_first_week = true,
        step_6_actions = p_data->'actions',
        step_6_anchor_habit = p_data->>'anchor_habit',
        step_6_completed_at = NOW(),
        current_step = 8,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 75;
      v_feature_unlocked := 'dashboard_full';
      
    WHEN 8 THEN
      -- Dashboard Activation (was step 7, uses step_7_* columns)
      UPDATE launchpad_progress SET
        step_7_dashboard_activated = true,
        step_7_completed_at = NOW(),
        launchpad_complete = true,
        completed_at = NOW(),
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 100;
      v_tokens_awarded := 25;
      v_feature_unlocked := 'life_os_complete';
      
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Invalid step number');
  END CASE;
  
  -- Award XP if any
  IF v_xp_awarded > 0 THEN
    INSERT INTO xp_events (user_id, xp_amount, source, source_id, description)
    VALUES (p_user_id, v_xp_awarded, 'launchpad', p_step::TEXT, 'Completed launchpad step ' || p_step);
    
    -- Update game state
    UPDATE game_state 
    SET experience = experience + v_xp_awarded,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
      INSERT INTO game_state (user_id, experience) VALUES (p_user_id, v_xp_awarded);
    END IF;
  END IF;
  
  -- Award tokens if any
  IF v_tokens_awarded > 0 THEN
    UPDATE game_state 
    SET tokens = tokens + v_tokens_awarded,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
  
  -- Record feature unlock if any
  IF v_feature_unlocked IS NOT NULL THEN
    INSERT INTO feature_unlocks (user_id, feature_key, unlocked_at)
    VALUES (p_user_id, v_feature_unlocked, NOW())
    ON CONFLICT (user_id, feature_key) DO NOTHING;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'step', p_step,
    'xp_awarded', v_xp_awarded,
    'tokens_awarded', v_tokens_awarded,
    'feature_unlocked', v_feature_unlocked
  );
END;
$$;

-- Update existing users who already passed step 1 to have their current_step incremented
-- This ensures they see the new Personal Profile step
UPDATE public.launchpad_progress
SET current_step = current_step + 1
WHERE current_step >= 2 AND step_2_profile = false;