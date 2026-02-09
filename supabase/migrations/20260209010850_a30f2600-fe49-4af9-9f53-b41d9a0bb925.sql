
-- Fix search_path on original overloads that lack it
CREATE OR REPLACE FUNCTION public.aurora_award_xp(p_user_id uuid, p_amount integer, p_reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  PERFORM award_unified_xp(p_user_id, p_amount, 'aurora', p_reason);
END;
$function$;

CREATE OR REPLACE FUNCTION public.complete_launchpad_step(p_user_id uuid, p_step integer, p_data jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_progress launchpad_progress%ROWTYPE;
  v_xp_awarded INTEGER := 0;
  v_tokens_awarded INTEGER := 0;
  v_feature_unlocked TEXT := NULL;
  v_result JSONB;
BEGIN
  SELECT * INTO v_progress FROM launchpad_progress WHERE user_id = p_user_id;
  
  IF v_progress IS NULL THEN
    INSERT INTO launchpad_progress (user_id) VALUES (p_user_id)
    RETURNING * INTO v_progress;
  END IF;
  
  IF p_step != v_progress.current_step THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid step number',
      'expected_step', v_progress.current_step
    );
  END IF;
  
  CASE p_step
    WHEN 1 THEN
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
      UPDATE launchpad_progress SET
        step_2_profile_data = COALESCE(step_2_profile_data, '{}'::jsonb) || jsonb_build_object('deep_dive', p_data),
        current_step = 4,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 35;
      v_feature_unlocked := 'aurora_chat_basic';
      
    WHEN 4 THEN
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
      UPDATE launchpad_progress SET
        step_3_introspection = true,
        step_3_form_submission_id = (p_data->>'form_submission_id')::UUID,
        step_3_completed_at = NOW(),
        current_step = 6,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 60;
      v_tokens_awarded := 5;
      v_feature_unlocked := 'life_plan';
      
    WHEN 6 THEN
      UPDATE launchpad_progress SET
        step_4_life_plan = true,
        step_4_completed_at = NOW(),
        current_step = 7,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 50;
      v_tokens_awarded := 5;
      v_feature_unlocked := 'mini_hypnosis';
      
    WHEN 7 THEN
      UPDATE launchpad_progress SET
        step_5_hypnosis = true,
        step_5_completed_at = NOW(),
        current_step = 8,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 75;
      v_tokens_awarded := 10;
      v_feature_unlocked := 'habits';
      
    WHEN 8 THEN
      UPDATE launchpad_progress SET
        step_6_habits = true,
        step_6_completed_at = NOW(),
        current_step = 9,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 50;
      v_tokens_awarded := 5;
      v_feature_unlocked := 'dashboard_activation';
      
    WHEN 9 THEN
      UPDATE launchpad_progress SET
        step_7_dashboard = true,
        step_7_completed_at = NOW(),
        is_complete = true,
        completed_at = NOW(),
        current_step = 10,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 100;
      v_tokens_awarded := 20;
      v_feature_unlocked := 'full_dashboard';
      
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Invalid step number');
  END CASE;
  
  -- Award XP
  IF v_xp_awarded > 0 THEN
    PERFORM award_unified_xp(p_user_id, v_xp_awarded, 'launchpad', 'Completed step ' || p_step);
  END IF;
  
  -- Award tokens
  IF v_tokens_awarded > 0 THEN
    UPDATE profiles SET tokens = COALESCE(tokens, 0) + v_tokens_awarded WHERE id = p_user_id;
  END IF;
  
  v_result := jsonb_build_object(
    'success', true,
    'xp_awarded', v_xp_awarded,
    'tokens_awarded', v_tokens_awarded,
    'feature_unlocked', v_feature_unlocked,
    'next_step', p_step + 1
  );
  
  RETURN v_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_journey_completion(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_display_name text;
BEGIN
  SELECT display_name INTO v_display_name FROM profiles WHERE id = p_user_id;
  
  INSERT INTO admin_notifications (title, message, type, metadata)
  VALUES (
    'משתמש השלים מסע תודעה',
    COALESCE(v_display_name, 'משתמש') || ' השלים את מסע התודעה בהצלחה',
    'system',
    jsonb_build_object('user_id', p_user_id, 'event', 'journey_complete')
  );
END;
$function$;
