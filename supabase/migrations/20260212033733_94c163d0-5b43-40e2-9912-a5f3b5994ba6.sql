
-- Update notify_new_user to use /panel/users/{user_id}
CREATE OR REPLACE FUNCTION public.notify_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM create_admin_notification(
    'new_user',
    'low',
    'משתמש חדש נרשם',
    'משתמש חדש: ' || COALESCE(NEW.full_name, 'לא צוין'),
    '/panel/users/' || NEW.id,
    jsonb_build_object('user_id', NEW.id)
  );
  RETURN NEW;
END;
$$;

-- Update notify_new_form_submission to use /panel/forms
CREATE OR REPLACE FUNCTION public.notify_new_form_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  form_name TEXT;
BEGIN
  SELECT title INTO form_name FROM public.custom_forms WHERE id = NEW.form_id;
  
  INSERT INTO public.admin_notifications (type, priority, title, message, link, metadata)
  VALUES (
    'new_form_submission',
    'medium',
    'טופס חדש התקבל',
    'טופס "' || COALESCE(form_name, 'לא ידוע') || '" מולא',
    '/panel/forms',
    jsonb_build_object('form_id', NEW.form_id, 'submission_id', NEW.id)
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create admin notification: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Update notify_new_lead to use /panel/leads
CREATE OR REPLACE FUNCTION public.notify_new_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, priority, title, message, link, metadata)
  VALUES (
    'new_lead',
    'medium',
    'ליד חדש התקבל',
    'ליד חדש: ' || COALESCE(NEW.name, NEW.phone, 'לא ידוע') || ' - ' || COALESCE(NEW.source, 'כללי'),
    '/panel/leads',
    jsonb_build_object('lead_id', NEW.id, 'source', NEW.source)
  );
  
  RETURN NEW;
END;
$$;

-- Update notify_consciousness_leap_application to use /panel/consciousness-leap
CREATE OR REPLACE FUNCTION public.notify_consciousness_leap_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lead_name TEXT;
  lead_email TEXT;
BEGIN
  SELECT name, email INTO lead_name, lead_email 
  FROM public.consciousness_leap_leads 
  WHERE id = NEW.lead_id;
  
  INSERT INTO public.admin_notifications (type, priority, title, message, link, metadata)
  VALUES (
    'new_consciousness_leap_application',
    'high',
    'בקשה חדשה לקפיצת תודעה',
    'התקבלה בקשה חדשה מ: ' || COALESCE(lead_name, lead_email, 'לא ידוע'),
    '/panel/consciousness-leap',
    jsonb_build_object('application_id', NEW.id, 'lead_id', NEW.lead_id)
  );
  
  RETURN NEW;
END;
$$;

-- Update notify_consciousness_leap_lead to use /panel/consciousness-leap
CREATE OR REPLACE FUNCTION public.notify_consciousness_leap_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, priority, title, message, link, metadata)
  VALUES (
    'new_lead',
    'high',
    'ליד חדש לקפיצת תודעה',
    'ליד חדש: ' || COALESCE(NEW.name, NEW.email, 'לא ידוע'),
    '/panel/consciousness-leap',
    jsonb_build_object('lead_id', NEW.id, 'email', NEW.email)
  );
  
  RETURN NEW;
END;
$$;

