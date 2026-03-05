-- Fix notify_onboarding_completed: replace display_name with community_username
CREATE OR REPLACE FUNCTION public.notify_onboarding_completed()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_name TEXT;
  v_pillar TEXT;
  v_diagnostic_scores JSONB;
  v_profile_data JSONB;
BEGIN
  IF NEW.launchpad_complete = true AND (OLD.launchpad_complete IS NULL OR OLD.launchpad_complete = false) THEN
    SELECT COALESCE(full_name, community_username, 'משתמש חדש')
    INTO v_user_name
    FROM public.profiles
    WHERE id = NEW.user_id;

    v_pillar := COALESCE(NEW.step_1_intention->>'selected_pillar', 'mind');
    v_diagnostic_scores := COALESCE(NEW.step_1_intention->'diagnostic_scores', '{}'::jsonb);
    v_profile_data := COALESCE(NEW.step_2_profile_data, '{}'::jsonb);

    INSERT INTO public.admin_notifications (type, priority, title, message, link, metadata)
    VALUES (
      'onboarding_completed',
      'high',
      '🧠 ' || v_user_name || ' השלים/ה כיול מערכת',
      'פילר: ' || v_pillar || 
        ' | אנרגיה: ' || COALESCE(v_diagnostic_scores->>'energy_stability', '?') ||
        '% | ריקברי: ' || COALESCE(v_diagnostic_scores->>'recovery_debt', '?') ||
        '% | דופמין: ' || COALESCE(v_diagnostic_scores->>'dopamine_load', '?') || '%',
      '/admin-hub?tab=admin&sub=users',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'user_name', v_user_name,
        'pillar', v_pillar,
        'diagnostic_scores', v_diagnostic_scores,
        'age_bracket', v_profile_data->>'age_bracket',
        'gender', v_profile_data->>'gender',
        'activity_level', v_profile_data->>'activity_level',
        'completed_at', now()
      )
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- Fix notify_journey_completion: replace display_name with full_name
CREATE OR REPLACE FUNCTION public.notify_journey_completion(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_display_name text;
BEGIN
  SELECT COALESCE(full_name, community_username) INTO v_display_name FROM profiles WHERE id = p_user_id;
  
  INSERT INTO admin_notifications (title, message, type, metadata)
  VALUES (
    'משתמש השלים מסע תודעה',
    COALESCE(v_display_name, 'משתמש') || ' השלים את מסע התודעה בהצלחה',
    'system',
    jsonb_build_object('user_id', p_user_id, 'event', 'journey_complete')
  );
END;
$function$;