-- ============================================
-- USER NOTIFICATIONS SYSTEM
-- ============================================

-- Create user_notifications table
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.user_notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.user_notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can create notifications for users
CREATE POLICY "Admins can create user notifications"
ON public.user_notifications
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON public.user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON public.user_notifications(created_at DESC);

-- ============================================
-- NOTIFICATION TRIGGERS
-- ============================================

-- Function to create user notification
CREATE OR REPLACE FUNCTION public.create_user_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_notifications (user_id, type, title, message, link, metadata)
  VALUES (p_user_id, p_type, p_title, p_message, p_link, p_metadata);
END;
$$;

-- Notify user when new content is published
CREATE OR REPLACE FUNCTION public.notify_users_new_content()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only notify when content becomes published
  IF (TG_OP = 'UPDATE' AND OLD.status != 'published' AND NEW.status = 'published') OR
     (TG_OP = 'INSERT' AND NEW.status = 'published') THEN
    
    -- Notify all active subscribers
    INSERT INTO user_notifications (user_id, type, title, message, link, metadata)
    SELECT DISTINCT
      us.user_id,
      'new_content',
      'תוכן חדש זמין! 🎉',
      'הועלה תוכן חדש: "' || NEW.title || '" - היכנס עכשיו וצפה',
      '/courses/' || NEW.slug,
      jsonb_build_object('product_id', NEW.id, 'title', NEW.title)
    FROM user_subscriptions us
    JOIN subscription_tiers st ON us.tier_id = st.id
    WHERE us.status = 'active'
      AND (
        st.access_level = 'vip'
        OR (st.access_level = 'premium' AND NEW.access_level IN ('free', 'basic', 'premium'))
        OR (st.access_level = 'basic' AND NEW.access_level IN ('free', 'basic'))
      );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for new content
DROP TRIGGER IF EXISTS trigger_notify_new_content ON public.content_products;
CREATE TRIGGER trigger_notify_new_content
AFTER INSERT OR UPDATE ON public.content_products
FOR EACH ROW
EXECUTE FUNCTION public.notify_users_new_content();

-- Notify user when they complete a course
CREATE OR REPLACE FUNCTION public.notify_course_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_title TEXT;
BEGIN
  IF OLD.is_completed = FALSE AND NEW.is_completed = TRUE THEN
    SELECT title INTO v_product_title
    FROM content_products
    WHERE id = NEW.product_id;
    
    INSERT INTO user_notifications (user_id, type, title, message, link, metadata)
    VALUES (
      NEW.user_id,
      'course_completed',
      'כל הכבוד! 🎓',
      'סיימת בהצלחה את "' || COALESCE(v_product_title, 'הקורס') || '"! קיבלת תעודת הצטיינות דיגיטלית',
      '/dashboard',
      jsonb_build_object('product_id', NEW.product_id, 'completed_at', NEW.completed_at)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for course completion
DROP TRIGGER IF EXISTS trigger_notify_completion ON public.course_enrollments;
CREATE TRIGGER trigger_notify_completion
AFTER UPDATE ON public.course_enrollments
FOR EACH ROW
EXECUTE FUNCTION public.notify_course_completion();

-- Notify users when their access is expiring soon
CREATE OR REPLACE FUNCTION public.check_expiring_access()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Notify users with subscriptions expiring in 7 days
  INSERT INTO user_notifications (user_id, type, title, message, link, metadata)
  SELECT DISTINCT
    us.user_id,
    'access_expiring',
    'הגישה שלך עומדת להסתיים ⏰',
    'הגישה למנוי שלך תסתיים בעוד 7 ימים. חדש כדי להמשיך ליהנות מהתוכן',
    '/subscriptions',
    jsonb_build_object('tier_id', us.tier_id, 'end_date', us.end_date)
  FROM user_subscriptions us
  WHERE us.status = 'active'
    AND us.end_date IS NOT NULL
    AND us.end_date BETWEEN now() AND now() + INTERVAL '7 days'
    AND NOT EXISTS (
      SELECT 1 FROM user_notifications un
      WHERE un.user_id = us.user_id
        AND un.type = 'access_expiring'
        AND un.created_at > now() - INTERVAL '7 days'
    );
    
  -- Notify users with purchased content expiring in 7 days
  INSERT INTO user_notifications (user_id, type, title, message, link, metadata)
  SELECT DISTINCT
    cp.user_id,
    'access_expiring',
    'הגישה שלך עומדת להסתיים ⏰',
    'הגישה לתוכן שרכשת תסתיים בעוד 7 ימים',
    '/dashboard',
    jsonb_build_object('product_id', cp.product_id, 'expires_at', cp.access_expires_at)
  FROM content_purchases cp
  WHERE cp.access_expires_at IS NOT NULL
    AND cp.access_expires_at BETWEEN now() AND now() + INTERVAL '7 days'
    AND NOT EXISTS (
      SELECT 1 FROM user_notifications un
      WHERE un.user_id = cp.user_id
        AND un.type = 'access_expiring'
        AND un.created_at > now() - INTERVAL '7 days'
    );
END;
$$;

-- Notify user on successful purchase
CREATE OR REPLACE FUNCTION public.notify_user_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_title TEXT;
BEGIN
  IF NEW.payment_status = 'completed' THEN
    SELECT title INTO v_product_title
    FROM content_products
    WHERE id = NEW.product_id;
    
    INSERT INTO user_notifications (user_id, type, title, message, link, metadata)
    VALUES (
      NEW.user_id,
      'purchase_success',
      'רכישה בוצעה בהצלחה! 🎉',
      'רכשת את "' || COALESCE(v_product_title, 'המוצר') || '" - התוכן זמין לצפייה עכשיו',
      '/courses/' || (SELECT slug FROM content_products WHERE id = NEW.product_id),
      jsonb_build_object('product_id', NEW.product_id, 'purchase_id', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for purchases
DROP TRIGGER IF EXISTS trigger_notify_purchase ON public.content_purchases;
CREATE TRIGGER trigger_notify_purchase
AFTER INSERT OR UPDATE ON public.content_purchases
FOR EACH ROW
EXECUTE FUNCTION public.notify_user_purchase();

-- Notify user on subscription activation
CREATE OR REPLACE FUNCTION public.notify_subscription_activated()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    SELECT name INTO v_tier_name
    FROM subscription_tiers
    WHERE id = NEW.tier_id;
    
    INSERT INTO user_notifications (user_id, type, title, message, link, metadata)
    VALUES (
      NEW.user_id,
      'subscription_activated',
      'המנוי שלך הופעל! ⭐',
      'ברוכים הבאים למנוי ' || COALESCE(v_tier_name, 'Premium') || ' - כל התכנים זמינים לך עכשיו',
      '/courses',
      jsonb_build_object('tier_id', NEW.tier_id, 'tier_name', v_tier_name)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for subscriptions
DROP TRIGGER IF EXISTS trigger_notify_subscription ON public.user_subscriptions;
CREATE TRIGGER trigger_notify_subscription
AFTER INSERT ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.notify_subscription_activated();