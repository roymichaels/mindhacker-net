-- Enable pg_net extension for HTTP calls from database
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create function to send push notification via edge function
CREATE OR REPLACE FUNCTION public.send_push_notification_via_edge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_supabase_url TEXT := 'https://voiomhujdmadsidbqskp.supabase.co';
  v_anon_key TEXT := 'sb_publishable_IwjpGxraAQjdV_83wETmKA_tbnmLufc';
BEGIN
  -- Call the push-notifications edge function
  PERFORM extensions.http_post(
    url := v_supabase_url || '/functions/v1/push-notifications',
    body := jsonb_build_object(
      'action', 'send',
      'user_id', NEW.user_id::text,
      'title', NEW.title,
      'body', NEW.message,
      'url', COALESCE(NEW.link, '/dashboard')
    )::text,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_anon_key
    )::jsonb
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the transaction
  RAISE WARNING 'Push notification edge call failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Create trigger to send push when user notification is created
DROP TRIGGER IF EXISTS on_user_notification_send_push ON public.user_notifications;
CREATE TRIGGER on_user_notification_send_push
  AFTER INSERT ON public.user_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.send_push_notification_via_edge();
