-- Update the notify_journey_completion function to link to the user dashboard view
CREATE OR REPLACE FUNCTION public.notify_journey_completion()
RETURNS TRIGGER AS $$
DECLARE
  user_name text;
  user_email text;
BEGIN
  -- Only trigger when launchpad_complete changes to true
  IF NEW.launchpad_complete = true AND (OLD.launchpad_complete IS NULL OR OLD.launchpad_complete = false) THEN
    -- Get user info
    SELECT full_name INTO user_name FROM public.profiles WHERE id = NEW.user_id;
    
    -- Create admin notification with link to user's dashboard view
    INSERT INTO public.admin_notifications (
      type,
      title,
      message,
      link,
      metadata,
      priority
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
$$ LANGUAGE plpgsql SECURITY DEFINER;