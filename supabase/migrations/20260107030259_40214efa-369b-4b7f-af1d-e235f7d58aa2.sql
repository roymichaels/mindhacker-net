-- Add new notification types to the enum
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'new_form_submission';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'new_consciousness_leap_application';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'new_personal_hypnosis_order';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'new_lead';

-- Create function for form submission notifications
CREATE OR REPLACE FUNCTION public.notify_new_form_submission()
RETURNS trigger
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
END;
$$;

-- Create trigger for form submissions
DROP TRIGGER IF EXISTS trigger_notify_form_submission ON public.form_submissions;
CREATE TRIGGER trigger_notify_form_submission
AFTER INSERT ON public.form_submissions
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_form_submission();

-- Create function for consciousness leap application notifications
CREATE OR REPLACE FUNCTION public.notify_consciousness_leap_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lead_name TEXT;
  lead_email TEXT;
BEGIN
  -- Get the lead name and email
  SELECT name, email INTO lead_name, lead_email 
  FROM public.consciousness_leap_leads 
  WHERE id = NEW.lead_id;
  
  -- Insert admin notification
  INSERT INTO public.admin_notifications (type, priority, title, message, link, metadata)
  VALUES (
    'new_consciousness_leap_application',
    'high',
    'בקשה חדשה לקפיצת תודעה',
    'התקבלה בקשה חדשה מ: ' || COALESCE(lead_name, lead_email, 'לא ידוע'),
    '/admin/consciousness-leap',
    jsonb_build_object('application_id', NEW.id, 'lead_id', NEW.lead_id)
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for consciousness leap applications
DROP TRIGGER IF EXISTS trigger_notify_consciousness_leap ON public.consciousness_leap_applications;
CREATE TRIGGER trigger_notify_consciousness_leap
AFTER INSERT ON public.consciousness_leap_applications
FOR EACH ROW
EXECUTE FUNCTION public.notify_consciousness_leap_application();

-- Create function for lead notifications (general leads)
CREATE OR REPLACE FUNCTION public.notify_new_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert admin notification
  INSERT INTO public.admin_notifications (type, priority, title, message, link, metadata)
  VALUES (
    'new_lead',
    'medium',
    'ליד חדש התקבל',
    'ליד חדש: ' || COALESCE(NEW.name, NEW.phone, 'לא ידוע') || ' - ' || COALESCE(NEW.source, 'כללי'),
    '/admin/leads',
    jsonb_build_object('lead_id', NEW.id, 'source', NEW.source)
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for leads
DROP TRIGGER IF EXISTS trigger_notify_new_lead ON public.leads;
CREATE TRIGGER trigger_notify_new_lead
AFTER INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_lead();

-- Create function for consciousness leap lead notifications
CREATE OR REPLACE FUNCTION public.notify_consciousness_leap_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert admin notification
  INSERT INTO public.admin_notifications (type, priority, title, message, link, metadata)
  VALUES (
    'new_lead',
    'high',
    'ליד חדש לקפיצת תודעה',
    'ליד חדש: ' || COALESCE(NEW.name, NEW.email, 'לא ידוע'),
    '/admin/consciousness-leap',
    jsonb_build_object('lead_id', NEW.id, 'email', NEW.email)
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for consciousness leap leads
DROP TRIGGER IF EXISTS trigger_notify_consciousness_leap_lead ON public.consciousness_leap_leads;
CREATE TRIGGER trigger_notify_consciousness_leap_lead
AFTER INSERT ON public.consciousness_leap_leads
FOR EACH ROW
EXECUTE FUNCTION public.notify_consciousness_leap_lead();

-- Create function for personal hypnosis order notifications (purchases with specific package types)
CREATE OR REPLACE FUNCTION public.notify_personal_hypnosis_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Only notify for personal hypnosis related packages
  IF NEW.package_type ILIKE '%hypnosis%' OR NEW.package_type ILIKE '%היפנוזה%' OR NEW.package_type = 'personal' THEN
    -- Get user info
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.user_id;
    SELECT full_name INTO user_name FROM public.profiles WHERE id = NEW.user_id;
    
    -- Insert admin notification
    INSERT INTO public.admin_notifications (type, priority, title, message, link, metadata)
    VALUES (
      'new_personal_hypnosis_order',
      'high',
      'הזמנה חדשה להיפנוזה אישית',
      'הזמנה חדשה מ: ' || COALESCE(user_name, user_email, 'לא ידוע') || ' - ' || NEW.package_type,
      '/admin/recordings',
      jsonb_build_object('purchase_id', NEW.id, 'user_id', NEW.user_id, 'package_type', NEW.package_type)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for purchases (personal hypnosis orders)
DROP TRIGGER IF EXISTS trigger_notify_personal_hypnosis ON public.purchases;
CREATE TRIGGER trigger_notify_personal_hypnosis
AFTER INSERT ON public.purchases
FOR EACH ROW
EXECUTE FUNCTION public.notify_personal_hypnosis_order();