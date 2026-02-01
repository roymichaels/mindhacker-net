-- Create trigger to send admin notification when user completes launchpad/journey
CREATE OR REPLACE FUNCTION notify_admin_journey_complete()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Only trigger if launchpad_complete changed from false to true
  IF NEW.launchpad_complete = true AND (OLD.launchpad_complete IS NULL OR OLD.launchpad_complete = false) THEN
    -- Get user info
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.user_id;
    SELECT COALESCE(first_name || ' ' || last_name, first_name, email) INTO user_name
    FROM profiles WHERE id = NEW.user_id;
    
    -- Insert admin notification
    INSERT INTO admin_notifications (
      type,
      priority,
      title,
      message,
      link,
      metadata
    ) VALUES (
      'user_milestone',
      'medium',
      CASE 
        WHEN user_name IS NOT NULL THEN user_name || ' סיים את מסע הטרנספורמציה!'
        ELSE 'משתמש סיים את מסע הטרנספורמציה!'
      END,
      'משתמש השלים את כל שלבי הלאנצ''פד ומוכן להתחיל עם אורורה.',
      '/panel/users',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'user_email', user_email,
        'completed_at', NEW.completed_at
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_journey_complete_notification ON launchpad_progress;

CREATE TRIGGER trigger_journey_complete_notification
  AFTER UPDATE ON launchpad_progress
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_journey_complete();