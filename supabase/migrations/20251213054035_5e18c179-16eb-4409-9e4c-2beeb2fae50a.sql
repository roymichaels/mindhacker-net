-- Fix the push notification trigger to use correct pg_net syntax
CREATE OR REPLACE FUNCTION public.send_push_notification_via_edge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request_id bigint;
BEGIN
  -- Call the push-notifications edge function using net.http_post
  SELECT net.http_post(
    url := 'https://voiomhujdmadsidbqskp.supabase.co/functions/v1/push-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer sb_publishable_IwjpGxraAQjdV_83wETmKA_tbnmLufc'
    ),
    body := jsonb_build_object(
      'action', 'send',
      'user_id', NEW.user_id::text,
      'title', NEW.title,
      'body', NEW.message,
      'url', COALESCE(NEW.link, '/dashboard')
    )
  ) INTO v_request_id;
  
  RAISE LOG 'Push notification request sent with id: %', v_request_id;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the transaction
  RAISE WARNING 'Push notification edge call failed: %', SQLERRM;
  RETURN NEW;
END;
$$;