-- Update notify_personal_hypnosis_order to use /panel/users/{user_id}
CREATE OR REPLACE FUNCTION public.notify_personal_hypnosis_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
BEGIN
  IF NEW.package_type ILIKE '%hypnosis%' OR NEW.package_type ILIKE '%היפנוזה%' OR NEW.package_type = 'personal' THEN
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.user_id;
    SELECT full_name INTO user_name FROM public.profiles WHERE id = NEW.user_id;
    
    INSERT INTO public.admin_notifications (type, priority, title, message, link, metadata)
    VALUES (
      'new_personal_hypnosis_order',
      'high',
      'הזמנה חדשה להיפנוזה אישית',
      'הזמנה חדשה מ: ' || COALESCE(user_name, user_email, 'לא ידוע') || ' - ' || NEW.package_type,
      '/panel/users/' || NEW.user_id,
      jsonb_build_object('purchase_id', NEW.id, 'user_id', NEW.user_id, 'package_type', NEW.package_type)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update notify_admin_journey_completion to use /panel/users/{user_id}/dashboard
CREATE OR REPLACE FUNCTION public.notify_admin_journey_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_full_name TEXT;
  user_email TEXT;
BEGIN
  IF NEW.launchpad_complete = true AND (OLD.launchpad_complete IS NULL OR OLD.launchpad_complete = false) THEN
    SELECT full_name INTO user_full_name FROM public.profiles WHERE id = NEW.user_id;
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.user_id;
    
    INSERT INTO public.admin_notifications (
      type, priority, title, message, link, metadata
    ) VALUES (
      'journey_completion',
      'medium',
      'מסע טרנספורמציה הושלם',
      COALESCE(user_full_name, 'משתמש') || ' סיים/ה את מסע הטרנספורמציה',
      '/panel/users/' || NEW.user_id || '/dashboard',
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
$$;

-- Update notify_admin_journey_complete to use /panel/users/{user_id}/dashboard
CREATE OR REPLACE FUNCTION public.notify_admin_journey_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
BEGIN
  IF NEW.launchpad_complete = true AND (OLD.launchpad_complete IS NULL OR OLD.launchpad_complete = false) THEN
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.user_id;
    SELECT COALESCE(first_name || ' ' || last_name, first_name, email) INTO user_name
    FROM profiles WHERE id = NEW.user_id;
    
    INSERT INTO admin_notifications (type, priority, title, message, link, metadata)
    VALUES (
      'user_milestone',
      'medium',
      CASE 
        WHEN user_name IS NOT NULL THEN user_name || ' סיים את מסע הטרנספורמציה!'
        ELSE 'משתמש סיים את מסע הטרנספורמציה!'
      END,
      'משתמש השלים את כל שלבי הלאנצ''פד ומוכן להתחיל עם אורורה.',
      '/panel/users/' || NEW.user_id || '/dashboard',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'user_email', user_email,
        'completed_at', NEW.completed_at
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update other admin notification triggers that use /admin/ paths
-- notify_new_purchase
CREATE OR REPLACE FUNCTION public.notify_new_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_title TEXT;
  v_user_name TEXT;
  v_priority notification_priority;
BEGIN
  SELECT title INTO v_product_title FROM content_products WHERE id = NEW.product_id;
  SELECT full_name INTO v_user_name FROM profiles WHERE id = NEW.user_id;
  
  v_priority := CASE 
    WHEN NEW.price_paid >= 1000 THEN 'high'::notification_priority
    WHEN NEW.price_paid >= 500 THEN 'medium'::notification_priority
    ELSE 'low'::notification_priority
  END;
  
  PERFORM create_admin_notification(
    CASE WHEN NEW.price_paid >= 1000 THEN 'high_value_purchase'::notification_type ELSE 'new_purchase'::notification_type END,
    v_priority,
    '🎉 רכישה חדשה!',
    COALESCE(v_user_name, 'משתמש') || ' רכש את ' || COALESCE(v_product_title, 'מוצר') || ' ב-₪' || NEW.price_paid::TEXT,
    '/panel/users/' || NEW.user_id,
    jsonb_build_object(
      'user_id', NEW.user_id,
      'product_id', NEW.product_id,
      'amount', NEW.price_paid,
      'purchase_id', NEW.id
    )
  );
  RETURN NEW;
END;
$$;

-- notify_content_upload
CREATE OR REPLACE FUNCTION public.notify_content_upload()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM create_admin_notification(
    'content_uploaded',
    'low',
    '📹 תוכן חדש הועלה',
    'מוצר חדש: ' || NEW.title,
    '/panel/content',
    jsonb_build_object('product_id', NEW.id, 'type', NEW.content_type)
  );
  RETURN NEW;
END;
$$;

-- notify_enrollment_events
CREATE OR REPLACE FUNCTION public.notify_enrollment_events()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_title TEXT;
  v_user_name TEXT;
BEGIN
  SELECT title INTO v_product_title FROM content_products WHERE id = NEW.product_id;
  SELECT full_name INTO v_user_name FROM profiles WHERE id = NEW.user_id;
  
  IF TG_OP = 'INSERT' THEN
    PERFORM create_admin_notification(
      'new_enrollment',
      'low',
      '📚 הרשמה חדשה',
      COALESCE(v_user_name, 'משתמש') || ' נרשם ל-' || COALESCE(v_product_title, 'קורס'),
      '/panel/users/' || NEW.user_id,
      jsonb_build_object('user_id', NEW.user_id, 'product_id', NEW.product_id)
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.is_completed = false AND NEW.is_completed = true THEN
    PERFORM create_admin_notification(
      'course_completed',
      'low',
      '🎓 קורס הושלם!',
      COALESCE(v_user_name, 'משתמש') || ' השלים את ' || COALESCE(v_product_title, 'קורס'),
      '/panel/users/' || NEW.user_id,
      jsonb_build_object('user_id', NEW.user_id, 'product_id', NEW.product_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- notify_subscription_change
CREATE OR REPLACE FUNCTION public.notify_subscription_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier_name TEXT;
  v_user_name TEXT;
BEGIN
  SELECT name INTO v_tier_name FROM subscription_tiers WHERE id = NEW.tier_id;
  SELECT full_name INTO v_user_name FROM profiles WHERE id = NEW.user_id;
  
  IF TG_OP = 'INSERT' THEN
    PERFORM create_admin_notification(
      'new_subscription',
      'medium',
      '⭐ מנוי חדש!',
      COALESCE(v_user_name, 'משתמש') || ' נרשם למנוי ' || COALESCE(v_tier_name, 'לא ידוע'),
      '/panel/users/' || NEW.user_id,
      jsonb_build_object('user_id', NEW.user_id, 'tier', v_tier_name)
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status = 'cancelled' THEN
    PERFORM create_admin_notification(
      'subscription_cancelled',
      'medium',
      '⚠️ מנוי בוטל',
      COALESCE(v_user_name, 'משתמש') || ' ביטל את המנוי ' || COALESCE(v_tier_name, 'לא ידוע'),
      '/panel/users/' || NEW.user_id,
      jsonb_build_object('user_id', NEW.user_id, 'reason', NEW.cancellation_reason)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- notify_payment_failed
CREATE OR REPLACE FUNCTION public.notify_payment_failed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_name TEXT;
BEGIN
  IF NEW.payment_status = 'failed' THEN
    SELECT full_name INTO v_user_name FROM profiles WHERE id = NEW.user_id;
    
    PERFORM create_admin_notification(
      'payment_failed',
      'high',
      '❌ תשלום נכשל',
      'תשלום נכשל עבור ' || COALESCE(v_user_name, 'משתמש') || ' - ₪' || NEW.price_paid::TEXT,
      '/panel/users/' || NEW.user_id,
      jsonb_build_object('user_id', NEW.user_id, 'purchase_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- notify_new_review
CREATE OR REPLACE FUNCTION public.notify_new_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_title TEXT;
  v_user_name TEXT;
BEGIN
  SELECT title INTO v_product_title FROM content_products WHERE id = NEW.product_id;
  SELECT full_name INTO v_user_name FROM profiles WHERE id = NEW.user_id;
  
  PERFORM create_admin_notification(
    'new_review',
    CASE WHEN NEW.rating <= 2 THEN 'high'::notification_priority ELSE 'low'::notification_priority END,
    CASE WHEN NEW.rating <= 2 THEN '⚠️ ביקורת נמוכה' ELSE '⭐ ביקורת חדשה' END,
    COALESCE(v_user_name, 'משתמש') || ' נתן ' || NEW.rating::TEXT || ' כוכבים ל-' || COALESCE(v_product_title, 'מוצר'),
    '/panel/content',
    jsonb_build_object('review_id', NEW.id, 'rating', NEW.rating)
  );
  RETURN NEW;
END;
$$;

-- notify_new_product_order
CREATE OR REPLACE FUNCTION public.notify_new_product_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM create_admin_notification(
    p_type := 'new_personal_hypnosis_order'::notification_type,
    p_priority := 'high'::notification_priority,
    p_title := 'הזמנה חדשה להיפנוזה אישית',
    p_message := 'התקבלה הזמנה חדשה להיפנוזה אישית',
    p_link := '/panel/users/' || NEW.user_id,
    p_metadata := jsonb_build_object('order_id', NEW.id, 'user_id', NEW.user_id)
  );
  RETURN NEW;
END;
$$;
