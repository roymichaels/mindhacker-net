
-- Create a function to generate admin notification when user completes the transformation journey
CREATE OR REPLACE FUNCTION public.notify_admin_journey_completion()
RETURNS TRIGGER AS $$
DECLARE
  user_full_name TEXT;
  user_email TEXT;
BEGIN
  -- Only trigger when launchpad_complete changes from false/null to true
  IF NEW.launchpad_complete = true AND (OLD.launchpad_complete IS NULL OR OLD.launchpad_complete = false) THEN
    -- Get user info
    SELECT full_name INTO user_full_name
    FROM public.profiles
    WHERE id = NEW.user_id;
    
    -- Get email from auth.users
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = NEW.user_id;
    
    -- Insert admin notification
    INSERT INTO public.admin_notifications (
      type,
      priority,
      title,
      message,
      link,
      metadata
    ) VALUES (
      'journey_completion',
      'medium',
      'מסע טרנספורמציה הושלם',
      COALESCE(user_full_name, 'משתמש') || ' סיים/ה את מסע הטרנספורמציה',
      '/admin/users/' || NEW.user_id,
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on launchpad_progress table
DROP TRIGGER IF EXISTS on_journey_completion ON public.launchpad_progress;
CREATE TRIGGER on_journey_completion
  AFTER UPDATE ON public.launchpad_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_journey_completion();

-- Also trigger on insert (in case launchpad_complete is set to true on first insert)
DROP TRIGGER IF EXISTS on_journey_completion_insert ON public.launchpad_progress;
CREATE TRIGGER on_journey_completion_insert
  AFTER INSERT ON public.launchpad_progress
  FOR EACH ROW
  WHEN (NEW.launchpad_complete = true)
  EXECUTE FUNCTION public.notify_admin_journey_completion();
