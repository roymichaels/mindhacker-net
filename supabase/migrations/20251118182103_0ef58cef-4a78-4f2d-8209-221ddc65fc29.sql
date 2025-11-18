-- Create notification enums
CREATE TYPE notification_type AS ENUM (
  'new_user',
  'new_purchase',
  'new_subscription',
  'subscription_cancelled',
  'new_enrollment',
  'course_completed',
  'new_review',
  'high_value_purchase',
  'payment_failed',
  'content_uploaded',
  'user_milestone',
  'expiring_access',
  'new_testimonial',
  'new_faq_needed',
  'system_alert'
);

CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Create notifications table
CREATE TABLE admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type notification_type NOT NULL,
  priority notification_priority DEFAULT 'medium',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_admin_notifications_read ON admin_notifications(is_read, created_at DESC);
CREATE INDEX idx_admin_notifications_priority ON admin_notifications(priority, created_at DESC);
CREATE INDEX idx_admin_notifications_type ON admin_notifications(type);

-- Enable RLS
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all notifications"
  ON admin_notifications FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update notifications"
  ON admin_notifications FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE admin_notifications;

-- Helper function to create notifications
CREATE OR REPLACE FUNCTION create_admin_notification(
  p_type notification_type,
  p_priority notification_priority,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO admin_notifications (type, priority, title, message, link, metadata)
  VALUES (p_type, p_priority, p_title, p_message, p_link, p_metadata);
END;
$$;

-- Trigger: New user registration
CREATE OR REPLACE FUNCTION notify_new_user()
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
    '/admin/users',
    jsonb_build_object('user_id', NEW.id)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_user_registered
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_user();

-- Trigger: New purchase
CREATE OR REPLACE FUNCTION notify_new_purchase()
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
  SELECT title INTO v_product_title
  FROM content_products
  WHERE id = NEW.product_id;
  
  SELECT full_name INTO v_user_name
  FROM profiles
  WHERE id = NEW.user_id;
  
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
    '/admin/purchases',
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

CREATE TRIGGER on_new_purchase
  AFTER INSERT ON content_purchases
  FOR EACH ROW
  WHEN (NEW.payment_status = 'completed')
  EXECUTE FUNCTION notify_new_purchase();

-- Trigger: Subscription changes
CREATE OR REPLACE FUNCTION notify_subscription_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier_name TEXT;
  v_user_name TEXT;
BEGIN
  SELECT name INTO v_tier_name
  FROM subscription_tiers
  WHERE id = NEW.tier_id;
  
  SELECT full_name INTO v_user_name
  FROM profiles
  WHERE id = NEW.user_id;
  
  IF TG_OP = 'INSERT' THEN
    PERFORM create_admin_notification(
      'new_subscription',
      'medium',
      '⭐ מנוי חדש!',
      COALESCE(v_user_name, 'משתמש') || ' נרשם למנוי ' || COALESCE(v_tier_name, 'לא ידוע'),
      '/admin/users',
      jsonb_build_object('user_id', NEW.user_id, 'tier', v_tier_name)
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status = 'cancelled' THEN
    PERFORM create_admin_notification(
      'subscription_cancelled',
      'medium',
      '⚠️ מנוי בוטל',
      COALESCE(v_user_name, 'משתמש') || ' ביטל את המנוי ' || COALESCE(v_tier_name, 'לא ידוע'),
      '/admin/users',
      jsonb_build_object('user_id', NEW.user_id, 'reason', NEW.cancellation_reason)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_subscription_change
  AFTER INSERT OR UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION notify_subscription_change();

-- Trigger: Enrollment events
CREATE OR REPLACE FUNCTION notify_enrollment_events()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_title TEXT;
  v_user_name TEXT;
BEGIN
  SELECT title INTO v_product_title
  FROM content_products
  WHERE id = NEW.product_id;
  
  SELECT full_name INTO v_user_name
  FROM profiles
  WHERE id = NEW.user_id;
  
  IF TG_OP = 'INSERT' THEN
    PERFORM create_admin_notification(
      'new_enrollment',
      'low',
      '📚 הרשמה חדשה',
      COALESCE(v_user_name, 'משתמש') || ' נרשם ל-' || COALESCE(v_product_title, 'קורס'),
      '/admin/analytics',
      jsonb_build_object('user_id', NEW.user_id, 'product_id', NEW.product_id)
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.is_completed = false AND NEW.is_completed = true THEN
    PERFORM create_admin_notification(
      'course_completed',
      'low',
      '🎓 קורס הושלם!',
      COALESCE(v_user_name, 'משתמש') || ' השלים את ' || COALESCE(v_product_title, 'קורס'),
      '/admin/analytics',
      jsonb_build_object('user_id', NEW.user_id, 'product_id', NEW.product_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_enrollment_events
  AFTER INSERT OR UPDATE ON course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION notify_enrollment_events();

-- Trigger: New review
CREATE OR REPLACE FUNCTION notify_new_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_title TEXT;
  v_user_name TEXT;
BEGIN
  SELECT title INTO v_product_title
  FROM content_products
  WHERE id = NEW.product_id;
  
  SELECT full_name INTO v_user_name
  FROM profiles
  WHERE id = NEW.user_id;
  
  PERFORM create_admin_notification(
    'new_review',
    CASE WHEN NEW.rating <= 2 THEN 'high'::notification_priority ELSE 'low'::notification_priority END,
    CASE WHEN NEW.rating <= 2 THEN '⚠️ ביקורת נמוכה' ELSE '⭐ ביקורת חדשה' END,
    COALESCE(v_user_name, 'משתמש') || ' נתן ' || NEW.rating::TEXT || ' כוכבים ל-' || COALESCE(v_product_title, 'מוצר'),
    '/admin/content',
    jsonb_build_object('review_id', NEW.id, 'rating', NEW.rating)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_review
  AFTER INSERT ON content_reviews
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_review();

-- Trigger: Content upload
CREATE OR REPLACE FUNCTION notify_content_upload()
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
    '/admin/content',
    jsonb_build_object('product_id', NEW.id, 'type', NEW.content_type)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_content_upload
  AFTER INSERT ON content_products
  FOR EACH ROW
  EXECUTE FUNCTION notify_content_upload();

-- Trigger: Payment failed
CREATE OR REPLACE FUNCTION notify_payment_failed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_name TEXT;
BEGIN
  IF NEW.payment_status = 'failed' THEN
    SELECT full_name INTO v_user_name
    FROM profiles
    WHERE id = NEW.user_id;
    
    PERFORM create_admin_notification(
      'payment_failed',
      'high',
      '❌ תשלום נכשל',
      'תשלום נכשל עבור ' || COALESCE(v_user_name, 'משתמש') || ' - ₪' || NEW.price_paid::TEXT,
      '/admin/purchases',
      jsonb_build_object('user_id', NEW.user_id, 'purchase_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_payment_failed
  AFTER UPDATE ON content_purchases
  FOR EACH ROW
  WHEN (OLD.payment_status != 'failed' AND NEW.payment_status = 'failed')
  EXECUTE FUNCTION notify_payment_failed();