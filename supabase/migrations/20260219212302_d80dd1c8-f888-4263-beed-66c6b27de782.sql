-- 1. Drop the orphaned notify_new_form_submission function (no trigger uses it anymore)
DROP FUNCTION IF EXISTS public.notify_new_form_submission() CASCADE;

-- 2. Update notify_new_user to link to admin-hub instead of /panel/
CREATE OR REPLACE FUNCTION public.notify_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM create_admin_notification(
    'new_user',
    'low',
    'משתמש חדש נרשם',
    'משתמש חדש: ' || COALESCE(NEW.full_name, 'לא צוין'),
    '/admin-hub?tab=admin&sub=users',
    jsonb_build_object('user_id', NEW.id)
  );
  RETURN NEW;
END;
$function$;

-- 3. Update notify_onboarding_completed to link to admin-hub
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

-- 4. Update notify_admin_journey_completion to link to admin-hub
CREATE OR REPLACE FUNCTION public.notify_admin_journey_completion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_full_name TEXT;
  user_email TEXT;
BEGIN
  IF NEW.launchpad_complete = true AND (OLD.launchpad_complete IS NULL OR OLD.launchpad_complete = false) THEN
    SELECT full_name INTO user_full_name FROM public.profiles WHERE id = NEW.user_id;
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.user_id;
    
    INSERT INTO public.admin_notifications (
      type, priority, title, message, link, metadata
    ) VALUES (
      'journey_completion',
      'medium',
      'מסע טרנספורמציה הושלם',
      COALESCE(user_full_name, 'משתמש') || ' סיים/ה את מסע הטרנספורמציה',
      '/admin-hub?tab=admin&sub=users',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'user_name', user_full_name,
        'user_email', user_email,
        'completed_at', NEW.completed_at
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 5. Update notify_journey_completion (trigger version) to link to admin-hub
CREATE OR REPLACE FUNCTION public.notify_journey_completion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_name text;
BEGIN
  IF NEW.launchpad_complete = true AND (OLD.launchpad_complete IS NULL OR OLD.launchpad_complete = false) THEN
    SELECT full_name INTO user_name FROM public.profiles WHERE id = NEW.user_id;
    
    INSERT INTO public.admin_notifications (
      type, title, message, link, metadata, priority
    ) VALUES (
      'journey_completion',
      CASE 
        WHEN user_name IS NOT NULL THEN user_name || ' השלים/ה את מסע הטרנספורמציה'
        ELSE 'משתמש השלים את מסע הטרנספורמציה'
      END,
      'משתמש השלים את כל שלבי הלאנצ''פד ומוכן להתחיל עם אורורה.',
      '/admin-hub?tab=admin&sub=users',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'user_name', user_name,
        'completed_at', NEW.completed_at
      ),
      'high'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 6. Update notify_new_lead to link to admin-hub
CREATE OR REPLACE FUNCTION public.notify_new_lead()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.admin_notifications (type, priority, title, message, link, metadata)
  VALUES (
    'new_lead',
    'medium',
    'ליד חדש התקבל',
    'ליד חדש: ' || COALESCE(NEW.name, NEW.phone, 'לא ידוע') || ' - ' || COALESCE(NEW.source, 'כללי'),
    '/admin-hub?tab=admin&sub=leads',
    jsonb_build_object('lead_id', NEW.id, 'source', NEW.source)
  );
  
  RETURN NEW;
END;
$function$;

-- 7. Update notify_consciousness_leap functions to admin-hub
CREATE OR REPLACE FUNCTION public.notify_consciousness_leap_application()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  lead_name TEXT;
  lead_email TEXT;
BEGIN
  SELECT name, email INTO lead_name, lead_email 
  FROM public.consciousness_leap_leads 
  WHERE id = NEW.lead_id;
  
  INSERT INTO public.admin_notifications (type, priority, title, message, link, metadata)
  VALUES (
    'new_consciousness_leap_application',
    'high',
    'בקשה חדשה לקפיצת תודעה',
    'התקבלה בקשה חדשה מ: ' || COALESCE(lead_name, lead_email, 'לא ידוע'),
    '/admin-hub?tab=campaigns&sub=consciousness-leap',
    jsonb_build_object('application_id', NEW.id, 'lead_id', NEW.lead_id)
  );
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_consciousness_leap_lead()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.admin_notifications (type, priority, title, message, link, metadata)
  VALUES (
    'new_lead',
    'high',
    'ליד חדש לקפיצת תודעה',
    'ליד חדש: ' || COALESCE(NEW.name, NEW.email, 'לא ידוע'),
    '/admin-hub?tab=campaigns&sub=consciousness-leap',
    jsonb_build_object('lead_id', NEW.id, 'email', NEW.email)
  );
  
  RETURN NEW;
END;
$function$;

-- 8. Update notify_personal_hypnosis_order to admin-hub
CREATE OR REPLACE FUNCTION public.notify_personal_hypnosis_order()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_email TEXT;
  user_name TEXT;
BEGIN
  IF NEW.package_type ILIKE '%hypnosis%' OR NEW.package_type ILIKE '%היפנוזה%' OR NEW.package_type = 'personal' THEN
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.user_id;
    SELECT full_name INTO user_name FROM public.profiles WHERE id = NEW.user_id;
    
    INSERT INTO public.admin_notifications (type, priority, title, message, link, metadata)
    VALUES (
      'new_personal_hypnosis_order',
      'high',
      'הזמנה חדשה להיפנוזה אישית',
      'הזמנה חדשה מ: ' || COALESCE(user_name, user_email, 'לא ידוע') || ' - ' || NEW.package_type,
      '/admin-hub?tab=admin&sub=users',
      jsonb_build_object('purchase_id', NEW.id, 'user_id', NEW.user_id, 'package_type', NEW.package_type)
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 9. Clean up stale form submission notifications
DELETE FROM public.admin_notifications WHERE type = 'new_form_submission';
