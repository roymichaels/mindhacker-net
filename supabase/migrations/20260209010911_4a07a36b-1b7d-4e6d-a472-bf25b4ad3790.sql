
-- Fix the trigger version of notify_journey_completion (no args)
CREATE OR REPLACE FUNCTION public.notify_journey_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_name text;
  user_email text;
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
      '/panel/users/' || NEW.user_id || '/dashboard',
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
