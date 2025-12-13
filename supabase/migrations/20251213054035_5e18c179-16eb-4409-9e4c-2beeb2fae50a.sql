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
    url := 'https://tsvfsbluyuaajqmkpzdv.supabase.co/functions/v1/push-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzdmZzYmx1eXVhYWpxbWtwemR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNDY3ODAsImV4cCI6MjA3ODcyMjc4MH0.25iZhw71Zlha_JNO8pBDTaxPy4IuTGKFlcP3D80Md1Y'
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