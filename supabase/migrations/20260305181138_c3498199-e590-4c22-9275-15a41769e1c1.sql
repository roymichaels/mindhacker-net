CREATE OR REPLACE FUNCTION public.notify_admin_journey_complete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_email TEXT;
  user_name TEXT;
BEGIN
  IF NEW.launchpad_complete = true AND (OLD.launchpad_complete IS NULL OR OLD.launchpad_complete = false) THEN
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.user_id;
    SELECT COALESCE(full_name, community_username, user_email) INTO user_name
    FROM profiles WHERE id = NEW.user_id;
    
    INSERT INTO admin_notifications (type, priority, title, message, link, metadata)
    VALUES (
      'user_milestone',
      'medium',
      CASE 
        WHEN user_name IS NOT NULL THEN user_name || ' סיים את מסע הטרנספורמציה!'
        ELSE 'משתמש סיים את מסע הטרנספורמציה!'
      END,
      'משתמש השלים את כל שלבי הלאנצ''פד ומוכן להתחיל עם אורורה.',
      '/panel/users/' || NEW.user_id || '/dashboard',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'user_email', user_email,
        'completed_at', NEW.completed_at
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;