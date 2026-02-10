
-- Fix 1: Add storage INSERT policy for bug-screenshots
CREATE POLICY "Authenticated users can upload bug screenshots"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'bug-screenshots' AND auth.role() = 'authenticated');

-- Fix 2: Rewrite complete_launchpad_step for 11-step flow with correct columns
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
BEGIN
  SELECT * INTO v_progress FROM launchpad_progress WHERE user_id = p_user_id;
  
  IF v_progress IS NULL THEN
    INSERT INTO launchpad_progress (user_id) VALUES (p_user_id)
    RETURNING * INTO v_progress;
  END IF;
  
  -- Allow completing current step or re-completing past steps
  IF p_step > v_progress.current_step THEN
    RETURN jsonb_build_object(
      'success', false,
      'step', p_step,
      'error', 'Cannot skip steps',
      'expected_step', v_progress.current_step,
      'xp_awarded', 0,
      'tokens_awarded', 0,
      'feature_unlocked', NULL
    );
  END IF;
  
  -- Only advance current_step if completing the current step
  CASE p_step
    WHEN 1 THEN
      UPDATE launchpad_progress SET
        step_1_welcome = true,
        step_1_intention = p_data->>'intention',
        step_1_completed_at = NOW(),
        current_step = GREATEST(current_step, 2),
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 25;
      v_feature_unlocked := 'personal_profile';
      
    WHEN 2 THEN
      UPDATE launchpad_progress SET
        step_2_profile = true,
        step_2_profile_data = COALESCE(p_data, '{}'::jsonb),
        step_2_profile_completed_at = NOW(),
        current_step = GREATEST(current_step, 3),
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 40;
      v_tokens_awarded := 5;
      v_feature_unlocked := 'lifestyle_routine';
      
    WHEN 3 THEN
      -- Lifestyle & Routine
      UPDATE launchpad_progress SET
        step_3_lifestyle_data = p_data,
        step_3_lifestyle_completed_at = NOW(),
        current_step = GREATEST(current_step, 4),
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 35;
      v_feature_unlocked := 'growth_deep_dive';
      
    WHEN 4 THEN
      -- Growth Deep Dive - merge into profile data
      UPDATE launchpad_progress SET
        step_2_profile_data = COALESCE(step_2_profile_data, '{}'::jsonb) || jsonb_build_object('deep_dive', p_data),
        current_step = GREATEST(current_step, 5),
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 35;
      v_feature_unlocked := 'aurora_chat_basic';
      
    WHEN 5 THEN
      -- First Chat
      UPDATE launchpad_progress SET
        step_2_first_chat = true,
        step_2_summary = p_data->>'summary',
        step_2_completed_at = NOW(),
        current_step = GREATEST(current_step, 6),
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 50;
      v_feature_unlocked := 'introspection_questionnaire';
      
    WHEN 6 THEN
      -- Introspection
      UPDATE launchpad_progress SET
        step_3_introspection = true,
        step_3_form_submission_id = CASE 
          WHEN p_data->>'form_submission_id' IS NOT NULL 
          THEN (p_data->>'form_submission_id')::UUID 
          ELSE step_3_form_submission_id 
        END,
        step_3_completed_at = NOW(),
        current_step = GREATEST(current_step, 7),
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 50;
      v_tokens_awarded := 5;
      v_feature_unlocked := 'introspection_complete';
      
    WHEN 7 THEN
      -- Life Plan / Vision & Direction
      UPDATE launchpad_progress SET
        step_4_life_plan = true,
        step_4_form_submission_id = CASE 
          WHEN p_data->>'form_submission_id' IS NOT NULL 
          THEN (p_data->>'form_submission_id')::UUID 
          ELSE step_4_form_submission_id 
        END,
        step_4_completed_at = NOW(),
        current_step = GREATEST(current_step, 8),
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 100;
      v_tokens_awarded := 10;
      v_feature_unlocked := 'life_plan_complete';
      
    WHEN 8 THEN
      -- Focus Areas
      UPDATE launchpad_progress SET
        step_5_focus_areas = true,
        step_5_focus_areas_selected = CASE
          WHEN p_data->'focusAreas' IS NOT NULL 
          THEN ARRAY(SELECT jsonb_array_elements_text(p_data->'focusAreas'))
          WHEN p_data->'focus_areas' IS NOT NULL
          THEN ARRAY(SELECT jsonb_array_elements_text(p_data->'focus_areas'))
          ELSE step_5_focus_areas_selected
        END,
        step_5_completed_at = NOW(),
        current_step = GREATEST(current_step, 9),
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 50;
      v_feature_unlocked := 'focus_areas_selection';
      
    WHEN 9 THEN
      -- First Week
      UPDATE launchpad_progress SET
        step_6_first_week = true,
        step_6_actions = CASE
          WHEN p_data->'actions' IS NOT NULL
          THEN ARRAY(SELECT jsonb_array_elements_text(p_data->'actions'))
          ELSE step_6_actions
        END,
        step_6_anchor_habit = COALESCE(p_data->>'anchor_habit', step_6_anchor_habit),
        step_6_completed_at = NOW(),
        current_step = GREATEST(current_step, 10),
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 75;
      v_feature_unlocked := 'first_week_planning';
      
    WHEN 10 THEN
      -- Final Notes
      UPDATE launchpad_progress SET
        step_10_final_notes = COALESCE(p_data->>'notes', p_data::text),
        step_10_completed_at = NOW(),
        current_step = GREATEST(current_step, 11),
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 25;
      v_feature_unlocked := 'final_notes';
      
    WHEN 11 THEN
      -- Dashboard Activation - Complete!
      UPDATE launchpad_progress SET
        step_7_dashboard_activated = true,
        step_7_completed_at = NOW(),
        launchpad_complete = true,
        completed_at = NOW(),
        current_step = 11,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 100;
      v_tokens_awarded := 25;
      v_feature_unlocked := 'life_os_complete';
      
    ELSE
      RETURN jsonb_build_object(
        'success', false,
        'step', p_step,
        'error', 'Invalid step number',
        'xp_awarded', 0,
        'tokens_awarded', 0,
        'feature_unlocked', NULL
      );
  END CASE;
  
  -- Award XP (only for first-time completion of current step)
  IF v_xp_awarded > 0 AND p_step = v_progress.current_step THEN
    PERFORM aurora_award_xp(p_user_id, v_xp_awarded, 'launchpad', 'Completed step ' || p_step);
  END IF;
  
  -- Award tokens (only for first-time completion)
  IF v_tokens_awarded > 0 AND p_step = v_progress.current_step THEN
    UPDATE profiles SET tokens = COALESCE(tokens, 0) + v_tokens_awarded WHERE id = p_user_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'step', p_step,
    'xp_awarded', CASE WHEN p_step = v_progress.current_step THEN v_xp_awarded ELSE 0 END,
    'tokens_awarded', CASE WHEN p_step = v_progress.current_step THEN v_tokens_awarded ELSE 0 END,
    'feature_unlocked', CASE WHEN p_step = v_progress.current_step THEN v_feature_unlocked ELSE NULL END
  );
END;
$$;
