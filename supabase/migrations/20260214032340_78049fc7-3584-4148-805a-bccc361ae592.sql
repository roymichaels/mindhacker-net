
-- Part 2: Bridge proactive queue to user notifications
-- Create trigger function that auto-creates a user_notification when a proactive queue item is inserted
CREATE OR REPLACE FUNCTION public.bridge_proactive_to_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only create notification if the item has a title and body
  IF NEW.title IS NOT NULL AND NEW.body IS NOT NULL THEN
    INSERT INTO public.user_notifications (user_id, type, title, message, link, metadata)
    VALUES (
      NEW.user_id,
      'aurora_coaching',
      NEW.title,
      NEW.body,
      '/aurora',
      jsonb_build_object(
        'proactive_id', NEW.id,
        'trigger_type', NEW.trigger_type,
        'priority', NEW.priority
      )
    );
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to bridge proactive item to notification: %', SQLERRM;
  RETURN NEW;
END;
$function$;

-- Create the trigger
DROP TRIGGER IF EXISTS bridge_proactive_to_notification_trigger ON public.aurora_proactive_queue;
CREATE TRIGGER bridge_proactive_to_notification_trigger
  AFTER INSERT ON public.aurora_proactive_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.bridge_proactive_to_notification();

-- Enable pg_cron and pg_net extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
