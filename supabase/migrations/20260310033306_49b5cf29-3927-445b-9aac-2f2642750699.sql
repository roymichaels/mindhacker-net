
-- ============================================================
-- Fix: Remove duplicate admin notification triggers on launchpad_progress
-- Keep ONLY notify_onboarding_completed (rich calibration data)
-- Drop the 3 redundant journey completion functions/triggers
-- ============================================================

-- 1. Drop all redundant triggers on launchpad_progress
DROP TRIGGER IF EXISTS on_journey_complete ON public.launchpad_progress;
DROP TRIGGER IF EXISTS on_journey_complete_insert ON public.launchpad_progress;
DROP TRIGGER IF EXISTS on_launchpad_journey_complete ON public.launchpad_progress;
DROP TRIGGER IF EXISTS on_launchpad_journey_completion ON public.launchpad_progress;
DROP TRIGGER IF EXISTS trigger_notify_journey_completion ON public.launchpad_progress;
DROP TRIGGER IF EXISTS trigger_notify_journey_complete ON public.launchpad_progress;

-- 2. Drop redundant functions
DROP FUNCTION IF EXISTS public.notify_admin_journey_complete() CASCADE;
DROP FUNCTION IF EXISTS public.notify_admin_journey_completion() CASCADE;
DROP FUNCTION IF EXISTS public.notify_journey_completion() CASCADE;

-- 3. Update notify_onboarding_completed with better language aligned to the OS
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
    SELECT COALESCE(full_name, display_name, 'משתמש חדש')
    INTO v_user_name
    FROM public.profiles
    WHERE id = NEW.user_id;

    v_pillar := COALESCE(NEW.step_1_intention->>'selected_pillar', 'mind');
    v_diagnostic_scores := COALESCE(NEW.step_1_intention->'diagnostic_scores', '{}'::jsonb);
    v_profile_data := COALESCE(NEW.step_2_profile_data, '{}'::jsonb);

    -- Single comprehensive notification for onboarding completion
    INSERT INTO public.admin_notifications (type, priority, title, message, link, metadata)
    VALUES (
      'onboarding_completed',
      'high',
      '🚀 ' || v_user_name || ' השלים/ה את תהליך הכיול',
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

-- 4. Ensure trigger exists (only one)
DROP TRIGGER IF EXISTS on_onboarding_completed ON public.launchpad_progress;
CREATE TRIGGER on_onboarding_completed
  AFTER UPDATE ON public.launchpad_progress
  FOR EACH ROW
  WHEN (NEW.launchpad_complete = true)
  EXECUTE FUNCTION public.notify_onboarding_completed();
