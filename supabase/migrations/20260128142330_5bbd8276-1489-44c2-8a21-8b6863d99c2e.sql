-- Fix the notify_new_form_submission function to use SECURITY DEFINER
-- This allows the trigger to insert admin notifications even when called by anonymous users

CREATE OR REPLACE FUNCTION public.notify_new_form_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  form_name TEXT;
BEGIN
  -- Get the form name
  SELECT title INTO form_name FROM public.custom_forms WHERE id = NEW.form_id;
  
  -- Insert admin notification
  INSERT INTO public.admin_notifications (type, priority, title, message, link, metadata)
  VALUES (
    'new_form_submission',
    'medium',
    'טופס חדש התקבל',
    'טופס "' || COALESCE(form_name, 'לא ידוע') || '" מולא',
    '/admin/forms',
    jsonb_build_object('form_id', NEW.form_id, 'submission_id', NEW.id)
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the form submission
    RAISE WARNING 'Failed to create admin notification: %', SQLERRM;
    RETURN NEW;
END;
$$;