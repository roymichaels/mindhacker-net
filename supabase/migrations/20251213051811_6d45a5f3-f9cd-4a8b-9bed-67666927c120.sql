-- Create function to fan out admin notifications to admin users as user_notifications
CREATE OR REPLACE FUNCTION public.fanout_admin_notifications_to_users()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Insert a corresponding user notification for each admin user
  INSERT INTO user_notifications (user_id, type, title, message, link, metadata)
  SELECT ur.user_id,
         'admin_alert',
         NEW.title,
         NEW.message,
         COALESCE(NEW.link, '/admin'),
         jsonb_build_object(
           'source', 'admin_notification',
           'admin_notification_id', NEW.id,
           'type', NEW.type,
           'priority', NEW.priority,
           'metadata', NEW.metadata
         )
  FROM user_roles ur
  WHERE ur.role = 'admin';

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Do not block the original insert if something goes wrong
  RAISE WARNING 'Failed to fanout admin notification to users: %', SQLERRM;
  RETURN NEW;
END;
$function$;

-- Attach trigger to admin_notifications table
DROP TRIGGER IF EXISTS trg_fanout_admin_notifications_to_users ON public.admin_notifications;
CREATE TRIGGER trg_fanout_admin_notifications_to_users
AFTER INSERT ON public.admin_notifications
FOR EACH ROW
EXECUTE FUNCTION public.fanout_admin_notifications_to_users();