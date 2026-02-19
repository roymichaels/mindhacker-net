
-- 1) Drop the generic "טופס חדש התקבל" trigger on form_submissions
DROP TRIGGER IF EXISTS trigger_notify_form_submission ON public.form_submissions;

-- 2) Create a rich onboarding-completion notification function
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
  -- Only fire when launchpad_complete flips from false/null to true
  IF NEW.launchpad_complete = true AND (OLD.launchpad_complete IS NULL OR OLD.launchpad_complete = false) THEN
    -- Get user name
    SELECT COALESCE(full_name, display_name, 'משתמש חדש')
    INTO v_user_name
    FROM public.profiles
    WHERE id = NEW.user_id;

    -- Extract pillar and diagnostics from the saved data
    v_pillar := COALESCE(NEW.step_1_intention->>'selected_pillar', 'mind');
    v_diagnostic_scores := COALESCE(NEW.step_1_intention->'diagnostic_scores', '{}'::jsonb);
    v_profile_data := COALESCE(NEW.step_2_profile_data, '{}'::jsonb);

    -- Create rich admin notification
    INSERT INTO public.admin_notifications (type, priority, title, message, link, metadata)
    VALUES (
      'onboarding_completed',
      'high',
      '🧠 ' || v_user_name || ' השלים/ה כיול מערכת',
      'פילר: ' || v_pillar || 
        ' | אנרגיה: ' || COALESCE(v_diagnostic_scores->>'energy_stability', '?') ||
        '% | ריקברי: ' || COALESCE(v_diagnostic_scores->>'recovery_debt', '?') ||
        '% | דופמין: ' || COALESCE(v_diagnostic_scores->>'dopamine_load', '?') || '%',
      '/panel/users/' || NEW.user_id || '/dashboard',
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

-- 3) Attach to launchpad_progress
CREATE TRIGGER trigger_notify_onboarding_completed
AFTER UPDATE ON public.launchpad_progress
FOR EACH ROW
EXECUTE FUNCTION public.notify_onboarding_completed();

-- 4) Add 'onboarding_completed' to notification_type enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumtypid = 'public.notification_type'::regtype 
    AND enumlabel = 'onboarding_completed'
  ) THEN
    ALTER TYPE public.notification_type ADD VALUE 'onboarding_completed';
  END IF;
END$$;
