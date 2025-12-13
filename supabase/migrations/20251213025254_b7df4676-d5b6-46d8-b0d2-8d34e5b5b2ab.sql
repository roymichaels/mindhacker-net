-- Enable pg_net extension for HTTP calls from database
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function to send push notification when user_notification is created
CREATE OR REPLACE FUNCTION public.send_push_on_user_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_service_role_key TEXT;
  v_supabase_url TEXT;
BEGIN
  -- Get environment variables
  v_supabase_url := 'https://tsvfsbluyuaajqmkpzdv.supabase.co';
  
  -- Call the push-notifications edge function
  PERFORM net.http_post(
    url := v_supabase_url || '/functions/v1/push-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'action', 'send',
      'user_id', NEW.user_id::text,
      'title', NEW.title,
      'body', NEW.message,
      'url', COALESCE(NEW.link, '/dashboard')
    )
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the transaction
  RAISE WARNING 'Push notification failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Trigger to send push on new user notification
DROP TRIGGER IF EXISTS on_user_notification_created ON public.user_notifications;
CREATE TRIGGER on_user_notification_created
AFTER INSERT ON public.user_notifications
FOR EACH ROW
EXECUTE FUNCTION public.send_push_on_user_notification();

-- Function to send welcome notification to new users
CREATE OR REPLACE FUNCTION public.notify_new_user_welcome()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_notifications (user_id, type, title, message, link)
  VALUES (
    NEW.id,
    'welcome',
    'ברוך הבא למיינד האקר! 🎉',
    'שמחים שהצטרפת אלינו. גלה את התכנים שלנו והתחל את המסע שלך',
    '/courses'
  );
  RETURN NEW;
END;
$$;

-- Trigger for welcome notification on new profile
DROP TRIGGER IF EXISTS on_new_user_welcome ON public.profiles;
CREATE TRIGGER on_new_user_welcome
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_user_welcome();