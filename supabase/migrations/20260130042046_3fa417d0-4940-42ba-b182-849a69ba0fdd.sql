-- Update the complete_launchpad_step function to support 9 steps (including GrowthDeepDive)
CREATE OR REPLACE FUNCTION public.complete_launchpad_step(p_user_id UUID, p_step INTEGER, p_data JSONB DEFAULT '{}'::JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
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
  
  -- Update based on step number (now 9 steps)
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
      -- Personal Profile
      UPDATE launchpad_progress SET
        step_2_profile = true,
        step_2_profile_data = p_data,
        step_2_profile_completed_at = NOW(),
        current_step = 3,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 40;
      v_tokens_awarded := 5;
      v_feature_unlocked := 'growth_deep_dive';
      
    WHEN 3 THEN
      -- Growth Deep Dive (NEW - stores additional deep dive data in profile_data)
      UPDATE launchpad_progress SET
        step_2_profile_data = COALESCE(step_2_profile_data, '{}'::jsonb) || jsonb_build_object('deep_dive', p_data),
        current_step = 4,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 35;
      v_feature_unlocked := 'aurora_chat_basic';
      
    WHEN 4 THEN
      -- First Chat (uses step_2_* columns for backward compatibility)
      UPDATE launchpad_progress SET
        step_2_first_chat = true,
        step_2_summary = p_data->>'summary',
        step_2_completed_at = NOW(),
        current_step = 5,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 50;
      v_feature_unlocked := 'introspection_questionnaire';
      
    WHEN 5 THEN
      -- Introspection (uses step_3_* columns)
      UPDATE launchpad_progress SET
        step_3_introspection = true,
        step_3_form_submission_id = (p_data->>'form_submission_id')::UUID,
        step_3_completed_at = NOW(),
        current_step = 6,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 100;
      v_tokens_awarded := 10;
      v_feature_unlocked := 'life_plan_questionnaire';
      
    WHEN 6 THEN
      -- Life Plan (uses step_4_* columns)
      UPDATE launchpad_progress SET
        step_4_life_plan = true,
        step_4_form_submission_id = (p_data->>'form_submission_id')::UUID,
        step_4_completed_at = NOW(),
        current_step = 7,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 100;
      v_tokens_awarded := 15;
      v_feature_unlocked := 'focus_areas_selection';
      
    WHEN 7 THEN
      -- Focus Areas (uses step_5_* columns)
      UPDATE launchpad_progress SET
        step_5_focus_areas = true,
        step_5_focus_areas_selected = p_data->'focus_areas',
        step_5_completed_at = NOW(),
        current_step = 8,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 50;
      v_feature_unlocked := 'first_week_planning';
      
    WHEN 8 THEN
      -- First Week (uses step_6_* columns)
      UPDATE launchpad_progress SET
        step_6_first_week = true,
        step_6_actions = p_data->'actions',
        step_6_anchor_habit = p_data->>'anchor_habit',
        step_6_completed_at = NOW(),
        current_step = 9,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 75;
      v_feature_unlocked := 'dashboard_full';
      
    WHEN 9 THEN
      -- Dashboard Activation (uses step_7_* columns)
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
    UPDATE profiles SET
      experience = COALESCE(experience, 0) + v_xp_awarded,
      tokens = COALESCE(tokens, 0) + v_tokens_awarded,
      updated_at = NOW()
    WHERE id = p_user_id;
  END IF;
  
  -- Build result
  v_result := jsonb_build_object(
    'success', true,
    'step', p_step,
    'xp_awarded', v_xp_awarded,
    'tokens_awarded', v_tokens_awarded,
    'feature_unlocked', v_feature_unlocked
  );
  
  RETURN v_result;
END;
$$;