-- Remove the non-functional push notification trigger from database
-- Use CASCADE to drop dependent objects
DROP TRIGGER IF EXISTS on_user_notification_created ON public.user_notifications;
DROP FUNCTION IF EXISTS public.send_push_on_user_notification() CASCADE;

-- Add trigger for subscription cancellation notification to user
CREATE OR REPLACE FUNCTION public.notify_user_subscription_cancelled()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier_name TEXT;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status = 'cancelled' THEN
    SELECT name INTO v_tier_name
    FROM subscription_tiers
    WHERE id = NEW.tier_id;
    
    INSERT INTO user_notifications (user_id, type, title, message, link, metadata)
    VALUES (
      NEW.user_id,
      'subscription_cancelled',
      'המנוי שלך בוטל',
      'המנוי ' || COALESCE(v_tier_name, '') || ' בוטל. נשמח לראות אותך שוב בעתיד!',
      '/subscriptions',
      jsonb_build_object('tier_id', NEW.tier_id, 'cancelled_at', NEW.cancelled_at)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for user subscription cancellation
DROP TRIGGER IF EXISTS on_user_subscription_cancelled ON public.user_subscriptions;
CREATE TRIGGER on_user_subscription_cancelled
  AFTER UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_user_subscription_cancelled();