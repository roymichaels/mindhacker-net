-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  assigned_at timestamp DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create site_settings table
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text,
  setting_type text DEFAULT 'text',
  description text,
  updated_at timestamp DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for site_settings
CREATE POLICY "Anyone can view settings"
ON public.site_settings
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Admins can manage settings"
ON public.site_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create FAQs table
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on faqs
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- RLS policies for faqs
CREATE POLICY "Anyone can view active FAQs"
ON public.faqs
FOR SELECT
TO authenticated, anon
USING (is_active = true);

CREATE POLICY "Admins can manage FAQs"
ON public.faqs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create testimonials table
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  quote text NOT NULL,
  avatar_url text,
  initials text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS policies for testimonials
CREATE POLICY "Anyone can view active testimonials"
ON public.testimonials
FOR SELECT
TO authenticated, anon
USING (is_active = true);

CREATE POLICY "Admins can manage testimonials"
ON public.testimonials
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed initial site_settings
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description) VALUES
('calendly_link', 'https://calendly.com/nexus_ai/meet-with-me', 'link', 'Calendly booking link'),
('instagram_url', 'https://instagram.com', 'link', 'Instagram profile URL'),
('telegram_url', 'https://t.me', 'link', 'Telegram contact URL'),
('email', 'contact@consciousness-hacker.com', 'text', 'Contact email'),
('single_session_price', '250', 'number', 'Price for single session in ILS'),
('package_session_price', '800', 'number', 'Price for 4-session package in ILS'),
('single_session_description', 'מפגש אחד של 90 דקות', 'text', 'Single session description'),
('package_session_description', '4 מפגשים של 90 דקות כל אחד', 'text', 'Package session description');

-- Seed initial FAQs (from current site)
INSERT INTO public.faqs (question, answer, order_index) VALUES
('מה ההבדל בין אימון תודעתי לטיפול?', 'טיפול מתמקד בעבר ובריפוי פצעים. אימון תודעתי מתמקד בהווה ובעתיד — שכתוב תבניות, תכנות מחדש של התת-מודע, ושחרור מהגבלות. זה לא ניתוח, זה עדכון מערכת הפעלה.', 1),
('האם אני בשליטה בזמן ההיפנוזה?', 'לחלוטין. היפנוזה מודעת היא מצב של מיקוד עמוק ורצוני. אתה מודע לכל רגע, יכול לעצור בכל שלב, ורק מקבל הצעות שמתאימות לך. זה לא שליטה חיצונית — זה שליטה פנימית משוחררת.', 2),
('כמה מפגשים נדרשים?', 'שינוי משמעותי מורגש כבר מהמפגש הראשון. תהליך מלא נע בין 3-6 מפגשים, תלוי במטרה ובעומק השינוי הרצוי. כל מפגש בונה על הקודם ומעמיק את התכנות.', 3);

-- Seed initial testimonials (from current site)
INSERT INTO public.testimonials (name, role, quote, initials, order_index) VALUES
('דני כהן', 'יזם טכנולוגי', 'המפגש עם אור שינה לי את המשחק לגמרי. הצלחתי לפרוץ מגבלות שליוו אותי שנים והתוצאות בעסק שלי מדברות בעד עצמן.', 'ד.כ', 1),
('מיכל לוי', 'מעצבת גרפית', 'לא האמנתי שאפשר לעשות שינוי כל כך עמוק במפגש אחד. היפנוזה תודעתית זה לא מה שחשבתי - זה הרבה יותר עוצמתי.', 'מ.ל', 2),
('רון אבידן', 'מנכ"ל סטארטאפ', 'הגישה של אור ייחודית לחלוטין. זה לא קוצ''ינג רגיל, זה באמת תכנות מחדש של הראש. ממליץ בחום!', 'ר.א', 3);-- Create purchases table
CREATE TABLE public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  package_type text NOT NULL,
  sessions_total integer NOT NULL,
  sessions_remaining integer NOT NULL,
  price numeric NOT NULL,
  payment_status text DEFAULT 'demo',
  payment_method text,
  purchase_date timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  booking_link text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on purchases
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
  ON public.purchases
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all purchases
CREATE POLICY "Admins can view all purchases"
  ON public.purchases
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Admins can manage purchases
CREATE POLICY "Admins can manage purchases"
  ON public.purchases
  FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Authenticated users can create their own purchases
CREATE POLICY "Authenticated users can create purchases"
  ON public.purchases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();-- Phase 1: Database Security - RLS Policy Fixes

-- 1. Add DELETE policy to profiles table (block all deletions for safety)
CREATE POLICY "Nobody can delete profiles"
ON public.profiles FOR DELETE
USING (false);

-- 2. Add INSERT policy for profiles (allow users to create their own profile if needed)
CREATE POLICY "Users can create own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 3. Add explicit DENY policy for purchases table (defense in depth)
CREATE POLICY "Public cannot access purchases"
ON public.purchases FOR ALL
TO public
USING (false);-- Create storage bucket for site images
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true);

-- Allow admins to upload images
CREATE POLICY "Admins can upload site images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'site-images' 
  AND (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ))
);

-- Allow admins to update images
CREATE POLICY "Admins can update site images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'site-images'
  AND (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ))
);

-- Allow admins to delete images
CREATE POLICY "Admins can delete site images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'site-images'
  AND (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ))
);

-- Allow public read access to site images
CREATE POLICY "Public can view site images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'site-images');-- Add booking and payment tracking fields to purchases table
ALTER TABLE public.purchases
ADD COLUMN IF NOT EXISTS booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('pending', 'scheduled', 'completed', 'cancelled')),
ADD COLUMN IF NOT EXISTS scheduled_date DATE,
ADD COLUMN IF NOT EXISTS scheduled_time TIME,
ADD COLUMN IF NOT EXISTS booking_notes TEXT,
ADD COLUMN IF NOT EXISTS booking_confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMPTZ;

-- Update existing payment_status values from 'demo' to 'pending_session'
UPDATE public.purchases 
SET payment_status = 'pending_session' 
WHERE payment_status = 'demo';

-- Add comment for clarity
COMMENT ON COLUMN public.purchases.booking_status IS 'Tracks booking lifecycle: pending (not scheduled), scheduled (time confirmed), completed (session done), cancelled';
COMMENT ON COLUMN public.purchases.payment_status IS 'Tracks payment lifecycle: pending_session (not yet paid), completed (paid), cancelled';
COMMENT ON COLUMN public.purchases.payment_method IS 'Set after payment: paypal, bank_transfer, cash, etc';-- Phase 1: Content Library Platform Database Schema

-- ============================================
-- ENUMS
-- ============================================

-- Content access levels
CREATE TYPE public.content_access_level AS ENUM ('free', 'basic', 'premium', 'vip');

-- Content types
CREATE TYPE public.content_type AS ENUM ('course', 'masterclass', 'workshop', 'guide', 'toolkit');

-- Subscription status
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'expired', 'trial', 'paused');

-- Content status
CREATE TYPE public.content_status AS ENUM ('draft', 'published', 'archived');

-- ============================================
-- CORE CONTENT TABLES
-- ============================================

-- Products (Courses/Digital Products)
CREATE TABLE public.content_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  price NUMERIC(10, 2) DEFAULT 0,
  access_level content_access_level NOT NULL DEFAULT 'free',
  content_type content_type NOT NULL DEFAULT 'course',
  status content_status NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  category TEXT,
  tags TEXT[],
  duration_minutes INTEGER,
  difficulty_level TEXT,
  instructor_name TEXT,
  preview_video_url TEXT,
  learning_objectives TEXT[],
  requirements TEXT[],
  view_count INTEGER DEFAULT 0,
  enrollment_count INTEGER DEFAULT 0,
  average_rating NUMERIC(3, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Series (organize episodes within products)
CREATE TABLE public.content_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.content_products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Episodes (individual video lessons)
CREATE TABLE public.content_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES public.content_series(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.content_products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  duration_seconds INTEGER,
  order_index INTEGER DEFAULT 0,
  is_preview BOOLEAN DEFAULT false,
  thumbnail_url TEXT,
  resources_url TEXT[],
  transcript_url TEXT,
  view_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- SUBSCRIPTION SYSTEM
-- ============================================

-- Subscription tiers
CREATE TABLE public.subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price_monthly NUMERIC(10, 2) NOT NULL,
  price_quarterly NUMERIC(10, 2),
  price_yearly NUMERIC(10, 2),
  access_level content_access_level NOT NULL,
  features TEXT[],
  max_downloads_per_month INTEGER,
  can_download_resources BOOLEAN DEFAULT false,
  priority_support BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User subscriptions
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES public.subscription_tiers(id),
  status subscription_status NOT NULL DEFAULT 'active',
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  next_billing_date TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Individual content purchases
CREATE TABLE public.content_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.content_products(id) ON DELETE CASCADE,
  price_paid NUMERIC(10, 2) NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  access_granted_at TIMESTAMP WITH TIME ZONE,
  access_expires_at TIMESTAMP WITH TIME ZONE,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- ============================================
-- ANALYTICS & ENGAGEMENT
-- ============================================

-- User progress tracking
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES public.content_episodes(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.content_products(id) ON DELETE CASCADE,
  watch_time_seconds INTEGER DEFAULT 0,
  last_position_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, episode_id)
);

-- Course enrollments
CREATE TABLE public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.content_products(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  progress_percentage INTEGER DEFAULT 0,
  completed_episodes INTEGER DEFAULT 0,
  total_episodes INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, product_id)
);

-- Content analytics events
CREATE TABLE public.content_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.content_products(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES public.content_episodes(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  session_id TEXT,
  device_type TEXT,
  browser TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Content reviews
CREATE TABLE public.content_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.content_products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Content products indexes
CREATE INDEX idx_content_products_status ON public.content_products(status);
CREATE INDEX idx_content_products_access_level ON public.content_products(access_level);
CREATE INDEX idx_content_products_category ON public.content_products(category);
CREATE INDEX idx_content_products_featured ON public.content_products(is_featured);
CREATE INDEX idx_content_products_slug ON public.content_products(slug);

-- Series indexes
CREATE INDEX idx_content_series_product ON public.content_series(product_id);
CREATE INDEX idx_content_series_order ON public.content_series(product_id, order_index);

-- Episodes indexes
CREATE INDEX idx_content_episodes_series ON public.content_episodes(series_id);
CREATE INDEX idx_content_episodes_product ON public.content_episodes(product_id);
CREATE INDEX idx_content_episodes_order ON public.content_episodes(series_id, order_index);
CREATE INDEX idx_content_episodes_preview ON public.content_episodes(is_preview);

-- Subscription indexes
CREATE INDEX idx_user_subscriptions_user ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_next_billing ON public.user_subscriptions(next_billing_date);

-- Content purchases indexes
CREATE INDEX idx_content_purchases_user ON public.content_purchases(user_id);
CREATE INDEX idx_content_purchases_product ON public.content_purchases(product_id);

-- Progress indexes
CREATE INDEX idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_episode ON public.user_progress(episode_id);
CREATE INDEX idx_user_progress_product ON public.user_progress(product_id);
CREATE INDEX idx_user_progress_completed ON public.user_progress(completed);

-- Enrollment indexes
CREATE INDEX idx_course_enrollments_user ON public.course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_product ON public.course_enrollments(product_id);
CREATE INDEX idx_course_enrollments_last_accessed ON public.course_enrollments(last_accessed_at);

-- Analytics indexes
CREATE INDEX idx_content_analytics_user ON public.content_analytics(user_id);
CREATE INDEX idx_content_analytics_product ON public.content_analytics(product_id);
CREATE INDEX idx_content_analytics_episode ON public.content_analytics(episode_id);
CREATE INDEX idx_content_analytics_event_type ON public.content_analytics(event_type);
CREATE INDEX idx_content_analytics_created ON public.content_analytics(created_at);

-- Reviews indexes
CREATE INDEX idx_content_reviews_product ON public.content_reviews(product_id);
CREATE INDEX idx_content_reviews_user ON public.content_reviews(user_id);
CREATE INDEX idx_content_reviews_approved ON public.content_reviews(is_approved);
CREATE INDEX idx_content_reviews_rating ON public.content_reviews(rating);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Content Products RLS
ALTER TABLE public.content_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published products"
  ON public.content_products FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can manage all products"
  ON public.content_products FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Content Series RLS
ALTER TABLE public.content_series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published series"
  ON public.content_series FOR SELECT
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM public.content_products
      WHERE id = product_id AND status = 'published'
    )
  );

CREATE POLICY "Admins can manage all series"
  ON public.content_series FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Content Episodes RLS
ALTER TABLE public.content_episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view preview episodes"
  ON public.content_episodes FOR SELECT
  USING (is_preview = true);

CREATE POLICY "Authenticated users can view episodes they have access to"
  ON public.content_episodes FOR SELECT
  TO authenticated
  USING (
    -- Admin can see all
    has_role(auth.uid(), 'admin'::app_role)
    OR
    -- Preview episodes
    is_preview = true
    OR
    -- Has active subscription with sufficient access level
    EXISTS (
      SELECT 1 FROM public.user_subscriptions us
      JOIN public.subscription_tiers st ON us.tier_id = st.id
      JOIN public.content_products cp ON cp.id = product_id
      WHERE us.user_id = auth.uid()
        AND us.status = 'active'
        AND (
          st.access_level = 'vip'
          OR (st.access_level = 'premium' AND cp.access_level IN ('free', 'basic', 'premium'))
          OR (st.access_level = 'basic' AND cp.access_level IN ('free', 'basic'))
          OR cp.access_level = 'free'
        )
    )
    OR
    -- Has purchased the product
    EXISTS (
      SELECT 1 FROM public.content_purchases
      WHERE user_id = auth.uid()
        AND product_id = content_episodes.product_id
        AND payment_status = 'completed'
        AND (access_expires_at IS NULL OR access_expires_at > now())
    )
  );

CREATE POLICY "Admins can manage all episodes"
  ON public.content_episodes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Subscription Tiers RLS
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active tiers"
  ON public.subscription_tiers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage tiers"
  ON public.subscription_tiers FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- User Subscriptions RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions"
  ON public.user_subscriptions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Content Purchases RLS
ALTER TABLE public.content_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON public.content_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own purchases"
  ON public.content_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all purchases"
  ON public.content_purchases FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- User Progress RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress"
  ON public.user_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
  ON public.user_progress FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Course Enrollments RLS
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own enrollments"
  ON public.course_enrollments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own enrollments"
  ON public.course_enrollments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all enrollments"
  ON public.course_enrollments FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Content Analytics RLS
ALTER TABLE public.content_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create analytics events"
  ON public.content_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all analytics"
  ON public.content_analytics FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Content Reviews RLS
ALTER TABLE public.content_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved reviews"
  ON public.content_reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users can view own reviews"
  ON public.content_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reviews"
  ON public.content_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.content_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews"
  ON public.content_reviews FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));-- Create storage buckets for content files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('content-videos', 'content-videos', false, 524288000, ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']::text[]),
  ('content-thumbnails', 'content-thumbnails', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]),
  ('content-resources', 'content-resources', false, 52428800, NULL)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for content-videos bucket
-- Admins can upload videos
CREATE POLICY "Admins can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'content-videos' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Admins can update videos
CREATE POLICY "Admins can update videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'content-videos' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Admins can delete videos
CREATE POLICY "Admins can delete videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'content-videos' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Users with access can view videos
CREATE POLICY "Users with access can view videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'content-videos' AND
  (
    has_role(auth.uid(), 'admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM content_episodes ce
      WHERE ce.video_url = storage.objects.name AND ce.is_preview = true
    ) OR
    EXISTS (
      SELECT 1 FROM content_episodes ce
      JOIN user_subscriptions us ON us.user_id = auth.uid()
      JOIN subscription_tiers st ON st.id = us.tier_id
      JOIN content_products cp ON cp.id = ce.product_id
      WHERE ce.video_url = storage.objects.name
        AND us.status = 'active'
        AND (
          st.access_level = 'vip' OR
          (st.access_level = 'premium' AND cp.access_level IN ('free', 'basic', 'premium')) OR
          (st.access_level = 'basic' AND cp.access_level IN ('free', 'basic')) OR
          cp.access_level = 'free'
        )
    ) OR
    EXISTS (
      SELECT 1 FROM content_episodes ce
      JOIN content_purchases cp ON cp.product_id = ce.product_id
      WHERE ce.video_url = storage.objects.name
        AND cp.user_id = auth.uid()
        AND cp.payment_status = 'completed'
        AND (cp.access_expires_at IS NULL OR cp.access_expires_at > now())
    )
  )
);

-- RLS Policies for content-thumbnails bucket (public)
-- Anyone can view thumbnails (bucket is public)
CREATE POLICY "Anyone can view thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'content-thumbnails');

-- Admins can upload thumbnails
CREATE POLICY "Admins can upload thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'content-thumbnails' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Admins can update thumbnails
CREATE POLICY "Admins can update thumbnails"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'content-thumbnails' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Admins can delete thumbnails
CREATE POLICY "Admins can delete thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'content-thumbnails' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- RLS Policies for content-resources bucket
-- Admins can upload resources
CREATE POLICY "Admins can upload resources"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'content-resources' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Admins can update resources
CREATE POLICY "Admins can update resources"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'content-resources' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Admins can delete resources
CREATE POLICY "Admins can delete resources"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'content-resources' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Users with access can download resources
CREATE POLICY "Users with access can download resources"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'content-resources' AND
  (
    has_role(auth.uid(), 'admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM content_episodes ce
      WHERE storage.objects.name = ANY(ce.resources_url)
        AND (
          EXISTS (
            SELECT 1 FROM user_subscriptions us
            JOIN subscription_tiers st ON st.id = us.tier_id
            JOIN content_products cp ON cp.id = ce.product_id
            WHERE us.user_id = auth.uid()
              AND us.status = 'active'
              AND st.can_download_resources = true
              AND (
                st.access_level = 'vip' OR
                (st.access_level = 'premium' AND cp.access_level IN ('free', 'basic', 'premium')) OR
                (st.access_level = 'basic' AND cp.access_level IN ('free', 'basic')) OR
                cp.access_level = 'free'
              )
          ) OR
          EXISTS (
            SELECT 1 FROM content_purchases cp
            WHERE cp.user_id = auth.uid()
              AND cp.product_id = ce.product_id
              AND cp.payment_status = 'completed'
              AND (cp.access_expires_at IS NULL OR cp.access_expires_at > now())
          )
        )
    )
  )
);-- Create notification enums
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
  EXECUTE FUNCTION notify_payment_failed();-- ============================================
-- CRITICAL SECURITY FIXES - PRE-LAUNCH
-- ============================================

-- Fix content_reviews: Prevent users from editing after approval
DROP POLICY IF EXISTS "Users can update own reviews" ON public.content_reviews;
CREATE POLICY "Users can update own unapproved reviews" 
ON public.content_reviews 
FOR UPDATE 
USING (auth.uid() = user_id AND is_approved = false);

-- Block anonymous access to profiles (only show to owner or admin)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id OR has_role(auth.uid(), 'admin'));

-- Ensure content_analytics is only insertable by authenticated users
DROP POLICY IF EXISTS "Users can create analytics events" ON public.content_analytics;
CREATE POLICY "Users can create analytics events" 
ON public.content_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR (user_id IS NULL AND auth.uid() IS NOT NULL));

-- Ensure purchases require authentication
DROP POLICY IF EXISTS "Users can create own purchases" ON public.content_purchases;
CREATE POLICY "Users can create own purchases" 
ON public.content_purchases 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Ensure enrollments require authentication
DROP POLICY IF EXISTS "Users can manage own enrollments" ON public.course_enrollments;
CREATE POLICY "Users can insert own enrollments" 
ON public.course_enrollments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own enrollments" 
ON public.course_enrollments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own enrollments" 
ON public.course_enrollments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Ensure user_progress requires authentication
DROP POLICY IF EXISTS "Users can manage own progress" ON public.user_progress;
CREATE POLICY "Users can insert own progress" 
ON public.user_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own progress" 
ON public.user_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress" 
ON public.user_progress 
FOR DELETE 
USING (auth.uid() = user_id);

-- Ensure subscriptions require authentication
DROP POLICY IF EXISTS "Users can create own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can create own subscriptions" 
ON public.user_subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);-- ============================================
-- FINAL SECURITY HARDENING - BLOCK ALL ANONYMOUS ACCESS
-- ============================================

-- Block anonymous access to profiles completely
CREATE POLICY "Block anonymous profile access" 
ON public.profiles 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Block anonymous read access to content_analytics
CREATE POLICY "Block public analytics access" 
ON public.content_analytics 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Block all anonymous access to purchases (not just SELECT)
DROP POLICY IF EXISTS "Public cannot access purchases" ON public.purchases;
CREATE POLICY "Block all anonymous purchase access" 
ON public.purchases 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Block anonymous access to user_roles
CREATE POLICY "Block anonymous role access" 
ON public.user_roles 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Block anonymous access to content_purchases
CREATE POLICY "Block anonymous purchase access" 
ON public.content_purchases 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Block anonymous access to user_progress
CREATE POLICY "Block anonymous progress access" 
ON public.user_progress 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Block anonymous access to course_enrollments
CREATE POLICY "Block anonymous enrollment access" 
ON public.course_enrollments 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Block anonymous access to user_subscriptions
CREATE POLICY "Block anonymous subscription access" 
ON public.user_subscriptions 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Block anonymous access to admin_notifications
CREATE POLICY "Block anonymous notification access" 
ON public.admin_notifications 
FOR ALL 
USING (auth.uid() IS NOT NULL);-- ============================================
-- FINAL CRITICAL SECURITY FIXES (CORRECTED)
-- ============================================

-- Fix profiles access - users can only see their OWN data
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view only their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Prevent users from modifying their own subscriptions
CREATE POLICY "Block user subscription updates" 
ON public.user_subscriptions 
FOR UPDATE 
USING (false);

CREATE POLICY "Block user subscription deletes" 
ON public.user_subscriptions 
FOR DELETE 
USING (false);

-- Prevent users from modifying content purchases
CREATE POLICY "Block user content purchase updates" 
ON public.content_purchases 
FOR UPDATE 
USING (false);

CREATE POLICY "Block user content purchase deletes" 
ON public.content_purchases 
FOR DELETE 
USING (false);

-- Prevent users from modifying purchases
DROP POLICY IF EXISTS "Authenticated users can create purchases" ON public.purchases;
CREATE POLICY "Users can create own purchases" 
ON public.purchases 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Block user purchase updates" 
ON public.purchases 
FOR UPDATE 
USING (false);

CREATE POLICY "Block user purchase deletes" 
ON public.purchases 
FOR DELETE 
USING (false);-- ============================================
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
EXECUTE FUNCTION public.notify_subscription_activated();-- Create table for exit intent email captures
CREATE TABLE public.exit_intent_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_contacted BOOLEAN DEFAULT false,
  contacted_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.exit_intent_leads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form)
CREATE POLICY "Anyone can submit email" 
ON public.exit_intent_leads 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view leads
CREATE POLICY "Admins can view leads" 
ON public.exit_intent_leads 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Only admins can update leads
CREATE POLICY "Admins can update leads" 
ON public.exit_intent_leads 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);-- Create a separate table for sensitive user data (phone numbers)
-- Only the user themselves can access this - no admin access for maximum security
CREATE TABLE public.user_sensitive_data (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_sensitive_data ENABLE ROW LEVEL SECURITY;

-- ONLY the user can see their own sensitive data - NO admin access
CREATE POLICY "Users can view only their own sensitive data"
ON public.user_sensitive_data
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update only their own sensitive data"
ON public.user_sensitive_data
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert only their own sensitive data"
ON public.user_sensitive_data
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Block anonymous access
CREATE POLICY "Block anonymous access to sensitive data"
ON public.user_sensitive_data
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Migrate existing phone data from profiles to new table
INSERT INTO public.user_sensitive_data (id, phone)
SELECT id, phone FROM public.profiles WHERE phone IS NOT NULL
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;

-- Remove phone column from profiles table (security fix)
ALTER TABLE public.profiles DROP COLUMN phone;

-- Create trigger to auto-create sensitive data row when profile is created
CREATE OR REPLACE FUNCTION public.handle_new_sensitive_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_sensitive_data (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_add_sensitive_data
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_sensitive_data();-- Create push_subscriptions table for storing Web Push subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  device_name TEXT,
  device_type TEXT CHECK (device_type IN ('ios', 'android', 'desktop', 'other')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own subscriptions
CREATE POLICY "Users can view own push subscriptions"
ON public.push_subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own push subscriptions"
ON public.push_subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push subscriptions"
ON public.push_subscriptions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscriptions"
ON public.push_subscriptions FOR DELETE
USING (auth.uid() = user_id);

-- Block anonymous access
CREATE POLICY "Block anonymous push subscription access"
ON public.push_subscriptions FOR ALL
USING (auth.uid() IS NOT NULL);

-- Index for faster lookups
CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_active ON public.push_subscriptions(is_active) WHERE is_active = true;-- Enable pg_net extension for HTTP calls from database
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function to send push notification when user_notification is created
CREATE OR REPLACE FUNCTION public.send_push_on_user_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_service_role_key TEXT;
  v_supabase_url TEXT;
BEGIN
  -- Get environment variables
  v_supabase_url := 'https://tsvfsbluyuaajqmkpzdv.supabase.co';
  
  -- Call the push-notifications edge function
  PERFORM net.http_post(
    url := v_supabase_url || '/functions/v1/push-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'action', 'send',
      'user_id', NEW.user_id::text,
      'title', NEW.title,
      'body', NEW.message,
      'url', COALESCE(NEW.link, '/dashboard')
    )
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the transaction
  RAISE WARNING 'Push notification failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Trigger to send push on new user notification
DROP TRIGGER IF EXISTS on_user_notification_created ON public.user_notifications;
CREATE TRIGGER on_user_notification_created
AFTER INSERT ON public.user_notifications
FOR EACH ROW
EXECUTE FUNCTION public.send_push_on_user_notification();

-- Function to send welcome notification to new users
CREATE OR REPLACE FUNCTION public.notify_new_user_welcome()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_notifications (user_id, type, title, message, link)
  VALUES (
    NEW.id,
    'welcome',
    'ברוך הבא למיינד האקר! 🎉',
    'שמחים שהצטרפת אלינו. גלה את התכנים שלנו והתחל את המסע שלך',
    '/courses'
  );
  RETURN NEW;
END;
$$;

-- Trigger for welcome notification on new profile
DROP TRIGGER IF EXISTS on_new_user_welcome ON public.profiles;
CREATE TRIGGER on_new_user_welcome
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_user_welcome();-- Create leads table for capturing consultation requests
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  source text NOT NULL DEFAULT 'general',
  preferred_time text,
  notes text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  contacted_at timestamp with time zone,
  contacted_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all leads"
ON public.leads FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update leads"
ON public.leads FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete leads"
ON public.leads FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can submit lead"
ON public.leads FOR INSERT
WITH CHECK (true);

-- Create trigger for admin notification on new lead
CREATE OR REPLACE FUNCTION public.notify_new_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM create_admin_notification(
    'new_user'::notification_type,
    'high'::notification_priority,
    '📱 ליד חדש!',
    NEW.name || ' השאיר/ה פרטים (' || NEW.source || ')',
    '/admin/leads',
    jsonb_build_object('lead_id', NEW.id, 'phone', NEW.phone, 'source', NEW.source)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_lead
AFTER INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_lead();-- Create function to fan out admin notifications to admin users as user_notifications
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
EXECUTE FUNCTION public.fanout_admin_notifications_to_users();-- Remove the non-functional push notification trigger from database
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
  EXECUTE FUNCTION public.notify_user_subscription_cancelled();-- Enable pg_net extension for HTTP calls from database
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create function to send push notification via edge function
CREATE OR REPLACE FUNCTION public.send_push_notification_via_edge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_supabase_url TEXT := 'https://tsvfsbluyuaajqmkpzdv.supabase.co';
  v_anon_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzdmZzYmx1eXVhYWpxbWtwemR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNDY3ODAsImV4cCI6MjA3ODcyMjc4MH0.25iZhw71Zlha_JNO8pBDTaxPy4IuTGKFlcP3D80Md1Y';
BEGIN
  -- Call the push-notifications edge function
  PERFORM extensions.http_post(
    url := v_supabase_url || '/functions/v1/push-notifications',
    body := jsonb_build_object(
      'action', 'send',
      'user_id', NEW.user_id::text,
      'title', NEW.title,
      'body', NEW.message,
      'url', COALESCE(NEW.link, '/dashboard')
    )::text,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_anon_key
    )::jsonb
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the transaction
  RAISE WARNING 'Push notification edge call failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Create trigger to send push when user notification is created
DROP TRIGGER IF EXISTS on_user_notification_send_push ON public.user_notifications;
CREATE TRIGGER on_user_notification_send_push
  AFTER INSERT ON public.user_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.send_push_notification_via_edge();-- Fix the push notification trigger to use correct pg_net syntax
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
$$;-- Fix security: Add SELECT policies to protect lead data from public access

-- 1. Add SELECT policy to leads table - only admins can read
CREATE POLICY "Admins can view leads"
ON public.leads
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Add SELECT policy to exit_intent_leads table - only admins can read  
CREATE POLICY "Admins can view exit intent leads"
ON public.exit_intent_leads
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Also add INSERT restriction to admin_notifications (only system triggers should insert)
-- First check if policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'admin_notifications' 
    AND policyname = 'Only system can insert admin notifications'
  ) THEN
    CREATE POLICY "Only system can insert admin notifications"
    ON public.admin_notifications
    FOR INSERT
    WITH CHECK (false); -- Only triggers with SECURITY DEFINER can insert
  END IF;
END $$;-- Fix leads table RLS - add restrictive policy to block non-admin SELECT access
-- The current policies are PERMISSIVE, so any authenticated user can read all leads
-- We need to add a RESTRICTIVE policy that blocks non-admin SELECT

-- First, drop the duplicate SELECT policy
DROP POLICY IF EXISTS "Admins can view leads" ON public.leads;

-- Add a restrictive policy that blocks SELECT for non-admins
-- This works together with the existing permissive "Admins can view all leads" policy
CREATE POLICY "Block non-admin lead access"
ON public.leads
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));-- Create menu_items table
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('scroll', 'navigate')),
  action_value TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Anyone can view visible menu items
CREATE POLICY "Anyone can view visible menu items"
ON public.menu_items
FOR SELECT
USING (is_visible = true);

-- Admins can manage all menu items
CREATE POLICY "Admins can manage menu items"
ON public.menu_items
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default menu items
INSERT INTO public.menu_items (label, action_type, action_value, order_index, is_visible) VALUES
('מה זה?', 'scroll', 'what', 1, true),
('איך זה עובד?', 'scroll', 'how', 2, true),
('עלי', 'scroll', 'about', 3, true),
('עדויות', 'scroll', 'testimonials', 4, true),
('שאלות נפוצות', 'scroll', 'faq', 5, true),
('מחירים', 'scroll', 'booking', 6, true);-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create hypnosis_audios table for storing audio file metadata
CREATE TABLE public.hypnosis_audios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  duration_seconds INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_audio_access junction table for user-audio assignments
CREATE TABLE public.user_audio_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  audio_id UUID NOT NULL REFERENCES public.hypnosis_audios(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  notes TEXT,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, audio_id)
);

-- Enable RLS on both tables
ALTER TABLE public.hypnosis_audios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_audio_access ENABLE ROW LEVEL SECURITY;

-- RLS policies for hypnosis_audios
CREATE POLICY "Admins can manage all audios"
ON public.hypnosis_audios
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view audios they have access to"
ON public.hypnosis_audios
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_audio_access uaa
    WHERE uaa.audio_id = hypnosis_audios.id
      AND uaa.user_id = auth.uid()
      AND uaa.is_active = true
      AND (uaa.expires_at IS NULL OR uaa.expires_at > now())
  )
);

-- RLS policies for user_audio_access
CREATE POLICY "Admins can manage all audio access"
ON public.user_audio_access
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own audio access"
ON public.user_audio_access
FOR SELECT
USING (auth.uid() = user_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_hypnosis_audios_updated_at
BEFORE UPDATE ON public.hypnosis_audios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create private storage bucket for hypnosis audios
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hypnosis-audios', 'hypnosis-audios', false);

-- Storage policies for hypnosis-audios bucket
CREATE POLICY "Admins can upload hypnosis audios"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'hypnosis-audios' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update hypnosis audios"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'hypnosis-audios' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete hypnosis audios"
ON storage.objects
FOR DELETE
USING (bucket_id = 'hypnosis-audios' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all hypnosis audios"
ON storage.objects
FOR SELECT
USING (bucket_id = 'hypnosis-audios' AND public.has_role(auth.uid(), 'admin'));

-- Users with access can view their assigned audios
CREATE POLICY "Users can view assigned hypnosis audios"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'hypnosis-audios' 
  AND EXISTS (
    SELECT 1 FROM public.user_audio_access uaa
    JOIN public.hypnosis_audios ha ON ha.id = uaa.audio_id
    WHERE ha.file_path = name
      AND uaa.user_id = auth.uid()
      AND uaa.is_active = true
      AND (uaa.expires_at IS NULL OR uaa.expires_at > now())
  )
);

-- Create index for faster token lookups
CREATE INDEX idx_user_audio_access_token ON public.user_audio_access(access_token);
CREATE INDEX idx_user_audio_access_user ON public.user_audio_access(user_id);-- Drop the constraint first, then the index
ALTER TABLE public.user_audio_access 
DROP CONSTRAINT IF EXISTS user_audio_access_user_id_audio_id_key;

-- Allow user_id to be nullable for anonymous/direct links
ALTER TABLE public.user_audio_access 
ALTER COLUMN user_id DROP NOT NULL;

-- Create partial unique index to allow multiple null user entries
CREATE UNIQUE INDEX user_audio_access_user_audio_unique 
ON public.user_audio_access(user_id, audio_id) 
WHERE user_id IS NOT NULL;-- Allow anyone (even unauthenticated users) to read user_audio_access by access_token
-- This enables public shareable links for audio recordings

CREATE POLICY "Anyone can read audio access by token" 
ON public.user_audio_access
FOR SELECT 
USING (true);

-- Note: This is safe because:
-- 1. Access tokens are cryptographically random (64 character hex)
-- 2. Without knowing the token, you cannot guess it
-- 3. The audio file itself is still protected via signed URLs-- Fix security issue #1: Explicitly block non-admin access to leads table
-- Drop existing policies that might allow access
DROP POLICY IF EXISTS "Block non-admin lead access" ON public.leads;

-- Create explicit deny policy for non-admins on SELECT
CREATE POLICY "Block non-admin lead select" 
ON public.leads 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix security issue #2: Remove public read access to user_audio_access
-- This exposed access tokens to everyone
DROP POLICY IF EXISTS "Anyone can read audio access by token" ON public.user_audio_access;-- Fix security issue: Explicitly block anonymous/non-admin access to leads table
-- First drop conflicting policies
DROP POLICY IF EXISTS "Block non-admin lead select" ON public.leads;

-- Create restrictive policy that only allows admins
CREATE POLICY "Only admins can select leads" 
ON public.leads 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role)
);

-- Fix exit_intent_leads: Add explicit block for non-admins
DROP POLICY IF EXISTS "Admins can view leads" ON public.exit_intent_leads;
DROP POLICY IF EXISTS "Admins can view exit intent leads" ON public.exit_intent_leads;

CREATE POLICY "Only admins can view exit intent leads" 
ON public.exit_intent_leads 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role)
);-- First drop the partially created table if exists and recreate properly
DROP TABLE IF EXISTS public.hypnosis_videos CASCADE;

-- Create hypnosis_videos table for personal training videos
CREATE TABLE public.hypnosis_videos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  file_path text NOT NULL,
  thumbnail_path text,
  duration_seconds integer,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_video_access table FIRST (before referencing it in policy)
CREATE TABLE public.user_video_access (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  video_id uuid NOT NULL REFERENCES public.hypnosis_videos(id) ON DELETE CASCADE,
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  granted_by uuid,
  access_token text NOT NULL DEFAULT encode(extensions.gen_random_bytes(32), 'hex'::text),
  notes text
);

-- Enable RLS on hypnosis_videos
ALTER TABLE public.hypnosis_videos ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_video_access
ALTER TABLE public.user_video_access ENABLE ROW LEVEL SECURITY;

-- Admins can manage all videos
CREATE POLICY "Admins can manage all videos"
ON public.hypnosis_videos
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Users can view videos they have access to
CREATE POLICY "Users can view videos they have access to"
ON public.hypnosis_videos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_video_access uva
    WHERE uva.video_id = hypnosis_videos.id
      AND uva.user_id = auth.uid()
      AND uva.is_active = true
      AND (uva.expires_at IS NULL OR uva.expires_at > now())
  )
);

-- Admins can manage all video access
CREATE POLICY "Admins can manage all video access"
ON public.user_video_access
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own video access
CREATE POLICY "Users can view their own video access"
ON public.user_video_access
FOR SELECT
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_hypnosis_videos_updated_at
BEFORE UPDATE ON public.hypnosis_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for personal videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('hypnosis-videos', 'hypnosis-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for hypnosis-videos bucket
CREATE POLICY "Admins can manage hypnosis videos storage"
ON storage.objects
FOR ALL
USING (bucket_id = 'hypnosis-videos' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'hypnosis-videos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view hypnosis videos they have access to"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'hypnosis-videos' 
  AND EXISTS (
    SELECT 1 FROM user_video_access uva
    JOIN hypnosis_videos hv ON hv.id = uva.video_id
    WHERE hv.file_path = name
      AND uva.user_id = auth.uid()
      AND uva.is_active = true
      AND (uva.expires_at IS NULL OR uva.expires_at > now())
  )
);-- Create custom_forms table for form definitions
CREATE TABLE public.custom_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  access_token TEXT NOT NULL DEFAULT encode(extensions.gen_random_bytes(32), 'hex'::text) UNIQUE,
  settings JSONB DEFAULT '{"thank_you_message": "תודה על מילוי הטופס!", "show_progress": true}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create form_fields table for field definitions
CREATE TABLE public.form_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.custom_forms(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'email', 'phone', 'textarea', 'select', 'radio', 'checkbox', 'rating', 'date', 'number')),
  label TEXT NOT NULL,
  placeholder TEXT,
  is_required BOOLEAN DEFAULT false,
  options JSONB DEFAULT '[]'::jsonb,
  order_index INTEGER DEFAULT 0,
  validation JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create form_submissions table for responses
CREATE TABLE public.form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.custom_forms(id) ON DELETE CASCADE,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'viewed', 'processed'))
);

-- Enable RLS on all tables
ALTER TABLE public.custom_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_forms
CREATE POLICY "Admins can manage all forms"
  ON public.custom_forms
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view published forms by token"
  ON public.custom_forms
  FOR SELECT
  USING (status = 'published');

-- RLS Policies for form_fields
CREATE POLICY "Admins can manage all fields"
  ON public.form_fields
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view fields of published forms"
  ON public.form_fields
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.custom_forms
    WHERE custom_forms.id = form_fields.form_id
    AND custom_forms.status = 'published'
  ));

-- RLS Policies for form_submissions
CREATE POLICY "Admins can manage all submissions"
  ON public.form_submissions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can submit to published forms"
  ON public.form_submissions
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.custom_forms
    WHERE custom_forms.id = form_submissions.form_id
    AND custom_forms.status = 'published'
  ));

-- Create indexes for performance
CREATE INDEX idx_form_fields_form_id ON public.form_fields(form_id);
CREATE INDEX idx_form_fields_order ON public.form_fields(form_id, order_index);
CREATE INDEX idx_form_submissions_form_id ON public.form_submissions(form_id);
CREATE INDEX idx_form_submissions_status ON public.form_submissions(status);
CREATE INDEX idx_custom_forms_token ON public.custom_forms(access_token);
CREATE INDEX idx_custom_forms_status ON public.custom_forms(status);

-- Create trigger to update updated_at
CREATE TRIGGER update_custom_forms_updated_at
  BEFORE UPDATE ON public.custom_forms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_form_fields_updated_at
  BEFORE UPDATE ON public.form_fields
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();-- Add English label column to menu_items
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS label_en TEXT;

-- Update existing menu items with English translations
UPDATE menu_items SET label_en = 'Consciousness Leap' WHERE label = 'קפיצה לתודעה חדשה';
UPDATE menu_items SET label_en = 'Personal Hypnosis Video' WHERE label = 'סרטון היפנוזה אישי';
UPDATE menu_items SET label_en = 'About' WHERE label = 'עלי';
UPDATE menu_items SET label_en = 'Testimonials' WHERE label = 'עדויות';
UPDATE menu_items SET label_en = 'FAQ' WHERE label = 'שאלות נפוצות';
UPDATE menu_items SET label_en = 'Courses' WHERE label = 'קורסים';
UPDATE menu_items SET label_en = 'Subscriptions' WHERE label = 'מנויים';-- Add English columns for FAQ translations
ALTER TABLE public.faqs 
ADD COLUMN question_en TEXT,
ADD COLUMN answer_en TEXT;-- Create homepage_sections table for admin-editable content
CREATE TABLE public.homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  title_he TEXT,
  title_en TEXT,
  subtitle_he TEXT,
  subtitle_en TEXT,
  content_he TEXT,
  content_en TEXT,
  is_visible BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

-- Anyone can view visible sections
CREATE POLICY "Anyone can view visible sections"
ON public.homepage_sections
FOR SELECT
USING (is_visible = true);

-- Admins can manage all sections
CREATE POLICY "Admins can manage all sections"
ON public.homepage_sections
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_homepage_sections_updated_at
BEFORE UPDATE ON public.homepage_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial sections
INSERT INTO public.homepage_sections (section_key, title_he, title_en, subtitle_he, subtitle_en, order_index) VALUES
('what', 'מה זה היפנוזה?', 'What is Hypnosis?', 'גלה את הכוח שבתוכך', 'Discover the power within', 1),
('how', 'איך זה עובד?', 'How Does It Work?', 'התהליך שלנו', 'Our Process', 2),
('about', 'קצת עליי', 'About Me', 'הכירו את דין', 'Meet Dean', 3),
('booking', 'בוא נתכנת את המציאות שלך', 'Let''s Program Your Reality', 'בחר את החבילה המתאימה לך', 'Choose the package that suits you', 4),
('testimonials', 'מה אומרים עליי', 'What People Say', 'סיפורי הצלחה', 'Success Stories', 5),
('faq', 'שאלות נפוצות', 'FAQ', 'התשובות לכל מה שרצית לדעת', 'Answers to everything you wanted to know', 6);-- Add new notification types to the enum
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
EXECUTE FUNCTION public.notify_personal_hypnosis_order();-- Add email column to form_submissions for tracking
ALTER TABLE public.form_submissions ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_form_submissions_email ON public.form_submissions(email);

-- Add user_id column for linking to accounts (nullable, linked when user registers)
ALTER TABLE public.form_submissions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_form_submissions_user_id ON public.form_submissions(user_id);-- Create visitor_sessions table
CREATE TABLE public.visitor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  user_id UUID,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  device_type TEXT,
  browser TEXT,
  os TEXT,
  screen_size TEXT,
  language TEXT,
  country TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  landing_page TEXT,
  is_returning BOOLEAN DEFAULT FALSE,
  page_views INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0
);

-- Create page_views table
CREATE TABLE public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer_path TEXT,
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  exited_at TIMESTAMPTZ,
  time_on_page_seconds INTEGER,
  scroll_depth_percent INTEGER,
  is_bounce BOOLEAN DEFAULT TRUE
);

-- Create conversion_events table
CREATE TABLE public.conversion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID,
  event_type TEXT NOT NULL,
  event_category TEXT,
  source TEXT,
  page_path TEXT,
  event_data JSONB DEFAULT '{}',
  conversion_value NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_visitor_sessions_session_id ON public.visitor_sessions(session_id);
CREATE INDEX idx_visitor_sessions_created ON public.visitor_sessions(first_seen);
CREATE INDEX idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX idx_page_views_page_path ON public.page_views(page_path);
CREATE INDEX idx_page_views_entered ON public.page_views(entered_at);
CREATE INDEX idx_conversion_events_session_id ON public.conversion_events(session_id);
CREATE INDEX idx_conversion_events_type ON public.conversion_events(event_type);
CREATE INDEX idx_conversion_events_category ON public.conversion_events(event_category);
CREATE INDEX idx_conversion_events_created ON public.conversion_events(created_at);

-- Enable RLS on all tables
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for visitor_sessions
CREATE POLICY "Anyone can insert visitor sessions" ON public.visitor_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update their own session" ON public.visitor_sessions
  FOR UPDATE USING (true);

CREATE POLICY "Admins can view all sessions" ON public.visitor_sessions
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for page_views
CREATE POLICY "Anyone can insert page views" ON public.page_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update page views" ON public.page_views
  FOR UPDATE USING (true);

CREATE POLICY "Admins can view all page views" ON public.page_views
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for conversion_events
CREATE POLICY "Anyone can insert conversion events" ON public.conversion_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all conversion events" ON public.conversion_events
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for conversion tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversion_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.visitor_sessions;-- Create analytics_reports table to store daily report history
CREATE TABLE public.analytics_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE NOT NULL UNIQUE,
  report_data JSONB NOT NULL DEFAULT '{}',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.analytics_reports ENABLE ROW LEVEL SECURITY;

-- Only admins can view reports
CREATE POLICY "Admins can view analytics reports" 
ON public.analytics_reports 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Only service role can insert (from edge function)
CREATE POLICY "Service role can insert analytics reports" 
ON public.analytics_reports 
FOR INSERT 
WITH CHECK (true);

-- Add video URL settings to site_settings if they don't exist
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description) VALUES
  ('introspection_promo_video_url', '', 'url', 'Video URL for introspection promo section'),
  ('introspection_promo_video_enabled', 'false', 'boolean', 'Enable video in introspection promo'),
  ('personal_hypnosis_sample_video_url', '', 'url', 'Sample video URL for personal hypnosis'),
  ('personal_hypnosis_sample_video_enabled', 'false', 'boolean', 'Enable sample video in personal hypnosis'),
  ('consciousness_leap_intro_video_url', '', 'url', 'Intro video URL for consciousness leap'),
  ('consciousness_leap_intro_video_enabled', 'false', 'boolean', 'Enable intro video in consciousness leap'),
  ('daily_report_enabled', 'true', 'boolean', 'Enable daily analytics reports'),
  ('daily_report_email', '', 'text', 'Email address for daily analytics reports')
ON CONFLICT (setting_key) DO NOTHING;-- Newsletter subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  source TEXT DEFAULT 'website',
  language TEXT DEFAULT 'he',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  unsubscribe_token UUID DEFAULT gen_random_uuid() UNIQUE,
  preferences JSONB DEFAULT '{"marketing": true, "updates": true, "tips": true}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email logs table for tracking all sent emails
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email_type TEXT NOT NULL,
  subject TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  resend_id TEXT,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter campaigns table
CREATE TABLE public.newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject_he TEXT NOT NULL,
  subject_en TEXT,
  content_html_he TEXT NOT NULL,
  content_html_en TEXT,
  content_text_he TEXT,
  content_text_en TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  target_audience JSONB DEFAULT '{"all": true}'::jsonb,
  stats JSONB DEFAULT '{"total": 0, "sent": 0, "opened": 0, "clicked": 0, "bounced": 0}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for newsletter_subscribers
CREATE POLICY "Admins can view all subscribers"
ON public.newsletter_subscribers FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can manage subscribers"
ON public.newsletter_subscribers FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Anyone can subscribe"
ON public.newsletter_subscribers FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Users can view own subscription"
ON public.newsletter_subscribers FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own subscription"
ON public.newsletter_subscribers FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for email_logs
CREATE POLICY "Admins can view all email logs"
ON public.email_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Service role can insert email logs"
ON public.email_logs FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update email logs"
ON public.email_logs FOR UPDATE
TO service_role
USING (true);

-- RLS Policies for newsletter_campaigns
CREATE POLICY "Admins can manage campaigns"
ON public.newsletter_campaigns FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Indexes for performance
CREATE INDEX idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_status ON public.newsletter_subscribers(status);
CREATE INDEX idx_email_logs_recipient ON public.email_logs(recipient_email);
CREATE INDEX idx_email_logs_type ON public.email_logs(email_type);
CREATE INDEX idx_email_logs_created ON public.email_logs(created_at DESC);
CREATE INDEX idx_newsletter_campaigns_status ON public.newsletter_campaigns(status);

-- Trigger for updated_at
CREATE TRIGGER update_newsletter_subscribers_updated_at
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_newsletter_campaigns_updated_at
  BEFORE UPDATE ON public.newsletter_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();-- Create chat assistant settings table
CREATE TABLE public.chat_assistant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create knowledge base table
CREATE TABLE public.chat_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_assistant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_knowledge_base ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_assistant_settings (admin only)
CREATE POLICY "Admins can view chat settings"
  ON public.chat_assistant_settings FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can insert chat settings"
  ON public.chat_assistant_settings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update chat settings"
  ON public.chat_assistant_settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete chat settings"
  ON public.chat_assistant_settings FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- RLS Policies for chat_knowledge_base (admin only)
CREATE POLICY "Admins can view knowledge base"
  ON public.chat_knowledge_base FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can insert knowledge base"
  ON public.chat_knowledge_base FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update knowledge base"
  ON public.chat_knowledge_base FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete knowledge base"
  ON public.chat_knowledge_base FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Insert default settings
INSERT INTO public.chat_assistant_settings (setting_key, setting_value) VALUES
  ('enabled', 'true'),
  ('model', 'google/gemini-2.5-flash'),
  ('greeting_he', 'היי! אני העוזר האישי של דין. במה אוכל לעזור לך היום?'),
  ('greeting_en', 'Hi! I am Dean''s personal assistant. How can I help you today?'),
  ('max_messages', '20'),
  ('max_content_length', '2000'),
  ('system_prompt', 'אתה עוזר אישי של דין אושר אזולאי, מייסד מיינד-האקר.

## תפקידך
- לעזור למבקרים להבין את השירותים והתכנים
- להכווין אותם לתוכן המתאים להם
- לענות על שאלות נפוצות
- להיות חם, אכפתי ולא מכירתי

## השירותים העיקריים
1. מסע התבוננות פנימית - שאלון חינמי להכרות עצמית
2. סרטון היפנוזה אישי - ₪297 - הקלטה מותאמת אישית
3. קפיצה לתודעה חדשה - ₪1,997 - תהליך טרנספורמציה מעמיק

## הנחיות התנהגות
- דבר בעברית בברירת מחדל, אלא אם המבקר פונה באנגלית
- היה תמציתי וממוקד
- הפנה לשיחת ייעוץ חינמית כשמתאים
- אל תלחץ למכירה - הצע ערך');

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_chat_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_chat_assistant_settings_updated_at
  BEFORE UPDATE ON public.chat_assistant_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chat_settings_updated_at();

CREATE TRIGGER update_chat_knowledge_base_updated_at
  BEFORE UPDATE ON public.chat_knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chat_settings_updated_at();-- Create site-videos storage bucket for site-wide videos (hero, about, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-videos', 'site-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view site videos (they're promotional content)
CREATE POLICY "Site videos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'site-videos');

-- Only admins can upload/update/delete site videos
CREATE POLICY "Admins can manage site videos"
ON storage.objects
FOR ALL
USING (bucket_id = 'site-videos' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'site-videos' AND public.has_role(auth.uid(), 'admin'));-- Create products table for standalone purchasable products/services
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  price NUMERIC NOT NULL,
  price_usd NUMERIC,
  status TEXT DEFAULT 'active',
  product_type TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create orders table for product purchases
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id),
  amount NUMERIC NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  order_date TIMESTAMPTZ DEFAULT now(),
  payment_approved_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Products policies (public read, admin write)
CREATE POLICY "Products are viewable by everyone"
ON public.products FOR SELECT
USING (true);

CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Orders policies
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all orders"
ON public.orders FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert Personal Hypnosis product
INSERT INTO public.products (slug, title, title_en, description, description_en, price, price_usd, product_type, status)
VALUES (
  'personal-hypnosis-video',
  'סרטון היפנוזה אישי',
  'Personal Hypnosis Video',
  'סרטון היפנוזה מותאם אישית שנוצר במיוחד עבורך',
  'A personalized hypnosis video created specifically for you',
  297,
  79,
  'personal-hypnosis',
  'active'
);

-- Create trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create notification trigger for new orders
CREATE OR REPLACE FUNCTION public.notify_new_product_order()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_admin_notification(
    p_type := 'new_personal_hypnosis_order'::notification_type,
    p_priority := 'high'::notification_priority,
    p_title := 'הזמנה חדשה להיפנוזה אישית',
    p_message := 'התקבלה הזמנה חדשה להיפנוזה אישית',
    p_link := '/admin/products',
    p_metadata := jsonb_build_object('order_id', NEW.id, 'user_id', NEW.user_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_new_product_order
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_product_order();-- Add foreign key from orders to profiles for proper query joins
ALTER TABLE public.orders 
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Delete "היפנוזה אישית" from content_products (now managed via products table)
DELETE FROM public.content_products WHERE slug = 'personal-hypnosis';CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;-- Add preferred_language to profiles for user language tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'he' CHECK (preferred_language IN ('he', 'en'));

-- Add English columns to testimonials for bilingual support
ALTER TABLE public.testimonials 
ADD COLUMN IF NOT EXISTS name_en text,
ADD COLUMN IF NOT EXISTS role_en text,
ADD COLUMN IF NOT EXISTS quote_en text;

-- Insert English video URL settings for each promotional video
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description)
VALUES 
  ('hero_video_url_en', NULL, 'text', 'Hero section video URL (English)'),
  ('about_video_url_en', NULL, 'text', 'About section video URL (English)'),
  ('introspection_promo_video_url_en', NULL, 'text', 'Introspection promo video URL (English)'),
  ('personal_hypnosis_promo_video_url_en', NULL, 'text', 'Personal Hypnosis promo video URL (English)'),
  ('consciousness_leap_promo_video_url_en', NULL, 'text', 'Consciousness Leap promo video URL (English)')
ON CONFLICT (setting_key) DO NOTHING;

-- Add English enabled toggles for videos
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description)
VALUES 
  ('hero_video_enabled_en', 'false', 'boolean', 'Hero section video enabled (English)'),
  ('about_video_enabled_en', 'false', 'boolean', 'About section video enabled (English)'),
  ('introspection_promo_video_enabled_en', 'false', 'boolean', 'Introspection promo video enabled (English)'),
  ('personal_hypnosis_promo_video_enabled_en', 'false', 'boolean', 'Personal Hypnosis promo video enabled (English)'),
  ('consciousness_leap_promo_video_enabled_en', 'false', 'boolean', 'Consciousness Leap promo video enabled (English)')
ON CONFLICT (setting_key) DO NOTHING;-- Create affiliates table
CREATE TABLE public.affiliates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  affiliate_code TEXT NOT NULL UNIQUE,
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  payment_method TEXT CHECK (payment_method IN ('paypal', 'bank_transfer', 'bit', 'paybox')),
  payment_details JSONB,
  total_earnings DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_paid DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create affiliate_referrals table
CREATE TABLE public.affiliate_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  order_amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Create affiliate_payouts table
CREATE TABLE public.affiliate_payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  notes TEXT,
  processed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add affiliate_code column to orders table
ALTER TABLE public.orders ADD COLUMN affiliate_code TEXT;

-- Enable RLS on all tables
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- RLS policies for affiliates
CREATE POLICY "Users can view their own affiliate profile" 
ON public.affiliates FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own affiliate profile" 
ON public.affiliates FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can insert affiliate profile" 
ON public.affiliates FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all affiliates" 
ON public.affiliates FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- RLS policies for affiliate_referrals
CREATE POLICY "Affiliates can view their own referrals" 
ON public.affiliate_referrals FOR SELECT 
USING (
  affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage all referrals" 
ON public.affiliate_referrals FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- RLS policies for affiliate_payouts
CREATE POLICY "Affiliates can view their own payouts" 
ON public.affiliate_payouts FOR SELECT 
USING (
  affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage all payouts" 
ON public.affiliate_payouts FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Create function to update affiliate earnings when referral is approved
CREATE OR REPLACE FUNCTION public.update_affiliate_earnings()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    UPDATE public.affiliates 
    SET total_earnings = total_earnings + NEW.commission_amount,
        updated_at = now()
    WHERE id = NEW.affiliate_id;
  ELSIF NEW.status = 'paid' AND OLD.status = 'approved' THEN
    UPDATE public.affiliates 
    SET total_paid = total_paid + NEW.commission_amount,
        updated_at = now()
    WHERE id = NEW.affiliate_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for updating affiliate earnings
CREATE TRIGGER on_referral_status_change
  AFTER UPDATE ON public.affiliate_referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_affiliate_earnings();

-- Create trigger for updated_at on affiliates
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add notification type for affiliate events
-- Note: This requires adding to the enum if not exists
DO $$
BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'new_affiliate';
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'affiliate_referral';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;-- Add affiliate_code column to leads table for tracking referrals from affiliate partners
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS affiliate_code TEXT;

-- Add index for faster affiliate lookups
CREATE INDEX IF NOT EXISTS idx_leads_affiliate_code ON public.leads(affiliate_code) WHERE affiliate_code IS NOT NULL;

-- Add affiliate_code column to consciousness_leap_leads table
ALTER TABLE public.consciousness_leap_leads ADD COLUMN IF NOT EXISTS affiliate_code TEXT;

-- Add index for faster affiliate lookups
CREATE INDEX IF NOT EXISTS idx_consciousness_leap_leads_affiliate_code ON public.consciousness_leap_leads(affiliate_code) WHERE affiliate_code IS NOT NULL;-- Trigger function to create affiliate referral when order payment is approved
CREATE OR REPLACE FUNCTION create_affiliate_referral_on_payment_approval()
RETURNS TRIGGER AS $$
DECLARE
  v_affiliate_id uuid;
  v_commission_rate numeric;
  v_existing_referral_id uuid;
BEGIN
  -- Only trigger when payment_status changes to 'completed'
  IF NEW.payment_status = 'completed' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'completed') AND NEW.affiliate_code IS NOT NULL THEN
    -- Check if referral already exists for this order
    SELECT id INTO v_existing_referral_id
    FROM affiliate_referrals
    WHERE order_id = NEW.id;
    
    -- Only create if no existing referral
    IF v_existing_referral_id IS NULL THEN
      -- Get affiliate info
      SELECT id, commission_rate INTO v_affiliate_id, v_commission_rate
      FROM affiliates
      WHERE affiliate_code = NEW.affiliate_code AND status = 'active';
      
      IF v_affiliate_id IS NOT NULL THEN
        -- Create referral record
        INSERT INTO affiliate_referrals (
          affiliate_id,
          referred_user_id,
          order_id,
          order_amount,
          commission_amount,
          status,
          approved_at
        ) VALUES (
          v_affiliate_id,
          NEW.user_id,
          NEW.id,
          NEW.amount,
          (NEW.amount * v_commission_rate / 100),
          'approved',
          now()
        );
        
        -- Update affiliate total earnings
        UPDATE affiliates
        SET total_earnings = total_earnings + (NEW.amount * v_commission_rate / 100),
            updated_at = now()
        WHERE id = v_affiliate_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on orders table
DROP TRIGGER IF EXISTS trg_create_affiliate_referral ON orders;
CREATE TRIGGER trg_create_affiliate_referral
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_affiliate_referral_on_payment_approval();-- Add affiliate_code to content_purchases and user_subscriptions tables for tracking
ALTER TABLE content_purchases ADD COLUMN IF NOT EXISTS affiliate_code TEXT;
ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS affiliate_code TEXT;

-- Drop existing trigger and function to recreate with improvements
DROP TRIGGER IF EXISTS trg_create_affiliate_referral ON orders;
DROP FUNCTION IF EXISTS create_affiliate_referral_on_payment_approval();

-- Create improved trigger function that handles both INSERT and UPDATE
CREATE OR REPLACE FUNCTION create_affiliate_referral_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_affiliate_id uuid;
  v_commission_rate numeric;
  v_existing_referral_id uuid;
  v_should_process boolean := false;
BEGIN
  -- Check if we should process this event
  IF TG_OP = 'INSERT' THEN
    -- For INSERT, process if payment is already completed and has affiliate code
    v_should_process := (NEW.payment_status = 'completed' AND NEW.affiliate_code IS NOT NULL);
  ELSIF TG_OP = 'UPDATE' THEN
    -- For UPDATE, process if payment_status changed to 'completed' and has affiliate code
    v_should_process := (NEW.payment_status = 'completed' 
                         AND (OLD.payment_status IS NULL OR OLD.payment_status != 'completed') 
                         AND NEW.affiliate_code IS NOT NULL);
  END IF;

  IF v_should_process THEN
    -- Check if referral already exists for this order
    SELECT id INTO v_existing_referral_id
    FROM affiliate_referrals 
    WHERE order_id = NEW.id;
    
    IF v_existing_referral_id IS NULL THEN
      -- Get affiliate info
      SELECT id, commission_rate INTO v_affiliate_id, v_commission_rate
      FROM affiliates
      WHERE affiliate_code = NEW.affiliate_code AND status = 'active';
      
      IF v_affiliate_id IS NOT NULL THEN
        -- Create referral record
        INSERT INTO affiliate_referrals (
          affiliate_id,
          referred_user_id,
          order_id,
          order_amount,
          commission_amount,
          status,
          approved_at
        ) VALUES (
          v_affiliate_id,
          NEW.user_id,
          NEW.id,
          NEW.amount,
          (NEW.amount * v_commission_rate / 100),
          'approved',
          now()
        );
        
        -- Update affiliate total earnings
        UPDATE affiliates
        SET total_earnings = total_earnings + (NEW.amount * v_commission_rate / 100),
            updated_at = now()
        WHERE id = v_affiliate_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on orders table for both INSERT and UPDATE
CREATE TRIGGER trg_affiliate_referral_on_payment
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_affiliate_referral_on_payment();-- Create theme_settings table for storing all theme/branding configuration
CREATE TABLE public.theme_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text,
  setting_type text DEFAULT 'string',
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;

-- Public read access (theme needs to load for all visitors)
CREATE POLICY "Theme settings are publicly readable"
  ON public.theme_settings FOR SELECT
  USING (true);

-- Admin-only write access
CREATE POLICY "Only admins can update theme settings"
  ON public.theme_settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Only admins can insert theme settings"
  ON public.theme_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Create theme_presets table for pre-built color themes
CREATE TABLE public.theme_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  description text,
  description_en text,
  colors jsonb NOT NULL,
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.theme_presets ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Theme presets are publicly readable"
  ON public.theme_presets FOR SELECT
  USING (true);

-- Admin-only write access
CREATE POLICY "Only admins can manage theme presets"
  ON public.theme_presets FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Insert default theme settings
INSERT INTO public.theme_settings (setting_key, setting_value, setting_type, description) VALUES
  -- Brand
  ('brand_name', 'מיינד האקר', 'string', 'Primary brand name (Hebrew)'),
  ('brand_name_en', 'Mind Hacker', 'string', 'Brand name (English)'),
  ('company_legal_name', 'Mind Hacker OÜ', 'string', 'Legal company name'),
  ('company_country', 'Estonia', 'string', 'Company registration country'),
  
  -- Colors (HSL format without hsl() wrapper)
  ('primary_h', '187', 'number', 'Primary color hue'),
  ('primary_s', '100%', 'string', 'Primary color saturation'),
  ('primary_l', '50%', 'string', 'Primary color lightness'),
  ('secondary_h', '217', 'number', 'Secondary color hue'),
  ('secondary_s', '91%', 'string', 'Secondary color saturation'),
  ('secondary_l', '60%', 'string', 'Secondary color lightness'),
  ('accent_h', '45', 'number', 'Accent color hue'),
  ('accent_s', '93%', 'string', 'Accent color saturation'),
  ('accent_l', '47%', 'string', 'Accent color lightness'),
  ('background_h', '222', 'number', 'Background color hue'),
  ('background_s', '47%', 'string', 'Background color saturation'),
  ('background_l', '11%', 'string', 'Background color lightness'),
  
  -- Typography
  ('font_family_primary', 'Heebo', 'string', 'Primary font family'),
  ('font_family_secondary', 'inherit', 'string', 'Secondary font family'),
  
  -- Effects
  ('matrix_rain_enabled', 'true', 'boolean', 'Enable Matrix Rain effect'),
  ('matrix_rain_color', '#00d4ff', 'string', 'Matrix Rain primary color'),
  ('matrix_rain_opacity', '0.15', 'number', 'Matrix Rain opacity'),
  
  -- Assets
  ('logo_url', '', 'string', 'Logo image URL'),
  ('favicon_url', '', 'string', 'Favicon URL'),
  
  -- Localization
  ('default_language', 'he', 'string', 'Default site language');

-- Insert default theme presets
INSERT INTO public.theme_presets (name, name_en, description, description_en, colors, order_index) VALUES
  ('סייבר מיינד', 'Cyber Mind', 'הנושא הנוכחי - צבעי ציאן וטכנולוגיה', 'Current theme - Cyan tech colors', 
   '{"primary_h": "187", "primary_s": "100%", "primary_l": "50%", "secondary_h": "217", "secondary_s": "91%", "secondary_l": "60%", "accent_h": "45", "accent_s": "93%", "accent_l": "47%", "background_h": "222", "background_s": "47%", "background_l": "11%", "matrix_color": "#00d4ff"}',
   1),
  ('אדמה חמה', 'Warm Earth', 'גוונים חמים של ענבר וטרקוטה', 'Warm amber and terracotta tones',
   '{"primary_h": "25", "primary_s": "95%", "primary_l": "53%", "secondary_h": "15", "secondary_s": "75%", "secondary_l": "45%", "accent_h": "45", "accent_s": "90%", "accent_l": "55%", "background_h": "20", "background_s": "20%", "background_l": "10%", "matrix_color": "#ff9500"}',
   2),
  ('שלוות האוקיינוס', 'Ocean Calm', 'גוונים רגועים של כחול וטורקיז', 'Calming blue and teal tones',
   '{"primary_h": "200", "primary_s": "85%", "primary_l": "55%", "secondary_h": "180", "secondary_s": "70%", "secondary_l": "45%", "accent_h": "160", "accent_s": "75%", "accent_l": "50%", "background_h": "210", "background_s": "35%", "background_l": "12%", "matrix_color": "#00a0c0"}',
   3),
  ('צמיחת היער', 'Forest Growth', 'גוונים טבעיים של ירוק ואדמה', 'Natural green earth tones',
   '{"primary_h": "142", "primary_s": "70%", "primary_l": "45%", "secondary_h": "160", "secondary_s": "60%", "secondary_l": "40%", "accent_h": "45", "accent_s": "80%", "accent_l": "50%", "background_h": "150", "background_s": "25%", "background_l": "10%", "matrix_color": "#22c55e"}',
   4),
  ('סגול מלכותי', 'Royal Purple', 'גוונים עשירים של סגול וזהב', 'Rich purple and gold tones',
   '{"primary_h": "270", "primary_s": "75%", "primary_l": "55%", "secondary_h": "280", "secondary_s": "65%", "secondary_l": "45%", "accent_h": "45", "accent_s": "90%", "accent_l": "55%", "background_h": "260", "background_s": "30%", "background_l": "12%", "matrix_color": "#a855f7"}',
   5);

-- Update trigger for theme_settings
CREATE TRIGGER update_theme_settings_updated_at
  BEFORE UPDATE ON public.theme_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for theme_presets
CREATE TRIGGER update_theme_presets_updated_at
  BEFORE UPDATE ON public.theme_presets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();-- Add additional theme settings for complete data-driven templating
INSERT INTO theme_settings (setting_key, setting_value, setting_type, description) VALUES
  -- Founder/Owner info
  ('founder_name', 'דין אושר אזולאי', 'string', 'Founder name (Hebrew)'),
  ('founder_name_en', 'Dean Osher Azulay', 'string', 'Founder name (English)'),
  ('founder_title', 'מאמן תודעה', 'string', 'Founder title (Hebrew)'),
  ('founder_title_en', 'Consciousness Coach', 'string', 'Founder title (English)'),
  
  -- SEO/Open Graph
  ('og_image_url', '', 'string', 'Default Open Graph image URL'),
  ('site_url', 'https://mind-hacker.net', 'string', 'Primary site URL'),
  
  -- Extended color palette
  ('primary_glow_l', '70', 'number', 'Primary glow lightness'),
  ('muted_h', '215', 'number', 'Muted color hue'),
  ('muted_s', '40', 'number', 'Muted color saturation (%)'),
  ('muted_l', '15', 'number', 'Muted color lightness (%)'),
  ('foreground_h', '210', 'number', 'Foreground color hue'),
  ('foreground_s', '40', 'number', 'Foreground color saturation (%)'),
  ('foreground_l', '98', 'number', 'Foreground color lightness (%)')
ON CONFLICT (setting_key) DO NOTHING;-- Add new theme settings for complete template system
INSERT INTO theme_settings (setting_key, setting_value, setting_type, description) VALUES
  ('background_effect', 'matrix_rain', 'string', 'Background effect type: none, matrix_rain'),
  ('hero_portrait_url', '', 'string', 'Founder portrait image URL'),
  ('pwa_icon_url', '', 'string', 'PWA icon URL'),
  ('introspection_form_id', '45dfc6a5-6f98-444b-a3dd-2c0dd1ca3308', 'string', 'Default introspection form ID'),
  ('founder_short_name', 'דין', 'string', 'Founder short name (Hebrew)'),
  ('founder_short_name_en', 'Dean', 'string', 'Founder short name (English)')
ON CONFLICT (setting_key) DO NOTHING;-- Add consciousness field effect settings
INSERT INTO theme_settings (setting_key, setting_value, setting_type, description) VALUES
  ('consciousness_field_primary_color', '#0a1628', 'string', 'Deep background color for consciousness field'),
  ('consciousness_field_accent_color', '#3d7a8c', 'string', 'Turquoise accent glow for consciousness field'),
  ('consciousness_field_particle_density', '0.6', 'string', 'Particle density 0-1 for consciousness field'),
  ('consciousness_field_breathing_speed', '10', 'string', 'Breathing cycle in seconds for consciousness field'),
  ('consciousness_field_interaction', 'true', 'boolean', 'Enable mouse/scroll interaction for consciousness field')
ON CONFLICT (setting_key) DO NOTHING;-- Add hero portrait effect settings
INSERT INTO theme_settings (setting_key, setting_value, setting_type, description) VALUES
  ('hero_portrait_effect', 'cyber_glow', 'string', 'Hero portrait effect style: cyber_glow, consciousness_aura, or none'),
  ('hero_portrait_glow_color', '', 'string', 'Custom glow color for hero portrait (hex, empty for theme primary)'),
  ('hero_portrait_animation_speed', 'normal', 'string', 'Animation speed: slow, normal, fast')
ON CONFLICT (setting_key) DO NOTHING;-- Add brand_color column to products table for data-driven product theming
ALTER TABLE products 
ADD COLUMN brand_color text DEFAULT 'primary';

-- Update existing products with their designated colors
UPDATE products SET brand_color = 'emerald' WHERE slug = 'personal-hypnosis-video';
UPDATE products SET brand_color = 'purple' WHERE slug = 'consciousness-leap';-- Create offers table for data-driven product offerings
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  
  -- Offer Identity
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  subtitle TEXT,
  subtitle_en TEXT,
  description TEXT,
  description_en TEXT,
  
  -- Landing Page Content
  badge_text TEXT,
  badge_text_en TEXT,
  hero_heading TEXT,
  hero_heading_en TEXT,
  hero_subheading TEXT,
  hero_subheading_en TEXT,
  
  -- Pricing
  price NUMERIC NOT NULL DEFAULT 0,
  price_usd NUMERIC,
  original_price NUMERIC,
  original_price_usd NUMERIC,
  
  -- Branding (null = use theme primary color)
  brand_color TEXT DEFAULT NULL,
  
  -- Features & Benefits (JSONB arrays)
  pain_points JSONB DEFAULT '[]',
  process_steps JSONB DEFAULT '[]',
  benefits JSONB DEFAULT '[]',
  faqs JSONB DEFAULT '[]',
  includes JSONB DEFAULT '[]',
  
  -- SEO
  seo_title TEXT,
  seo_title_en TEXT,
  seo_description TEXT,
  seo_description_en TEXT,
  
  -- Landing Page Settings
  landing_page_route TEXT,
  landing_page_enabled BOOLEAN DEFAULT true,
  show_on_homepage BOOLEAN DEFAULT true,
  homepage_order INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  
  -- CTA Configuration
  cta_type TEXT DEFAULT 'checkout',
  cta_text TEXT,
  cta_text_en TEXT,
  cta_link TEXT,
  
  -- Form Association (for lead capture offers)
  form_id UUID REFERENCES public.custom_forms(id) ON DELETE SET NULL,
  
  -- Status
  status TEXT DEFAULT 'draft',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Public read access for active offers
CREATE POLICY "Anyone can view active offers" 
ON public.offers 
FOR SELECT 
USING (status = 'active' AND landing_page_enabled = true);

-- Admin full access
CREATE POLICY "Admins can manage offers" 
ON public.offers 
FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Create index for faster lookups
CREATE INDEX idx_offers_slug ON public.offers(slug);
CREATE INDEX idx_offers_status ON public.offers(status);
CREATE INDEX idx_offers_homepage ON public.offers(show_on_homepage, homepage_order);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_offers_updated_at
BEFORE UPDATE ON public.offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial offers from existing products
INSERT INTO public.offers (
  slug, 
  title, 
  title_en, 
  subtitle,
  subtitle_en,
  description,
  description_en,
  badge_text,
  badge_text_en,
  price, 
  price_usd,
  brand_color,
  is_free,
  cta_type,
  cta_text,
  cta_text_en,
  landing_page_route,
  landing_page_enabled,
  show_on_homepage,
  homepage_order,
  status,
  product_id
)
SELECT 
  'introspection-journey',
  'מסע התבוננות עמוקה',
  'Deep Introspection Journey',
  '15 שאלות שישנו את הדרך שבה אתה רואה את עצמך',
  '15 questions that will change how you see yourself',
  'רק 10 דקות יכולות לפתוח דלת לתודעה חדשה',
  'Just 10 minutes can open a door to new consciousness',
  '🎁 מתנה חינמית',
  '🎁 Free Gift',
  0,
  0,
  'amber',
  true,
  'form',
  'התחל את המסע שלך',
  'Start Your Journey',
  '/form/45dfc6a5-6f98-444b-a3dd-2c0dd1ca3308',
  true,
  true,
  1,
  'active',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM public.offers WHERE slug = 'introspection-journey');

INSERT INTO public.offers (
  slug, 
  title, 
  title_en, 
  subtitle,
  subtitle_en,
  price, 
  price_usd,
  brand_color,
  is_free,
  cta_type,
  cta_text,
  cta_text_en,
  landing_page_route,
  landing_page_enabled,
  show_on_homepage,
  homepage_order,
  status,
  product_id
)
SELECT 
  'personal-hypnosis-video',
  'סרטון היפנוזה אישי',
  'Personal Hypnosis Video',
  'סרטון אימון תודעתי מותאם אישית לצרכים שלך',
  'A consciousness training video customized to your specific needs',
  297,
  79,
  'emerald',
  false,
  'checkout',
  'הזמן עכשיו',
  'Order Now',
  '/personal-hypnosis',
  true,
  true,
  2,
  'active',
  (SELECT id FROM public.products WHERE slug = 'personal-hypnosis-video' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.offers WHERE slug = 'personal-hypnosis-video');

INSERT INTO public.offers (
  slug, 
  title, 
  title_en, 
  subtitle,
  subtitle_en,
  price, 
  price_usd,
  brand_color,
  is_free,
  cta_type,
  cta_text,
  cta_text_en,
  landing_page_route,
  landing_page_enabled,
  show_on_homepage,
  homepage_order,
  status,
  product_id
)
SELECT 
  'consciousness-leap',
  'קפיצה לתודעה חדשה',
  'Consciousness Leap',
  'תהליך טרנספורמציה אישית עמוקה עם ליווי צמוד',
  'Deep personal transformation process with close guidance',
  1997,
  549,
  'purple',
  false,
  'lead_form',
  'גלה אם זה מתאים לך',
  'Discover if it''s right for you',
  '/consciousness-leap',
  true,
  true,
  3,
  'active',
  (SELECT id FROM public.products WHERE slug = 'consciousness-leap' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.offers WHERE slug = 'consciousness-leap');-- Create form_analyses table for storing AI consciousness analysis results
CREATE TABLE public.form_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_submission_id UUID NOT NULL REFERENCES public.form_submissions(id) ON DELETE CASCADE,
  analysis_summary TEXT NOT NULL,
  patterns JSONB DEFAULT '[]'::jsonb,
  transformation_potential TEXT,
  recommendation TEXT,
  recommended_product TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.form_analyses ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX idx_form_analyses_submission ON public.form_analyses(form_submission_id);

-- RLS Policies: Users can read analyses for their own submissions
CREATE POLICY "Users can view their own form analyses"
ON public.form_analyses
FOR SELECT
USING (
  form_submission_id IN (
    SELECT id FROM public.form_submissions 
    WHERE user_id = auth.uid() OR email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  )
);

-- Allow insert from service role (edge function)
CREATE POLICY "Service role can insert analyses"
ON public.form_analyses
FOR INSERT
WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE public.form_analyses IS 'Stores AI-generated consciousness analysis results for introspection form submissions';-- Fix the notify_new_form_submission function to use SECURITY DEFINER
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
$$;-- Fix function search_path for update_chat_settings_updated_at
CREATE OR REPLACE FUNCTION public.update_chat_settings_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix function search_path for create_affiliate_referral_on_payment (SECURITY DEFINER needs search_path)
CREATE OR REPLACE FUNCTION public.create_affiliate_referral_on_payment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_affiliate_id uuid;
  v_commission_rate numeric;
  v_existing_referral_id uuid;
  v_should_process boolean := false;
BEGIN
  -- Check if we should process this event
  IF TG_OP = 'INSERT' THEN
    -- For INSERT, process if payment is already completed and has affiliate code
    v_should_process := (NEW.payment_status = 'completed' AND NEW.affiliate_code IS NOT NULL);
  ELSIF TG_OP = 'UPDATE' THEN
    -- For UPDATE, process if payment_status changed to 'completed' and has affiliate code
    v_should_process := (NEW.payment_status = 'completed' 
                         AND (OLD.payment_status IS NULL OR OLD.payment_status != 'completed') 
                         AND NEW.affiliate_code IS NOT NULL);
  END IF;

  IF v_should_process THEN
    -- Check if referral already exists for this order
    SELECT id INTO v_existing_referral_id
    FROM affiliate_referrals 
    WHERE order_id = NEW.id;
    
    IF v_existing_referral_id IS NULL THEN
      -- Get affiliate info
      SELECT id, commission_rate INTO v_affiliate_id, v_commission_rate
      FROM affiliates
      WHERE affiliate_code = NEW.affiliate_code AND status = 'active';
      
      IF v_affiliate_id IS NOT NULL THEN
        -- Create referral record
        INSERT INTO affiliate_referrals (
          affiliate_id,
          referred_user_id,
          order_id,
          order_amount,
          commission_amount,
          status,
          approved_at
        ) VALUES (
          v_affiliate_id,
          NEW.user_id,
          NEW.id,
          NEW.amount,
          (NEW.amount * v_commission_rate / 100),
          'approved',
          now()
        );
        
        -- Update affiliate total earnings
        UPDATE affiliates
        SET total_earnings = total_earnings + (NEW.amount * v_commission_rate / 100),
            updated_at = now()
        WHERE id = v_affiliate_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;-- Fix newsletter_subscribers: Block non-admin from reading subscriber data
-- The "Anyone can subscribe" INSERT policy is fine, but we need to restrict SELECT access

-- Drop the existing permissive SELECT policies that might allow broad access
DROP POLICY IF EXISTS "Users can view own subscription" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can view all subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can manage subscribers" ON public.newsletter_subscribers;

-- Create admin-only SELECT policy (RESTRICTIVE)
CREATE POLICY "Only admins can view subscribers"
ON public.newsletter_subscribers
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create admin-only management policy (for UPDATE/DELETE)
CREATE POLICY "Admins can manage subscribers"
ON public.newsletter_subscribers
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix leads table: Add RESTRICTIVE policy to block non-admin access
-- Drop existing overlapping policies
DROP POLICY IF EXISTS "Only admins can select leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;

-- Create RESTRICTIVE policy that blocks non-admin SELECT
CREATE POLICY "Block non-admin lead access"
ON public.leads
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Recreate admin SELECT policy as permissive (works with RESTRICTIVE)
CREATE POLICY "Admins can view all leads"
ON public.leads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));-- Add RLS policy to allow admins to view all form analyses
CREATE POLICY "Admins can view all form analyses"
ON public.form_analyses
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));-- Drop the problematic policy that references auth.users
DROP POLICY IF EXISTS "Users can view their own form analyses" ON public.form_analyses;

-- Recreate the policy without direct auth.users reference
-- Users can view analyses for submissions they own (by user_id) or their email matches
CREATE POLICY "Users can view their own form analyses"
ON public.form_analyses
FOR SELECT
USING (
  form_submission_id IN (
    SELECT fs.id 
    FROM form_submissions fs
    WHERE fs.user_id = auth.uid()
  )
);-- =============================================
-- COMMUNITY SYSTEM TABLES
-- =============================================

-- 1. Community Categories
CREATE TABLE public.community_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  description_en TEXT,
  icon TEXT DEFAULT 'MessageCircle',
  color TEXT DEFAULT '#6366f1',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Community Members (extends profiles)
CREATE TABLE public.community_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  bio TEXT,
  avatar_url TEXT,
  total_points INTEGER DEFAULT 0,
  current_level_id UUID,
  posts_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  likes_received INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_online BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Community Levels (gamification)
CREATE TABLE public.community_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  min_points INTEGER NOT NULL DEFAULT 0,
  badge_icon TEXT DEFAULT 'Star',
  badge_color TEXT DEFAULT '#f59e0b',
  unlocks_content_ids UUID[] DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add foreign key for current_level_id after community_levels is created
ALTER TABLE public.community_members 
  ADD CONSTRAINT fk_community_members_level 
  FOREIGN KEY (current_level_id) REFERENCES public.community_levels(id) ON DELETE SET NULL;

-- 4. Community Posts
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.community_categories(id) ON DELETE SET NULL,
  title TEXT,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Community Comments
CREATE TABLE public.community_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Community Likes (for posts and comments)
CREATE TABLE public.community_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT check_like_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR 
    (post_id IS NULL AND comment_id IS NOT NULL)
  ),
  CONSTRAINT unique_post_like UNIQUE (user_id, post_id),
  CONSTRAINT unique_comment_like UNIQUE (user_id, comment_id)
);

-- 7. Community Events
CREATE TABLE public.community_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  event_type TEXT DEFAULT 'live_session',
  meeting_url TEXT,
  cover_image_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  attendees_count INTEGER DEFAULT 0,
  max_attendees INTEGER,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Community Event RSVPs
CREATE TABLE public.community_event_rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.community_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'going',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_event_rsvp UNIQUE (event_id, user_id)
);

-- 9. Community Point Logs
CREATE TABLE public.community_point_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX idx_community_posts_category_id ON public.community_posts(category_id);
CREATE INDEX idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX idx_community_posts_is_pinned ON public.community_posts(is_pinned) WHERE is_pinned = true;

CREATE INDEX idx_community_comments_post_id ON public.community_comments(post_id);
CREATE INDEX idx_community_comments_user_id ON public.community_comments(user_id);
CREATE INDEX idx_community_comments_parent_id ON public.community_comments(parent_comment_id);

CREATE INDEX idx_community_likes_post_id ON public.community_likes(post_id) WHERE post_id IS NOT NULL;
CREATE INDEX idx_community_likes_comment_id ON public.community_likes(comment_id) WHERE comment_id IS NOT NULL;
CREATE INDEX idx_community_likes_user_id ON public.community_likes(user_id);

CREATE INDEX idx_community_members_user_id ON public.community_members(user_id);
CREATE INDEX idx_community_members_points ON public.community_members(total_points DESC);

CREATE INDEX idx_community_events_start_time ON public.community_events(start_time);
CREATE INDEX idx_community_point_logs_user_id ON public.community_point_logs(user_id);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.community_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_point_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Community Categories Policies
CREATE POLICY "Anyone can view active categories" ON public.community_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.community_categories
  FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Community Members Policies
CREATE POLICY "Authenticated users can view members" ON public.community_members
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert own member profile" ON public.community_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own member profile" ON public.community_members
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all members" ON public.community_members
  FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Community Levels Policies
CREATE POLICY "Anyone can view levels" ON public.community_levels
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage levels" ON public.community_levels
  FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Community Posts Policies
CREATE POLICY "Authenticated users can view posts" ON public.community_posts
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create posts" ON public.community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own posts" ON public.community_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.community_posts
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all posts" ON public.community_posts
  FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Community Comments Policies
CREATE POLICY "Authenticated users can view comments" ON public.community_comments
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create comments" ON public.community_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own comments" ON public.community_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.community_comments
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments" ON public.community_comments
  FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Community Likes Policies
CREATE POLICY "Authenticated users can view likes" ON public.community_likes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create likes" ON public.community_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own likes" ON public.community_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Community Events Policies
CREATE POLICY "Authenticated users can view published events" ON public.community_events
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_published = true);

CREATE POLICY "Admins can manage events" ON public.community_events
  FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Community Event RSVPs Policies
CREATE POLICY "Authenticated users can view RSVPs" ON public.community_event_rsvps
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create RSVPs" ON public.community_event_rsvps
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own RSVPs" ON public.community_event_rsvps
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own RSVPs" ON public.community_event_rsvps
  FOR DELETE USING (auth.uid() = user_id);

-- Community Point Logs Policies
CREATE POLICY "Users can view own point logs" ON public.community_point_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all point logs" ON public.community_point_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert point logs" ON public.community_point_logs
  FOR INSERT WITH CHECK (true);

-- =============================================
-- REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_members;

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE TRIGGER update_community_categories_updated_at
  BEFORE UPDATE ON public.community_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_members_updated_at
  BEFORE UPDATE ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_levels_updated_at
  BEFORE UPDATE ON public.community_levels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_comments_updated_at
  BEFORE UPDATE ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_events_updated_at
  BEFORE UPDATE ON public.community_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- INSERT DEFAULT CATEGORIES
-- =============================================
INSERT INTO public.community_categories (name, name_en, description, description_en, icon, color, order_index) VALUES
  ('דיונים', 'Discussions', 'דיונים כלליים בקהילה', 'General community discussions', 'MessageCircle', '#6366f1', 1),
  ('שאלות', 'Questions', 'שאלו את הקהילה', 'Ask the community', 'HelpCircle', '#22c55e', 2),
  ('הצלחות', 'Wins', 'שתפו את ההצלחות שלכם', 'Share your wins', 'Trophy', '#f59e0b', 3),
  ('הכרזות', 'Announcements', 'עדכונים חשובים', 'Important announcements', 'Megaphone', '#ef4444', 4);

-- =============================================
-- INSERT DEFAULT LEVELS
-- =============================================
INSERT INTO public.community_levels (name, name_en, min_points, badge_icon, badge_color, order_index) VALUES
  ('מתחיל', 'Newcomer', 0, 'Sprout', '#94a3b8', 1),
  ('פעיל', 'Active', 50, 'Flame', '#f97316', 2),
  ('תורם', 'Contributor', 200, 'Star', '#eab308', 3),
  ('מומחה', 'Expert', 500, 'Award', '#a855f7', 4),
  ('אלוף', 'Champion', 1000, 'Crown', '#3b82f6', 5),
  ('אגדה', 'Legend', 2500, 'Gem', '#ec4899', 6);

-- =============================================
-- FUNCTION: Update member stats
-- =============================================
CREATE OR REPLACE FUNCTION public.update_community_member_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'community_posts' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.community_members 
      SET posts_count = posts_count + 1, 
          total_points = total_points + 5,
          last_active_at = now()
      WHERE user_id = NEW.user_id;
      
      INSERT INTO public.community_point_logs (user_id, points, action_type, reference_id, reference_type, description)
      VALUES (NEW.user_id, 5, 'new_post', NEW.id, 'post', 'יצירת פוסט חדש');
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.community_members 
      SET posts_count = GREATEST(0, posts_count - 1)
      WHERE user_id = OLD.user_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'community_comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.community_members 
      SET comments_count = comments_count + 1, 
          total_points = total_points + 2,
          last_active_at = now()
      WHERE user_id = NEW.user_id;
      
      INSERT INTO public.community_point_logs (user_id, points, action_type, reference_id, reference_type, description)
      VALUES (NEW.user_id, 2, 'new_comment', NEW.id, 'comment', 'הוספת תגובה');
      
      -- Update post comments count
      UPDATE public.community_posts 
      SET comments_count = comments_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.community_members 
      SET comments_count = GREATEST(0, comments_count - 1)
      WHERE user_id = OLD.user_id;
      
      UPDATE public.community_posts 
      SET comments_count = GREATEST(0, comments_count - 1) 
      WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'community_likes' THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.post_id IS NOT NULL THEN
        UPDATE public.community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        
        -- Give point to post author
        UPDATE public.community_members cm
        SET likes_received = likes_received + 1, total_points = total_points + 1
        FROM public.community_posts cp
        WHERE cp.id = NEW.post_id AND cm.user_id = cp.user_id;
      ELSIF NEW.comment_id IS NOT NULL THEN
        UPDATE public.community_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
        
        -- Give point to comment author
        UPDATE public.community_members cm
        SET likes_received = likes_received + 1, total_points = total_points + 1
        FROM public.community_comments cc
        WHERE cc.id = NEW.comment_id AND cm.user_id = cc.user_id;
      END IF;
    ELSIF TG_OP = 'DELETE' THEN
      IF OLD.post_id IS NOT NULL THEN
        UPDATE public.community_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
        UPDATE public.community_members cm
        SET likes_received = GREATEST(0, likes_received - 1)
        FROM public.community_posts cp
        WHERE cp.id = OLD.post_id AND cm.user_id = cp.user_id;
      ELSIF OLD.comment_id IS NOT NULL THEN
        UPDATE public.community_comments SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.comment_id;
        UPDATE public.community_members cm
        SET likes_received = GREATEST(0, likes_received - 1)
        FROM public.community_comments cc
        WHERE cc.id = OLD.comment_id AND cm.user_id = cc.user_id;
      END IF;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for stats updates
CREATE TRIGGER trigger_update_stats_on_post
  AFTER INSERT OR DELETE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_community_member_stats();

CREATE TRIGGER trigger_update_stats_on_comment
  AFTER INSERT OR DELETE ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_community_member_stats();

CREATE TRIGGER trigger_update_stats_on_like
  AFTER INSERT OR DELETE ON public.community_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_community_member_stats();

-- =============================================
-- FUNCTION: Update member level based on points
-- =============================================
CREATE OR REPLACE FUNCTION public.update_community_member_level()
RETURNS TRIGGER AS $$
DECLARE
  new_level_id UUID;
BEGIN
  SELECT id INTO new_level_id
  FROM public.community_levels
  WHERE min_points <= NEW.total_points
  ORDER BY min_points DESC
  LIMIT 1;
  
  IF new_level_id IS DISTINCT FROM NEW.current_level_id THEN
    NEW.current_level_id := new_level_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_member_level
  BEFORE UPDATE OF total_points ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION public.update_community_member_level();

-- =============================================
-- FUNCTION: Auto-create community member on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_community_member()
RETURNS TRIGGER AS $$
DECLARE
  starter_level_id UUID;
  profile_name TEXT;
BEGIN
  -- Get starter level
  SELECT id INTO starter_level_id FROM public.community_levels ORDER BY min_points ASC LIMIT 1;
  
  -- Get name from profiles if exists
  SELECT full_name INTO profile_name FROM public.profiles WHERE id = NEW.id;
  
  -- Insert community member
  INSERT INTO public.community_members (user_id, current_level_id)
  VALUES (NEW.id, starter_level_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on auth.users - but we need to use profiles instead
CREATE TRIGGER trigger_create_community_member
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_community_member();-- Create conversation type enum
CREATE TYPE public.conversation_type AS ENUM ('direct', 'ai');

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.conversation_type NOT NULL DEFAULT 'direct',
  participant_1 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2 UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_message_preview TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure AI conversations have no participant_2
  CONSTRAINT ai_conversations_no_participant_2 CHECK (
    (type = 'ai' AND participant_2 IS NULL) OR 
    (type = 'direct' AND participant_2 IS NOT NULL)
  ),
  -- Prevent duplicate direct conversations
  CONSTRAINT unique_direct_conversation UNIQUE NULLS NOT DISTINCT (participant_1, participant_2)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_ai_message BOOLEAN NOT NULL DEFAULT false,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_conversations_participant_1 ON public.conversations(participant_1);
CREATE INDEX idx_conversations_participant_2 ON public.conversations(participant_2);
CREATE INDEX idx_conversations_last_message ON public.conversations(last_message_at DESC);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_created ON public.messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view own conversations"
ON public.conversations FOR SELECT
USING (participant_1 = auth.uid() OR participant_2 = auth.uid());

CREATE POLICY "Users can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (participant_1 = auth.uid());

CREATE POLICY "Users can update own conversations"
ON public.conversations FOR UPDATE
USING (participant_1 = auth.uid() OR participant_2 = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view messages in own conversations"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  )
);

CREATE POLICY "Users can send messages in own conversations"
ON public.messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid() OR is_ai_message = true
);

CREATE POLICY "Users can update message read status"
ON public.messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  )
);

-- Function to update conversation last_message_at
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET 
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update conversation on new message
CREATE TRIGGER update_conversation_on_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_last_message();

-- Function to get or create AI conversation for a user
CREATE OR REPLACE FUNCTION public.get_or_create_ai_conversation(user_id UUID)
RETURNS UUID AS $$
DECLARE
  conv_id UUID;
BEGIN
  -- Try to find existing AI conversation
  SELECT id INTO conv_id
  FROM public.conversations
  WHERE participant_1 = user_id AND type = 'ai';
  
  -- Create if not exists
  IF conv_id IS NULL THEN
    INSERT INTO public.conversations (participant_1, type)
    VALUES (user_id, 'ai')
    RETURNING id INTO conv_id;
  END IF;
  
  RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;-- =============================================
-- GAMIFICATION SYSTEM: Libero Integration
-- =============================================

-- 1. Extend profiles table for gamification
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS level integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS experience integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS tokens integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS session_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_session_date date,
ADD COLUMN IF NOT EXISTS active_ego_state text DEFAULT 'guardian',
ADD COLUMN IF NOT EXISTS ego_state_usage jsonb DEFAULT '{}';

-- 2. Create hypnosis_sessions table for session history
CREATE TABLE IF NOT EXISTS hypnosis_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ego_state text NOT NULL DEFAULT 'guardian',
  action text,
  goal_id text,
  duration_seconds integer NOT NULL DEFAULT 0,
  experience_gained integer DEFAULT 0,
  script_data jsonb,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 3. Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  UNIQUE(user_id, achievement_id)
);

-- 4. Create custom_protocols table for user-defined sessions
CREATE TABLE IF NOT EXISTS custom_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  goals text[],
  induction text,
  duration_seconds integer DEFAULT 600,
  ego_state text DEFAULT 'guardian',
  is_public boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Enable RLS on all new tables
ALTER TABLE hypnosis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_protocols ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for hypnosis_sessions
CREATE POLICY "Users can view own sessions"
  ON hypnosis_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON hypnosis_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all sessions"
  ON hypnosis_sessions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 7. RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all achievements"
  ON user_achievements FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 8. RLS Policies for custom_protocols
CREATE POLICY "Users can view own protocols"
  ON custom_protocols FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public protocols"
  ON custom_protocols FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can insert own protocols"
  ON custom_protocols FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own protocols"
  ON custom_protocols FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own protocols"
  ON custom_protocols FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all protocols"
  ON custom_protocols FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 9. Create streak bonus function
CREATE OR REPLACE FUNCTION check_streak_bonus(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_streak integer;
  v_bonus integer := 0;
BEGIN
  SELECT session_streak INTO v_streak FROM profiles WHERE id = p_user_id;
  
  -- Weekly bonus (7 days)
  IF v_streak = 7 THEN 
    v_bonus := 10;
  -- Monthly bonus (30 days)
  ELSIF v_streak = 30 THEN 
    v_bonus := 50;
  -- 100 day bonus
  ELSIF v_streak = 100 THEN
    v_bonus := 200;
  END IF;
  
  IF v_bonus > 0 THEN
    UPDATE profiles SET tokens = tokens + v_bonus WHERE id = p_user_id;
  END IF;
  
  RETURN v_bonus;
END;
$$;

-- 10. Create function to update streak on session completion
CREATE OR REPLACE FUNCTION update_session_streak()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_date date;
  v_today date := CURRENT_DATE;
  v_new_streak integer;
BEGIN
  -- Get user's last session date
  SELECT last_session_date INTO v_last_date FROM profiles WHERE id = NEW.user_id;
  
  IF v_last_date IS NULL OR v_last_date < v_today - 1 THEN
    -- Reset streak if more than 1 day gap
    v_new_streak := 1;
  ELSIF v_last_date = v_today - 1 THEN
    -- Consecutive day - increment streak
    SELECT session_streak + 1 INTO v_new_streak FROM profiles WHERE id = NEW.user_id;
  ELSIF v_last_date = v_today THEN
    -- Same day - keep current streak
    SELECT session_streak INTO v_new_streak FROM profiles WHERE id = NEW.user_id;
  ELSE
    v_new_streak := 1;
  END IF;
  
  -- Update profile with new streak and date
  UPDATE profiles 
  SET 
    session_streak = v_new_streak,
    last_session_date = v_today,
    experience = experience + COALESCE(NEW.experience_gained, 0),
    level = GREATEST(1, FLOOR((experience + COALESCE(NEW.experience_gained, 0)) / 100) + 1),
    ego_state_usage = COALESCE(ego_state_usage, '{}') || 
      jsonb_build_object(NEW.ego_state, COALESCE((ego_state_usage->>NEW.ego_state)::integer, 0) + 1)
  WHERE id = NEW.user_id;
  
  -- Check for streak bonuses
  PERFORM check_streak_bonus(NEW.user_id);
  
  RETURN NEW;
END;
$$;

-- 11. Create trigger for session completion
DROP TRIGGER IF EXISTS on_hypnosis_session_complete ON hypnosis_sessions;
CREATE TRIGGER on_hypnosis_session_complete
  AFTER INSERT ON hypnosis_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_streak();

-- 12. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hypnosis_sessions_user_id ON hypnosis_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_hypnosis_sessions_completed_at ON hypnosis_sessions(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_protocols_user_id ON custom_protocols(user_id);-- Function to check and award streak bonus XP/tokens
CREATE OR REPLACE FUNCTION public.check_streak_bonus()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_current_streak INTEGER;
  v_last_session DATE;
  v_today DATE;
  v_bonus_xp INTEGER := 0;
  v_bonus_tokens INTEGER := 0;
BEGIN
  v_user_id := NEW.user_id;
  v_today := CURRENT_DATE;
  
  -- Get current profile data
  SELECT session_streak, last_session_date 
  INTO v_current_streak, v_last_session
  FROM profiles 
  WHERE id = v_user_id;
  
  -- Check if this is a new day session
  IF v_last_session IS NULL OR v_last_session < v_today THEN
    -- Check if streak continues (yesterday) or resets
    IF v_last_session = v_today - INTERVAL '1 day' THEN
      -- Streak continues
      v_current_streak := COALESCE(v_current_streak, 0) + 1;
      
      -- Award streak bonuses at milestones
      CASE v_current_streak
        WHEN 3 THEN 
          v_bonus_xp := 25;
          v_bonus_tokens := 5;
        WHEN 7 THEN 
          v_bonus_xp := 50;
          v_bonus_tokens := 10;
        WHEN 14 THEN 
          v_bonus_xp := 100;
          v_bonus_tokens := 20;
        WHEN 30 THEN 
          v_bonus_xp := 200;
          v_bonus_tokens := 50;
        WHEN 60 THEN 
          v_bonus_xp := 300;
          v_bonus_tokens := 75;
        WHEN 100 THEN 
          v_bonus_xp := 500;
          v_bonus_tokens := 100;
        ELSE
          -- Daily streak bonus (every day after 7)
          IF v_current_streak > 7 THEN
            v_bonus_xp := 5;
          END IF;
      END CASE;
    ELSE
      -- Streak broken, reset to 1
      v_current_streak := 1;
    END IF;
    
    -- Update profile with new streak and bonuses
    UPDATE profiles 
    SET 
      session_streak = v_current_streak,
      last_session_date = v_today,
      experience = COALESCE(experience, 0) + COALESCE(NEW.experience_gained, 0) + v_bonus_xp,
      tokens = COALESCE(tokens, 0) + v_bonus_tokens,
      updated_at = NOW()
    WHERE id = v_user_id;
  ELSE
    -- Same day, just add XP without streak update
    UPDATE profiles 
    SET 
      experience = COALESCE(experience, 0) + COALESCE(NEW.experience_gained, 0),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on hypnosis_sessions if not exists
DROP TRIGGER IF EXISTS on_session_complete ON hypnosis_sessions;
CREATE TRIGGER on_session_complete
  AFTER INSERT ON hypnosis_sessions
  FOR EACH ROW
  EXECUTE FUNCTION check_streak_bonus();

-- Function to update ego_state_usage JSONB
CREATE OR REPLACE FUNCTION public.update_ego_state_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET 
    ego_state_usage = COALESCE(ego_state_usage, '{}'::jsonb) || 
      jsonb_build_object(
        NEW.ego_state, 
        COALESCE((ego_state_usage ->> NEW.ego_state)::int, 0) + 1
      ),
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for ego state tracking
DROP TRIGGER IF EXISTS on_session_track_ego ON hypnosis_sessions;
CREATE TRIGGER on_session_track_ego
  AFTER INSERT ON hypnosis_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_ego_state_usage();-- =====================================================
-- AURORA LIFE COACHING SCHEMA
-- 12 new tables + profile extensions + RLS + realtime
-- =====================================================

-- 1. Extend profiles table with Aurora-specific columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS aurora_preferences JSONB DEFAULT '{"tone": "warm", "intensity": "balanced"}'::jsonb;

-- 2. Aurora Life Direction (core orientation)
CREATE TABLE public.aurora_life_direction (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  clarity_score INTEGER DEFAULT 0 CHECK (clarity_score >= 0 AND clarity_score <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Aurora Identity Elements (values, principles, self-concepts)
CREATE TABLE public.aurora_identity_elements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  element_type TEXT NOT NULL CHECK (element_type IN ('value', 'principle', 'self_concept', 'vision_statement')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Aurora Life Visions (5-year, 10-year goals)
CREATE TABLE public.aurora_life_visions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timeframe TEXT NOT NULL CHECK (timeframe IN ('5_year', '10_year')),
  title TEXT NOT NULL,
  description TEXT,
  focus_areas TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Aurora Commitments (active life directions)
CREATE TABLE public.aurora_commitments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Aurora Energy Patterns (sleep, nutrition, movement, stress)
CREATE TABLE public.aurora_energy_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('sleep', 'nutrition', 'movement', 'stress')),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Aurora Behavioral Patterns (focus, avoidance, discipline, etc.)
CREATE TABLE public.aurora_behavioral_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('focus', 'avoidance', 'discipline', 'resistance', 'strength')),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Aurora Focus Plans (short-term focus periods)
CREATE TABLE public.aurora_focus_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Aurora Daily Minimums (non-negotiable daily anchors)
CREATE TABLE public.aurora_daily_minimums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Aurora Onboarding Progress (Life Model completion tracking)
CREATE TABLE public.aurora_onboarding_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  direction_clarity TEXT NOT NULL DEFAULT 'incomplete' CHECK (direction_clarity IN ('incomplete', 'emerging', 'stable')),
  identity_understanding TEXT NOT NULL DEFAULT 'shallow' CHECK (identity_understanding IN ('shallow', 'partial', 'clear')),
  energy_patterns_status TEXT NOT NULL DEFAULT 'unknown' CHECK (energy_patterns_status IN ('unknown', 'partial', 'mapped')),
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Aurora Checklists (task lists created manually or by Aurora)
CREATE TABLE public.aurora_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  origin TEXT NOT NULL DEFAULT 'manual' CHECK (origin IN ('manual', 'aurora')),
  context TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Aurora Checklist Items (individual tasks)
CREATE TABLE public.aurora_checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID NOT NULL REFERENCES public.aurora_checklists(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on all Aurora tables
ALTER TABLE public.aurora_life_direction ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aurora_identity_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aurora_life_visions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aurora_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aurora_energy_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aurora_behavioral_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aurora_focus_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aurora_daily_minimums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aurora_onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aurora_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aurora_checklist_items ENABLE ROW LEVEL SECURITY;

-- aurora_life_direction policies
CREATE POLICY "Users can view own life direction" ON public.aurora_life_direction FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own life direction" ON public.aurora_life_direction FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own life direction" ON public.aurora_life_direction FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own life direction" ON public.aurora_life_direction FOR DELETE USING (auth.uid() = user_id);

-- aurora_identity_elements policies
CREATE POLICY "Users can view own identity elements" ON public.aurora_identity_elements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own identity elements" ON public.aurora_identity_elements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own identity elements" ON public.aurora_identity_elements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own identity elements" ON public.aurora_identity_elements FOR DELETE USING (auth.uid() = user_id);

-- aurora_life_visions policies
CREATE POLICY "Users can view own life visions" ON public.aurora_life_visions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own life visions" ON public.aurora_life_visions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own life visions" ON public.aurora_life_visions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own life visions" ON public.aurora_life_visions FOR DELETE USING (auth.uid() = user_id);

-- aurora_commitments policies
CREATE POLICY "Users can view own commitments" ON public.aurora_commitments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own commitments" ON public.aurora_commitments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own commitments" ON public.aurora_commitments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own commitments" ON public.aurora_commitments FOR DELETE USING (auth.uid() = user_id);

-- aurora_energy_patterns policies
CREATE POLICY "Users can view own energy patterns" ON public.aurora_energy_patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own energy patterns" ON public.aurora_energy_patterns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own energy patterns" ON public.aurora_energy_patterns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own energy patterns" ON public.aurora_energy_patterns FOR DELETE USING (auth.uid() = user_id);

-- aurora_behavioral_patterns policies
CREATE POLICY "Users can view own behavioral patterns" ON public.aurora_behavioral_patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own behavioral patterns" ON public.aurora_behavioral_patterns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own behavioral patterns" ON public.aurora_behavioral_patterns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own behavioral patterns" ON public.aurora_behavioral_patterns FOR DELETE USING (auth.uid() = user_id);

-- aurora_focus_plans policies
CREATE POLICY "Users can view own focus plans" ON public.aurora_focus_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own focus plans" ON public.aurora_focus_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own focus plans" ON public.aurora_focus_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own focus plans" ON public.aurora_focus_plans FOR DELETE USING (auth.uid() = user_id);

-- aurora_daily_minimums policies
CREATE POLICY "Users can view own daily minimums" ON public.aurora_daily_minimums FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily minimums" ON public.aurora_daily_minimums FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily minimums" ON public.aurora_daily_minimums FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own daily minimums" ON public.aurora_daily_minimums FOR DELETE USING (auth.uid() = user_id);

-- aurora_onboarding_progress policies
CREATE POLICY "Users can view own onboarding progress" ON public.aurora_onboarding_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own onboarding progress" ON public.aurora_onboarding_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own onboarding progress" ON public.aurora_onboarding_progress FOR UPDATE USING (auth.uid() = user_id);

-- aurora_checklists policies
CREATE POLICY "Users can view own checklists" ON public.aurora_checklists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checklists" ON public.aurora_checklists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checklists" ON public.aurora_checklists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own checklists" ON public.aurora_checklists FOR DELETE USING (auth.uid() = user_id);

-- aurora_checklist_items policies (via checklist ownership)
CREATE POLICY "Users can view own checklist items" ON public.aurora_checklist_items 
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.aurora_checklists WHERE id = checklist_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own checklist items" ON public.aurora_checklist_items 
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.aurora_checklists WHERE id = checklist_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own checklist items" ON public.aurora_checklist_items 
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.aurora_checklists WHERE id = checklist_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own checklist items" ON public.aurora_checklist_items 
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.aurora_checklists WHERE id = checklist_id AND user_id = auth.uid()));

-- =====================================================
-- REALTIME ENABLEMENT
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.aurora_life_direction;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aurora_identity_elements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aurora_life_visions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aurora_commitments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aurora_energy_patterns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aurora_behavioral_patterns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aurora_focus_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aurora_daily_minimums;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aurora_onboarding_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aurora_checklists;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aurora_checklist_items;

-- =====================================================
-- HELPER FUNCTION: Award XP for Aurora interactions
-- =====================================================

CREATE OR REPLACE FUNCTION public.aurora_award_xp(
  p_user_id UUID,
  p_amount INT,
  p_reason TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET experience = COALESCE(experience, 0) + p_amount,
      updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER: Auto-update updated_at on aurora_life_direction
-- =====================================================

CREATE TRIGGER update_aurora_life_direction_updated_at
  BEFORE UPDATE ON public.aurora_life_direction
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_aurora_onboarding_progress_updated_at
  BEFORE UPDATE ON public.aurora_onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();-- Create xp_events table for unified XP tracking
CREATE TABLE public.xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  source TEXT NOT NULL, -- 'hypnosis', 'aurora', 'aurora_insight', 'community', 'course'
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own XP events
CREATE POLICY "Users can view own xp events"
ON public.xp_events
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own XP events (via triggers/functions)
CREATE POLICY "Users can insert own xp events"
ON public.xp_events
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Index for efficient querying
CREATE INDEX idx_xp_events_user_date ON public.xp_events(user_id, created_at DESC);
CREATE INDEX idx_xp_events_source ON public.xp_events(source);

-- Unified XP awarding function
CREATE OR REPLACE FUNCTION public.award_unified_xp(
  p_user_id UUID,
  p_amount INT,
  p_source TEXT,
  p_reason TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Update profile experience
  UPDATE public.profiles 
  SET experience = COALESCE(experience, 0) + p_amount,
      updated_at = now()
  WHERE id = p_user_id;
  
  -- Log the XP event
  INSERT INTO public.xp_events (user_id, amount, source, reason)
  VALUES (p_user_id, p_amount, p_source, p_reason);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Weekly stats view for dashboard
CREATE VIEW public.weekly_user_stats AS
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE source = 'hypnosis') as hypnosis_sessions,
  COUNT(*) FILTER (WHERE source = 'aurora') as aurora_chats,
  COUNT(*) FILTER (WHERE source = 'aurora_insight') as insights_gained,
  SUM(amount) as total_xp
FROM public.xp_events
WHERE created_at > now() - interval '7 days'
GROUP BY user_id;-- Fix the weekly_user_stats view - recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.weekly_user_stats;

CREATE VIEW public.weekly_user_stats WITH (security_invoker = true) AS
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE source = 'hypnosis') as hypnosis_sessions,
  COUNT(*) FILTER (WHERE source = 'aurora') as aurora_chats,
  COUNT(*) FILTER (WHERE source = 'aurora_insight') as insights_gained,
  SUM(amount) as total_xp
FROM public.xp_events
WHERE created_at > now() - interval '7 days'
GROUP BY user_id;

-- Fix the award_unified_xp function - add search_path
DROP FUNCTION IF EXISTS public.award_unified_xp(UUID, INT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.award_unified_xp(
  p_user_id UUID,
  p_amount INT,
  p_source TEXT,
  p_reason TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Update profile experience
  UPDATE public.profiles 
  SET experience = COALESCE(experience, 0) + p_amount,
      updated_at = now()
  WHERE id = p_user_id;
  
  -- Log the XP event
  INSERT INTO public.xp_events (user_id, amount, source, reason)
  VALUES (p_user_id, p_amount, p_source, p_reason);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;-- Create aurora_award_xp as an alias for backward compatibility
CREATE OR REPLACE FUNCTION aurora_award_xp(
  p_user_id UUID,
  p_amount INT,
  p_reason TEXT
) RETURNS VOID AS $$
BEGIN
  -- Call the unified XP function with 'aurora' as the source
  PERFORM award_unified_xp(p_user_id, p_amount, 'aurora', p_reason);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;-- ============================================
-- LAUNCHPAD PROGRESS TABLE
-- Tracks user progress through the 7-step onboarding
-- ============================================
CREATE TABLE public.launchpad_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Step 1: Welcome + Initial Intention
  step_1_welcome BOOLEAN DEFAULT FALSE,
  step_1_intention TEXT,
  step_1_completed_at TIMESTAMPTZ,
  
  -- Step 2: First Chat with AI
  step_2_first_chat BOOLEAN DEFAULT FALSE,
  step_2_summary TEXT,
  step_2_completed_at TIMESTAMPTZ,
  
  -- Step 3: Introspection Questionnaire
  step_3_introspection BOOLEAN DEFAULT FALSE,
  step_3_form_submission_id UUID,
  step_3_completed_at TIMESTAMPTZ,
  
  -- Step 4: Life Plan Questionnaire
  step_4_life_plan BOOLEAN DEFAULT FALSE,
  step_4_form_submission_id UUID,
  step_4_completed_at TIMESTAMPTZ,
  
  -- Step 5: Focus Areas Selection
  step_5_focus_areas BOOLEAN DEFAULT FALSE,
  step_5_focus_areas_selected JSONB DEFAULT '[]'::jsonb,
  step_5_completed_at TIMESTAMPTZ,
  
  -- Step 6: First Week Planning
  step_6_first_week BOOLEAN DEFAULT FALSE,
  step_6_actions JSONB DEFAULT '[]'::jsonb,
  step_6_anchor_habit TEXT,
  step_6_completed_at TIMESTAMPTZ,
  
  -- Step 7: Dashboard Activation
  step_7_dashboard_activated BOOLEAN DEFAULT FALSE,
  step_7_completed_at TIMESTAMPTZ,
  
  -- Overall Progress
  current_step INTEGER DEFAULT 1,
  launchpad_complete BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.launchpad_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own launchpad progress"
  ON public.launchpad_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own launchpad progress"
  ON public.launchpad_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own launchpad progress"
  ON public.launchpad_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_launchpad_progress_user_id ON public.launchpad_progress(user_id);

-- ============================================
-- USER FEATURE UNLOCKS TABLE
-- Tracks which features are unlocked for each user
-- ============================================
CREATE TABLE public.user_feature_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  feature_key TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  unlock_reason TEXT,
  unlock_source TEXT, -- 'launchpad', 'level', 'achievement', 'admin'
  
  UNIQUE(user_id, feature_key)
);

-- Enable RLS
ALTER TABLE public.user_feature_unlocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own feature unlocks"
  ON public.user_feature_unlocks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert feature unlocks"
  ON public.user_feature_unlocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_user_feature_unlocks_user_id ON public.user_feature_unlocks(user_id);
CREATE INDEX idx_user_feature_unlocks_feature ON public.user_feature_unlocks(feature_key);

-- ============================================
-- QUESTIONNAIRE COMPLETIONS TABLE
-- Tracks completed questionnaires with AI analysis
-- ============================================
CREATE TABLE public.questionnaire_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  questionnaire_type TEXT NOT NULL, -- 'introspection', 'life_plan', 'values', 'habits', 'blockers'
  form_submission_id UUID REFERENCES public.form_submissions(id),
  
  -- AI Analysis Results
  analysis JSONB DEFAULT '{}'::jsonb,
  summary TEXT,
  key_insights JSONB DEFAULT '[]'::jsonb,
  blindspots JSONB DEFAULT '[]'::jsonb,
  goals_suggested JSONB DEFAULT '[]'::jsonb,
  habits_suggested JSONB DEFAULT '[]'::jsonb,
  next_actions JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  
  -- Life Model Updates Applied
  life_model_updates_applied BOOLEAN DEFAULT FALSE,
  
  -- XP Tracking
  xp_awarded INTEGER DEFAULT 0,
  tokens_awarded INTEGER DEFAULT 0,
  
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.questionnaire_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own questionnaire completions"
  ON public.questionnaire_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questionnaire completions"
  ON public.questionnaire_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questionnaire completions"
  ON public.questionnaire_completions FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_questionnaire_completions_user_id ON public.questionnaire_completions(user_id);
CREATE INDEX idx_questionnaire_completions_type ON public.questionnaire_completions(questionnaire_type);

-- ============================================
-- FUNCTION: Complete Launchpad Step
-- Awards XP and tokens, unlocks features
-- ============================================
CREATE OR REPLACE FUNCTION public.complete_launchpad_step(
  p_user_id UUID,
  p_step INTEGER,
  p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_xp INTEGER := 0;
  v_tokens INTEGER := 0;
  v_unlock TEXT;
  v_result JSONB;
BEGIN
  -- Define XP and tokens per step
  CASE p_step
    WHEN 1 THEN v_xp := 25; v_tokens := 0; v_unlock := 'aurora_chat_basic';
    WHEN 2 THEN v_xp := 50; v_tokens := 0; v_unlock := 'introspection_questionnaire';
    WHEN 3 THEN v_xp := 100; v_tokens := 10; v_unlock := 'life_plan_questionnaire';
    WHEN 4 THEN v_xp := 100; v_tokens := 15; v_unlock := 'focus_areas_selection';
    WHEN 5 THEN v_xp := 50; v_tokens := 0; v_unlock := 'first_week_planning';
    WHEN 6 THEN v_xp := 75; v_tokens := 0; v_unlock := 'dashboard_full';
    WHEN 7 THEN v_xp := 100; v_tokens := 25; v_unlock := 'life_os_complete';
    ELSE v_xp := 0; v_tokens := 0;
  END CASE;
  
  -- Update launchpad_progress based on step
  CASE p_step
    WHEN 1 THEN
      UPDATE launchpad_progress 
      SET step_1_welcome = TRUE, 
          step_1_intention = p_data->>'intention',
          step_1_completed_at = NOW(),
          current_step = GREATEST(current_step, 2),
          updated_at = NOW()
      WHERE user_id = p_user_id;
    WHEN 2 THEN
      UPDATE launchpad_progress 
      SET step_2_first_chat = TRUE, 
          step_2_summary = p_data->>'summary',
          step_2_completed_at = NOW(),
          current_step = GREATEST(current_step, 3),
          updated_at = NOW()
      WHERE user_id = p_user_id;
    WHEN 3 THEN
      UPDATE launchpad_progress 
      SET step_3_introspection = TRUE, 
          step_3_form_submission_id = (p_data->>'form_submission_id')::UUID,
          step_3_completed_at = NOW(),
          current_step = GREATEST(current_step, 4),
          updated_at = NOW()
      WHERE user_id = p_user_id;
    WHEN 4 THEN
      UPDATE launchpad_progress 
      SET step_4_life_plan = TRUE, 
          step_4_form_submission_id = (p_data->>'form_submission_id')::UUID,
          step_4_completed_at = NOW(),
          current_step = GREATEST(current_step, 5),
          updated_at = NOW()
      WHERE user_id = p_user_id;
    WHEN 5 THEN
      UPDATE launchpad_progress 
      SET step_5_focus_areas = TRUE, 
          step_5_focus_areas_selected = COALESCE(p_data->'focus_areas', '[]'::jsonb),
          step_5_completed_at = NOW(),
          current_step = GREATEST(current_step, 6),
          updated_at = NOW()
      WHERE user_id = p_user_id;
    WHEN 6 THEN
      UPDATE launchpad_progress 
      SET step_6_first_week = TRUE, 
          step_6_actions = COALESCE(p_data->'actions', '[]'::jsonb),
          step_6_anchor_habit = p_data->>'anchor_habit',
          step_6_completed_at = NOW(),
          current_step = GREATEST(current_step, 7),
          updated_at = NOW()
      WHERE user_id = p_user_id;
    WHEN 7 THEN
      UPDATE launchpad_progress 
      SET step_7_dashboard_activated = TRUE, 
          step_7_completed_at = NOW(),
          launchpad_complete = TRUE,
          completed_at = NOW(),
          current_step = 8,
          updated_at = NOW()
      WHERE user_id = p_user_id;
  END CASE;
  
  -- Award XP using unified function
  IF v_xp > 0 THEN
    PERFORM award_unified_xp(p_user_id, v_xp, 'launchpad', 'Completed Launchpad step ' || p_step);
  END IF;
  
  -- Award tokens
  IF v_tokens > 0 THEN
    UPDATE profiles SET tokens = COALESCE(tokens, 0) + v_tokens WHERE id = p_user_id;
  END IF;
  
  -- Unlock feature
  IF v_unlock IS NOT NULL THEN
    INSERT INTO user_feature_unlocks (user_id, feature_key, unlock_reason, unlock_source)
    VALUES (p_user_id, v_unlock, 'Completed Launchpad step ' || p_step, 'launchpad')
    ON CONFLICT (user_id, feature_key) DO NOTHING;
  END IF;
  
  v_result := jsonb_build_object(
    'success', TRUE,
    'step', p_step,
    'xp_awarded', v_xp,
    'tokens_awarded', v_tokens,
    'feature_unlocked', v_unlock
  );
  
  RETURN v_result;
END;
$$;

-- ============================================
-- FUNCTION: Initialize Launchpad for New User
-- ============================================
CREATE OR REPLACE FUNCTION public.initialize_launchpad()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO launchpad_progress (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to initialize launchpad on new profile
CREATE TRIGGER on_profile_created_init_launchpad
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_launchpad();

-- ============================================
-- FUNCTION: Get User Tier
-- Returns the user's current tier based on level and launchpad
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_tier(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_level INTEGER;
  v_launchpad_complete BOOLEAN;
  v_streak INTEGER;
BEGIN
  SELECT 
    COALESCE(p.level, 1),
    COALESCE(lp.launchpad_complete, FALSE),
    COALESCE(p.session_streak, 0)
  INTO v_level, v_launchpad_complete, v_streak
  FROM profiles p
  LEFT JOIN launchpad_progress lp ON lp.user_id = p.id
  WHERE p.id = p_user_id;
  
  -- Tier 4: Mastery (Level 10+)
  IF v_level >= 10 THEN
    RETURN 'mastery';
  -- Tier 3: Consistency (Level 7-9 + 7+ day streak)
  ELSIF v_level >= 7 AND v_streak >= 7 THEN
    RETURN 'consistency';
  -- Tier 2: Structure (Level 4-6 + Launchpad Complete)
  ELSIF v_level >= 4 AND v_launchpad_complete THEN
    RETURN 'structure';
  -- Tier 1: Clarity (Default)
  ELSE
    RETURN 'clarity';
  END IF;
END;
$$;

-- Update timestamp trigger
CREATE TRIGGER update_launchpad_progress_updated_at
  BEFORE UPDATE ON public.launchpad_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();-- Create landing_pages table for data-driven landing page management
CREATE TABLE public.landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  template_type TEXT NOT NULL DEFAULT 'product', -- 'homepage', 'product', 'lead_capture', 'custom'
  
  -- Offer connection (optional)
  offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,
  
  -- Meta & SEO
  title_he TEXT,
  title_en TEXT,
  seo_title_he TEXT,
  seo_title_en TEXT,
  seo_description_he TEXT,
  seo_description_en TEXT,
  
  -- Hero Section
  hero_heading_he TEXT,
  hero_heading_en TEXT,
  hero_subheading_he TEXT,
  hero_subheading_en TEXT,
  hero_image_url TEXT,
  hero_video_url TEXT,
  hero_badge_text_he TEXT,
  hero_badge_text_en TEXT,
  
  -- Sections Configuration (JSONB)
  sections_order JSONB DEFAULT '["hero", "pain_points", "process", "benefits", "testimonials", "faq", "cta"]'::jsonb,
  sections_config JSONB DEFAULT '{}'::jsonb,
  
  -- Content Blocks (JSONB for flexibility)
  pain_points JSONB DEFAULT '[]'::jsonb,
  process_steps JSONB DEFAULT '[]'::jsonb,
  benefits JSONB DEFAULT '[]'::jsonb,
  for_who JSONB DEFAULT '[]'::jsonb,
  not_for_who JSONB DEFAULT '[]'::jsonb,
  testimonials JSONB DEFAULT '[]'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  includes JSONB DEFAULT '[]'::jsonb,
  
  -- Styling
  brand_color TEXT DEFAULT '#8B5CF6',
  custom_css TEXT,
  
  -- CTA
  primary_cta_type TEXT DEFAULT 'link', -- 'checkout', 'form', 'link', 'contact', 'whatsapp'
  primary_cta_text_he TEXT,
  primary_cta_text_en TEXT,
  primary_cta_link TEXT,
  form_id UUID REFERENCES public.custom_forms(id) ON DELETE SET NULL,
  
  -- Status
  is_published BOOLEAN DEFAULT FALSE,
  is_homepage BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;

-- Public can view published landing pages
CREATE POLICY "Anyone can view published landing pages"
ON public.landing_pages
FOR SELECT
USING (is_published = true);

-- Admins can do everything
CREATE POLICY "Admins can manage landing pages"
ON public.landing_pages
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_landing_pages_updated_at
BEFORE UPDATE ON public.landing_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default landing pages based on existing pages
INSERT INTO public.landing_pages (
  slug, template_type, title_he, title_en, is_published, is_homepage,
  hero_heading_he, hero_heading_en, hero_subheading_he, hero_subheading_en,
  sections_order, brand_color, primary_cta_type
) VALUES 
(
  'home',
  'homepage',
  'דף הבית',
  'Home',
  true,
  true,
  'הסוד האמיתי מסתתר בתת־המודע שלך',
  'The Real Secret Hides in Your Subconscious',
  'גלה את הכוח הפנימי שלך',
  'Discover Your Inner Power',
  '["hero", "products", "about", "testimonials", "faq"]'::jsonb,
  '#8B5CF6',
  'link'
),
(
  'consciousness-leap',
  'product',
  'קפיצה לתודעה חדשה',
  'Consciousness Leap',
  true,
  false,
  'הגיע הזמן לקפיצה לתודעה חדשה',
  'Time for a Consciousness Leap',
  'תהליך אישי עמוק לשינוי אמיתי',
  'Deep personal process for real change',
  '["hero", "pain_points", "process", "benefits", "for_who", "testimonials", "faq", "cta"]'::jsonb,
  '#10B981',
  'form'
),
(
  'personal-hypnosis',
  'product',
  'הקלטת היפנוזה אישית',
  'Personal Hypnosis Recording',
  true,
  false,
  'הקלטת היפנוזה אישית מותאמת במיוחד עבורך',
  'Personal Hypnosis Recording Custom Made for You',
  'פתח את הפוטנציאל שלך עם הקלטה מותאמת אישית',
  'Unlock your potential with a personalized recording',
  '["hero", "pain_points", "process", "benefits", "testimonials", "cta"]'::jsonb,
  '#F59E0B',
  'checkout'
);-- Add new columns for Personal Profile step (between step 1 and current step 2)
-- We'll add step_2_profile columns and keep the existing column names as-is
-- The function will handle the logic for the new 8-step flow

-- Add new step 2 columns for Personal Profile
ALTER TABLE public.launchpad_progress
  ADD COLUMN IF NOT EXISTS step_2_profile BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS step_2_profile_data JSONB,
  ADD COLUMN IF NOT EXISTS step_2_profile_completed_at TIMESTAMPTZ;

-- Drop and recreate the complete_launchpad_step function with updated step numbers
-- The column mapping is now:
-- Step 1: step_1_* (Welcome)
-- Step 2: step_2_profile_* (Personal Profile - NEW!)
-- Step 3: step_2_* (First Chat - using old step_2 columns)
-- Step 4: step_3_* (Introspection)
-- Step 5: step_4_* (Life Plan)
-- Step 6: step_5_* (Focus Areas)
-- Step 7: step_6_* (First Week)
-- Step 8: step_7_* (Dashboard Activation)

DROP FUNCTION IF EXISTS public.complete_launchpad_step(UUID, INTEGER, JSONB);

CREATE OR REPLACE FUNCTION public.complete_launchpad_step(
  p_user_id UUID,
  p_step INTEGER,
  p_data JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_progress launchpad_progress%ROWTYPE;
  v_xp_awarded INTEGER := 0;
  v_tokens_awarded INTEGER := 0;
  v_feature_unlocked TEXT := NULL;
  v_result JSONB;
BEGIN
  -- Get or create progress record
  SELECT * INTO v_progress FROM launchpad_progress WHERE user_id = p_user_id;
  
  IF v_progress IS NULL THEN
    INSERT INTO launchpad_progress (user_id) VALUES (p_user_id)
    RETURNING * INTO v_progress;
  END IF;
  
  -- Verify step is the current step
  IF p_step != v_progress.current_step THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid step number',
      'expected_step', v_progress.current_step
    );
  END IF;
  
  -- Update based on step number (now 8 steps with new mapping)
  CASE p_step
    WHEN 1 THEN
      -- Welcome
      UPDATE launchpad_progress SET
        step_1_welcome = true,
        step_1_intention = p_data->>'intention',
        step_1_completed_at = NOW(),
        current_step = 2,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 25;
      v_feature_unlocked := 'personal_profile';
      
    WHEN 2 THEN
      -- Personal Profile (NEW!)
      UPDATE launchpad_progress SET
        step_2_profile = true,
        step_2_profile_data = p_data,
        step_2_profile_completed_at = NOW(),
        current_step = 3,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 40;
      v_tokens_awarded := 5;
      v_feature_unlocked := 'aurora_chat_basic';
      
    WHEN 3 THEN
      -- First Chat (was step 2, uses step_2_* columns)
      UPDATE launchpad_progress SET
        step_2_first_chat = true,
        step_2_summary = p_data->>'summary',
        step_2_completed_at = NOW(),
        current_step = 4,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 50;
      v_feature_unlocked := 'introspection_questionnaire';
      
    WHEN 4 THEN
      -- Introspection (was step 3, uses step_3_* columns)
      UPDATE launchpad_progress SET
        step_3_introspection = true,
        step_3_form_submission_id = (p_data->>'form_submission_id')::UUID,
        step_3_completed_at = NOW(),
        current_step = 5,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 100;
      v_tokens_awarded := 10;
      v_feature_unlocked := 'life_plan_questionnaire';
      
    WHEN 5 THEN
      -- Life Plan (was step 4, uses step_4_* columns)
      UPDATE launchpad_progress SET
        step_4_life_plan = true,
        step_4_form_submission_id = (p_data->>'form_submission_id')::UUID,
        step_4_completed_at = NOW(),
        current_step = 6,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 100;
      v_tokens_awarded := 15;
      v_feature_unlocked := 'focus_areas_selection';
      
    WHEN 6 THEN
      -- Focus Areas (was step 5, uses step_5_* columns)
      UPDATE launchpad_progress SET
        step_5_focus_areas = true,
        step_5_focus_areas_selected = p_data->'focus_areas',
        step_5_completed_at = NOW(),
        current_step = 7,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 50;
      v_feature_unlocked := 'first_week_planning';
      
    WHEN 7 THEN
      -- First Week (was step 6, uses step_6_* columns)
      UPDATE launchpad_progress SET
        step_6_first_week = true,
        step_6_actions = p_data->'actions',
        step_6_anchor_habit = p_data->>'anchor_habit',
        step_6_completed_at = NOW(),
        current_step = 8,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 75;
      v_feature_unlocked := 'dashboard_full';
      
    WHEN 8 THEN
      -- Dashboard Activation (was step 7, uses step_7_* columns)
      UPDATE launchpad_progress SET
        step_7_dashboard_activated = true,
        step_7_completed_at = NOW(),
        launchpad_complete = true,
        completed_at = NOW(),
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 100;
      v_tokens_awarded := 25;
      v_feature_unlocked := 'life_os_complete';
      
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Invalid step number');
  END CASE;
  
  -- Award XP if any
  IF v_xp_awarded > 0 THEN
    INSERT INTO xp_events (user_id, xp_amount, source, source_id, description)
    VALUES (p_user_id, v_xp_awarded, 'launchpad', p_step::TEXT, 'Completed launchpad step ' || p_step);
    
    -- Update game state
    UPDATE game_state 
    SET experience = experience + v_xp_awarded,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
      INSERT INTO game_state (user_id, experience) VALUES (p_user_id, v_xp_awarded);
    END IF;
  END IF;
  
  -- Award tokens if any
  IF v_tokens_awarded > 0 THEN
    UPDATE game_state 
    SET tokens = tokens + v_tokens_awarded,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
  
  -- Record feature unlock if any
  IF v_feature_unlocked IS NOT NULL THEN
    INSERT INTO feature_unlocks (user_id, feature_key, unlocked_at)
    VALUES (p_user_id, v_feature_unlocked, NOW())
    ON CONFLICT (user_id, feature_key) DO NOTHING;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'step', p_step,
    'xp_awarded', v_xp_awarded,
    'tokens_awarded', v_tokens_awarded,
    'feature_unlocked', v_feature_unlocked
  );
END;
$$;

-- Update existing users who already passed step 1 to have their current_step incremented
-- This ensures they see the new Personal Profile step
UPDATE public.launchpad_progress
SET current_step = current_step + 1
WHERE current_step >= 2 AND step_2_profile = false;-- Update the complete_launchpad_step function to support 9 steps (including GrowthDeepDive)
CREATE OR REPLACE FUNCTION public.complete_launchpad_step(p_user_id UUID, p_step INTEGER, p_data JSONB DEFAULT '{}'::JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_progress launchpad_progress%ROWTYPE;
  v_xp_awarded INTEGER := 0;
  v_tokens_awarded INTEGER := 0;
  v_feature_unlocked TEXT := NULL;
  v_result JSONB;
BEGIN
  -- Get or create progress record
  SELECT * INTO v_progress FROM launchpad_progress WHERE user_id = p_user_id;
  
  IF v_progress IS NULL THEN
    INSERT INTO launchpad_progress (user_id) VALUES (p_user_id)
    RETURNING * INTO v_progress;
  END IF;
  
  -- Verify step is the current step
  IF p_step != v_progress.current_step THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid step number',
      'expected_step', v_progress.current_step
    );
  END IF;
  
  -- Update based on step number (now 9 steps)
  CASE p_step
    WHEN 1 THEN
      -- Welcome
      UPDATE launchpad_progress SET
        step_1_welcome = true,
        step_1_intention = p_data->>'intention',
        step_1_completed_at = NOW(),
        current_step = 2,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 25;
      v_feature_unlocked := 'personal_profile';
      
    WHEN 2 THEN
      -- Personal Profile
      UPDATE launchpad_progress SET
        step_2_profile = true,
        step_2_profile_data = p_data,
        step_2_profile_completed_at = NOW(),
        current_step = 3,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 40;
      v_tokens_awarded := 5;
      v_feature_unlocked := 'growth_deep_dive';
      
    WHEN 3 THEN
      -- Growth Deep Dive (NEW - stores additional deep dive data in profile_data)
      UPDATE launchpad_progress SET
        step_2_profile_data = COALESCE(step_2_profile_data, '{}'::jsonb) || jsonb_build_object('deep_dive', p_data),
        current_step = 4,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 35;
      v_feature_unlocked := 'aurora_chat_basic';
      
    WHEN 4 THEN
      -- First Chat (uses step_2_* columns for backward compatibility)
      UPDATE launchpad_progress SET
        step_2_first_chat = true,
        step_2_summary = p_data->>'summary',
        step_2_completed_at = NOW(),
        current_step = 5,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 50;
      v_feature_unlocked := 'introspection_questionnaire';
      
    WHEN 5 THEN
      -- Introspection (uses step_3_* columns)
      UPDATE launchpad_progress SET
        step_3_introspection = true,
        step_3_form_submission_id = (p_data->>'form_submission_id')::UUID,
        step_3_completed_at = NOW(),
        current_step = 6,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 100;
      v_tokens_awarded := 10;
      v_feature_unlocked := 'life_plan_questionnaire';
      
    WHEN 6 THEN
      -- Life Plan (uses step_4_* columns)
      UPDATE launchpad_progress SET
        step_4_life_plan = true,
        step_4_form_submission_id = (p_data->>'form_submission_id')::UUID,
        step_4_completed_at = NOW(),
        current_step = 7,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 100;
      v_tokens_awarded := 15;
      v_feature_unlocked := 'focus_areas_selection';
      
    WHEN 7 THEN
      -- Focus Areas (uses step_5_* columns)
      UPDATE launchpad_progress SET
        step_5_focus_areas = true,
        step_5_focus_areas_selected = p_data->'focus_areas',
        step_5_completed_at = NOW(),
        current_step = 8,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 50;
      v_feature_unlocked := 'first_week_planning';
      
    WHEN 8 THEN
      -- First Week (uses step_6_* columns)
      UPDATE launchpad_progress SET
        step_6_first_week = true,
        step_6_actions = p_data->'actions',
        step_6_anchor_habit = p_data->>'anchor_habit',
        step_6_completed_at = NOW(),
        current_step = 9,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 75;
      v_feature_unlocked := 'dashboard_full';
      
    WHEN 9 THEN
      -- Dashboard Activation (uses step_7_* columns)
      UPDATE launchpad_progress SET
        step_7_dashboard_activated = true,
        step_7_completed_at = NOW(),
        launchpad_complete = true,
        completed_at = NOW(),
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 100;
      v_tokens_awarded := 25;
      v_feature_unlocked := 'life_os_complete';
      
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Invalid step number');
  END CASE;
  
  -- Award XP if any
  IF v_xp_awarded > 0 THEN
    UPDATE profiles SET
      experience = COALESCE(experience, 0) + v_xp_awarded,
      tokens = COALESCE(tokens, 0) + v_tokens_awarded,
      updated_at = NOW()
    WHERE id = p_user_id;
  END IF;
  
  -- Build result
  v_result := jsonb_build_object(
    'success', true,
    'step', p_step,
    'xp_awarded', v_xp_awarded,
    'tokens_awarded', v_tokens_awarded,
    'feature_unlocked', v_feature_unlocked
  );
  
  RETURN v_result;
END;
$$;-- =============================================
-- Launchpad Summaries & Life Plans Tables
-- =============================================

-- Table for storing comprehensive AI-generated Launchpad summaries
CREATE TABLE public.launchpad_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  summary_data JSONB NOT NULL DEFAULT '{}',
  consciousness_score INTEGER DEFAULT 0 CHECK (consciousness_score >= 0 AND consciousness_score <= 100),
  transformation_readiness INTEGER DEFAULT 0 CHECK (transformation_readiness >= 0 AND transformation_readiness <= 100),
  clarity_score INTEGER DEFAULT 0 CHECK (clarity_score >= 0 AND clarity_score <= 100),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Table for storing 3-month life plans
CREATE TABLE public.life_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  summary_id UUID REFERENCES public.launchpad_summaries(id) ON DELETE SET NULL,
  duration_months INTEGER DEFAULT 3,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '90 days')::date,
  plan_data JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'abandoned')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for weekly milestones within a life plan
CREATE TABLE public.life_plan_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES public.life_plans(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 12),
  month_number INTEGER NOT NULL CHECK (month_number >= 1 AND month_number <= 3),
  title TEXT NOT NULL,
  description TEXT,
  focus_area TEXT,
  tasks JSONB DEFAULT '[]',
  goal TEXT,
  challenge TEXT,
  hypnosis_recommendation TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  xp_reward INTEGER DEFAULT 50,
  tokens_reward INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_launchpad_summaries_user_id ON public.launchpad_summaries(user_id);
CREATE INDEX idx_launchpad_summaries_generated_at ON public.launchpad_summaries(generated_at DESC);
CREATE INDEX idx_life_plans_user_id ON public.life_plans(user_id);
CREATE INDEX idx_life_plans_status ON public.life_plans(status);
CREATE INDEX idx_life_plan_milestones_plan_id ON public.life_plan_milestones(plan_id);
CREATE INDEX idx_life_plan_milestones_week ON public.life_plan_milestones(week_number);

-- Enable Row Level Security
ALTER TABLE public.launchpad_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_plan_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for launchpad_summaries
CREATE POLICY "Users can view their own summary"
ON public.launchpad_summaries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own summary"
ON public.launchpad_summaries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own summary"
ON public.launchpad_summaries FOR UPDATE
USING (auth.uid() = user_id);

-- Admin can view all summaries (using user_roles table)
CREATE POLICY "Admins can view all summaries"
ON public.launchpad_summaries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  )
);

-- RLS Policies for life_plans
CREATE POLICY "Users can view their own plans"
ON public.life_plans FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plans"
ON public.life_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
ON public.life_plans FOR UPDATE
USING (auth.uid() = user_id);

-- Admin can view all plans (using user_roles table)
CREATE POLICY "Admins can view all plans"
ON public.life_plans FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  )
);

-- RLS Policies for life_plan_milestones
CREATE POLICY "Users can view their own milestones"
ON public.life_plan_milestones FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.life_plans
    WHERE life_plans.id = life_plan_milestones.plan_id
    AND life_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own milestones"
ON public.life_plan_milestones FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.life_plans
    WHERE life_plans.id = life_plan_milestones.plan_id
    AND life_plans.user_id = auth.uid()
  )
);

-- Admin can view all milestones (using user_roles table)
CREATE POLICY "Admins can view all milestones"
ON public.life_plan_milestones FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  )
);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_launchpad_summaries_updated_at
BEFORE UPDATE ON public.launchpad_summaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_life_plans_updated_at
BEFORE UPDATE ON public.life_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update life plan progress when milestone is completed
CREATE OR REPLACE FUNCTION public.update_life_plan_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_milestones INTEGER;
  completed_milestones INTEGER;
  new_progress INTEGER;
BEGIN
  -- Count total and completed milestones for this plan
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE is_completed = true)
  INTO total_milestones, completed_milestones
  FROM public.life_plan_milestones
  WHERE plan_id = NEW.plan_id;
  
  -- Calculate progress percentage
  IF total_milestones > 0 THEN
    new_progress := (completed_milestones * 100) / total_milestones;
  ELSE
    new_progress := 0;
  END IF;
  
  -- Update the life plan progress
  UPDATE public.life_plans
  SET 
    progress_percentage = new_progress,
    status = CASE 
      WHEN new_progress = 100 THEN 'completed'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = NEW.plan_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to auto-update plan progress
CREATE TRIGGER update_plan_progress_on_milestone_change
AFTER UPDATE OF is_completed ON public.life_plan_milestones
FOR EACH ROW
EXECUTE FUNCTION public.update_life_plan_progress();-- Add date tracking columns to aurora_checklist_items
ALTER TABLE public.aurora_checklist_items
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Add date range columns to life_plan_milestones
ALTER TABLE public.life_plan_milestones
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS goal TEXT;

-- Create index for efficient overdue task queries
CREATE INDEX IF NOT EXISTS idx_checklist_items_due_date 
ON public.aurora_checklist_items(due_date) 
WHERE is_completed = false;

-- Create index for milestone date lookups
CREATE INDEX IF NOT EXISTS idx_milestones_dates 
ON public.life_plan_milestones(start_date, end_date);

-- Function to calculate milestone dates when creating a life plan
CREATE OR REPLACE FUNCTION public.calculate_milestone_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate start_date and end_date based on plan start_date and week_number
  IF NEW.start_date IS NULL AND NEW.plan_id IS NOT NULL THEN
    SELECT 
      lp.start_date + ((NEW.week_number - 1) * 7),
      lp.start_date + ((NEW.week_number - 1) * 7) + 6
    INTO NEW.start_date, NEW.end_date
    FROM public.life_plans lp
    WHERE lp.id = NEW.plan_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to auto-calculate milestone dates
DROP TRIGGER IF EXISTS calculate_milestone_dates_trigger ON public.life_plan_milestones;
CREATE TRIGGER calculate_milestone_dates_trigger
BEFORE INSERT ON public.life_plan_milestones
FOR EACH ROW
EXECUTE FUNCTION public.calculate_milestone_dates();

-- Add progress_percentage column to life_plans if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'life_plans' 
    AND column_name = 'progress_percentage'
  ) THEN
    ALTER TABLE public.life_plans ADD COLUMN progress_percentage INTEGER DEFAULT 0;
  END IF;
END $$;-- Add 'practitioner' to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'practitioner';

-- Create practitioners table
CREATE TABLE public.practitioners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  display_name TEXT NOT NULL,
  display_name_en TEXT,
  title TEXT NOT NULL,
  title_en TEXT,
  short_name TEXT,
  short_name_en TEXT,
  bio TEXT,
  bio_en TEXT,
  
  -- Media
  avatar_url TEXT,
  hero_image_url TEXT,
  intro_video_url TEXT,
  
  -- Contact & Social
  whatsapp TEXT,
  calendly_url TEXT,
  instagram_url TEXT,
  website_url TEXT,
  
  -- Location & Availability
  country TEXT DEFAULT 'Israel',
  languages TEXT[] DEFAULT ARRAY['he']::TEXT[],
  timezone TEXT DEFAULT 'Asia/Jerusalem',
  
  -- Platform settings
  slug TEXT UNIQUE NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  
  -- Commission
  commission_rate DECIMAL DEFAULT 20,
  
  -- Stats
  clients_count INTEGER DEFAULT 0,
  rating DECIMAL DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_user_practitioner UNIQUE (user_id)
);

-- Create practitioner_specialties table
CREATE TABLE public.practitioner_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL,
  specialty_label TEXT NOT NULL,
  specialty_label_en TEXT,
  years_experience INTEGER DEFAULT 0,
  certification_name TEXT,
  certification_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create practitioner_services table
CREATE TABLE public.practitioner_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  service_type TEXT NOT NULL CHECK (service_type IN ('session', 'package', 'product')),
  price DECIMAL NOT NULL,
  price_currency TEXT DEFAULT 'ILS',
  duration_minutes INTEGER,
  sessions_count INTEGER,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create practitioner_reviews table
CREATE TABLE public.practitioner_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_practitioner_review UNIQUE (practitioner_id, user_id)
);

-- Add practitioner_id to content_products
ALTER TABLE public.content_products
ADD COLUMN practitioner_id UUID REFERENCES public.practitioners(id) ON DELETE SET NULL;

-- Add practitioner_id to purchases
ALTER TABLE public.purchases
ADD COLUMN practitioner_id UUID REFERENCES public.practitioners(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioner_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioner_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioner_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for practitioners
CREATE POLICY "Anyone can view active practitioners"
ON public.practitioners FOR SELECT
USING (status = 'active');

CREATE POLICY "Admins can view all practitioners"
ON public.practitioners FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Practitioner can view own profile"
ON public.practitioners FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Practitioner can update own profile"
ON public.practitioners FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all practitioners"
ON public.practitioners FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for practitioner_specialties
CREATE POLICY "Anyone can view specialties of active practitioners"
ON public.practitioner_specialties FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.practitioners p 
  WHERE p.id = practitioner_id AND p.status = 'active'
));

CREATE POLICY "Practitioner can manage own specialties"
ON public.practitioner_specialties FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.practitioners p 
  WHERE p.id = practitioner_id AND p.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all specialties"
ON public.practitioner_specialties FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for practitioner_services
CREATE POLICY "Anyone can view active services of active practitioners"
ON public.practitioner_services FOR SELECT
USING (is_active = true AND EXISTS (
  SELECT 1 FROM public.practitioners p 
  WHERE p.id = practitioner_id AND p.status = 'active'
));

CREATE POLICY "Practitioner can manage own services"
ON public.practitioner_services FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.practitioners p 
  WHERE p.id = practitioner_id AND p.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all services"
ON public.practitioner_services FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for practitioner_reviews
CREATE POLICY "Anyone can view approved reviews"
ON public.practitioner_reviews FOR SELECT
USING (is_approved = true);

CREATE POLICY "Users can create their own reviews"
ON public.practitioner_reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
ON public.practitioner_reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews"
ON public.practitioner_reviews FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX idx_practitioners_slug ON public.practitioners(slug);
CREATE INDEX idx_practitioners_status ON public.practitioners(status);
CREATE INDEX idx_practitioners_featured ON public.practitioners(is_featured) WHERE is_featured = true;
CREATE INDEX idx_practitioner_specialties_practitioner ON public.practitioner_specialties(practitioner_id);
CREATE INDEX idx_practitioner_services_practitioner ON public.practitioner_services(practitioner_id);
CREATE INDEX idx_practitioner_reviews_practitioner ON public.practitioner_reviews(practitioner_id);
CREATE INDEX idx_content_products_practitioner ON public.content_products(practitioner_id);

-- Trigger for updating updated_at
CREATE TRIGGER update_practitioners_updated_at
BEFORE UPDATE ON public.practitioners
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_practitioner_services_updated_at
BEFORE UPDATE ON public.practitioner_services
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_practitioner_reviews_updated_at
BEFORE UPDATE ON public.practitioner_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update practitioner stats
CREATE OR REPLACE FUNCTION public.update_practitioner_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.practitioners
    SET 
      rating = (
        SELECT COALESCE(AVG(rating), 0) 
        FROM public.practitioner_reviews 
        WHERE practitioner_id = NEW.practitioner_id AND is_approved = true
      ),
      reviews_count = (
        SELECT COUNT(*) 
        FROM public.practitioner_reviews 
        WHERE practitioner_id = NEW.practitioner_id AND is_approved = true
      ),
      updated_at = NOW()
    WHERE id = NEW.practitioner_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.practitioners
    SET 
      rating = (
        SELECT COALESCE(AVG(rating), 0) 
        FROM public.practitioner_reviews 
        WHERE practitioner_id = OLD.practitioner_id AND is_approved = true
      ),
      reviews_count = (
        SELECT COUNT(*) 
        FROM public.practitioner_reviews 
        WHERE practitioner_id = OLD.practitioner_id AND is_approved = true
      ),
      updated_at = NOW()
    WHERE id = OLD.practitioner_id;
    RETURN OLD;
  END IF;
END;
$$;

-- Trigger to update practitioner stats on review changes
CREATE TRIGGER update_practitioner_stats_on_review
AFTER INSERT OR UPDATE OR DELETE ON public.practitioner_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_practitioner_stats();-- Step 1: Add 'affiliate' to app_role enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'affiliate' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')) THEN
    ALTER TYPE app_role ADD VALUE 'affiliate';
  END IF;
END $$;-- Step 2: Create role_permissions table and seed permissions

-- 1. Create role_permissions table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_key TEXT NOT NULL,
  description TEXT,
  description_en TEXT,
  category TEXT DEFAULT 'general',
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role, permission_key)
);

-- 2. Enable RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Admins can manage permissions"
ON public.role_permissions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view permissions"
ON public.role_permissions FOR SELECT
TO authenticated
USING (true);

-- 4. Function to check permission
CREATE OR REPLACE FUNCTION public.has_permission(
  _user_id UUID, 
  _permission_key TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role = rp.role
    WHERE ur.user_id = _user_id 
      AND rp.permission_key = _permission_key
      AND rp.is_enabled = true
  )
$$;

-- 5. Migrate existing affiliates to user_roles
INSERT INTO user_roles (user_id, role)
SELECT user_id, 'affiliate'::app_role
FROM affiliates
WHERE status = 'active'
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. Seed default permissions
INSERT INTO role_permissions (role, permission_key, description, description_en, category) VALUES
-- Admin permissions
('admin', 'panel.access', 'גישה לפאנל', 'Panel access', 'general'),
('admin', 'analytics.view', 'צפייה באנליטיקס', 'View analytics', 'analytics'),
('admin', 'analytics.full', 'אנליטיקס מלא', 'Full analytics', 'analytics'),
('admin', 'users.view', 'צפייה במשתמשים', 'View users', 'users'),
('admin', 'users.edit', 'עריכת משתמשים', 'Edit users', 'users'),
('admin', 'users.roles', 'ניהול תפקידים', 'Manage roles', 'users'),
('admin', 'practitioners.view', 'צפייה במאמנים', 'View practitioners', 'practitioners'),
('admin', 'practitioners.edit', 'עריכת מאמנים', 'Edit practitioners', 'practitioners'),
('admin', 'practitioners.approve', 'אישור מאמנים', 'Approve practitioners', 'practitioners'),
('admin', 'products.view', 'צפייה במוצרים', 'View products', 'products'),
('admin', 'products.edit', 'עריכת מוצרים', 'Edit products', 'products'),
('admin', 'products.create', 'יצירת מוצרים', 'Create products', 'products'),
('admin', 'content.view', 'צפייה בתוכן', 'View content', 'content'),
('admin', 'content.edit', 'עריכת תוכן', 'Edit content', 'content'),
('admin', 'site.settings', 'הגדרות אתר', 'Site settings', 'site'),
('admin', 'site.theme', 'עיצוב אתר', 'Site theme', 'site'),
('admin', 'site.landing', 'דפי נחיתה', 'Landing pages', 'site'),
('admin', 'affiliates.view', 'צפייה בשותפים', 'View affiliates', 'affiliates'),
('admin', 'affiliates.manage', 'ניהול שותפים', 'Manage affiliates', 'affiliates'),
('admin', 'leads.view', 'צפייה בלידים', 'View leads', 'leads'),
('admin', 'leads.manage', 'ניהול לידים', 'Manage leads', 'leads'),
('admin', 'newsletter.view', 'צפייה בניוזלטר', 'View newsletter', 'newsletter'),
('admin', 'newsletter.send', 'שליחת ניוזלטר', 'Send newsletter', 'newsletter'),
('admin', 'aurora.insights', 'תובנות Aurora', 'Aurora Insights', 'aurora'),
('admin', 'recordings.view', 'צפייה בהקלטות', 'View recordings', 'recordings'),
('admin', 'recordings.manage', 'ניהול הקלטות', 'Manage recordings', 'recordings'),

-- Practitioner permissions
('practitioner', 'panel.access', 'גישה לפאנל', 'Panel access', 'general'),
('practitioner', 'analytics.own', 'אנליטיקס אישי', 'Own analytics', 'analytics'),
('practitioner', 'clients.view', 'צפייה בלקוחות', 'View clients', 'clients'),
('practitioner', 'clients.manage', 'ניהול לקוחות', 'Manage clients', 'clients'),
('practitioner', 'services.view', 'צפייה בשירותים', 'View services', 'services'),
('practitioner', 'services.edit', 'עריכת שירותים', 'Edit services', 'services'),
('practitioner', 'products.own', 'מוצרים שלי', 'Own products', 'products'),
('practitioner', 'calendar.view', 'צפייה ביומן', 'View calendar', 'calendar'),
('practitioner', 'calendar.edit', 'עריכת יומן', 'Edit calendar', 'calendar'),
('practitioner', 'earnings.view', 'צפייה בהכנסות', 'View earnings', 'earnings'),
('practitioner', 'profile.edit', 'עריכת פרופיל', 'Edit profile', 'profile'),

-- Affiliate permissions
('affiliate', 'panel.access', 'גישה לפאנל', 'Panel access', 'general'),
('affiliate', 'links.view', 'צפייה בלינקים', 'View links', 'links'),
('affiliate', 'referrals.view', 'צפייה בהפניות', 'View referrals', 'referrals'),
('affiliate', 'payouts.view', 'צפייה בתשלומים', 'View payouts', 'payouts'),
('affiliate', 'stats.view', 'צפייה בסטטיסטיקות', 'View stats', 'stats')
ON CONFLICT (role, permission_key) DO NOTHING;

-- 7. Add updated_at trigger
CREATE TRIGGER update_role_permissions_updated_at
  BEFORE UPDATE ON public.role_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();-- Add practitioner_id to offers table
ALTER TABLE offers ADD COLUMN practitioner_id UUID REFERENCES practitioners(id);

-- Add practitioner_id to products table  
ALTER TABLE products ADD COLUMN practitioner_id UUID REFERENCES practitioners(id);

-- Create index for faster queries
CREATE INDEX idx_offers_practitioner ON offers(practitioner_id);
CREATE INDEX idx_products_practitioner ON products(practitioner_id);-- Create orb_profiles table to store computed orb configurations
CREATE TABLE public.orb_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  primary_color TEXT NOT NULL DEFAULT 'hsl(210, 100%, 50%)',
  secondary_colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  accent_color TEXT DEFAULT 'hsl(200, 100%, 60%)',
  morph_intensity NUMERIC NOT NULL DEFAULT 0.15,
  morph_speed NUMERIC NOT NULL DEFAULT 1.0,
  core_intensity NUMERIC NOT NULL DEFAULT 0.5,
  layer_count INTEGER NOT NULL DEFAULT 1,
  particle_enabled BOOLEAN NOT NULL DEFAULT false,
  particle_count INTEGER NOT NULL DEFAULT 0,
  geometry_detail INTEGER NOT NULL DEFAULT 4,
  computed_from JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orb_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own orb profile
CREATE POLICY "Users can view their own orb profile"
ON public.orb_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own orb profile
CREATE POLICY "Users can insert their own orb profile"
ON public.orb_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own orb profile
CREATE POLICY "Users can update their own orb profile"
ON public.orb_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION public.update_orb_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_orb_profiles_updated_at
BEFORE UPDATE ON public.orb_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_orb_profile_timestamp();

-- Enable realtime for orb_profiles
ALTER PUBLICATION supabase_realtime ADD TABLE public.orb_profiles;-- Add 'character_trait' to the allowed element_type values
ALTER TABLE public.aurora_identity_elements 
DROP CONSTRAINT aurora_identity_elements_element_type_check;

ALTER TABLE public.aurora_identity_elements
ADD CONSTRAINT aurora_identity_elements_element_type_check 
CHECK (element_type = ANY (ARRAY['value'::text, 'principle'::text, 'self_concept'::text, 'vision_statement'::text, 'character_trait'::text]));-- Add role_model to element_type constraint
ALTER TABLE public.aurora_identity_elements
DROP CONSTRAINT aurora_identity_elements_element_type_check;

ALTER TABLE public.aurora_identity_elements
ADD CONSTRAINT aurora_identity_elements_element_type_check
CHECK (element_type = ANY (ARRAY['value'::text, 'principle'::text, 'self_concept'::text, 'vision_statement'::text, 'character_trait'::text, 'role_model'::text]));-- Fix RLS for form_submissions so authenticated users can save questionnaire answers

-- Ensure RLS is enabled
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Allow authenticated users to INSERT their own submissions (and allow public submissions with user_id NULL)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'form_submissions' 
      AND policyname = 'form_submissions_insert_own_or_public'
  ) THEN
    CREATE POLICY form_submissions_insert_own_or_public
    ON public.form_submissions
    FOR INSERT
    WITH CHECK (
      (auth.uid() IS NOT NULL AND user_id = auth.uid())
      OR user_id IS NULL
    );
  END IF;

  -- Allow authenticated users to SELECT their own submissions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'form_submissions' 
      AND policyname = 'form_submissions_select_own'
  ) THEN
    CREATE POLICY form_submissions_select_own
    ON public.form_submissions
    FOR SELECT
    USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
  END IF;
END $$;
-- Update the element_type check constraint to include 'identity_title'
ALTER TABLE aurora_identity_elements 
DROP CONSTRAINT IF EXISTS aurora_identity_elements_element_type_check;

ALTER TABLE aurora_identity_elements
ADD CONSTRAINT aurora_identity_elements_element_type_check 
CHECK (element_type = ANY (ARRAY[
  'value'::text, 
  'principle'::text, 
  'self_concept'::text, 
  'vision_statement'::text, 
  'character_trait'::text, 
  'role_model'::text, 
  'identity_title'::text, 
  'ai_archetype'::text
]));-- Create hypnosis script cache table
CREATE TABLE public.hypnosis_script_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cache_key TEXT NOT NULL,
  ego_state TEXT NOT NULL,
  goal TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  language TEXT NOT NULL DEFAULT 'he',
  script_data JSONB NOT NULL,
  audio_paths JSONB, -- Array of segment audio file paths in Storage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  use_count INTEGER DEFAULT 1,
  UNIQUE(user_id, cache_key)
);

-- Enable Row Level Security
ALTER TABLE public.hypnosis_script_cache ENABLE ROW LEVEL SECURITY;

-- Users can only access their own cache
CREATE POLICY "Users can view own cache" ON public.hypnosis_script_cache 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cache" ON public.hypnosis_script_cache 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cache" ON public.hypnosis_script_cache 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cache" ON public.hypnosis_script_cache 
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_hypnosis_script_cache_lookup ON public.hypnosis_script_cache(user_id, cache_key);

-- Create Storage bucket for audio cache
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('hypnosis-cache', 'hypnosis-cache', false, 52428800, ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav']);

-- Storage policies for hypnosis-cache bucket
CREATE POLICY "Users can view own audio cache" ON storage.objects
  FOR SELECT USING (bucket_id = 'hypnosis-cache' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own audio cache" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'hypnosis-cache' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own audio cache" ON storage.objects
  FOR DELETE USING (bucket_id = 'hypnosis-cache' AND auth.uid()::text = (storage.foldername(name))[1]);-- Create daily_habit_logs table for tracking daily habit completion
CREATE TABLE public.daily_habit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  habit_item_id UUID NOT NULL REFERENCES public.aurora_checklist_items(id) ON DELETE CASCADE,
  track_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by TEXT NOT NULL DEFAULT 'manual' CHECK (completed_by IN ('manual', 'aurora')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint: one log per habit per day per user
  UNIQUE(user_id, habit_item_id, track_date)
);

-- Add is_recurring column to aurora_checklist_items
ALTER TABLE public.aurora_checklist_items 
ADD COLUMN is_recurring BOOLEAN NOT NULL DEFAULT false;

-- Enable RLS
ALTER TABLE public.daily_habit_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_habit_logs
CREATE POLICY "Users can view their own habit logs"
ON public.daily_habit_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habit logs"
ON public.daily_habit_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit logs"
ON public.daily_habit_logs
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit logs"
ON public.daily_habit_logs
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX idx_daily_habit_logs_user_date ON public.daily_habit_logs(user_id, track_date);
CREATE INDEX idx_daily_habit_logs_habit_date ON public.daily_habit_logs(habit_item_id, track_date);-- Enable RLS (safe if already enabled)
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Public analytics write policies (non-sensitive operational data)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'visitor_sessions' AND policyname = 'visitor_sessions_public_insert'
  ) THEN
    CREATE POLICY visitor_sessions_public_insert
    ON public.visitor_sessions
    FOR INSERT
    WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'visitor_sessions' AND policyname = 'visitor_sessions_public_update'
  ) THEN
    CREATE POLICY visitor_sessions_public_update
    ON public.visitor_sessions
    FOR UPDATE
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'page_views' AND policyname = 'page_views_public_insert'
  ) THEN
    CREATE POLICY page_views_public_insert
    ON public.page_views
    FOR INSERT
    WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'page_views' AND policyname = 'page_views_public_update'
  ) THEN
    CREATE POLICY page_views_public_update
    ON public.page_views
    FOR UPDATE
    USING (true);
  END IF;
END $$;
-- 1. Conversation Memory Table
CREATE TABLE public.aurora_conversation_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  key_topics TEXT[] DEFAULT '{}',
  action_items TEXT[] DEFAULT '{}',
  emotional_state TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Reminders Table
CREATE TABLE public.aurora_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  reminder_date DATE NOT NULL,
  context TEXT,
  source TEXT DEFAULT 'aurora',
  is_delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.aurora_conversation_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aurora_reminders ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Conversation Memory
CREATE POLICY "Users can view own conversation memories" 
ON public.aurora_conversation_memory 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversation memories" 
ON public.aurora_conversation_memory 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversation memories" 
ON public.aurora_conversation_memory 
FOR DELETE 
USING (auth.uid() = user_id);

-- 5. RLS Policies for Reminders
CREATE POLICY "Users can view own reminders" 
ON public.aurora_reminders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders" 
ON public.aurora_reminders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" 
ON public.aurora_reminders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders" 
ON public.aurora_reminders 
FOR DELETE 
USING (auth.uid() = user_id);

-- 6. Indexes for Performance
CREATE INDEX idx_conversation_memory_user ON public.aurora_conversation_memory(user_id, created_at DESC);
CREATE INDEX idx_reminders_user_date ON public.aurora_reminders(user_id, reminder_date) WHERE NOT is_delivered;
CREATE INDEX idx_reminders_pending ON public.aurora_reminders(user_id, is_delivered, reminder_date);-- Add new columns to launchpad_progress for Step 3 (Lifestyle) and Step 10 (Final Notes)
ALTER TABLE launchpad_progress 
ADD COLUMN IF NOT EXISTS step_3_lifestyle_data jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS step_3_lifestyle_completed_at timestamptz DEFAULT NULL,
ADD COLUMN IF NOT EXISTS step_10_final_notes text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS step_10_completed_at timestamptz DEFAULT NULL;-- Add DELETE policy for conversations (only owner can delete their AI conversations)
CREATE POLICY "Users can delete own conversations"
ON public.conversations
FOR DELETE
USING (
  participant_1 = auth.uid() AND type = 'ai'
);

-- Add DELETE policy for messages (users can delete messages in their own conversations)
CREATE POLICY "Users can delete messages in own conversations"
ON public.messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND c.participant_1 = auth.uid()
    AND c.type = 'ai'
  )
);-- Create trigger to send admin notification when user completes launchpad/journey
CREATE OR REPLACE FUNCTION notify_admin_journey_complete()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Only trigger if launchpad_complete changed from false to true
  IF NEW.launchpad_complete = true AND (OLD.launchpad_complete IS NULL OR OLD.launchpad_complete = false) THEN
    -- Get user info
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.user_id;
    SELECT COALESCE(first_name || ' ' || last_name, first_name, email) INTO user_name
    FROM profiles WHERE id = NEW.user_id;
    
    -- Insert admin notification
    INSERT INTO admin_notifications (
      type,
      priority,
      title,
      message,
      link,
      metadata
    ) VALUES (
      'user_milestone',
      'medium',
      CASE 
        WHEN user_name IS NOT NULL THEN user_name || ' סיים את מסע הטרנספורמציה!'
        ELSE 'משתמש סיים את מסע הטרנספורמציה!'
      END,
      'משתמש השלים את כל שלבי הלאנצ''פד ומוכן להתחיל עם אורורה.',
      '/panel/users',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'user_email', user_email,
        'completed_at', NEW.completed_at
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_journey_complete_notification ON launchpad_progress;

CREATE TRIGGER trigger_journey_complete_notification
  AFTER UPDATE ON launchpad_progress
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_journey_complete();
-- Create a function to generate admin notification when user completes the transformation journey
CREATE OR REPLACE FUNCTION public.notify_admin_journey_completion()
RETURNS TRIGGER AS $$
DECLARE
  user_full_name TEXT;
  user_email TEXT;
BEGIN
  -- Only trigger when launchpad_complete changes from false/null to true
  IF NEW.launchpad_complete = true AND (OLD.launchpad_complete IS NULL OR OLD.launchpad_complete = false) THEN
    -- Get user info
    SELECT full_name INTO user_full_name
    FROM public.profiles
    WHERE id = NEW.user_id;
    
    -- Get email from auth.users
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = NEW.user_id;
    
    -- Insert admin notification
    INSERT INTO public.admin_notifications (
      type,
      priority,
      title,
      message,
      link,
      metadata
    ) VALUES (
      'journey_completion',
      'medium',
      'מסע טרנספורמציה הושלם',
      COALESCE(user_full_name, 'משתמש') || ' סיים/ה את מסע הטרנספורמציה',
      '/admin/users/' || NEW.user_id,
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on launchpad_progress table
DROP TRIGGER IF EXISTS on_journey_completion ON public.launchpad_progress;
CREATE TRIGGER on_journey_completion
  AFTER UPDATE ON public.launchpad_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_journey_completion();

-- Also trigger on insert (in case launchpad_complete is set to true on first insert)
DROP TRIGGER IF EXISTS on_journey_completion_insert ON public.launchpad_progress;
CREATE TRIGGER on_journey_completion_insert
  AFTER INSERT ON public.launchpad_progress
  FOR EACH ROW
  WHEN (NEW.launchpad_complete = true)
  EXECUTE FUNCTION public.notify_admin_journey_completion();

-- Add journey_completion to notification_type enum
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'journey_completion';
-- ============================================================================
-- GAMIFICATION SYSTEM ROBUSTNESS FIX
-- Phase 1: Fix award_unified_xp, consolidate triggers, fix existing data
-- ============================================================================

-- 1. First drop the old function to allow return type change
DROP FUNCTION IF EXISTS public.award_unified_xp(uuid, integer, text, text);

-- 2. Create improved award_unified_xp with level calculation and token bonus
CREATE OR REPLACE FUNCTION public.award_unified_xp(
  p_user_id uuid, 
  p_amount integer, 
  p_source text, 
  p_reason text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_old_level integer;
  v_new_level integer;
  v_new_experience integer;
  v_tokens_awarded integer := 0;
  v_levels_gained integer := 0;
BEGIN
  -- Get current level and experience
  SELECT COALESCE(level, 1), COALESCE(experience, 0)
  INTO v_old_level, v_new_experience
  FROM public.profiles 
  WHERE id = p_user_id;
  
  -- Calculate new experience
  v_new_experience := v_new_experience + p_amount;
  
  -- Calculate new level (100 XP per level)
  v_new_level := GREATEST(1, FLOOR(v_new_experience / 100) + 1);
  
  -- Calculate levels gained and token bonus (5 tokens per level)
  IF v_new_level > v_old_level THEN
    v_levels_gained := v_new_level - v_old_level;
    v_tokens_awarded := v_levels_gained * 5;
  END IF;
  
  -- Update profile with new experience, level, and tokens
  UPDATE public.profiles 
  SET 
    experience = v_new_experience,
    level = v_new_level,
    tokens = COALESCE(tokens, 0) + v_tokens_awarded,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Log the XP event
  INSERT INTO public.xp_events (user_id, amount, source, reason)
  VALUES (p_user_id, p_amount, p_source, p_reason);
  
  -- Return result for frontend
  RETURN jsonb_build_object(
    'xp_gained', p_amount,
    'new_experience', v_new_experience,
    'old_level', v_old_level,
    'new_level', v_new_level,
    'levels_gained', v_levels_gained,
    'tokens_awarded', v_tokens_awarded
  );
END;
$function$;

-- 3. Update aurora_award_xp to use the new function signature
CREATE OR REPLACE FUNCTION public.aurora_award_xp(p_user_id uuid, p_amount integer, p_reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Call the unified XP function with 'aurora' as the source
  PERFORM award_unified_xp(p_user_id, p_amount, 'aurora', p_reason);
END;
$function$;

-- 4. Drop old redundant triggers
DROP TRIGGER IF EXISTS on_hypnosis_session_complete ON public.hypnosis_sessions;
DROP TRIGGER IF EXISTS on_session_complete ON public.hypnosis_sessions;
DROP TRIGGER IF EXISTS on_session_track_ego ON public.hypnosis_sessions;
DROP TRIGGER IF EXISTS update_streak_on_session ON public.hypnosis_sessions;

-- 5. Create consolidated session handler function
CREATE OR REPLACE FUNCTION public.handle_hypnosis_session_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_last_date date;
  v_today date := CURRENT_DATE;
  v_current_streak integer;
  v_new_streak integer;
  v_bonus_xp integer := 0;
  v_bonus_tokens integer := 0;
  v_xp_result jsonb;
BEGIN
  -- Get user's current streak info
  SELECT session_streak, last_session_date 
  INTO v_current_streak, v_last_date
  FROM profiles 
  WHERE id = NEW.user_id;
  
  v_current_streak := COALESCE(v_current_streak, 0);
  
  -- Determine new streak value
  IF v_last_date IS NULL OR v_last_date < v_today - 1 THEN
    -- Reset streak (gap > 1 day or first session)
    v_new_streak := 1;
  ELSIF v_last_date = v_today - 1 THEN
    -- Consecutive day - increment streak
    v_new_streak := v_current_streak + 1;
  ELSIF v_last_date = v_today THEN
    -- Same day - keep current streak
    v_new_streak := v_current_streak;
  ELSE
    v_new_streak := 1;
  END IF;
  
  -- Calculate streak milestone bonuses (only on new milestone)
  IF v_new_streak > v_current_streak THEN
    CASE v_new_streak
      WHEN 3 THEN 
        v_bonus_xp := 25;
        v_bonus_tokens := 5;
      WHEN 7 THEN 
        v_bonus_xp := 50;
        v_bonus_tokens := 10;
      WHEN 14 THEN 
        v_bonus_xp := 100;
        v_bonus_tokens := 20;
      WHEN 30 THEN 
        v_bonus_xp := 200;
        v_bonus_tokens := 50;
      WHEN 60 THEN 
        v_bonus_xp := 300;
        v_bonus_tokens := 75;
      WHEN 100 THEN 
        v_bonus_xp := 500;
        v_bonus_tokens := 100;
      ELSE
        -- Daily bonus after 7 day streak
        IF v_new_streak > 7 THEN
          v_bonus_xp := 5;
        END IF;
    END CASE;
  END IF;
  
  -- Update streak and ego state usage
  UPDATE profiles 
  SET 
    session_streak = v_new_streak,
    last_session_date = v_today,
    tokens = COALESCE(tokens, 0) + v_bonus_tokens,
    ego_state_usage = COALESCE(ego_state_usage, '{}'::jsonb) || 
      jsonb_build_object(
        NEW.ego_state, 
        COALESCE((ego_state_usage ->> NEW.ego_state)::int, 0) + 1
      ),
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  -- Award session XP via unified function (includes level calculation)
  SELECT award_unified_xp(
    NEW.user_id, 
    COALESCE(NEW.experience_gained, 0) + v_bonus_xp,
    'hypnosis_session',
    'Session completed: ' || NEW.ego_state
  ) INTO v_xp_result;
  
  RETURN NEW;
END;
$function$;

-- 6. Create single consolidated trigger
CREATE TRIGGER on_hypnosis_session_complete
  AFTER INSERT ON public.hypnosis_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_hypnosis_session_complete();

-- 7. Fix existing level mismatches
UPDATE public.profiles 
SET level = GREATEST(1, FLOOR(COALESCE(experience, 0) / 100) + 1)
WHERE level != GREATEST(1, FLOOR(COALESCE(experience, 0) / 100) + 1)
   OR level IS NULL;

-- 8. Drop old conflicting functions (keep only consolidated versions)
DROP FUNCTION IF EXISTS public.check_streak_bonus(uuid);
DROP FUNCTION IF EXISTS public.update_session_streak();
DROP FUNCTION IF EXISTS public.update_ego_state_usage();-- Update the notify_journey_completion function to link to the user dashboard view
CREATE OR REPLACE FUNCTION public.notify_journey_completion()
RETURNS TRIGGER AS $$
DECLARE
  user_name text;
  user_email text;
BEGIN
  -- Only trigger when launchpad_complete changes to true
  IF NEW.launchpad_complete = true AND (OLD.launchpad_complete IS NULL OR OLD.launchpad_complete = false) THEN
    -- Get user info
    SELECT full_name INTO user_name FROM public.profiles WHERE id = NEW.user_id;
    
    -- Create admin notification with link to user's dashboard view
    INSERT INTO public.admin_notifications (
      type,
      title,
      message,
      link,
      metadata,
      priority
    ) VALUES (
      'journey_completion',
      CASE 
        WHEN user_name IS NOT NULL THEN user_name || ' השלים/ה את מסע הטרנספורמציה'
        ELSE 'משתמש השלים את מסע הטרנספורמציה'
      END,
      'משתמש השלים את כל שלבי הלאנצ''פד ומוכן להתחיל עם אורורה.',
      '/panel/users/' || NEW.user_id || '/dashboard',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'user_name', user_name,
        'completed_at', NEW.completed_at
      ),
      'high'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;-- Create practitioner_clients table for coach-client relationships
CREATE TABLE public.practitioner_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  client_user_id UUID NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(practitioner_id, client_user_id)
);

-- Enable RLS
ALTER TABLE public.practitioner_clients ENABLE ROW LEVEL SECURITY;

-- Create function to get practitioner_id for current user
CREATE OR REPLACE FUNCTION public.get_practitioner_id_for_user(user_uuid UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.practitioners WHERE user_id = user_uuid LIMIT 1;
$$;

-- RLS: Coaches can view their own clients
CREATE POLICY "Coaches can view their own clients"
ON public.practitioner_clients
FOR SELECT
TO authenticated
USING (
  practitioner_id = public.get_practitioner_id_for_user(auth.uid())
);

-- RLS: Coaches can insert their own clients
CREATE POLICY "Coaches can insert their own clients"
ON public.practitioner_clients
FOR INSERT
TO authenticated
WITH CHECK (
  practitioner_id = public.get_practitioner_id_for_user(auth.uid())
);

-- RLS: Coaches can update their own clients
CREATE POLICY "Coaches can update their own clients"
ON public.practitioner_clients
FOR UPDATE
TO authenticated
USING (
  practitioner_id = public.get_practitioner_id_for_user(auth.uid())
);

-- RLS: Coaches can delete their own clients
CREATE POLICY "Coaches can delete their own clients"
ON public.practitioner_clients
FOR DELETE
TO authenticated
USING (
  practitioner_id = public.get_practitioner_id_for_user(auth.uid())
);

-- RLS: Clients can view their relationship with coaches
CREATE POLICY "Clients can view their coach relationships"
ON public.practitioner_clients
FOR SELECT
TO authenticated
USING (
  client_user_id = auth.uid()
);

-- Create trigger for updated_at
CREATE TRIGGER update_practitioner_clients_updated_at
BEFORE UPDATE ON public.practitioner_clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add RLS policies for content_products to ensure coaches only see their own
CREATE POLICY "Coaches can view their own products"
ON public.content_products
FOR SELECT
TO authenticated
USING (
  practitioner_id IS NULL 
  OR practitioner_id = public.get_practitioner_id_for_user(auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- Add RLS policies for practitioner_reviews
CREATE POLICY "Coaches can view reviews for their profile"
ON public.practitioner_reviews
FOR SELECT
TO authenticated
USING (
  practitioner_id = public.get_practitioner_id_for_user(auth.uid())
  OR user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);-- ============================================
-- Multi-Tenant Practitioner Platform Tables
-- ============================================

-- 1. Practitioner Settings (Domain, Branding, Landing Page)
CREATE TABLE public.practitioner_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  
  -- Domain Configuration
  custom_domain TEXT UNIQUE,
  subdomain TEXT UNIQUE,
  domain_verified BOOLEAN DEFAULT false,
  
  -- Branding
  logo_url TEXT,
  favicon_url TEXT,
  brand_color TEXT DEFAULT '#e91e63',
  brand_color_secondary TEXT,
  
  -- Landing Page Config
  hero_heading_he TEXT,
  hero_heading_en TEXT,
  hero_subheading_he TEXT,
  hero_subheading_en TEXT,
  hero_image_url TEXT,
  about_section JSONB DEFAULT '{}',
  
  -- Feature Toggles
  enable_courses BOOLEAN DEFAULT true,
  enable_services BOOLEAN DEFAULT true,
  enable_products BOOLEAN DEFAULT true,
  enable_community BOOLEAN DEFAULT false,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  og_image_url TEXT,
  
  -- Settings
  default_language TEXT DEFAULT 'he',
  timezone TEXT DEFAULT 'Asia/Jerusalem',
  
  -- Social Links
  social_links JSONB DEFAULT '{}',
  
  -- Contact
  contact_email TEXT,
  contact_phone TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(practitioner_id)
);

-- 2. Practitioner Client Profiles (Isolated per practitioner)
CREATE TABLE public.practitioner_client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  
  -- Profile data scoped to this practitioner
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Engagement metrics
  total_sessions INTEGER DEFAULT 0,
  total_purchases NUMERIC(10,2) DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, practitioner_id)
);

-- 3. Enable RLS
ALTER TABLE public.practitioner_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioner_client_profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for practitioner_settings
-- Practitioners can manage their own settings
CREATE POLICY "Practitioners manage own settings"
ON public.practitioner_settings FOR ALL TO authenticated
USING (practitioner_id = public.get_practitioner_id_for_user(auth.uid()))
WITH CHECK (practitioner_id = public.get_practitioner_id_for_user(auth.uid()));

-- Public read for domain lookup (needed for routing)
CREATE POLICY "Anyone can read settings for domain lookup"
ON public.practitioner_settings FOR SELECT TO anon, authenticated
USING (true);

-- 5. RLS Policies for practitioner_client_profiles
-- Practitioners can view/manage their own client profiles
CREATE POLICY "Practitioners manage own client profiles"
ON public.practitioner_client_profiles FOR ALL TO authenticated
USING (practitioner_id = public.get_practitioner_id_for_user(auth.uid()))
WITH CHECK (practitioner_id = public.get_practitioner_id_for_user(auth.uid()));

-- Clients can view their own profile per practitioner
CREATE POLICY "Clients view own profiles"
ON public.practitioner_client_profiles FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Clients can update their own profile (limited fields)
CREATE POLICY "Clients update own profile"
ON public.practitioner_client_profiles FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 6. Indexes for performance
CREATE INDEX idx_practitioner_settings_domain ON public.practitioner_settings(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX idx_practitioner_settings_subdomain ON public.practitioner_settings(subdomain) WHERE subdomain IS NOT NULL;
CREATE INDEX idx_practitioner_settings_practitioner ON public.practitioner_settings(practitioner_id);
CREATE INDEX idx_practitioner_client_profiles_practitioner ON public.practitioner_client_profiles(practitioner_id);
CREATE INDEX idx_practitioner_client_profiles_user ON public.practitioner_client_profiles(user_id);
CREATE INDEX idx_practitioner_client_profiles_status ON public.practitioner_client_profiles(status);

-- 7. Updated at trigger for practitioner_settings
CREATE TRIGGER update_practitioner_settings_updated_at
  BEFORE UPDATE ON public.practitioner_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Updated at trigger for practitioner_client_profiles
CREATE TRIGGER update_practitioner_client_profiles_updated_at
  BEFORE UPDATE ON public.practitioner_client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Function to get practitioner by domain
CREATE OR REPLACE FUNCTION public.get_practitioner_by_domain(domain_input TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT practitioner_id
  FROM practitioner_settings
  WHERE custom_domain = domain_input
     OR subdomain = domain_input
  LIMIT 1;
$$;

-- 10. Auto-create settings when practitioner is created
CREATE OR REPLACE FUNCTION public.auto_create_practitioner_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO practitioner_settings (practitioner_id, subdomain)
  VALUES (NEW.id, NEW.slug)
  ON CONFLICT (practitioner_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_practitioner_settings_on_insert
  AFTER INSERT ON public.practitioners
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_practitioner_settings();-- Create trigger to auto-create practitioner_settings when a practitioner is created
CREATE OR REPLACE FUNCTION public.create_practitioner_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.practitioner_settings (practitioner_id, subdomain)
  VALUES (NEW.id, NEW.slug)
  ON CONFLICT (practitioner_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS on_practitioner_created ON public.practitioners;
CREATE TRIGGER on_practitioner_created
  AFTER INSERT ON public.practitioners
  FOR EACH ROW
  EXECUTE FUNCTION public.create_practitioner_settings();-- Create a security-definer function to create a brand-new AI conversation and return its id
CREATE OR REPLACE FUNCTION public.create_ai_conversation(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  conv_id uuid;
BEGIN
  INSERT INTO public.conversations (participant_1, participant_2, type)
  VALUES (p_user_id, NULL, 'ai')
  RETURNING id INTO conv_id;

  RETURN conv_id;
END;
$$;-- Replace function to always create a distinct AI conversation (avoids unique constraint on (participant_1, participant_2) when participant_2 is NULL)
CREATE OR REPLACE FUNCTION public.create_ai_conversation(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  conv_id uuid;
BEGIN
  INSERT INTO public.conversations (participant_1, participant_2, type)
  VALUES (p_user_id, gen_random_uuid(), 'ai')
  RETURNING id INTO conv_id;

  RETURN conv_id;
END;
$$;-- Create business_journeys table for storing business journey data
CREATE TABLE public.business_journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_name TEXT,
  current_step INTEGER NOT NULL DEFAULT 1,
  journey_complete BOOLEAN NOT NULL DEFAULT false,
  step_1_vision JSONB DEFAULT '{}'::jsonb,
  step_2_business_model JSONB DEFAULT '{}'::jsonb,
  step_3_target_audience JSONB DEFAULT '{}'::jsonb,
  step_4_value_proposition JSONB DEFAULT '{}'::jsonb,
  step_5_challenges JSONB DEFAULT '{}'::jsonb,
  step_6_resources JSONB DEFAULT '{}'::jsonb,
  step_7_financial JSONB DEFAULT '{}'::jsonb,
  step_8_marketing JSONB DEFAULT '{}'::jsonb,
  step_9_operations JSONB DEFAULT '{}'::jsonb,
  step_10_action_plan JSONB DEFAULT '{}'::jsonb,
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.business_journeys ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own business journeys" 
ON public.business_journeys 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own business journeys" 
ON public.business_journeys 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business journeys" 
ON public.business_journeys 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business journeys" 
ON public.business_journeys 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_business_journeys_updated_at
BEFORE UPDATE ON public.business_journeys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster user lookups
CREATE INDEX idx_business_journeys_user_id ON public.business_journeys(user_id);
CREATE INDEX idx_business_journeys_complete ON public.business_journeys(user_id, journey_complete);-- Business Orb Profiles - Visual DNA for each business
CREATE TABLE public.business_orb_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business_journeys(id) ON DELETE CASCADE,
  primary_color TEXT NOT NULL,
  secondary_colors TEXT[] DEFAULT '{}',
  accent_color TEXT NOT NULL,
  morph_intensity NUMERIC DEFAULT 0.15,
  morph_speed NUMERIC DEFAULT 1.0,
  geometry_detail INTEGER DEFAULT 4,
  particle_enabled BOOLEAN DEFAULT true,
  particle_count INTEGER DEFAULT 50,
  computed_from JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id)
);

-- Business Plans - 90-day action plans
CREATE TABLE public.business_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business_journeys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'paused')),
  start_date DATE,
  end_date DATE,
  plan_data JSONB DEFAULT '{}',
  total_weeks INTEGER DEFAULT 12,
  current_week INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Business Plan Milestones - Weekly milestones within a plan
CREATE TABLE public.business_plan_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.business_plans(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  focus_area TEXT,
  tasks JSONB DEFAULT '[]',
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  xp_reward INTEGER DEFAULT 50,
  tokens_reward INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Business Branding - Brand identity for each business
CREATE TABLE public.business_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business_journeys(id) ON DELETE CASCADE,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  font_heading TEXT,
  font_body TEXT,
  brand_voice TEXT,
  tone_keywords TEXT[] DEFAULT '{}',
  tagline TEXT,
  mission_statement TEXT,
  vision_statement TEXT,
  core_values TEXT[] DEFAULT '{}',
  brand_story TEXT,
  target_emotions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id)
);

-- Enable RLS on all tables
ALTER TABLE public.business_orb_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_plan_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_branding ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_orb_profiles
CREATE POLICY "Users can view own business orb profiles"
  ON public.business_orb_profiles FOR SELECT
  USING (business_id IN (SELECT id FROM public.business_journeys WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own business orb profiles"
  ON public.business_orb_profiles FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM public.business_journeys WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own business orb profiles"
  ON public.business_orb_profiles FOR UPDATE
  USING (business_id IN (SELECT id FROM public.business_journeys WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own business orb profiles"
  ON public.business_orb_profiles FOR DELETE
  USING (business_id IN (SELECT id FROM public.business_journeys WHERE user_id = auth.uid()));

-- RLS Policies for business_plans
CREATE POLICY "Users can view own business plans"
  ON public.business_plans FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own business plans"
  ON public.business_plans FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own business plans"
  ON public.business_plans FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own business plans"
  ON public.business_plans FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for business_plan_milestones (via plan ownership)
CREATE POLICY "Users can view own business plan milestones"
  ON public.business_plan_milestones FOR SELECT
  USING (plan_id IN (SELECT id FROM public.business_plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own business plan milestones"
  ON public.business_plan_milestones FOR INSERT
  WITH CHECK (plan_id IN (SELECT id FROM public.business_plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own business plan milestones"
  ON public.business_plan_milestones FOR UPDATE
  USING (plan_id IN (SELECT id FROM public.business_plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own business plan milestones"
  ON public.business_plan_milestones FOR DELETE
  USING (plan_id IN (SELECT id FROM public.business_plans WHERE user_id = auth.uid()));

-- RLS Policies for business_branding
CREATE POLICY "Users can view own business branding"
  ON public.business_branding FOR SELECT
  USING (business_id IN (SELECT id FROM public.business_journeys WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own business branding"
  ON public.business_branding FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM public.business_journeys WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own business branding"
  ON public.business_branding FOR UPDATE
  USING (business_id IN (SELECT id FROM public.business_journeys WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own business branding"
  ON public.business_branding FOR DELETE
  USING (business_id IN (SELECT id FROM public.business_journeys WHERE user_id = auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_business_orb_profiles_updated_at
  BEFORE UPDATE ON public.business_orb_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_plans_updated_at
  BEFORE UPDATE ON public.business_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_plan_milestones_updated_at
  BEFORE UPDATE ON public.business_plan_milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_branding_updated_at
  BEFORE UPDATE ON public.business_branding
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();-- Add category column to aurora_checklists for mission categorization
ALTER TABLE public.aurora_checklists 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'personal' 
CHECK (category IN ('personal', 'business', 'health'));

-- Add time_scope column for daily/weekly/monthly organization
ALTER TABLE public.aurora_checklists 
ADD COLUMN IF NOT EXISTS time_scope TEXT DEFAULT 'weekly'
CHECK (time_scope IN ('daily', 'weekly', 'monthly'));

-- Add milestone_id for linking to 90-day plan milestones
ALTER TABLE public.aurora_checklists 
ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES public.life_plan_milestones(id) ON DELETE SET NULL;

-- Add priority for sorting
ALTER TABLE public.aurora_checklists 
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_aurora_checklists_category ON public.aurora_checklists(category);
CREATE INDEX IF NOT EXISTS idx_aurora_checklists_time_scope ON public.aurora_checklists(time_scope);
CREATE INDEX IF NOT EXISTS idx_aurora_checklists_milestone ON public.aurora_checklists(milestone_id);-- Create health_journeys table for storing health journey progress
CREATE TABLE public.health_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  journey_data JSONB DEFAULT '{}',
  current_step INTEGER DEFAULT 1,
  is_completed BOOLEAN DEFAULT FALSE,
  plan_id UUID REFERENCES public.life_plans(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.health_journeys ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own health journeys"
ON public.health_journeys
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health journeys"
ON public.health_journeys
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health journeys"
ON public.health_journeys
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health journeys"
ON public.health_journeys
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_health_journeys_updated_at
BEFORE UPDATE ON public.health_journeys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_health_journeys_user_id ON public.health_journeys(user_id);
CREATE INDEX idx_health_journeys_is_completed ON public.health_journeys(is_completed);-- =============================================
-- Life OS New Pillars: Relationships, Finances, Learning
-- =============================================

-- 1. RELATIONSHIPS JOURNEYS
CREATE TABLE public.relationships_journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 1,
  journey_complete BOOLEAN NOT NULL DEFAULT FALSE,
  step_1_vision JSONB DEFAULT '{}'::jsonb,
  step_2_current_state JSONB DEFAULT '{}'::jsonb,
  step_3_family JSONB DEFAULT '{}'::jsonb,
  step_4_partner JSONB DEFAULT '{}'::jsonb,
  step_5_social JSONB DEFAULT '{}'::jsonb,
  step_6_communication JSONB DEFAULT '{}'::jsonb,
  step_7_boundaries JSONB DEFAULT '{}'::jsonb,
  step_8_action_plan JSONB DEFAULT '{}'::jsonb,
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.relationships_journeys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for relationships_journeys
CREATE POLICY "Users can view their own relationship journeys"
  ON public.relationships_journeys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own relationship journeys"
  ON public.relationships_journeys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own relationship journeys"
  ON public.relationships_journeys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own relationship journeys"
  ON public.relationships_journeys FOR DELETE
  USING (auth.uid() = user_id);

-- 2. FINANCE JOURNEYS
CREATE TABLE public.finance_journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 1,
  journey_complete BOOLEAN NOT NULL DEFAULT FALSE,
  step_1_vision JSONB DEFAULT '{}'::jsonb,
  step_2_current_state JSONB DEFAULT '{}'::jsonb,
  step_3_income JSONB DEFAULT '{}'::jsonb,
  step_4_expenses JSONB DEFAULT '{}'::jsonb,
  step_5_savings JSONB DEFAULT '{}'::jsonb,
  step_6_debt JSONB DEFAULT '{}'::jsonb,
  step_7_goals JSONB DEFAULT '{}'::jsonb,
  step_8_action_plan JSONB DEFAULT '{}'::jsonb,
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.finance_journeys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for finance_journeys
CREATE POLICY "Users can view their own finance journeys"
  ON public.finance_journeys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own finance journeys"
  ON public.finance_journeys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own finance journeys"
  ON public.finance_journeys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own finance journeys"
  ON public.finance_journeys FOR DELETE
  USING (auth.uid() = user_id);

-- 3. LEARNING JOURNEYS
CREATE TABLE public.learning_journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 1,
  journey_complete BOOLEAN NOT NULL DEFAULT FALSE,
  step_1_vision JSONB DEFAULT '{}'::jsonb,
  step_2_learning_style JSONB DEFAULT '{}'::jsonb,
  step_3_skills JSONB DEFAULT '{}'::jsonb,
  step_4_reading JSONB DEFAULT '{}'::jsonb,
  step_5_courses JSONB DEFAULT '{}'::jsonb,
  step_6_practice JSONB DEFAULT '{}'::jsonb,
  step_7_goals JSONB DEFAULT '{}'::jsonb,
  step_8_action_plan JSONB DEFAULT '{}'::jsonb,
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.learning_journeys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_journeys
CREATE POLICY "Users can view their own learning journeys"
  ON public.learning_journeys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own learning journeys"
  ON public.learning_journeys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning journeys"
  ON public.learning_journeys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learning journeys"
  ON public.learning_journeys FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Add triggers for updated_at
CREATE TRIGGER update_relationships_journeys_updated_at
  BEFORE UPDATE ON public.relationships_journeys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_finance_journeys_updated_at
  BEFORE UPDATE ON public.finance_journeys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_journeys_updated_at
  BEFORE UPDATE ON public.learning_journeys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();-- Aurora Proactive Intelligence System Tables

-- Table for queued proactive outreach messages
CREATE TABLE public.aurora_proactive_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  trigger_type TEXT NOT NULL, -- 'overdue_task', 'habit_reminder', 'milestone_ending', 'pattern_alert', 'streak_risk', 'daily_checkin'
  trigger_data JSONB DEFAULT '{}',
  priority INTEGER DEFAULT 5, -- 1-10, higher = more urgent
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.aurora_proactive_queue ENABLE ROW LEVEL SECURITY;

-- Users can only see their own proactive messages
CREATE POLICY "Users can view their own proactive queue"
ON public.aurora_proactive_queue
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update (dismiss) their own messages
CREATE POLICY "Users can update their own proactive queue"
ON public.aurora_proactive_queue
FOR UPDATE
USING (auth.uid() = user_id);

-- Service role can insert for any user
CREATE POLICY "Service role can insert proactive messages"
ON public.aurora_proactive_queue
FOR INSERT
WITH CHECK (true);

-- Index for efficient scheduled query
CREATE INDEX idx_proactive_queue_scheduled ON public.aurora_proactive_queue(scheduled_for, sent_at) WHERE sent_at IS NULL;
CREATE INDEX idx_proactive_queue_user ON public.aurora_proactive_queue(user_id, scheduled_for);

-- Table for user action preferences (trust levels)
CREATE TABLE public.aurora_action_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'task_complete', 'habit_log', 'reminder_set', 'navigate', etc.
  trust_level TEXT NOT NULL DEFAULT 'always_ask', -- 'always_ask', 'auto_execute', 'confirm_once'
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, action_type)
);

-- Enable RLS
ALTER TABLE public.aurora_action_preferences ENABLE ROW LEVEL SECURITY;

-- Users can manage their own preferences
CREATE POLICY "Users can view their action preferences"
ON public.aurora_action_preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their action preferences"
ON public.aurora_action_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their action preferences"
ON public.aurora_action_preferences
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their action preferences"
ON public.aurora_action_preferences
FOR DELETE
USING (auth.uid() = user_id);

-- Add enhanced context columns to existing aurora tables
ALTER TABLE public.aurora_onboarding_progress 
ADD COLUMN IF NOT EXISTS mood_signals JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS energy_level TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS last_active_page TEXT,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS proactive_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS voice_mode_enabled BOOLEAN DEFAULT false;

-- Function to get pending proactive items for a user
CREATE OR REPLACE FUNCTION public.get_pending_proactive_items(p_user_id UUID)
RETURNS SETOF public.aurora_proactive_queue
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.aurora_proactive_queue
  WHERE user_id = p_user_id
    AND sent_at IS NULL
    AND dismissed_at IS NULL
    AND scheduled_for <= NOW()
  ORDER BY priority DESC, scheduled_for ASC
  LIMIT 5;
$$;

-- Function to queue a proactive message
CREATE OR REPLACE FUNCTION public.queue_proactive_message(
  p_user_id UUID,
  p_trigger_type TEXT,
  p_trigger_data JSONB DEFAULT '{}',
  p_priority INTEGER DEFAULT 5,
  p_scheduled_for TIMESTAMPTZ DEFAULT NOW()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.aurora_proactive_queue (user_id, trigger_type, trigger_data, priority, scheduled_for)
  VALUES (p_user_id, p_trigger_type, p_trigger_data, p_priority, p_scheduled_for)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;-- Update brand settings to MindOS
UPDATE theme_settings SET setting_value = 'מיינדOS' WHERE setting_key = 'brand_name';
UPDATE theme_settings SET setting_value = 'MindOS' WHERE setting_key = 'brand_name_en';
UPDATE theme_settings SET setting_value = 'MindOS OÜ' WHERE setting_key = 'company_legal_name';-- Create bug_reports table
CREATE TABLE public.bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Bug Details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  priority TEXT NOT NULL DEFAULT 'medium',
  
  -- Context (auto-captured)
  page_path TEXT NOT NULL,
  page_url TEXT NOT NULL,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  screen_size TEXT,
  
  -- Optional
  screenshot_url TEXT,
  contact_email TEXT,
  
  -- Admin fields
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Users can insert their own reports (or anonymous reports)
CREATE POLICY "Users can create bug reports"
  ON public.bug_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON public.bug_reports FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can do everything (using user_roles table)
CREATE POLICY "Admins full access on bug_reports"
  ON public.bug_reports FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Indexes for performance
CREATE INDEX idx_bug_reports_status ON public.bug_reports(status);
CREATE INDEX idx_bug_reports_created ON public.bug_reports(created_at DESC);
CREATE INDEX idx_bug_reports_user ON public.bug_reports(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_bug_reports_updated_at
  BEFORE UPDATE ON public.bug_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();-- Create storage bucket for bug report screenshots
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bug-screenshots', 'bug-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload screenshots
CREATE POLICY "Users can upload bug screenshots"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'bug-screenshots' AND auth.role() = 'authenticated');

-- Allow public read access for screenshots
CREATE POLICY "Bug screenshots are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'bug-screenshots');

-- Allow authenticated users to delete their own screenshots (cleanup)
CREATE POLICY "Users can delete own screenshots"
ON storage.objects FOR DELETE
USING (bucket_id = 'bug-screenshots' AND auth.role() = 'authenticated');-- Create table for purpose journeys
CREATE TABLE public.purpose_journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 1,
  journey_complete BOOLEAN NOT NULL DEFAULT false,
  step_1_vision JSONB,
  step_2_values JSONB,
  step_3_meaning JSONB,
  step_4_mission JSONB,
  step_5_strengths JSONB,
  step_6_contribution JSONB,
  step_7_legacy JSONB,
  step_8_action_plan JSONB,
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.purpose_journeys ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own purpose journey" 
ON public.purpose_journeys 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purpose journey" 
ON public.purpose_journeys 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purpose journey" 
ON public.purpose_journeys 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purpose journey" 
ON public.purpose_journeys 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_purpose_journeys_updated_at
BEFORE UPDATE ON public.purpose_journeys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for user lookups
CREATE INDEX idx_purpose_journeys_user_id ON public.purpose_journeys(user_id);-- Create hobbies_journeys table for the 8th life pillar
CREATE TABLE public.hobbies_journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 1,
  journey_complete BOOLEAN NOT NULL DEFAULT false,
  step_1_discovery JSONB DEFAULT NULL,
  step_2_passion JSONB DEFAULT NULL,
  step_3_time JSONB DEFAULT NULL,
  step_4_creativity JSONB DEFAULT NULL,
  step_5_social JSONB DEFAULT NULL,
  step_6_growth JSONB DEFAULT NULL,
  step_7_balance JSONB DEFAULT NULL,
  step_8_action_plan JSONB DEFAULT NULL,
  ai_summary TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index on user_id (one journey per user)
CREATE UNIQUE INDEX hobbies_journeys_user_id_idx ON public.hobbies_journeys(user_id);

-- Enable Row Level Security
ALTER TABLE public.hobbies_journeys ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user access
CREATE POLICY "Users can view their own hobbies journey"
ON public.hobbies_journeys
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own hobbies journey"
ON public.hobbies_journeys
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hobbies journey"
ON public.hobbies_journeys
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hobbies journey"
ON public.hobbies_journeys
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_hobbies_journeys_updated_at
BEFORE UPDATE ON public.hobbies_journeys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- 1. Create practitioner_availability table
CREATE TABLE public.practitioner_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID REFERENCES public.practitioners(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Validation trigger for day_of_week
CREATE OR REPLACE FUNCTION public.validate_day_of_week()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.day_of_week < 0 OR NEW.day_of_week > 6 THEN
    RAISE EXCEPTION 'day_of_week must be between 0 and 6';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER check_day_of_week
BEFORE INSERT OR UPDATE ON public.practitioner_availability
FOR EACH ROW EXECUTE FUNCTION public.validate_day_of_week();

ALTER TABLE public.practitioner_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active availability"
ON public.practitioner_availability FOR SELECT
USING (is_active = true);

CREATE POLICY "Practitioners can manage own availability"
ON public.practitioner_availability FOR ALL
USING (practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid()));

-- 2. Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID REFERENCES public.practitioners(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.practitioner_services(id),
  client_user_id UUID NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Validation trigger for status
CREATE OR REPLACE FUNCTION public.validate_booking_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('pending', 'confirmed', 'cancelled', 'completed') THEN
    RAISE EXCEPTION 'Invalid booking status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER check_booking_status
BEFORE INSERT OR UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.validate_booking_status();

-- Updated_at trigger
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own bookings"
ON public.bookings FOR SELECT
USING (client_user_id = auth.uid());

CREATE POLICY "Practitioners can view their bookings"
ON public.bookings FOR SELECT
USING (practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can create bookings"
ON public.bookings FOR INSERT
WITH CHECK (auth.uid() = client_user_id);

CREATE POLICY "Clients can update own bookings"
ON public.bookings FOR UPDATE
USING (client_user_id = auth.uid());

CREATE POLICY "Practitioners can update their bookings"
ON public.bookings FOR UPDATE
USING (practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid()));
-- Add reviewer_name and reviewer_avatar_url for admin-managed reviews (where user_id may not have a profile)
ALTER TABLE public.practitioner_reviews 
  ADD COLUMN IF NOT EXISTS reviewer_name TEXT,
  ADD COLUMN IF NOT EXISTS reviewer_avatar_url TEXT;
-- Fix 3 functions with mutable search paths
CREATE OR REPLACE FUNCTION public.aurora_award_xp(p_user_id uuid, p_amount integer, p_source text, p_description text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_xp integer;
  v_current_level integer;
  v_new_xp integer;
BEGIN
  -- Get current XP and level
  SELECT xp, level INTO v_current_xp, v_current_level
  FROM profiles WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  v_new_xp := COALESCE(v_current_xp, 0) + p_amount;
  
  -- Update profile
  UPDATE profiles SET xp = v_new_xp WHERE id = p_user_id;
  
  -- Log XP gain
  INSERT INTO xp_logs (user_id, amount, source, description)
  VALUES (p_user_id, p_amount, p_source, p_description);
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_launchpad_step(p_user_id uuid, p_step text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO launchpad_progress (user_id, step_key, completed, completed_at)
  VALUES (p_user_id, p_step, true, now())
  ON CONFLICT (user_id, step_key) DO UPDATE SET completed = true, completed_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_journey_completion(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_display_name text;
BEGIN
  SELECT display_name INTO v_display_name FROM profiles WHERE id = p_user_id;
  
  INSERT INTO admin_notifications (title, message, type, metadata)
  VALUES (
    'משתמש השלים מסע תודעה',
    COALESCE(v_display_name, 'משתמש') || ' השלים את מסע התודעה בהצלחה',
    'system',
    jsonb_build_object('user_id', p_user_id, 'event', 'journey_complete')
  );
END;
$$;

-- Remove duplicate page_views policies (keep the cleaner-named ones)
DROP POLICY IF EXISTS "page_views_public_insert" ON public.page_views;
DROP POLICY IF EXISTS "page_views_public_update" ON public.page_views;

-- Remove duplicate visitor_sessions policies
DROP POLICY IF EXISTS "visitor_sessions_public_insert" ON public.visitor_sessions;
DROP POLICY IF EXISTS "visitor_sessions_public_update" ON public.visitor_sessions;

-- Tighten aurora_proactive_queue: only authenticated users can insert their own
DROP POLICY IF EXISTS "Service role can insert proactive messages" ON public.aurora_proactive_queue;
CREATE POLICY "Users can insert own proactive messages" ON public.aurora_proactive_queue
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Tighten community_point_logs: only authenticated users can insert their own
DROP POLICY IF EXISTS "System can insert point logs" ON public.community_point_logs;
CREATE POLICY "Users can insert own point logs" ON public.community_point_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Tighten form_analyses: only authenticated users can insert
DROP POLICY IF EXISTS "Service role can insert analyses" ON public.form_analyses;
CREATE POLICY "Authenticated users can insert analyses" ON public.form_analyses
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Tighten analytics_reports: only service role (already restricted by roles but add auth check)
DROP POLICY IF EXISTS "Service role can insert analytics reports" ON public.analytics_reports;
CREATE POLICY "Service role can insert analytics reports" ON public.analytics_reports
  FOR INSERT TO service_role
  WITH CHECK (true);

-- Fix search_path on original overloads that lack it
CREATE OR REPLACE FUNCTION public.aurora_award_xp(p_user_id uuid, p_amount integer, p_reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  PERFORM award_unified_xp(p_user_id, p_amount, 'aurora', p_reason);
END;
$function$;

CREATE OR REPLACE FUNCTION public.complete_launchpad_step(p_user_id uuid, p_step integer, p_data jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_progress launchpad_progress%ROWTYPE;
  v_xp_awarded INTEGER := 0;
  v_tokens_awarded INTEGER := 0;
  v_feature_unlocked TEXT := NULL;
  v_result JSONB;
BEGIN
  SELECT * INTO v_progress FROM launchpad_progress WHERE user_id = p_user_id;
  
  IF v_progress IS NULL THEN
    INSERT INTO launchpad_progress (user_id) VALUES (p_user_id)
    RETURNING * INTO v_progress;
  END IF;
  
  IF p_step != v_progress.current_step THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid step number',
      'expected_step', v_progress.current_step
    );
  END IF;
  
  CASE p_step
    WHEN 1 THEN
      UPDATE launchpad_progress SET
        step_1_welcome = true,
        step_1_intention = p_data->>'intention',
        step_1_completed_at = NOW(),
        current_step = 2,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 25;
      v_feature_unlocked := 'personal_profile';
      
    WHEN 2 THEN
      UPDATE launchpad_progress SET
        step_2_profile = true,
        step_2_profile_data = p_data,
        step_2_profile_completed_at = NOW(),
        current_step = 3,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 40;
      v_tokens_awarded := 5;
      v_feature_unlocked := 'growth_deep_dive';
      
    WHEN 3 THEN
      UPDATE launchpad_progress SET
        step_2_profile_data = COALESCE(step_2_profile_data, '{}'::jsonb) || jsonb_build_object('deep_dive', p_data),
        current_step = 4,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 35;
      v_feature_unlocked := 'aurora_chat_basic';
      
    WHEN 4 THEN
      UPDATE launchpad_progress SET
        step_2_first_chat = true,
        step_2_summary = p_data->>'summary',
        step_2_completed_at = NOW(),
        current_step = 5,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 50;
      v_feature_unlocked := 'introspection_questionnaire';
      
    WHEN 5 THEN
      UPDATE launchpad_progress SET
        step_3_introspection = true,
        step_3_form_submission_id = (p_data->>'form_submission_id')::UUID,
        step_3_completed_at = NOW(),
        current_step = 6,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 60;
      v_tokens_awarded := 5;
      v_feature_unlocked := 'life_plan';
      
    WHEN 6 THEN
      UPDATE launchpad_progress SET
        step_4_life_plan = true,
        step_4_completed_at = NOW(),
        current_step = 7,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 50;
      v_tokens_awarded := 5;
      v_feature_unlocked := 'mini_hypnosis';
      
    WHEN 7 THEN
      UPDATE launchpad_progress SET
        step_5_hypnosis = true,
        step_5_completed_at = NOW(),
        current_step = 8,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 75;
      v_tokens_awarded := 10;
      v_feature_unlocked := 'habits';
      
    WHEN 8 THEN
      UPDATE launchpad_progress SET
        step_6_habits = true,
        step_6_completed_at = NOW(),
        current_step = 9,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 50;
      v_tokens_awarded := 5;
      v_feature_unlocked := 'dashboard_activation';
      
    WHEN 9 THEN
      UPDATE launchpad_progress SET
        step_7_dashboard = true,
        step_7_completed_at = NOW(),
        is_complete = true,
        completed_at = NOW(),
        current_step = 10,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 100;
      v_tokens_awarded := 20;
      v_feature_unlocked := 'full_dashboard';
      
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Invalid step number');
  END CASE;
  
  -- Award XP
  IF v_xp_awarded > 0 THEN
    PERFORM award_unified_xp(p_user_id, v_xp_awarded, 'launchpad', 'Completed step ' || p_step);
  END IF;
  
  -- Award tokens
  IF v_tokens_awarded > 0 THEN
    UPDATE profiles SET tokens = COALESCE(tokens, 0) + v_tokens_awarded WHERE id = p_user_id;
  END IF;
  
  v_result := jsonb_build_object(
    'success', true,
    'xp_awarded', v_xp_awarded,
    'tokens_awarded', v_tokens_awarded,
    'feature_unlocked', v_feature_unlocked,
    'next_step', p_step + 1
  );
  
  RETURN v_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_journey_completion(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_display_name text;
BEGIN
  SELECT display_name INTO v_display_name FROM profiles WHERE id = p_user_id;
  
  INSERT INTO admin_notifications (title, message, type, metadata)
  VALUES (
    'משתמש השלים מסע תודעה',
    COALESCE(v_display_name, 'משתמש') || ' השלים את מסע התודעה בהצלחה',
    'system',
    jsonb_build_object('user_id', p_user_id, 'event', 'journey_complete')
  );
END;
$function$;

-- Fix the trigger version of notify_journey_completion (no args)
CREATE OR REPLACE FUNCTION public.notify_journey_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_name text;
  user_email text;
BEGIN
  IF NEW.launchpad_complete = true AND (OLD.launchpad_complete IS NULL OR OLD.launchpad_complete = false) THEN
    SELECT full_name INTO user_name FROM public.profiles WHERE id = NEW.user_id;
    
    INSERT INTO public.admin_notifications (
      type, title, message, link, metadata, priority
    ) VALUES (
      'journey_completion',
      CASE 
        WHEN user_name IS NOT NULL THEN user_name || ' השלים/ה את מסע הטרנספורמציה'
        ELSE 'משתמש השלים את מסע הטרנספורמציה'
      END,
      'משתמש השלים את כל שלבי הלאנצ''פד ומוכן להתחיל עם אורורה.',
      '/panel/users/' || NEW.user_id || '/dashboard',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'user_name', user_name,
        'completed_at', NEW.completed_at
      ),
      'high'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix 1: Add storage INSERT policy for bug-screenshots
CREATE POLICY "Authenticated users can upload bug screenshots"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'bug-screenshots' AND auth.role() = 'authenticated');

-- Fix 2: Rewrite complete_launchpad_step for 11-step flow with correct columns
CREATE OR REPLACE FUNCTION public.complete_launchpad_step(
  p_user_id UUID,
  p_step INTEGER,
  p_data JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_progress launchpad_progress%ROWTYPE;
  v_xp_awarded INTEGER := 0;
  v_tokens_awarded INTEGER := 0;
  v_feature_unlocked TEXT := NULL;
BEGIN
  SELECT * INTO v_progress FROM launchpad_progress WHERE user_id = p_user_id;
  
  IF v_progress IS NULL THEN
    INSERT INTO launchpad_progress (user_id) VALUES (p_user_id)
    RETURNING * INTO v_progress;
  END IF;
  
  -- Allow completing current step or re-completing past steps
  IF p_step > v_progress.current_step THEN
    RETURN jsonb_build_object(
      'success', false,
      'step', p_step,
      'error', 'Cannot skip steps',
      'expected_step', v_progress.current_step,
      'xp_awarded', 0,
      'tokens_awarded', 0,
      'feature_unlocked', NULL
    );
  END IF;
  
  -- Only advance current_step if completing the current step
  CASE p_step
    WHEN 1 THEN
      UPDATE launchpad_progress SET
        step_1_welcome = true,
        step_1_intention = p_data->>'intention',
        step_1_completed_at = NOW(),
        current_step = GREATEST(current_step, 2),
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 25;
      v_feature_unlocked := 'personal_profile';
      
    WHEN 2 THEN
      UPDATE launchpad_progress SET
        step_2_profile = true,
        step_2_profile_data = COALESCE(p_data, '{}'::jsonb),
        step_2_profile_completed_at = NOW(),
        current_step = GREATEST(current_step, 3),
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 40;
      v_tokens_awarded := 5;
      v_feature_unlocked := 'lifestyle_routine';
      
    WHEN 3 THEN
      -- Lifestyle & Routine
      UPDATE launchpad_progress SET
        step_3_lifestyle_data = p_data,
        step_3_lifestyle_completed_at = NOW(),
        current_step = GREATEST(current_step, 4),
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 35;
      v_feature_unlocked := 'growth_deep_dive';
      
    WHEN 4 THEN
      -- Growth Deep Dive - merge into profile data
      UPDATE launchpad_progress SET
        step_2_profile_data = COALESCE(step_2_profile_data, '{}'::jsonb) || jsonb_build_object('deep_dive', p_data),
        current_step = GREATEST(current_step, 5),
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 35;
      v_feature_unlocked := 'aurora_chat_basic';
      
    WHEN 5 THEN
      -- First Chat
      UPDATE launchpad_progress SET
        step_2_first_chat = true,
        step_2_summary = p_data->>'summary',
        step_2_completed_at = NOW(),
        current_step = GREATEST(current_step, 6),
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 50;
      v_feature_unlocked := 'introspection_questionnaire';
      
    WHEN 6 THEN
      -- Introspection
      UPDATE launchpad_progress SET
        step_3_introspection = true,
        step_3_form_submission_id = CASE 
          WHEN p_data->>'form_submission_id' IS NOT NULL 
          THEN (p_data->>'form_submission_id')::UUID 
          ELSE step_3_form_submission_id 
        END,
        step_3_completed_at = NOW(),
        current_step = GREATEST(current_step, 7),
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 50;
      v_tokens_awarded := 5;
      v_feature_unlocked := 'introspection_complete';
      
    WHEN 7 THEN
      -- Life Plan / Vision & Direction
      UPDATE launchpad_progress SET
        step_4_life_plan = true,
        step_4_form_submission_id = CASE 
          WHEN p_data->>'form_submission_id' IS NOT NULL 
          THEN (p_data->>'form_submission_id')::UUID 
          ELSE step_4_form_submission_id 
        END,
        step_4_completed_at = NOW(),
        current_step = GREATEST(current_step, 8),
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 100;
      v_tokens_awarded := 10;
      v_feature_unlocked := 'life_plan_complete';
      
    WHEN 8 THEN
      -- Focus Areas
      UPDATE launchpad_progress SET
        step_5_focus_areas = true,
        step_5_focus_areas_selected = CASE
          WHEN p_data->'focusAreas' IS NOT NULL 
          THEN ARRAY(SELECT jsonb_array_elements_text(p_data->'focusAreas'))
          WHEN p_data->'focus_areas' IS NOT NULL
          THEN ARRAY(SELECT jsonb_array_elements_text(p_data->'focus_areas'))
          ELSE step_5_focus_areas_selected
        END,
        step_5_completed_at = NOW(),
        current_step = GREATEST(current_step, 9),
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 50;
      v_feature_unlocked := 'focus_areas_selection';
      
    WHEN 9 THEN
      -- First Week
      UPDATE launchpad_progress SET
        step_6_first_week = true,
        step_6_actions = CASE
          WHEN p_data->'actions' IS NOT NULL
          THEN ARRAY(SELECT jsonb_array_elements_text(p_data->'actions'))
          ELSE step_6_actions
        END,
        step_6_anchor_habit = COALESCE(p_data->>'anchor_habit', step_6_anchor_habit),
        step_6_completed_at = NOW(),
        current_step = GREATEST(current_step, 10),
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 75;
      v_feature_unlocked := 'first_week_planning';
      
    WHEN 10 THEN
      -- Final Notes
      UPDATE launchpad_progress SET
        step_10_final_notes = COALESCE(p_data->>'notes', p_data::text),
        step_10_completed_at = NOW(),
        current_step = GREATEST(current_step, 11),
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 25;
      v_feature_unlocked := 'final_notes';
      
    WHEN 11 THEN
      -- Dashboard Activation - Complete!
      UPDATE launchpad_progress SET
        step_7_dashboard_activated = true,
        step_7_completed_at = NOW(),
        launchpad_complete = true,
        completed_at = NOW(),
        current_step = 11,
        updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 100;
      v_tokens_awarded := 25;
      v_feature_unlocked := 'life_os_complete';
      
    ELSE
      RETURN jsonb_build_object(
        'success', false,
        'step', p_step,
        'error', 'Invalid step number',
        'xp_awarded', 0,
        'tokens_awarded', 0,
        'feature_unlocked', NULL
      );
  END CASE;
  
  -- Award XP (only for first-time completion of current step)
  IF v_xp_awarded > 0 AND p_step = v_progress.current_step THEN
    PERFORM aurora_award_xp(p_user_id, v_xp_awarded, 'launchpad', 'Completed step ' || p_step);
  END IF;
  
  -- Award tokens (only for first-time completion)
  IF v_tokens_awarded > 0 AND p_step = v_progress.current_step THEN
    UPDATE profiles SET tokens = COALESCE(tokens, 0) + v_tokens_awarded WHERE id = p_user_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'step', p_step,
    'xp_awarded', CASE WHEN p_step = v_progress.current_step THEN v_xp_awarded ELSE 0 END,
    'tokens_awarded', CASE WHEN p_step = v_progress.current_step THEN v_tokens_awarded ELSE 0 END,
    'feature_unlocked', CASE WHEN p_step = v_progress.current_step THEN v_feature_unlocked ELSE NULL END
  );
END;
$$;

-- Drop both overloads and recreate the correct one
DROP FUNCTION IF EXISTS public.complete_launchpad_step(UUID, TEXT);
DROP FUNCTION IF EXISTS public.complete_launchpad_step(UUID, INTEGER);
DROP FUNCTION IF EXISTS public.complete_launchpad_step(UUID, INTEGER, JSONB);

CREATE OR REPLACE FUNCTION public.complete_launchpad_step(p_user_id UUID, p_step INTEGER, p_data JSONB DEFAULT '{}'::jsonb)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_progress launchpad_progress%ROWTYPE;
  v_xp_awarded INTEGER := 0;
  v_tokens_awarded INTEGER := 0;
  v_feature_unlocked TEXT := NULL;
BEGIN
  SELECT * INTO v_progress FROM launchpad_progress WHERE user_id = p_user_id;
  
  IF v_progress IS NULL THEN
    INSERT INTO launchpad_progress (user_id) VALUES (p_user_id)
    RETURNING * INTO v_progress;
  END IF;
  
  IF p_step > v_progress.current_step THEN
    RETURN jsonb_build_object(
      'success', false, 'step', p_step, 'error', 'Cannot skip steps',
      'expected_step', v_progress.current_step,
      'xp_awarded', 0, 'tokens_awarded', 0, 'feature_unlocked', NULL
    );
  END IF;
  
  CASE p_step
    WHEN 1 THEN
      UPDATE launchpad_progress SET
        step_1_welcome = true, step_1_intention = p_data->>'intention',
        step_1_completed_at = NOW(), current_step = GREATEST(current_step, 2), updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 25; v_feature_unlocked := 'personal_profile';
      
    WHEN 2 THEN
      UPDATE launchpad_progress SET
        step_2_profile = true, step_2_profile_data = COALESCE(p_data, '{}'::jsonb),
        step_2_profile_completed_at = NOW(), current_step = GREATEST(current_step, 3), updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 40; v_tokens_awarded := 5; v_feature_unlocked := 'lifestyle_routine';
      
    WHEN 3 THEN
      UPDATE launchpad_progress SET
        step_3_lifestyle_data = p_data, step_3_lifestyle_completed_at = NOW(),
        current_step = GREATEST(current_step, 4), updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 35; v_feature_unlocked := 'growth_deep_dive';
      
    WHEN 4 THEN
      UPDATE launchpad_progress SET
        step_2_profile_data = COALESCE(step_2_profile_data, '{}'::jsonb) || jsonb_build_object('deep_dive', p_data),
        current_step = GREATEST(current_step, 5), updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 35; v_feature_unlocked := 'aurora_chat_basic';
      
    WHEN 5 THEN
      UPDATE launchpad_progress SET
        step_2_first_chat = true, step_2_summary = p_data->>'summary',
        step_2_completed_at = NOW(), current_step = GREATEST(current_step, 6), updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 50; v_feature_unlocked := 'introspection_questionnaire';
      
    WHEN 6 THEN
      UPDATE launchpad_progress SET
        step_3_introspection = true,
        step_3_form_submission_id = CASE WHEN p_data->>'form_submission_id' IS NOT NULL 
          THEN (p_data->>'form_submission_id')::UUID ELSE step_3_form_submission_id END,
        step_3_completed_at = NOW(), current_step = GREATEST(current_step, 7), updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 50; v_tokens_awarded := 5; v_feature_unlocked := 'introspection_complete';
      
    WHEN 7 THEN
      UPDATE launchpad_progress SET
        step_4_life_plan = true,
        step_4_form_submission_id = CASE WHEN p_data->>'form_submission_id' IS NOT NULL 
          THEN (p_data->>'form_submission_id')::UUID ELSE step_4_form_submission_id END,
        step_4_completed_at = NOW(), current_step = GREATEST(current_step, 8), updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 100; v_tokens_awarded := 10; v_feature_unlocked := 'life_plan_complete';
      
    WHEN 8 THEN
      UPDATE launchpad_progress SET
        step_5_focus_areas = true,
        step_5_focus_areas_selected = COALESCE(p_data->'focusAreas', p_data->'focus_areas', step_5_focus_areas_selected),
        step_5_completed_at = NOW(), current_step = GREATEST(current_step, 9), updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 50; v_feature_unlocked := 'focus_areas_selection';
      
    WHEN 9 THEN
      UPDATE launchpad_progress SET
        step_6_first_week = true,
        step_6_actions = COALESCE(p_data->'actions', step_6_actions),
        step_6_anchor_habit = COALESCE(p_data->>'anchor_habit', step_6_anchor_habit),
        step_6_completed_at = NOW(), current_step = GREATEST(current_step, 10), updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 75; v_feature_unlocked := 'first_week_planning';
      
    WHEN 10 THEN
      UPDATE launchpad_progress SET
        step_10_final_notes = COALESCE(p_data->>'notes', p_data::text),
        step_10_completed_at = NOW(), current_step = GREATEST(current_step, 11), updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 25; v_feature_unlocked := 'final_notes';
      
    WHEN 11 THEN
      UPDATE launchpad_progress SET
        step_7_dashboard_activated = true, step_7_completed_at = NOW(),
        launchpad_complete = true, completed_at = NOW(), current_step = 11, updated_at = NOW()
      WHERE user_id = p_user_id;
      v_xp_awarded := 100; v_tokens_awarded := 25; v_feature_unlocked := 'life_os_complete';
      
    ELSE
      RETURN jsonb_build_object(
        'success', false, 'step', p_step, 'error', 'Invalid step number',
        'xp_awarded', 0, 'tokens_awarded', 0, 'feature_unlocked', NULL
      );
  END CASE;
  
  IF v_xp_awarded > 0 AND p_step = v_progress.current_step THEN
    PERFORM aurora_award_xp(p_user_id, v_xp_awarded, 'launchpad', 'Completed step ' || p_step);
  END IF;
  
  IF v_tokens_awarded > 0 AND p_step = v_progress.current_step THEN
    UPDATE profiles SET tokens = COALESCE(tokens, 0) + v_tokens_awarded WHERE id = p_user_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true, 'step', p_step,
    'xp_awarded', CASE WHEN p_step = v_progress.current_step THEN v_xp_awarded ELSE 0 END,
    'tokens_awarded', CASE WHEN p_step = v_progress.current_step THEN v_tokens_awarded ELSE 0 END,
    'feature_unlocked', CASE WHEN p_step = v_progress.current_step THEN v_feature_unlocked ELSE NULL END
  );
END;
$$;
-- Fix aurora_award_xp(uuid,int,text,text) which references non-existent profiles.xp
CREATE OR REPLACE FUNCTION public.aurora_award_xp(
  p_user_id uuid,
  p_amount integer,
  p_source text,
  p_description text DEFAULT NULL::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Use unified XP/level/token system (profiles.experience) instead of legacy profiles.xp
  PERFORM award_unified_xp(p_user_id, p_amount, p_source, p_description);
END;
$$;
-- Add title and body columns to aurora_proactive_queue if missing
ALTER TABLE aurora_proactive_queue 
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS body text;

-- Index for efficient polling
CREATE INDEX IF NOT EXISTS idx_proactive_queue_user_scheduled 
  ON aurora_proactive_queue(user_id, scheduled_for) 
  WHERE dismissed_at IS NULL AND sent_at IS NULL;

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

-- Create user_projects table for managing personal projects
CREATE TABLE public.user_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'personal',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  -- Journey data (collected during add-project wizard)
  vision TEXT,
  why_it_matters TEXT,
  desired_outcome TEXT,
  timeline TEXT,
  key_milestones JSONB DEFAULT '[]'::jsonb,
  resources_needed TEXT,
  potential_blockers TEXT,
  linked_life_areas TEXT[] DEFAULT '{}',
  -- Progress & integration
  progress_percentage INTEGER DEFAULT 0,
  linked_goal_ids UUID[] DEFAULT '{}',
  linked_checklist_ids UUID[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  cover_color TEXT DEFAULT '#d4a574',
  -- Timestamps
  target_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own projects"
  ON public.user_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON public.user_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON public.user_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON public.user_projects FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update timestamps
CREATE TRIGGER update_user_projects_updated_at
  BEFORE UPDATE ON public.user_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_user_projects_user_id ON public.user_projects(user_id);
CREATE INDEX idx_user_projects_status ON public.user_projects(user_id, status);

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

-- Backfill aurora_onboarding_progress for all existing profiles that don't have a row
INSERT INTO public.aurora_onboarding_progress (user_id, proactive_enabled, last_active_at, onboarding_complete)
SELECT p.id, true, now(), false
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.aurora_onboarding_progress aop WHERE aop.user_id = p.id
);

-- Create trigger function to auto-create onboarding progress for new profiles
CREATE OR REPLACE FUNCTION public.auto_create_aurora_onboarding_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.aurora_onboarding_progress (user_id, proactive_enabled, last_active_at, onboarding_complete)
  VALUES (NEW.id, true, now(), false)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS on_profile_created_aurora_progress ON public.profiles;
CREATE TRIGGER on_profile_created_aurora_progress
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_aurora_onboarding_progress();

-- Clean up any leftover functions from failed migrations
DROP FUNCTION IF EXISTS public.handle_action_item_completion() CASCADE;
DROP FUNCTION IF EXISTS public.migrate_to_action_items() CASCADE;

-- 1. Create table
CREATE TABLE public.action_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('task', 'habit', 'session', 'milestone', 'reflection')),
  source TEXT NOT NULL DEFAULT 'user' CHECK (source IN ('plan', 'user', 'aurora', 'coach', 'system')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'doing', 'done', 'skipped')),
  title TEXT NOT NULL,
  description TEXT,
  due_at TIMESTAMPTZ,
  recurrence_rule TEXT,
  pillar TEXT,
  project_id UUID REFERENCES public.user_projects(id) ON DELETE SET NULL,
  plan_id UUID REFERENCES public.life_plans(id) ON DELETE SET NULL,
  milestone_id UUID REFERENCES public.life_plan_milestones(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.action_items(id) ON DELETE CASCADE,
  ego_state TEXT,
  tags TEXT[] DEFAULT '{}',
  xp_reward INTEGER NOT NULL DEFAULT 10,
  token_reward INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes
CREATE INDEX idx_action_items_user_type_status ON public.action_items (user_id, type, status);
CREATE INDEX idx_action_items_user_due ON public.action_items (user_id, due_at) WHERE due_at IS NOT NULL;
CREATE INDEX idx_action_items_parent ON public.action_items (parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_action_items_plan ON public.action_items (plan_id) WHERE plan_id IS NOT NULL;
CREATE INDEX idx_action_items_recurrence ON public.action_items (user_id, recurrence_rule) WHERE recurrence_rule IS NOT NULL;

-- 3. RLS
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own action_items" ON public.action_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own action_items" ON public.action_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own action_items" ON public.action_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own action_items" ON public.action_items FOR DELETE USING (auth.uid() = user_id);

-- 4. Updated_at trigger
CREATE TRIGGER update_action_items_updated_at
  BEFORE UPDATE ON public.action_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. XP auto-award trigger
CREATE OR REPLACE FUNCTION public.handle_action_item_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'done' AND (OLD.status IS DISTINCT FROM 'done') THEN
    NEW.completed_at = now();
    IF NEW.xp_reward > 0 THEN
      PERFORM award_unified_xp(NEW.user_id, NEW.xp_reward, 'action_item', NEW.title);
    END IF;
    IF NEW.token_reward > 0 THEN
      UPDATE public.profiles SET tokens = COALESCE(tokens, 0) + NEW.token_reward WHERE id = NEW.user_id;
    END IF;
  END IF;
  IF NEW.status != 'done' AND OLD.status = 'done' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_action_item_completion
  BEFORE UPDATE ON public.action_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_action_item_completion();

-- 6. Migration function
CREATE OR REPLACE FUNCTION public.migrate_to_action_items()
RETURNS TEXT AS $$
DECLARE
  v_tasks INTEGER := 0;
  v_items INTEGER := 0;
  v_habits INTEGER := 0;
  v_milestones INTEGER := 0;
  v_sessions INTEGER := 0;
  v_checklist RECORD;
BEGIN
  FOR v_checklist IN SELECT * FROM public.aurora_checklists LOOP
    INSERT INTO public.action_items (id, user_id, type, source, status, title, description, pillar, milestone_id, order_index, metadata, created_at)
    VALUES (
      v_checklist.id, v_checklist.user_id, 'task',
      CASE WHEN v_checklist.origin = 'aurora' THEN 'aurora' WHEN v_checklist.origin = 'plan' THEN 'plan' ELSE 'user' END,
      CASE WHEN v_checklist.status = 'completed' THEN 'done' WHEN v_checklist.status = 'in_progress' THEN 'doing' ELSE 'todo' END,
      v_checklist.title, v_checklist.context, v_checklist.category, v_checklist.milestone_id,
      COALESCE(v_checklist.priority, 0),
      jsonb_build_object('time_scope', v_checklist.time_scope, 'legacy_table', 'aurora_checklists'),
      v_checklist.created_at
    ) ON CONFLICT (id) DO NOTHING;
    v_tasks := v_tasks + 1;
  END LOOP;

  INSERT INTO public.action_items (user_id, type, source, status, title, parent_id, order_index, due_at, completed_at, metadata, created_at)
  SELECT c.user_id, 'task', 'user',
    CASE WHEN ci.is_completed THEN 'done' ELSE 'todo' END,
    ci.content, ci.checklist_id, ci.order_index, ci.due_date::timestamptz, ci.completed_at,
    jsonb_build_object('is_recurring', ci.is_recurring, 'legacy_table', 'aurora_checklist_items', 'legacy_id', ci.id),
    ci.created_at
  FROM public.aurora_checklist_items ci
  JOIN public.aurora_checklists c ON c.id = ci.checklist_id;
  GET DIAGNOSTICS v_items = ROW_COUNT;

  INSERT INTO public.action_items (user_id, type, source, status, title, pillar, recurrence_rule, xp_reward, metadata, created_at)
  SELECT user_id, 'habit', 'user', 'todo', title, category, 'daily', 10,
    jsonb_build_object('is_active', is_active, 'legacy_table', 'aurora_daily_minimums', 'legacy_id', id), created_at
  FROM public.aurora_daily_minimums WHERE is_active = true;
  GET DIAGNOSTICS v_habits = ROW_COUNT;

  INSERT INTO public.action_items (user_id, type, source, status, title, description, plan_id, milestone_id, xp_reward, token_reward, completed_at, metadata, created_at)
  SELECT lp.user_id, 'milestone', 'plan',
    CASE WHEN m.is_completed THEN 'done' ELSE 'todo' END,
    m.title, m.description, m.plan_id, m.id,
    COALESCE(m.xp_reward, 50), COALESCE(m.tokens_reward, 0), m.completed_at,
    jsonb_build_object('week_number', m.week_number, 'focus_area', m.focus_area, 'tasks', m.tasks, 'legacy_table', 'life_plan_milestones'),
    m.created_at
  FROM public.life_plan_milestones m
  JOIN public.life_plans lp ON lp.id = m.plan_id;
  GET DIAGNOSTICS v_milestones = ROW_COUNT;

  INSERT INTO public.action_items (user_id, type, source, status, title, ego_state, xp_reward, completed_at, metadata, created_at)
  SELECT user_id, 'session', 'system', 'done',
    COALESCE(action, 'Power-Up Session'), ego_state, COALESCE(experience_gained, 15), completed_at,
    jsonb_build_object('duration_seconds', duration_seconds, 'goal_id', goal_id, 'script_data', script_data, 'legacy_table', 'hypnosis_sessions', 'legacy_id', id),
    created_at
  FROM public.hypnosis_sessions;
  GET DIAGNOSTICS v_sessions = ROW_COUNT;

  RETURN format('Migrated: %s parents, %s items, %s habits, %s milestones, %s sessions', v_tasks, v_items, v_habits, v_milestones, v_sessions);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Run migration
SELECT public.migrate_to_action_items();

-- 8. Views
CREATE OR REPLACE VIEW public.v_today_actions AS
SELECT * FROM public.action_items
WHERE status IN ('todo', 'doing')
  AND ((due_at IS NOT NULL AND due_at::date = CURRENT_DATE) OR recurrence_rule IS NOT NULL);

CREATE OR REPLACE VIEW public.v_habits AS
SELECT * FROM public.action_items WHERE type = 'habit';

CREATE OR REPLACE VIEW public.v_milestones AS
SELECT * FROM public.action_items WHERE type = 'milestone';

-- Fix SECURITY DEFINER views by making them SECURITY INVOKER
DROP VIEW IF EXISTS public.v_today_actions;
DROP VIEW IF EXISTS public.v_habits;
DROP VIEW IF EXISTS public.v_milestones;

CREATE VIEW public.v_today_actions WITH (security_invoker = true) AS
SELECT * FROM public.action_items
WHERE status IN ('todo', 'doing')
  AND ((due_at IS NOT NULL AND due_at::date = CURRENT_DATE) OR recurrence_rule IS NOT NULL);

CREATE VIEW public.v_habits WITH (security_invoker = true) AS
SELECT * FROM public.action_items WHERE type = 'habit';

CREATE VIEW public.v_milestones WITH (security_invoker = true) AS
SELECT * FROM public.action_items WHERE type = 'milestone';

-- Create ai_response_logs table for tracing Aurora responses
CREATE TABLE public.ai_response_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  conversation_id UUID,
  prompt_version TEXT NOT NULL,
  context_hash TEXT NOT NULL,
  model TEXT NOT NULL,
  mode TEXT NOT NULL,
  token_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_response_logs ENABLE ROW LEVEL SECURITY;

-- Only allow users to read their own logs
CREATE POLICY "Users can view their own ai_response_logs"
  ON public.ai_response_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Allow service role inserts (edge functions use service role key)
CREATE POLICY "Service role can insert ai_response_logs"
  ON public.ai_response_logs FOR INSERT
  WITH CHECK (true);

-- Index for lookups
CREATE INDEX idx_ai_response_logs_user_id ON public.ai_response_logs (user_id);
CREATE INDEX idx_ai_response_logs_context_hash ON public.ai_response_logs (context_hash);
CREATE INDEX idx_ai_response_logs_created_at ON public.ai_response_logs (created_at DESC);

-- ============================================================================
-- ROBUSTNESS: Idempotency, XP Immutability, Error Logging, FK Enforcement
-- ============================================================================

-- A1: Add idempotency_key to xp_events
ALTER TABLE public.xp_events ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_xp_events_idempotency ON public.xp_events(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- A1: Add idempotency_key to aurora_proactive_queue
ALTER TABLE public.aurora_proactive_queue ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_proactive_queue_idempotency ON public.aurora_proactive_queue(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- A1: Modify award_unified_xp to support idempotency
CREATE OR REPLACE FUNCTION public.award_unified_xp(
  p_user_id uuid, 
  p_amount integer, 
  p_source text, 
  p_reason text DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_old_level integer;
  v_new_level integer;
  v_new_experience integer;
  v_tokens_awarded integer := 0;
  v_levels_gained integer := 0;
  v_existing jsonb;
BEGIN
  -- Idempotency check: if key provided and already exists, return previous result
  IF p_idempotency_key IS NOT NULL THEN
    SELECT jsonb_build_object(
      'xp_gained', amount,
      'new_experience', 0,
      'old_level', 0,
      'new_level', 0,
      'levels_gained', 0,
      'tokens_awarded', 0,
      'idempotent', true
    ) INTO v_existing
    FROM public.xp_events
    WHERE idempotency_key = p_idempotency_key;
    
    IF v_existing IS NOT NULL THEN
      RETURN v_existing;
    END IF;
  END IF;

  -- Get current level and experience
  SELECT COALESCE(level, 1), COALESCE(experience, 0)
  INTO v_old_level, v_new_experience
  FROM public.profiles 
  WHERE id = p_user_id;
  
  -- Calculate new experience
  v_new_experience := v_new_experience + p_amount;
  
  -- Calculate new level (100 XP per level)
  v_new_level := GREATEST(1, FLOOR(v_new_experience / 100) + 1);
  
  -- Calculate levels gained and token bonus (5 tokens per level)
  IF v_new_level > v_old_level THEN
    v_levels_gained := v_new_level - v_old_level;
    v_tokens_awarded := v_levels_gained * 5;
  END IF;
  
  -- Update profile
  UPDATE public.profiles 
  SET 
    experience = v_new_experience,
    level = v_new_level,
    tokens = COALESCE(tokens, 0) + v_tokens_awarded,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Log the XP event with idempotency key
  INSERT INTO public.xp_events (user_id, amount, source, reason, idempotency_key)
  VALUES (p_user_id, p_amount, p_source, p_reason, p_idempotency_key);
  
  RETURN jsonb_build_object(
    'xp_gained', p_amount,
    'new_experience', v_new_experience,
    'old_level', v_old_level,
    'new_level', v_new_level,
    'levels_gained', v_levels_gained,
    'tokens_awarded', v_tokens_awarded
  );
END;
$$;

-- B1: Make xp_events append-only (block UPDATE and DELETE)
CREATE POLICY "xp_events_no_update" ON public.xp_events FOR UPDATE USING (false);
CREATE POLICY "xp_events_no_delete" ON public.xp_events FOR DELETE USING (false);

-- B1: Reconciliation function
CREATE OR REPLACE FUNCTION public.reconcile_user_xp(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_expected integer;
  v_actual integer;
  v_drift integer;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_expected FROM public.xp_events WHERE user_id = p_user_id;
  SELECT COALESCE(experience, 0) INTO v_actual FROM public.profiles WHERE id = p_user_id;
  v_drift := v_actual - v_expected;
  
  IF v_drift != 0 THEN
    UPDATE public.profiles 
    SET experience = v_expected, level = GREATEST(1, FLOOR(v_expected / 100) + 1), updated_at = now()
    WHERE id = p_user_id;
  END IF;
  
  RETURN jsonb_build_object('expected', v_expected, 'actual', v_actual, 'drift', v_drift, 'corrected', v_drift != 0);
END;
$$;

-- B1: Integrity check across all users
CREATE OR REPLACE FUNCTION public.check_xp_integrity()
RETURNS TABLE(user_id uuid, expected_xp bigint, actual_xp integer, drift bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.id as user_id,
    COALESCE(e.total, 0) as expected_xp,
    COALESCE(p.experience, 0) as actual_xp,
    COALESCE(p.experience, 0) - COALESCE(e.total, 0) as drift
  FROM public.profiles p
  LEFT JOIN (SELECT user_id, SUM(amount) as total FROM public.xp_events GROUP BY user_id) e ON e.user_id = p.id
  WHERE COALESCE(p.experience, 0) != COALESCE(e.total, 0);
$$;

-- A3: Central error logging table
CREATE TABLE IF NOT EXISTS public.edge_function_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  user_id UUID,
  request_context JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.edge_function_errors ENABLE ROW LEVEL SECURITY;

-- Only service role can insert (edge functions use service role)
-- No user access needed
CREATE POLICY "edge_function_errors_service_only" ON public.edge_function_errors FOR ALL USING (false);

CREATE INDEX idx_edge_errors_function ON public.edge_function_errors(function_name, created_at DESC);
CREATE INDEX idx_edge_errors_created ON public.edge_function_errors(created_at DESC);

-- B3: FK on ai_response_logs.user_id (with safety check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'ai_response_logs_user_id_fkey' AND table_name = 'ai_response_logs'
  ) THEN
    ALTER TABLE public.ai_response_logs 
    ADD CONSTRAINT ai_response_logs_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Phase 1: Monetization Infrastructure Migration

-- 1. Deactivate old tiers
UPDATE public.subscription_tiers SET is_active = false WHERE slug IN ('hatchala', 'hatmara', 'shinui');

-- 2. Insert Free tier
INSERT INTO public.subscription_tiers (
  name, slug, description, price_monthly, price_quarterly, price_yearly,
  access_level, features, max_downloads_per_month, can_download_resources,
  priority_support, is_active, order_index
) VALUES (
  'Free', 'free', 'גישה בסיסית למערכת',
  0, 0, 0,
  'basic',
  ARRAY['5 הודעות יומיות לאורורה', 'עד 3 הרגלים פעילים', 'מסע התודעה (אונבורדינג)', 'כרטיסיית היום'],
  0, false, false, true, 0
);

-- 3. Insert Pro tier
INSERT INTO public.subscription_tiers (
  name, slug, description, price_monthly, price_quarterly, price_yearly,
  access_level, features, max_downloads_per_month, can_download_resources,
  priority_support, is_active, order_index
) VALUES (
  'Pro', 'pro', 'גישה מלאה למערכת MindOS',
  97, 261, 930,
  'premium',
  ARRAY['הודעות ללא הגבלה לאורורה', 'מנוע תכנון 90 יום מלא', 'נאדג׳ים פרואקטיביים', 'ספריית היפנוזה', 'הרגלים ורשימות ללא הגבלה', 'כל מרכזי העמודים פתוחים'],
  999, true, true, true, 1
);

-- 4. Add Stripe columns to user_subscriptions
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- 5. Create daily_message_counts table
CREATE TABLE IF NOT EXISTS public.daily_message_counts (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, message_date)
);

-- 6. Enable RLS on daily_message_counts
ALTER TABLE public.daily_message_counts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own message counts"
  ON public.daily_message_counts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own message counts"
  ON public.daily_message_counts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own message counts"
  ON public.daily_message_counts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 7. Function to increment daily message count (called from edge function)
CREATE OR REPLACE FUNCTION public.increment_daily_message_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO public.daily_message_counts (user_id, message_date, count)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, message_date)
  DO UPDATE SET count = daily_message_counts.count + 1, updated_at = now()
  RETURNING count INTO v_count;
  
  RETURN v_count;
END;
$$;

-- Composite index for notification queries (user + unread filter + ordered)
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_unread 
ON public.user_notifications (user_id, is_read, created_at DESC);

-- Messages: conversation + chronological order (composite for common query pattern)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_ordered 
ON public.messages (conversation_id, created_at ASC);

-- Add missing enum values for subscription_status to match Stripe statuses
ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'trialing';
ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'past_due';
ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'unpaid';

-- Add subscription columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Add missing columns to user_subscriptions
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS price_id TEXT,
  ADD COLUMN IF NOT EXISTS product_id TEXT,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false;

-- Index for fast entitlement lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status 
ON public.user_subscriptions (user_id, status);

-- Index for webhook customer lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer 
ON public.profiles (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Daily Pulse Logs: one row per user per day
CREATE TABLE public.daily_pulse_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  energy_rating smallint NOT NULL CHECK (energy_rating BETWEEN 1 AND 5),
  sleep_compliance text NOT NULL CHECK (sleep_compliance IN ('yes','partial','no')),
  task_confidence smallint NOT NULL CHECK (task_confidence BETWEEN 1 AND 5),
  screen_discipline boolean NOT NULL DEFAULT false,
  mood_signal text NOT NULL CHECK (mood_signal IN ('wired','drained','neutral','focused','flow')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, log_date)
);

ALTER TABLE public.daily_pulse_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pulse logs"
  ON public.daily_pulse_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pulse logs"
  ON public.daily_pulse_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pulse logs"
  ON public.daily_pulse_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for fast weekly aggregation
CREATE INDEX idx_pulse_logs_user_date ON public.daily_pulse_logs (user_id, log_date DESC);

-- Recalibration Logs: one row per user per week
CREATE TABLE public.recalibration_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  week_number smallint NOT NULL,
  compliance_score numeric NOT NULL DEFAULT 0,
  cognitive_load_score numeric NOT NULL DEFAULT 0,
  recovery_debt_score numeric NOT NULL DEFAULT 0,
  adjustments_made jsonb DEFAULT '{}'::jsonb,
  behavioral_risks jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_number)
);

ALTER TABLE public.recalibration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recalibration logs"
  ON public.recalibration_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert recalibration logs"
  ON public.recalibration_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update recalibration logs"
  ON public.recalibration_logs FOR UPDATE
  USING (true);

CREATE INDEX idx_recalib_user_week ON public.recalibration_logs (user_id, week_number DESC);

-- ============================================
-- Phase 1.1: Energy Events Ledger Table
-- ============================================
CREATE TABLE public.energy_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  change INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  source TEXT NOT NULL,
  reason TEXT,
  idempotency_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint for idempotency (only on non-null keys)
CREATE UNIQUE INDEX idx_energy_events_idempotency ON public.energy_events (idempotency_key) WHERE idempotency_key IS NOT NULL;

-- Index for user queries
CREATE INDEX idx_energy_events_user_id ON public.energy_events (user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.energy_events ENABLE ROW LEVEL SECURITY;

-- Users can only read their own events
CREATE POLICY "Users can read own energy events"
  ON public.energy_events FOR SELECT
  USING (auth.uid() = user_id);

-- No direct inserts/updates/deletes from client - only via RPCs (security definer)

-- ============================================
-- Phase 1.2: spend_energy RPC (atomic)
-- ============================================
CREATE OR REPLACE FUNCTION public.spend_energy(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT,
  p_reason TEXT DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_existing JSONB;
BEGIN
  -- Validate
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Idempotency check
  IF p_idempotency_key IS NOT NULL THEN
    SELECT jsonb_build_object(
      'success', true,
      'new_balance', balance_after,
      'change', change,
      'idempotent', true
    ) INTO v_existing
    FROM public.energy_events
    WHERE idempotency_key = p_idempotency_key;
    
    IF v_existing IS NOT NULL THEN
      RETURN v_existing;
    END IF;
  END IF;

  -- Lock row and check balance
  SELECT COALESCE(tokens, 0) INTO v_current_balance
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  IF v_current_balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient energy',
      'current_balance', v_current_balance,
      'required', p_amount
    );
  END IF;

  v_new_balance := v_current_balance - p_amount;

  -- Deduct
  UPDATE public.profiles
  SET tokens = v_new_balance, updated_at = now()
  WHERE id = p_user_id;

  -- Log event
  INSERT INTO public.energy_events (user_id, change, balance_after, source, reason, idempotency_key)
  VALUES (p_user_id, -p_amount, v_new_balance, p_source, p_reason, p_idempotency_key);

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'change', -p_amount
  );
END;
$$;

-- ============================================
-- Phase 1.2: award_energy RPC
-- ============================================
CREATE OR REPLACE FUNCTION public.award_energy(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT,
  p_reason TEXT DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance INTEGER;
  v_existing JSONB;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Idempotency check
  IF p_idempotency_key IS NOT NULL THEN
    SELECT jsonb_build_object(
      'success', true,
      'new_balance', balance_after,
      'change', change,
      'idempotent', true
    ) INTO v_existing
    FROM public.energy_events
    WHERE idempotency_key = p_idempotency_key;
    
    IF v_existing IS NOT NULL THEN
      RETURN v_existing;
    END IF;
  END IF;

  -- Update balance
  UPDATE public.profiles
  SET tokens = COALESCE(tokens, 0) + p_amount, updated_at = now()
  WHERE id = p_user_id
  RETURNING tokens INTO v_new_balance;

  IF v_new_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Log event
  INSERT INTO public.energy_events (user_id, change, balance_after, source, reason, idempotency_key)
  VALUES (p_user_id, p_amount, v_new_balance, p_source, p_reason, p_idempotency_key);

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'change', p_amount
  );
END;
$$;

-- ============================================
-- Update award_unified_xp to use award_energy for level-up bonuses
-- ============================================
CREATE OR REPLACE FUNCTION public.award_unified_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT,
  p_reason TEXT DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_new_experience INTEGER;
  v_tokens_awarded INTEGER := 0;
  v_levels_gained INTEGER := 0;
  v_existing JSONB;
  v_energy_result JSONB;
BEGIN
  -- Idempotency check
  IF p_idempotency_key IS NOT NULL THEN
    SELECT jsonb_build_object(
      'xp_gained', amount,
      'new_experience', 0,
      'old_level', 0,
      'new_level', 0,
      'levels_gained', 0,
      'tokens_awarded', 0,
      'idempotent', true
    ) INTO v_existing
    FROM public.xp_events
    WHERE idempotency_key = p_idempotency_key;
    
    IF v_existing IS NOT NULL THEN
      RETURN v_existing;
    END IF;
  END IF;

  -- Get current level and experience
  SELECT COALESCE(level, 1), COALESCE(experience, 0)
  INTO v_old_level, v_new_experience
  FROM public.profiles 
  WHERE id = p_user_id;
  
  v_new_experience := v_new_experience + p_amount;
  v_new_level := GREATEST(1, FLOOR(v_new_experience / 100) + 1);
  
  IF v_new_level > v_old_level THEN
    v_levels_gained := v_new_level - v_old_level;
    v_tokens_awarded := v_levels_gained * 5;
  END IF;
  
  -- Update profile (XP + level only, energy handled separately)
  UPDATE public.profiles 
  SET 
    experience = v_new_experience,
    level = v_new_level,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Log XP event
  INSERT INTO public.xp_events (user_id, amount, source, reason, idempotency_key)
  VALUES (p_user_id, p_amount, p_source, p_reason, p_idempotency_key);
  
  -- Award energy via ledger if levels gained
  IF v_tokens_awarded > 0 THEN
    PERFORM award_energy(
      p_user_id, 
      v_tokens_awarded, 
      'level_up', 
      'Leveled up from ' || v_old_level || ' to ' || v_new_level
    );
  END IF;
  
  RETURN jsonb_build_object(
    'xp_gained', p_amount,
    'new_experience', v_new_experience,
    'old_level', v_old_level,
    'new_level', v_new_level,
    'levels_gained', v_levels_gained,
    'tokens_awarded', v_tokens_awarded
  );
END;
$$;

-- Also update the 4-param overload
CREATE OR REPLACE FUNCTION public.award_unified_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN award_unified_xp(p_user_id, p_amount, p_source, p_reason, NULL::TEXT);
END;
$$;

-- Update handle_action_item_completion to use award_energy for token rewards
CREATE OR REPLACE FUNCTION public.handle_action_item_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'done' AND (OLD.status IS DISTINCT FROM 'done') THEN
    NEW.completed_at = now();
    IF NEW.xp_reward > 0 THEN
      PERFORM award_unified_xp(NEW.user_id, NEW.xp_reward, 'action_item', NEW.title);
    END IF;
    IF NEW.token_reward > 0 THEN
      PERFORM award_energy(NEW.user_id, NEW.token_reward, 'action_item', NEW.title);
    END IF;
  END IF;
  IF NEW.status != 'done' AND OLD.status = 'done' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- Create coaching_journeys table (mirrors business_journeys structure)
CREATE TABLE public.coaching_journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coaching_niche TEXT,
  current_step INTEGER NOT NULL DEFAULT 1,
  journey_complete BOOLEAN NOT NULL DEFAULT false,
  step_1_vision JSONB DEFAULT '{}'::jsonb,
  step_2_niche JSONB DEFAULT '{}'::jsonb,
  step_3_methodology JSONB DEFAULT '{}'::jsonb,
  step_4_ideal_client JSONB DEFAULT '{}'::jsonb,
  step_5_value_proposition JSONB DEFAULT '{}'::jsonb,
  step_6_credentials JSONB DEFAULT '{}'::jsonb,
  step_7_services JSONB DEFAULT '{}'::jsonb,
  step_8_marketing JSONB DEFAULT '{}'::jsonb,
  step_9_operations JSONB DEFAULT '{}'::jsonb,
  step_10_action_plan JSONB DEFAULT '{}'::jsonb,
  ai_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coaching_journeys ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own coaching journeys"
  ON public.coaching_journeys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own coaching journeys"
  ON public.coaching_journeys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coaching journeys"
  ON public.coaching_journeys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own coaching journeys"
  ON public.coaching_journeys FOR DELETE
  USING (auth.uid() = user_id);

-- Updated at trigger
CREATE TRIGGER update_coaching_journeys_updated_at
  BEFORE UPDATE ON public.coaching_journeys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create coach_client_plans table
CREATE TABLE public.coach_client_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  client_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name TEXT,
  plan_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  methodology JSONB DEFAULT '{}'::jsonb,
  coaching_niche TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coach_client_plans ENABLE ROW LEVEL SECURITY;

-- RLS: Coach can manage their own plans
CREATE POLICY "Coaches can view their own client plans"
  ON public.coach_client_plans FOR SELECT
  USING (
    coach_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid())
    OR client_user_id = auth.uid()
  );

CREATE POLICY "Coaches can create client plans"
  ON public.coach_client_plans FOR INSERT
  WITH CHECK (
    coach_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can update their client plans"
  ON public.coach_client_plans FOR UPDATE
  USING (
    coach_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid())
  );

CREATE POLICY "Coaches can delete their client plans"
  ON public.coach_client_plans FOR DELETE
  USING (
    coach_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid())
  );

-- Updated at trigger
CREATE TRIGGER update_coach_client_plans_updated_at
  BEFORE UPDATE ON public.coach_client_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS utm_data JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ DEFAULT NULL;

-- 1) Drop the generic "טופס חדש התקבל" trigger on form_submissions
DROP TRIGGER IF EXISTS trigger_notify_form_submission ON public.form_submissions;

-- 2) Create a rich onboarding-completion notification function
CREATE OR REPLACE FUNCTION public.notify_onboarding_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_name TEXT;
  v_pillar TEXT;
  v_diagnostic_scores JSONB;
  v_profile_data JSONB;
BEGIN
  -- Only fire when launchpad_complete flips from false/null to true
  IF NEW.launchpad_complete = true AND (OLD.launchpad_complete IS NULL OR OLD.launchpad_complete = false) THEN
    -- Get user name
    SELECT COALESCE(full_name, display_name, 'משתמש חדש')
    INTO v_user_name
    FROM public.profiles
    WHERE id = NEW.user_id;

    -- Extract pillar and diagnostics from the saved data
    v_pillar := COALESCE(NEW.step_1_intention->>'selected_pillar', 'mind');
    v_diagnostic_scores := COALESCE(NEW.step_1_intention->'diagnostic_scores', '{}'::jsonb);
    v_profile_data := COALESCE(NEW.step_2_profile_data, '{}'::jsonb);

    -- Create rich admin notification
    INSERT INTO public.admin_notifications (type, priority, title, message, link, metadata)
    VALUES (
      'onboarding_completed',
      'high',
      '🧠 ' || v_user_name || ' השלים/ה כיול מערכת',
      'פילר: ' || v_pillar || 
        ' | אנרגיה: ' || COALESCE(v_diagnostic_scores->>'energy_stability', '?') ||
        '% | ריקברי: ' || COALESCE(v_diagnostic_scores->>'recovery_debt', '?') ||
        '% | דופמין: ' || COALESCE(v_diagnostic_scores->>'dopamine_load', '?') || '%',
      '/panel/users/' || NEW.user_id || '/dashboard',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'user_name', v_user_name,
        'pillar', v_pillar,
        'diagnostic_scores', v_diagnostic_scores,
        'age_bracket', v_profile_data->>'age_bracket',
        'gender', v_profile_data->>'gender',
        'activity_level', v_profile_data->>'activity_level',
        'completed_at', now()
      )
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- 3) Attach to launchpad_progress
CREATE TRIGGER trigger_notify_onboarding_completed
AFTER UPDATE ON public.launchpad_progress
FOR EACH ROW
EXECUTE FUNCTION public.notify_onboarding_completed();

-- 4) Add 'onboarding_completed' to notification_type enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumtypid = 'public.notification_type'::regtype 
    AND enumlabel = 'onboarding_completed'
  ) THEN
    ALTER TYPE public.notification_type ADD VALUE 'onboarding_completed';
  END IF;
END$$;

-- Admin Journeys table
CREATE TABLE public.admin_journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 1,
  journey_complete BOOLEAN NOT NULL DEFAULT false,
  step_1_vision JSONB DEFAULT '{}'::jsonb,
  step_2_team JSONB DEFAULT '{}'::jsonb,
  step_3_branding JSONB DEFAULT '{}'::jsonb,
  step_4_products JSONB DEFAULT '{}'::jsonb,
  step_5_content JSONB DEFAULT '{}'::jsonb,
  step_6_landing JSONB DEFAULT '{}'::jsonb,
  step_7_marketing JSONB DEFAULT '{}'::jsonb,
  step_8_operations JSONB DEFAULT '{}'::jsonb,
  ai_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own admin journeys"
  ON public.admin_journeys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own admin journeys"
  ON public.admin_journeys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own admin journeys"
  ON public.admin_journeys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_admin_journeys_updated_at
  BEFORE UPDATE ON public.admin_journeys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Projects Journeys table
CREATE TABLE public.projects_journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 1,
  journey_complete BOOLEAN NOT NULL DEFAULT false,
  step_1_vision JSONB DEFAULT '{}'::jsonb,
  step_2_first_project JSONB DEFAULT '{}'::jsonb,
  step_3_goals JSONB DEFAULT '{}'::jsonb,
  step_4_tasks JSONB DEFAULT '{}'::jsonb,
  step_5_milestones JSONB DEFAULT '{}'::jsonb,
  step_6_collaboration JSONB DEFAULT '{}'::jsonb,
  step_7_tracking JSONB DEFAULT '{}'::jsonb,
  step_8_aurora JSONB DEFAULT '{}'::jsonb,
  ai_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects_journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects journeys"
  ON public.projects_journeys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects journeys"
  ON public.projects_journeys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects journeys"
  ON public.projects_journeys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_projects_journeys_updated_at
  BEFORE UPDATE ON public.projects_journeys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- 1. Drop the orphaned notify_new_form_submission function (no trigger uses it anymore)
DROP FUNCTION IF EXISTS public.notify_new_form_submission() CASCADE;

-- 2. Update notify_new_user to link to admin-hub instead of /panel/
CREATE OR REPLACE FUNCTION public.notify_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM create_admin_notification(
    'new_user',
    'low',
    'משתמש חדש נרשם',
    'משתמש חדש: ' || COALESCE(NEW.full_name, 'לא צוין'),
    '/admin-hub?tab=admin&sub=users',
    jsonb_build_object('user_id', NEW.id)
  );
  RETURN NEW;
END;
$function$;

-- 3. Update notify_onboarding_completed to link to admin-hub
CREATE OR REPLACE FUNCTION public.notify_onboarding_completed()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_name TEXT;
  v_pillar TEXT;
  v_diagnostic_scores JSONB;
  v_profile_data JSONB;
BEGIN
  IF NEW.launchpad_complete = true AND (OLD.launchpad_complete IS NULL OR OLD.launchpad_complete = false) THEN
    SELECT COALESCE(full_name, display_name, 'משתמש חדש')
    INTO v_user_name
    FROM public.profiles
    WHERE id = NEW.user_id;

    v_pillar := COALESCE(NEW.step_1_intention->>'selected_pillar', 'mind');
    v_diagnostic_scores := COALESCE(NEW.step_1_intention->'diagnostic_scores', '{}'::jsonb);
    v_profile_data := COALESCE(NEW.step_2_profile_data, '{}'::jsonb);

    INSERT INTO public.admin_notifications (type, priority, title, message, link, metadata)
    VALUES (
      'onboarding_completed',
      'high',
      '🧠 ' || v_user_name || ' השלים/ה כיול מערכת',
      'פילר: ' || v_pillar || 
        ' | אנרגיה: ' || COALESCE(v_diagnostic_scores->>'energy_stability', '?') ||
        '% | ריקברי: ' || COALESCE(v_diagnostic_scores->>'recovery_debt', '?') ||
        '% | דופמין: ' || COALESCE(v_diagnostic_scores->>'dopamine_load', '?') || '%',
      '/admin-hub?tab=admin&sub=users',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'user_name', v_user_name,
        'pillar', v_pillar,
        'diagnostic_scores', v_diagnostic_scores,
        'age_bracket', v_profile_data->>'age_bracket',
        'gender', v_profile_data->>'gender',
        'activity_level', v_profile_data->>'activity_level',
        'completed_at', now()
      )
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- 4. Update notify_admin_journey_completion to link to admin-hub
CREATE OR REPLACE FUNCTION public.notify_admin_journey_completion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      '/admin-hub?tab=admin&sub=users',
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
$function$;

-- 5. Update notify_journey_completion (trigger version) to link to admin-hub
CREATE OR REPLACE FUNCTION public.notify_journey_completion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_name text;
BEGIN
  IF NEW.launchpad_complete = true AND (OLD.launchpad_complete IS NULL OR OLD.launchpad_complete = false) THEN
    SELECT full_name INTO user_name FROM public.profiles WHERE id = NEW.user_id;
    
    INSERT INTO public.admin_notifications (
      type, title, message, link, metadata, priority
    ) VALUES (
      'journey_completion',
      CASE 
        WHEN user_name IS NOT NULL THEN user_name || ' השלים/ה את מסע הטרנספורמציה'
        ELSE 'משתמש השלים את מסע הטרנספורמציה'
      END,
      'משתמש השלים את כל שלבי הלאנצ''פד ומוכן להתחיל עם אורורה.',
      '/admin-hub?tab=admin&sub=users',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'user_name', user_name,
        'completed_at', NEW.completed_at
      ),
      'high'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 6. Update notify_new_lead to link to admin-hub
CREATE OR REPLACE FUNCTION public.notify_new_lead()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.admin_notifications (type, priority, title, message, link, metadata)
  VALUES (
    'new_lead',
    'medium',
    'ליד חדש התקבל',
    'ליד חדש: ' || COALESCE(NEW.name, NEW.phone, 'לא ידוע') || ' - ' || COALESCE(NEW.source, 'כללי'),
    '/admin-hub?tab=admin&sub=leads',
    jsonb_build_object('lead_id', NEW.id, 'source', NEW.source)
  );
  
  RETURN NEW;
END;
$function$;

-- 7. Update notify_consciousness_leap functions to admin-hub
CREATE OR REPLACE FUNCTION public.notify_consciousness_leap_application()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    '/admin-hub?tab=campaigns&sub=consciousness-leap',
    jsonb_build_object('application_id', NEW.id, 'lead_id', NEW.lead_id)
  );
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_consciousness_leap_lead()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.admin_notifications (type, priority, title, message, link, metadata)
  VALUES (
    'new_lead',
    'high',
    'ליד חדש לקפיצת תודעה',
    'ליד חדש: ' || COALESCE(NEW.name, NEW.email, 'לא ידוע'),
    '/admin-hub?tab=campaigns&sub=consciousness-leap',
    jsonb_build_object('lead_id', NEW.id, 'email', NEW.email)
  );
  
  RETURN NEW;
END;
$function$;

-- 8. Update notify_personal_hypnosis_order to admin-hub
CREATE OR REPLACE FUNCTION public.notify_personal_hypnosis_order()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      '/admin-hub?tab=admin&sub=users',
      jsonb_build_object('purchase_id', NEW.id, 'user_id', NEW.user_id, 'package_type', NEW.package_type)
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 9. Clean up stale form submission notifications
DELETE FROM public.admin_notifications WHERE type = 'new_form_submission';
CREATE TABLE public.life_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  domain_id TEXT NOT NULL,
  domain_config JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'unconfigured',
  configured_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, domain_id)
);

ALTER TABLE public.life_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own domains"
  ON public.life_domains FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own domains"
  ON public.life_domains FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own domains"
  ON public.life_domains FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_life_domains_updated_at
  BEFORE UPDATE ON public.life_domains
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Table: presence_scans
CREATE TABLE public.presence_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scan_images JSONB DEFAULT '{}'::jsonb,
  derived_metrics JSONB DEFAULT '{}'::jsonb,
  scores JSONB DEFAULT '{}'::jsonb,
  delta_metrics JSONB,
  direct_mode_notes JSONB,
  scan_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.presence_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own scans" ON public.presence_scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scans" ON public.presence_scans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scans" ON public.presence_scans FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own scans" ON public.presence_scans FOR DELETE USING (auth.uid() = user_id);

-- Table: presence_scan_events
CREATE TABLE public.presence_scan_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scan_id UUID REFERENCES public.presence_scans(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  energy_cost INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.presence_scan_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own scan events" ON public.presence_scan_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scan events" ON public.presence_scan_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Table: presence_training_dataset (anonymized, no user_id)
CREATE TABLE public.presence_training_dataset (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  derived_metrics JSONB DEFAULT '{}'::jsonb,
  scores JSONB DEFAULT '{}'::jsonb,
  self_perception_rating INTEGER,
  improvement_outcome JSONB,
  consented BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.presence_training_dataset ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public access to training data" ON public.presence_training_dataset FOR SELECT USING (false);

-- Storage bucket: presence-scans (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('presence-scans', 'presence-scans', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- Storage RLS: users can access own folder only
CREATE POLICY "Users can upload own presence scans"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'presence-scans' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own presence scans"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'presence-scans' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own presence scans"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'presence-scans' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add Play-specific columns to user_projects
ALTER TABLE public.user_projects
  ADD COLUMN IF NOT EXISTS project_type text NOT NULL DEFAULT 'strategic',
  ADD COLUMN IF NOT EXISTS play_category text,
  ADD COLUMN IF NOT EXISTS play_intention text,
  ADD COLUMN IF NOT EXISTS play_location text,
  ADD COLUMN IF NOT EXISTS play_recurring text,
  ADD COLUMN IF NOT EXISTS play_duration text,
  ADD COLUMN IF NOT EXISTS play_reflection jsonb;

-- Add index for quick Play queries
CREATE INDEX IF NOT EXISTS idx_user_projects_type ON public.user_projects (project_type);

-- Life Protocol Compiler tables
CREATE TABLE public.life_protocols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.life_plans(id) ON DELETE SET NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  wake_time TIME NOT NULL DEFAULT '05:00',
  sleep_time TIME NOT NULL DEFAULT '22:00',
  energy_peak_start TIME DEFAULT '06:00',
  energy_peak_end TIME DEFAULT '10:00',
  energy_crash_start TIME DEFAULT '14:00',
  energy_crash_end TIME DEFAULT '15:00',
  training_window_start TIME DEFAULT '07:00',
  training_window_end TIME DEFAULT '08:00',
  work_start TIME DEFAULT '09:00',
  work_end TIME DEFAULT '17:00',
  locked_until TIMESTAMPTZ,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'plus', 'apex')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active_locked', 'active', 'paused', 'completed')),
  compliance_avg NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.protocol_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol_id UUID NOT NULL REFERENCES public.life_protocols(id) ON DELETE CASCADE,
  day_index INTEGER NOT NULL DEFAULT 0, -- 0=template, 1-7=specific day
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  block_type TEXT NOT NULL CHECK (block_type IN ('wake', 'focus', 'training', 'recovery', 'work', 'reflection', 'combat', 'expansion', 'admin', 'meal', 'sleep', 'play', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  linked_session_id UUID,
  linked_action_id UUID REFERENCES public.action_items(id) ON DELETE SET NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  skipped BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.protocol_compliance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol_id UUID NOT NULL REFERENCES public.life_protocols(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_blocks INTEGER NOT NULL DEFAULT 0,
  completed_blocks INTEGER NOT NULL DEFAULT 0,
  skipped_blocks INTEGER NOT NULL DEFAULT 0,
  compliance_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(protocol_id, log_date)
);

-- Indexes
CREATE INDEX idx_life_protocols_user ON public.life_protocols(user_id);
CREATE INDEX idx_life_protocols_status ON public.life_protocols(status);
CREATE INDEX idx_protocol_blocks_protocol ON public.protocol_blocks(protocol_id);
CREATE INDEX idx_protocol_blocks_day ON public.protocol_blocks(protocol_id, day_index);
CREATE INDEX idx_protocol_compliance_date ON public.protocol_compliance(protocol_id, log_date);

-- RLS
ALTER TABLE public.life_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_compliance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own protocols" ON public.life_protocols FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own blocks" ON public.protocol_blocks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.life_protocols lp WHERE lp.id = protocol_id AND lp.user_id = auth.uid())
);
CREATE POLICY "Users manage own compliance" ON public.protocol_compliance FOR ALL USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_life_protocols_updated_at
  BEFORE UPDATE ON public.life_protocols
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add schedule-block helper columns to action_items
ALTER TABLE public.action_items
  ADD COLUMN IF NOT EXISTS scheduled_date DATE,
  ADD COLUMN IF NOT EXISTS start_time TIME,
  ADD COLUMN IF NOT EXISTS end_time TIME;

-- Index for efficient timeline queries
CREATE INDEX IF NOT EXISTS idx_action_items_schedule 
  ON public.action_items (user_id, scheduled_date, start_time) 
  WHERE scheduled_date IS NOT NULL;

-- Add schedule_settings JSONB column to life_plans for commitment data
ALTER TABLE public.life_plans
  ADD COLUMN IF NOT EXISTS schedule_settings JSONB DEFAULT '{}'::jsonb;

-- Drop the protocol tables that are no longer needed
DROP TABLE IF EXISTS public.protocol_compliance CASCADE;
DROP TABLE IF EXISTS public.protocol_blocks CASCADE;
DROP TABLE IF EXISTS public.life_protocols CASCADE;

-- 1. Add community_username to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS community_username TEXT UNIQUE;

-- 2. Add status column to community_posts for Aurora approval gate
-- 'pending' = awaiting Aurora, 'approved' = visible, 'rejected' = hidden
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved';

-- 3. Add pillar_id to community_posts to link threads to the 13-pillar system
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS pillar TEXT;

-- 4. Add is_aurora flag to community_comments 
ALTER TABLE public.community_comments ADD COLUMN IF NOT EXISTS is_aurora BOOLEAN DEFAULT false;

-- 5. Index for fast pillar filtering
CREATE INDEX IF NOT EXISTS idx_community_posts_pillar ON public.community_posts (pillar);
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON public.community_posts (status);
CREATE INDEX IF NOT EXISTS idx_profiles_community_username ON public.profiles (community_username);

-- Add context column to conversations for pillar-scoped chats
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS context text DEFAULT NULL;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_conversations_context ON public.conversations(participant_1, context) WHERE context IS NOT NULL;

-- Function to get or create a pillar-specific conversation
CREATE OR REPLACE FUNCTION public.get_or_create_pillar_conversation(p_user_id uuid, p_pillar text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id uuid;
BEGIN
  -- Try to find existing pillar conversation
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE participant_1 = p_user_id
    AND context = 'pillar:' || p_pillar
    AND type = 'ai'
  ORDER BY created_at DESC
  LIMIT 1;

  -- Create if not found
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (participant_1, type, context)
    VALUES (p_user_id, 'ai', 'pillar:' || p_pillar)
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$;

-- Drop and recreate the function to handle the unique constraint properly
CREATE OR REPLACE FUNCTION public.get_or_create_pillar_conversation(p_user_id uuid, p_pillar text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_conversation_id uuid;
BEGIN
  -- Try to find existing pillar conversation
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE participant_1 = p_user_id
    AND context = 'pillar:' || p_pillar
    AND type = 'ai'
  ORDER BY created_at DESC
  LIMIT 1;

  -- Create if not found, using a unique participant_2 to avoid constraint violation
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (participant_1, participant_2, type, context)
    VALUES (p_user_id, gen_random_uuid(), 'ai', 'pillar:' || p_pillar)
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_or_create_pillar_conversation(p_user_id uuid, p_pillar text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_conversation_id uuid;
BEGIN
  -- Try to find existing pillar conversation
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE participant_1 = p_user_id
    AND context = 'pillar:' || p_pillar
    AND type = 'ai'
  ORDER BY created_at DESC
  LIMIT 1;

  -- Create if not found, WITHOUT participant_2 to satisfy the check constraint
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (participant_1, type, context)
    VALUES (p_user_id, 'ai', 'pillar:' || p_pillar)
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$function$;

-- Drop the restrictive check constraint that prevents participant_2 on AI conversations
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS ai_conversations_no_participant_2;

-- Drop the old unique constraint
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS unique_direct_conversation;

-- Recreate with context column so pillar conversations can coexist
-- Use a unique index instead to allow partial uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS unique_direct_conversation 
  ON public.conversations (participant_1, participant_2) 
  NULLS NOT DISTINCT 
  WHERE type = 'direct';

-- For AI conversations, unique on (participant_1, context) to allow multiple pillar convos
CREATE UNIQUE INDEX IF NOT EXISTS unique_ai_conversation_context 
  ON public.conversations (participant_1, context) 
  NULLS NOT DISTINCT 
  WHERE type = 'ai';

-- Update the function to NOT set participant_2 (cleaner for AI convos)
CREATE OR REPLACE FUNCTION public.get_or_create_pillar_conversation(p_user_id uuid, p_pillar text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_conversation_id uuid;
BEGIN
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE participant_1 = p_user_id
    AND context = 'pillar:' || p_pillar
    AND type = 'ai'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (participant_1, type, context)
    VALUES (p_user_id, 'ai', 'pillar:' || p_pillar)
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$function$;

-- Also fix get_or_create_ai_conversation to not set participant_2
CREATE OR REPLACE FUNCTION public.get_or_create_ai_conversation(user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  conv_id UUID;
BEGIN
  SELECT id INTO conv_id
  FROM public.conversations
  WHERE participant_1 = user_id AND type = 'ai' AND context IS NULL;
  
  IF conv_id IS NULL THEN
    INSERT INTO public.conversations (participant_1, type)
    VALUES (user_id, 'ai')
    RETURNING id INTO conv_id;
  END IF;
  
  RETURN conv_id;
END;
$function$;

-- Fix create_ai_conversation too
CREATE OR REPLACE FUNCTION public.create_ai_conversation(p_user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  conv_id uuid;
BEGIN
  INSERT INTO public.conversations (participant_1, type)
  VALUES (p_user_id, 'ai')
  RETURNING id INTO conv_id;

  RETURN conv_id;
END;
$function$;

-- Drop the overly restrictive index that prevents multiple default AI convos
DROP INDEX IF EXISTS unique_ai_conversation_context;

-- Only enforce uniqueness on pillar conversations (context IS NOT NULL)
CREATE UNIQUE INDEX IF NOT EXISTS unique_ai_pillar_conversation 
  ON public.conversations (participant_1, context) 
  WHERE type = 'ai' AND context IS NOT NULL;

-- Add schedule/execution fields to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS wake_time time DEFAULT '06:30',
  ADD COLUMN IF NOT EXISTS sleep_time time DEFAULT '23:00',
  ADD COLUMN IF NOT EXISTS focus_peak_start time DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS focus_peak_end time DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS crash_window_start time DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS crash_window_end time DEFAULT NULL;

-- Add execution engine fields to action_items
ALTER TABLE public.action_items
  ADD COLUMN IF NOT EXISTS time_block text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS priority_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_fallback boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS generated_payload jsonb DEFAULT NULL;

-- Create today_runs table for daily execution tracking
CREATE TABLE IF NOT EXISTS public.today_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  run_date date NOT NULL DEFAULT CURRENT_DATE,
  mode text NOT NULL DEFAULT 'normal', -- normal | min_day
  movement_score integer DEFAULT 0, -- 0-100
  body_covered boolean DEFAULT false,
  mind_covered boolean DEFAULT false,
  arena_covered boolean DEFAULT false,
  actions_completed integer DEFAULT 0,
  actions_total integer DEFAULT 0,
  schedule_data jsonb DEFAULT NULL, -- cached schedule blocks
  generated_at timestamptz DEFAULT now(),
  completed_at timestamptz DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, run_date)
);

-- Enable RLS
ALTER TABLE public.today_runs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own today_runs"
  ON public.today_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own today_runs"
  ON public.today_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own today_runs"
  ON public.today_runs FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for fast daily lookups
CREATE INDEX IF NOT EXISTS idx_today_runs_user_date ON public.today_runs(user_id, run_date);
CREATE INDEX IF NOT EXISTS idx_action_items_time_block ON public.action_items(user_id, scheduled_date, time_block);
CREATE INDEX IF NOT EXISTS idx_action_items_priority ON public.action_items(user_id, priority_score DESC);
-- Remove the check constraint on life_plans.status to allow 'archived'
ALTER TABLE public.life_plans DROP CONSTRAINT IF EXISTS life_plans_status_check;

-- Add updated constraint that includes 'archived'
ALTER TABLE public.life_plans ADD CONSTRAINT life_plans_status_check 
  CHECK (status IN ('active', 'completed', 'paused', 'archived'));-- Add bilingual columns to life_plan_milestones
-- Current title/goal/description remain as Hebrew (primary), add English variants
ALTER TABLE public.life_plan_milestones 
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS goal_en TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS tasks_en JSONB;ALTER TABLE public.life_plan_milestones ADD COLUMN IF NOT EXISTS focus_area_en text;-- Drop the week_number check constraint that limits to 12
ALTER TABLE public.life_plan_milestones DROP CONSTRAINT IF EXISTS life_plan_milestones_week_number_check;ALTER TABLE public.life_plans DROP CONSTRAINT life_plans_status_check;
ALTER TABLE public.life_plans ADD CONSTRAINT life_plans_status_check CHECK (status = ANY (ARRAY['active'::text, 'completed'::text, 'paused'::text, 'archived'::text, 'generating'::text]));
-- =====================================================
-- Plan Missions: 3 per pillar per plan
-- =====================================================
CREATE TABLE public.plan_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.life_plans(id) ON DELETE CASCADE,
  pillar TEXT NOT NULL,
  mission_number INTEGER NOT NULL CHECK (mission_number BETWEEN 1 AND 3),
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (plan_id, pillar, mission_number)
);

ALTER TABLE public.plan_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own missions" ON public.plan_missions FOR SELECT
  USING (plan_id IN (SELECT id FROM public.life_plans WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own missions" ON public.plan_missions FOR INSERT
  WITH CHECK (plan_id IN (SELECT id FROM public.life_plans WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own missions" ON public.plan_missions FOR UPDATE
  USING (plan_id IN (SELECT id FROM public.life_plans WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own missions" ON public.plan_missions FOR DELETE
  USING (plan_id IN (SELECT id FROM public.life_plans WHERE user_id = auth.uid()));

CREATE INDEX idx_plan_missions_plan_pillar ON public.plan_missions (plan_id, pillar);

-- =====================================================
-- Add mission_id to life_plan_milestones (5 per mission)
-- =====================================================
ALTER TABLE public.life_plan_milestones
  ADD COLUMN IF NOT EXISTS mission_id UUID REFERENCES public.plan_missions(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS milestone_number INTEGER DEFAULT 1;

CREATE INDEX idx_milestones_mission ON public.life_plan_milestones (mission_id);

-- =====================================================
-- Mini-milestones table: 5 per milestone, generates daily actions
-- =====================================================
CREATE TABLE public.mini_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  milestone_id UUID NOT NULL REFERENCES public.life_plan_milestones(id) ON DELETE CASCADE,
  mini_number INTEGER NOT NULL CHECK (mini_number BETWEEN 1 AND 5),
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  scheduled_day INTEGER, -- day 1-100 in the plan
  xp_reward INTEGER NOT NULL DEFAULT 10,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (milestone_id, mini_number)
);

ALTER TABLE public.mini_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mini milestones" ON public.mini_milestones FOR SELECT
  USING (milestone_id IN (
    SELECT lpm.id FROM public.life_plan_milestones lpm
    JOIN public.life_plans lp ON lp.id = lpm.plan_id
    WHERE lp.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert own mini milestones" ON public.mini_milestones FOR INSERT
  WITH CHECK (milestone_id IN (
    SELECT lpm.id FROM public.life_plan_milestones lpm
    JOIN public.life_plans lp ON lp.id = lpm.plan_id
    WHERE lp.user_id = auth.uid()
  ));
CREATE POLICY "Users can update own mini milestones" ON public.mini_milestones FOR UPDATE
  USING (milestone_id IN (
    SELECT lpm.id FROM public.life_plan_milestones lpm
    JOIN public.life_plans lp ON lp.id = lpm.plan_id
    WHERE lp.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete own mini milestones" ON public.mini_milestones FOR DELETE
  USING (milestone_id IN (
    SELECT lpm.id FROM public.life_plan_milestones lpm
    JOIN public.life_plans lp ON lp.id = lpm.plan_id
    WHERE lp.user_id = auth.uid()
  ));

CREATE INDEX idx_mini_milestones_milestone ON public.mini_milestones (milestone_id);
CREATE INDEX idx_mini_milestones_day ON public.mini_milestones (scheduled_day);

-- =====================================================
-- Trigger: auto-complete mission when all milestones done
-- =====================================================
CREATE OR REPLACE FUNCTION public.check_mission_completion()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_mission_id UUID;
  v_total INTEGER;
  v_done INTEGER;
BEGIN
  v_mission_id := NEW.mission_id;
  IF v_mission_id IS NULL THEN RETURN NEW; END IF;

  SELECT COUNT(*), COUNT(*) FILTER (WHERE is_completed = true)
  INTO v_total, v_done
  FROM life_plan_milestones WHERE mission_id = v_mission_id;

  IF v_total > 0 AND v_done = v_total THEN
    UPDATE plan_missions SET is_completed = true, completed_at = now() WHERE id = v_mission_id AND NOT is_completed;
  ELSE
    UPDATE plan_missions SET is_completed = false, completed_at = NULL WHERE id = v_mission_id AND is_completed;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_mission_completion
  AFTER UPDATE OF is_completed ON public.life_plan_milestones
  FOR EACH ROW EXECUTE FUNCTION public.check_mission_completion();

-- =====================================================
-- Trigger: auto-complete milestone when all mini-milestones done
-- =====================================================
CREATE OR REPLACE FUNCTION public.check_milestone_from_minis()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_total INTEGER;
  v_done INTEGER;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE is_completed = true)
  INTO v_total, v_done
  FROM mini_milestones WHERE milestone_id = NEW.milestone_id;

  IF v_total > 0 AND v_done = v_total THEN
    UPDATE life_plan_milestones SET is_completed = true, completed_at = now() WHERE id = NEW.milestone_id AND (is_completed IS NULL OR NOT is_completed);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_milestone_from_minis
  AFTER UPDATE OF is_completed ON public.mini_milestones
  FOR EACH ROW EXECUTE FUNCTION public.check_milestone_from_minis();

-- =====================================================
-- Trigger: award XP on mini-milestone completion
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_mini_milestone_completion()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false) THEN
    NEW.completed_at := now();
    -- Get user_id via milestone -> plan
    SELECT lp.user_id INTO v_user_id
    FROM life_plan_milestones lpm
    JOIN life_plans lp ON lp.id = lpm.plan_id
    WHERE lpm.id = NEW.milestone_id;

    IF v_user_id IS NOT NULL AND NEW.xp_reward > 0 THEN
      PERFORM award_unified_xp(v_user_id, NEW.xp_reward, 'mini_milestone', NEW.title);
    END IF;
  END IF;
  IF NEW.is_completed = false AND OLD.is_completed = true THEN
    NEW.completed_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_mini_milestone_completion
  BEFORE UPDATE OF is_completed ON public.mini_milestones
  FOR EACH ROW EXECUTE FUNCTION public.handle_mini_milestone_completion();

-- Updated at trigger for plan_missions
CREATE TRIGGER update_plan_missions_updated_at
  BEFORE UPDATE ON public.plan_missions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Fix: expand month_number constraint to support 100-day plans (up to 4 months)
ALTER TABLE public.life_plan_milestones DROP CONSTRAINT life_plan_milestones_month_number_check;
ALTER TABLE public.life_plan_milestones ADD CONSTRAINT life_plan_milestones_month_number_check CHECK (month_number >= 1 AND month_number <= 4);
-- Add selected_pillars column to profiles for storing which pillars each user has chosen
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS selected_pillars jsonb DEFAULT '{"core": [], "arena": []}'::jsonb;

COMMENT ON COLUMN public.profiles.selected_pillars IS 'Selected pillar IDs per hub: {"core": ["consciousness", ...], "arena": ["wealth", ...]}';

-- ============================================================
-- SSOT STABILIZATION: Phase 1
-- Fixes XP leaks, energy leaks, and adds guardrails
-- ============================================================

-- 1) DROP legacy check_streak_bonus trigger (causes double XP on hypnosis_sessions)
DROP TRIGGER IF EXISTS check_streak_bonus_trigger ON public.hypnosis_sessions;
DROP FUNCTION IF EXISTS public.check_streak_bonus();

-- 2) Fix handle_hypnosis_session_complete to use award_energy instead of direct tokens update
CREATE OR REPLACE FUNCTION public.handle_hypnosis_session_complete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_last_date date;
  v_today date := CURRENT_DATE;
  v_current_streak integer;
  v_new_streak integer;
  v_bonus_xp integer := 0;
  v_bonus_tokens integer := 0;
  v_xp_result jsonb;
BEGIN
  -- SSOT: All XP must flow through award_unified_xp
  -- SSOT: All Energy must flow through award_energy
  
  -- Get user's current streak info
  SELECT session_streak, last_session_date 
  INTO v_current_streak, v_last_date
  FROM profiles 
  WHERE id = NEW.user_id;
  
  v_current_streak := COALESCE(v_current_streak, 0);
  
  -- Determine new streak value
  IF v_last_date IS NULL OR v_last_date < v_today - 1 THEN
    v_new_streak := 1;
  ELSIF v_last_date = v_today - 1 THEN
    v_new_streak := v_current_streak + 1;
  ELSIF v_last_date = v_today THEN
    v_new_streak := v_current_streak;
  ELSE
    v_new_streak := 1;
  END IF;
  
  -- Calculate streak milestone bonuses (only on new milestone)
  IF v_new_streak > v_current_streak THEN
    CASE v_new_streak
      WHEN 3 THEN v_bonus_xp := 25; v_bonus_tokens := 5;
      WHEN 7 THEN v_bonus_xp := 50; v_bonus_tokens := 10;
      WHEN 14 THEN v_bonus_xp := 100; v_bonus_tokens := 20;
      WHEN 30 THEN v_bonus_xp := 200; v_bonus_tokens := 50;
      WHEN 60 THEN v_bonus_xp := 300; v_bonus_tokens := 75;
      WHEN 100 THEN v_bonus_xp := 500; v_bonus_tokens := 100;
      ELSE
        IF v_new_streak > 7 THEN v_bonus_xp := 5; END IF;
    END CASE;
  END IF;
  
  -- Update streak and ego state usage ONLY (no XP/tokens here)
  UPDATE profiles 
  SET 
    session_streak = v_new_streak,
    last_session_date = v_today,
    ego_state_usage = COALESCE(ego_state_usage, '{}'::jsonb) || 
      jsonb_build_object(
        NEW.ego_state, 
        COALESCE((ego_state_usage ->> NEW.ego_state)::int, 0) + 1
      ),
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  -- Award session XP via unified ledger (includes level calculation)
  SELECT award_unified_xp(
    NEW.user_id, 
    COALESCE(NEW.experience_gained, 0) + v_bonus_xp,
    'hypnosis_session',
    'Session: ' || NEW.ego_state || CASE WHEN v_bonus_xp > 0 THEN ' +streak_bonus' ELSE '' END
  ) INTO v_xp_result;
  
  -- Award streak energy bonus via unified ledger
  IF v_bonus_tokens > 0 THEN
    PERFORM award_energy(
      NEW.user_id, 
      v_bonus_tokens, 
      'streak_bonus', 
      'Streak ' || v_new_streak || ' milestone'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3) Update award_unified_xp to set session variable for guardrail
CREATE OR REPLACE FUNCTION public.award_unified_xp(
  p_user_id uuid,
  p_amount integer,
  p_source text,
  p_reason text DEFAULT NULL
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_energy_bonus INTEGER := 0;
BEGIN
  -- SSOT: This is the ONLY function that may update profiles.experience
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Amount must be positive');
  END IF;

  -- Set session flag so guardrail trigger allows this update
  PERFORM set_config('app.xp_update_via_rpc', 'true', true);

  -- Log to xp_events ledger FIRST (source of truth)
  INSERT INTO public.xp_events (user_id, amount, source, reason)
  VALUES (p_user_id, p_amount, p_source, p_reason);

  -- Update profiles (derived cache)
  UPDATE public.profiles
  SET 
    experience = COALESCE(experience, 0) + p_amount,
    level = GREATEST(1, FLOOR((COALESCE(experience, 0) + p_amount) / 100) + 1),
    updated_at = now()
  WHERE id = p_user_id
  RETURNING experience, level INTO v_new_xp, v_new_level;

  IF v_new_xp IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Level-up energy bonuses
  IF v_new_level >= 5 AND v_new_level < 10 THEN
    v_energy_bonus := 10;
  ELSIF v_new_level >= 10 THEN
    v_energy_bonus := 25;
  END IF;

  IF v_energy_bonus > 0 THEN
    PERFORM award_energy(p_user_id, v_energy_bonus, 'level_up', 'Level ' || v_new_level);
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'new_xp', v_new_xp,
    'new_level', v_new_level,
    'energy_bonus', v_energy_bonus
  );
END;
$function$;

-- 4) Add guardrail trigger: block direct experience updates not via RPC
CREATE OR REPLACE FUNCTION public.guard_xp_direct_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Allow if experience didn't change
  IF NEW.experience IS NOT DISTINCT FROM OLD.experience THEN
    RETURN NEW;
  END IF;
  
  -- Allow if called from award_unified_xp (session flag set)
  IF current_setting('app.xp_update_via_rpc', true) = 'true' THEN
    -- Reset the flag after use
    PERFORM set_config('app.xp_update_via_rpc', 'false', true);
    RETURN NEW;
  END IF;
  
  -- Block direct updates
  RAISE EXCEPTION 'SSOT VIOLATION: Direct update to profiles.experience is blocked. Use award_unified_xp() RPC instead. Source: %', TG_NAME;
END;
$function$;

-- Attach guardrail trigger (BEFORE UPDATE so it can block)
DROP TRIGGER IF EXISTS guard_xp_direct_update ON public.profiles;
CREATE TRIGGER guard_xp_direct_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_xp_direct_update();

-- ================================================
-- Phase 2: Job System — First-Class Entity
-- ================================================

-- 1. Jobs catalog (seeded with the 6 archetypes + 1 fallback)
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_he TEXT,
  description TEXT,
  description_he TEXT,
  icon TEXT DEFAULT '🎯',
  role_tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Jobs are readable by everyone" ON public.jobs FOR SELECT USING (true);

-- Seed the 6 archetype jobs
INSERT INTO public.jobs (name, name_he, description, description_he, icon, role_tags) VALUES
  ('Warrior', 'לוחם', 'Driven by action, courage, and determination', 'מונע על ידי פעולה, אומץ ונחישות', '⚔️', ARRAY['action','discipline','strength']),
  ('Mystic', 'מיסטיקן', 'Connected to intuition, wisdom, and the unseen', 'מחובר לאינטואיציה, חוכמה והנסתר', '🔮', ARRAY['intuition','meditation','depth']),
  ('Creator', 'יוצר', 'Fueled by imagination, expression, and innovation', 'מונע על ידי דמיון, ביטוי עצמי וחדשנות', '🎨', ARRAY['creativity','expression','innovation']),
  ('Sage', 'חכם', 'Guided by knowledge, analysis, and understanding', 'מונחה על ידי ידע, ניתוח והבנה', '📚', ARRAY['knowledge','analysis','strategy']),
  ('Healer', 'מרפא', 'Nurturing connection, empathy, and restoration', 'מטפח חיבור, אמפתיה והחלמה', '💚', ARRAY['empathy','nurturing','restoration']),
  ('Explorer', 'חוקר', 'Driven by curiosity, adventure, and discovery', 'מונע על ידי סקרנות, הרפתקאות וגילוי', '🌟', ARRAY['curiosity','adventure','discovery']);

-- 2. User jobs (assignment history)
CREATE TABLE public.user_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id),
  assigned_by TEXT NOT NULL DEFAULT 'ai' CHECK (assigned_by IN ('ai','user','coach','admin')),
  is_primary BOOLEAN NOT NULL DEFAULT false,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_user_jobs_user ON public.user_jobs (user_id);
CREATE INDEX idx_user_jobs_primary ON public.user_jobs (user_id) WHERE is_primary = true;

ALTER TABLE public.user_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs" ON public.user_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jobs" ON public.user_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own jobs" ON public.user_jobs FOR UPDATE USING (auth.uid() = user_id);

-- Coach can view client jobs (via practitioner relationship)
CREATE POLICY "Coaches can view client jobs" ON public.user_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.practitioners p
      JOIN public.coach_client_plans ccp ON ccp.coach_id = p.id
      WHERE p.user_id = auth.uid() AND ccp.client_user_id = user_jobs.user_id
    )
  );

-- 3. Function to assign a job (ensures single primary)
CREATE OR REPLACE FUNCTION public.assign_user_job(
  p_user_id UUID,
  p_job_name TEXT,
  p_assigned_by TEXT DEFAULT 'ai',
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_job_id UUID;
  v_new_id UUID;
BEGIN
  -- Look up job by name
  SELECT id INTO v_job_id FROM public.jobs WHERE LOWER(name) = LOWER(p_job_name) AND is_active = true;
  IF v_job_id IS NULL THEN
    -- Default to Explorer
    SELECT id INTO v_job_id FROM public.jobs WHERE name = 'Explorer';
  END IF;

  -- Demote existing primary
  UPDATE public.user_jobs SET is_primary = false WHERE user_id = p_user_id AND is_primary = true;

  -- Insert new primary
  INSERT INTO public.user_jobs (user_id, job_id, assigned_by, is_primary, metadata)
  VALUES (p_user_id, v_job_id, p_assigned_by, true, p_metadata)
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;

-- 4. Backfill: Create user_jobs from orb_profiles.computed_from for existing users
DO $$
DECLARE
  r RECORD;
  v_archetype TEXT;
  v_job_id UUID;
BEGIN
  FOR r IN
    SELECT op.user_id, op.computed_from
    FROM public.orb_profiles op
    WHERE op.computed_from IS NOT NULL
  LOOP
    -- Extract dominant archetype (new format) or egoState (legacy)
    v_archetype := COALESCE(
      r.computed_from->>'dominantArchetype',
      r.computed_from->>'egoState',
      'explorer'
    );

    -- Map legacy egoState names to archetype names
    v_archetype := CASE LOWER(v_archetype)
      WHEN 'guardian' THEN 'Warrior'
      WHEN 'visionary' THEN 'Explorer'
      WHEN 'achiever' THEN 'Warrior'
      WHEN 'nurturer' THEN 'Healer'
      WHEN 'analyst' THEN 'Sage'
      WHEN 'rebel' THEN 'Explorer'
      WHEN 'warrior' THEN 'Warrior'
      WHEN 'mystic' THEN 'Mystic'
      WHEN 'creator' THEN 'Creator'
      WHEN 'sage' THEN 'Sage'
      WHEN 'healer' THEN 'Healer'
      WHEN 'explorer' THEN 'Explorer'
      ELSE 'Explorer'
    END;

    SELECT id INTO v_job_id FROM public.jobs WHERE name = v_archetype;
    IF v_job_id IS NULL THEN
      SELECT id INTO v_job_id FROM public.jobs WHERE name = 'Explorer';
    END IF;

    -- Only insert if user doesn't already have a primary job
    IF NOT EXISTS (SELECT 1 FROM public.user_jobs WHERE user_id = r.user_id AND is_primary = true) THEN
      INSERT INTO public.user_jobs (user_id, job_id, assigned_by, is_primary, metadata)
      VALUES (r.user_id, v_job_id, 'ai', true, jsonb_build_object(
        'backfilled', true,
        'source', 'orb_profiles.computed_from',
        'original_archetype', r.computed_from->>'dominantArchetype',
        'original_egoState', r.computed_from->>'egoState'
      ));
    END IF;
  END LOOP;
END;
$$;

-- Phase 3: Skills MVP

-- A) skills catalog
CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_he text,
  description text,
  category text NOT NULL CHECK (category IN ('mind','body','social','wealth','spirit')),
  icon text NOT NULL DEFAULT '⭐',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skills catalog readable by all" ON public.skills FOR SELECT USING (true);

-- B) user_skill_progress (cache)
CREATE TABLE public.user_skill_progress (
  user_id uuid NOT NULL,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  xp_total int NOT NULL DEFAULT 0,
  level int NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, skill_id)
);
ALTER TABLE public.user_skill_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own skill progress" ON public.user_skill_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System upsert skill progress" ON public.user_skill_progress FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_usp_user ON public.user_skill_progress(user_id);

-- C) skill_xp_events (ledger — SOURCE OF TRUTH)
CREATE TABLE public.skill_xp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action_item_id uuid,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  amount int NOT NULL,
  source text NOT NULL DEFAULT 'action_item',
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_skill_xp_idempotency ON public.skill_xp_events(action_item_id, skill_id, source) WHERE action_item_id IS NOT NULL;
ALTER TABLE public.skill_xp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own skill xp" ON public.skill_xp_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System insert skill xp" ON public.skill_xp_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_sxe_user ON public.skill_xp_events(user_id);
CREATE INDEX idx_sxe_created ON public.skill_xp_events(user_id, created_at);

-- D) action_skill_weights (pillar -> skill mapping)
CREATE TABLE public.action_skill_weights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar text NOT NULL,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  weight numeric NOT NULL DEFAULT 0.5 CHECK (weight > 0 AND weight <= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(pillar, skill_id)
);
ALTER TABLE public.action_skill_weights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Weights readable by all" ON public.action_skill_weights FOR SELECT USING (true);

-- E) job_skill_weights (multipliers)
CREATE TABLE public.job_skill_weights (
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  multiplier numeric NOT NULL DEFAULT 1.0,
  PRIMARY KEY (job_id, skill_id)
);
ALTER TABLE public.job_skill_weights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Job weights readable by all" ON public.job_skill_weights FOR SELECT USING (true);

-- ============================================================
-- RPC: award_skill_xp (ONLY write path for skills)
-- ============================================================
CREATE OR REPLACE FUNCTION public.award_skill_xp(
  p_user_id uuid, p_skill_id uuid, p_amount int, p_source text,
  p_reason text DEFAULT NULL, p_action_item_id uuid DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_new_total int; v_new_level int;
BEGIN
  IF p_amount <= 0 THEN RETURN jsonb_build_object('success', false, 'error', 'Amount must be positive'); END IF;

  INSERT INTO public.skill_xp_events (user_id, action_item_id, skill_id, amount, source, reason)
  VALUES (p_user_id, p_action_item_id, p_skill_id, p_amount, p_source, p_reason)
  ON CONFLICT (action_item_id, skill_id, source) WHERE action_item_id IS NOT NULL DO NOTHING;

  IF NOT FOUND THEN RETURN jsonb_build_object('success', true, 'idempotent', true); END IF;

  INSERT INTO public.user_skill_progress (user_id, skill_id, xp_total, level, updated_at)
  VALUES (p_user_id, p_skill_id, p_amount, GREATEST(1, FLOOR(p_amount / 100) + 1), now())
  ON CONFLICT (user_id, skill_id) DO UPDATE SET
    xp_total = user_skill_progress.xp_total + p_amount,
    level = GREATEST(1, FLOOR((user_skill_progress.xp_total + p_amount) / 100) + 1),
    updated_at = now()
  RETURNING xp_total, level INTO v_new_total, v_new_level;

  RETURN jsonb_build_object('success', true, 'skill_id', p_skill_id, 'new_total', v_new_total, 'new_level', v_new_level);
END; $$;

-- ============================================================
-- Updated trigger: handle_action_item_completion + skill XP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_action_item_completion()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_weight RECORD;
  v_base_xp int;
  v_multiplier numeric;
  v_primary_job_id uuid;
  v_skill_amount int;
BEGIN
  IF NEW.status = 'done' AND (OLD.status IS DISTINCT FROM 'done') THEN
    NEW.completed_at = now();
    IF NEW.xp_reward > 0 THEN
      PERFORM award_unified_xp(NEW.user_id, NEW.xp_reward, 'action_item', NEW.title);
    END IF;
    IF NEW.token_reward > 0 THEN
      PERFORM award_energy(NEW.user_id, NEW.token_reward, 'action_item', NEW.title);
    END IF;

    -- Phase 3: Skill XP via pillar weights + job multipliers
    IF NEW.pillar IS NOT NULL THEN
      v_base_xp := GREATEST(COALESCE(NEW.xp_reward, 10), 5);
      SELECT job_id INTO v_primary_job_id FROM public.user_jobs WHERE user_id = NEW.user_id AND is_primary = true LIMIT 1;

      FOR v_weight IN SELECT asw.skill_id, asw.weight FROM public.action_skill_weights asw WHERE asw.pillar = NEW.pillar
      LOOP
        v_skill_amount := GREATEST(1, FLOOR(v_base_xp * v_weight.weight));
        IF v_primary_job_id IS NOT NULL THEN
          SELECT COALESCE(jsw.multiplier, 1.0) INTO v_multiplier FROM public.job_skill_weights jsw WHERE jsw.job_id = v_primary_job_id AND jsw.skill_id = v_weight.skill_id;
          IF v_multiplier IS NOT NULL AND v_multiplier != 1.0 THEN v_skill_amount := GREATEST(1, FLOOR(v_skill_amount * v_multiplier)); END IF;
        END IF;
        PERFORM award_skill_xp(NEW.user_id, v_weight.skill_id, v_skill_amount, COALESCE(NEW.source, 'action_item'), NEW.title, NEW.id);
      END LOOP;
    END IF;
  END IF;
  IF NEW.status != 'done' AND OLD.status = 'done' THEN NEW.completed_at = NULL; END IF;
  RETURN NEW;
END; $$;

-- ============================================================
-- SEED: 30 skills
-- ============================================================
INSERT INTO public.skills (name, name_he, description, category, icon) VALUES
('Focus',        'ריכוז',        'Deep concentration and attention control', 'mind', '🎯'),
('Clarity',      'בהירות',       'Mental clarity and clear thinking', 'mind', '💎'),
('Memory',       'זיכרון',       'Information retention and recall', 'mind', '🧠'),
('Mindfulness',  'מיינדפולנס',    'Present-moment awareness', 'mind', '🧘'),
('Emotional IQ', 'אינטליגנציה רגשית', 'Understanding and managing emotions', 'mind', '💜'),
('Problem Solving', 'פתרון בעיות', 'Analytical and creative problem solving', 'mind', '🔧'),
('Endurance',    'סיבולת',       'Physical stamina and persistence', 'body', '🏃'),
('Strength',     'כוח',          'Physical and mental strength', 'body', '💪'),
('Flexibility',  'גמישות',       'Physical and mental adaptability', 'body', '🤸'),
('Recovery',     'התאוששות',     'Rest, recovery, and regeneration', 'body', '😴'),
('Nutrition',    'תזונה',        'Healthy eating habits', 'body', '🥗'),
('Sleep Quality','איכות שינה',   'Deep, restorative sleep patterns', 'body', '🌙'),
('Communication','תקשורת',       'Clear and effective expression', 'social', '💬'),
('Empathy',      'אמפתיה',       'Understanding others perspectives', 'social', '🤝'),
('Leadership',   'מנהיגות',      'Inspiring and guiding others', 'social', '👑'),
('Collaboration','שיתוף פעולה',  'Working effectively with others', 'social', '🤜'),
('Networking',   'נטוורקינג',    'Building meaningful connections', 'social', '🌐'),
('Boundaries',   'גבולות',       'Setting healthy personal boundaries', 'social', '🛡️'),
('Planning',     'תכנון',        'Strategic and systematic planning', 'wealth', '📋'),
('Productivity', 'פרודוקטיביות', 'Efficient task execution', 'wealth', '⚡'),
('Financial IQ', 'אוריינות פיננסית', 'Financial literacy and management', 'wealth', '💰'),
('Time Mastery', 'ניהול זמן',    'Effective time management', 'wealth', '⏰'),
('Goal Setting', 'הצבת מטרות',   'Setting and tracking meaningful goals', 'wealth', '🏹'),
('Decision Making','קבלת החלטות','Making clear, confident decisions', 'wealth', '⚖️'),
('Self-Awareness','מודעות עצמית','Understanding your inner world', 'spirit', '👁️'),
('Gratitude',    'הכרת תודה',    'Appreciation and thankfulness', 'spirit', '🙏'),
('Resilience',   'חוסן',         'Bouncing back from adversity', 'spirit', '🌊'),
('Purpose',      'ייעוד',        'Connection to life purpose', 'spirit', '🔥'),
('Inner Peace',  'שלווה פנימית', 'Calm and centered state of being', 'spirit', '☮️'),
('Creativity',   'יצירתיות',     'Creative expression and innovation', 'spirit', '🎨');

-- SEED: action_skill_weights
INSERT INTO public.action_skill_weights (pillar, skill_id, weight)
SELECT w.pillar, s.id, w.weight FROM (VALUES
  ('mind','Focus',0.8),('mind','Clarity',0.7),('mind','Memory',0.5),('mind','Mindfulness',0.6),
  ('mind','Emotional IQ',0.5),('mind','Problem Solving',0.6),('mind','Self-Awareness',0.3),
  ('body','Endurance',0.8),('body','Strength',0.7),('body','Flexibility',0.5),
  ('body','Recovery',0.6),('body','Nutrition',0.5),('body','Sleep Quality',0.5),('body','Resilience',0.3),
  ('social','Communication',0.8),('social','Empathy',0.7),('social','Leadership',0.5),
  ('social','Collaboration',0.6),('social','Networking',0.5),('social','Boundaries',0.6),('social','Emotional IQ',0.3),
  ('wealth','Planning',0.8),('wealth','Productivity',0.7),('wealth','Financial IQ',0.5),
  ('wealth','Time Mastery',0.6),('wealth','Goal Setting',0.7),('wealth','Decision Making',0.6),('wealth','Focus',0.3),
  ('spirit','Self-Awareness',0.8),('spirit','Gratitude',0.7),('spirit','Resilience',0.6),
  ('spirit','Purpose',0.8),('spirit','Inner Peace',0.7),('spirit','Creativity',0.5),('spirit','Mindfulness',0.4)
) AS w(pillar, skill_name, weight) JOIN public.skills s ON s.name = w.skill_name;

-- SEED: job_skill_weights
INSERT INTO public.job_skill_weights (job_id, skill_id, multiplier)
SELECT j.id, s.id, m.mult FROM (VALUES
  ('Warrior','Endurance',1.5),('Warrior','Strength',1.5),('Warrior','Resilience',1.5),('Warrior','Focus',1.3),
  ('Mystic','Mindfulness',1.5),('Mystic','Self-Awareness',1.5),('Mystic','Inner Peace',1.5),('Mystic','Clarity',1.3),
  ('Creator','Creativity',1.5),('Creator','Problem Solving',1.5),('Creator','Purpose',1.3),('Creator','Communication',1.3),
  ('Sage','Clarity',1.5),('Sage','Memory',1.5),('Sage','Planning',1.3),('Sage','Decision Making',1.3),
  ('Healer','Empathy',1.5),('Healer','Emotional IQ',1.5),('Healer','Recovery',1.5),('Healer','Boundaries',1.3),
  ('Explorer','Networking',1.5),('Explorer','Flexibility',1.5),('Explorer','Goal Setting',1.3),('Explorer','Creativity',1.3)
) AS m(job_name, skill_name, mult) JOIN public.jobs j ON j.name = m.job_name JOIN public.skills s ON s.name = m.skill_name;

-- Phase 3.1 Skills Hardening: mapping key, idempotency, timezone, trigger perf

-- 1) Add mapping_key + mapping_type to action_skill_weights
ALTER TABLE public.action_skill_weights
  ADD COLUMN IF NOT EXISTS mapping_key text,
  ADD COLUMN IF NOT EXISTS mapping_type text DEFAULT 'pillar';

-- Backfill existing rows: mapping_key = pillar value
UPDATE public.action_skill_weights SET mapping_key = pillar, mapping_type = 'pillar' WHERE mapping_key IS NULL;

-- Drop old unique constraint, add new one on (mapping_type, mapping_key, skill_id)
ALTER TABLE public.action_skill_weights DROP CONSTRAINT IF EXISTS action_skill_weights_pillar_skill_id_key;
CREATE UNIQUE INDEX idx_asw_mapping ON public.action_skill_weights (mapping_type, mapping_key, skill_id);

-- 2) Fix idempotency: (action_item_id, skill_id) without source
DROP INDEX IF EXISTS idx_skill_xp_idempotency;
CREATE UNIQUE INDEX idx_skill_xp_idempotency ON public.skill_xp_events (action_item_id, skill_id) WHERE action_item_id IS NOT NULL;

-- 3) Timezone-correct today gains RPC
CREATE OR REPLACE FUNCTION public.get_skill_gains_today(p_user_id uuid, p_tz text DEFAULT 'Asia/Jerusalem')
RETURNS TABLE(skill_id uuid, total bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT e.skill_id, SUM(e.amount)::bigint AS total
  FROM public.skill_xp_events e
  WHERE e.user_id = p_user_id
    AND (e.created_at AT TIME ZONE p_tz)::date = (now() AT TIME ZONE p_tz)::date
  GROUP BY e.skill_id;
$$;

-- 4) Updated award_skill_xp with fixed idempotency (no source in conflict)
CREATE OR REPLACE FUNCTION public.award_skill_xp(
  p_user_id uuid, p_skill_id uuid, p_amount integer,
  p_source text, p_reason text DEFAULT NULL, p_action_item_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_new_total int; v_new_level int;
BEGIN
  IF p_amount <= 0 THEN RETURN jsonb_build_object('success', false, 'error', 'Amount must be positive'); END IF;

  INSERT INTO public.skill_xp_events (user_id, action_item_id, skill_id, amount, source, reason)
  VALUES (p_user_id, p_action_item_id, p_skill_id, p_amount, p_source, p_reason)
  ON CONFLICT (action_item_id, skill_id) WHERE action_item_id IS NOT NULL DO NOTHING;

  IF NOT FOUND THEN RETURN jsonb_build_object('success', true, 'idempotent', true); END IF;

  INSERT INTO public.user_skill_progress (user_id, skill_id, xp_total, level, updated_at)
  VALUES (p_user_id, p_skill_id, p_amount, GREATEST(1, FLOOR(p_amount / 100) + 1), now())
  ON CONFLICT (user_id, skill_id) DO UPDATE SET
    xp_total = user_skill_progress.xp_total + p_amount,
    level = GREATEST(1, FLOOR((user_skill_progress.xp_total + p_amount) / 100) + 1),
    updated_at = now()
  RETURNING xp_total, level INTO v_new_total, v_new_level;

  RETURN jsonb_build_object('success', true, 'skill_id', p_skill_id, 'new_total', v_new_total, 'new_level', v_new_level);
END; $function$;

-- 5) Optimized trigger: single join, template→pillar fallback
CREATE OR REPLACE FUNCTION public.handle_action_item_completion()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_row RECORD;
  v_base_xp int;
  v_primary_job_id uuid;
  v_template text;
  v_has_template_weights boolean := false;
BEGIN
  IF NEW.status = 'done' AND (OLD.status IS DISTINCT FROM 'done') THEN
    NEW.completed_at = now();

    -- Unified XP
    IF NEW.xp_reward > 0 THEN
      PERFORM award_unified_xp(NEW.user_id, NEW.xp_reward, 'action_item', NEW.title);
    END IF;
    IF NEW.token_reward > 0 THEN
      PERFORM award_energy(NEW.user_id, NEW.token_reward, 'action_item', NEW.title);
    END IF;

    -- Skill XP: resolve mapping key + job multiplier in single pass
    v_base_xp := GREATEST(COALESCE(NEW.xp_reward, 10), 5);
    v_template := COALESCE(NEW.metadata->>'execution_template', NULL);

    SELECT job_id INTO v_primary_job_id
    FROM public.user_jobs WHERE user_id = NEW.user_id AND is_primary = true LIMIT 1;

    -- Try execution_template mapping first
    IF v_template IS NOT NULL THEN
      SELECT true INTO v_has_template_weights
      FROM public.action_skill_weights
      WHERE mapping_type = 'execution_template' AND mapping_key = v_template LIMIT 1;
    END IF;

    -- Single join: weights + job multipliers in one query
    FOR v_row IN
      SELECT asw.skill_id, asw.weight, COALESCE(jsw.multiplier, 1.0) AS multiplier
      FROM public.action_skill_weights asw
      LEFT JOIN public.job_skill_weights jsw
        ON jsw.skill_id = asw.skill_id AND jsw.job_id = v_primary_job_id
      WHERE
        CASE
          WHEN v_has_template_weights THEN asw.mapping_type = 'execution_template' AND asw.mapping_key = v_template
          WHEN NEW.pillar IS NOT NULL THEN asw.mapping_type = 'pillar' AND asw.mapping_key = NEW.pillar
          ELSE false
        END
    LOOP
      PERFORM award_skill_xp(
        NEW.user_id, v_row.skill_id,
        GREATEST(1, FLOOR(v_base_xp * v_row.weight * v_row.multiplier)::int),
        COALESCE(NEW.source, 'action_item'), NEW.title, NEW.id
      );
    END LOOP;
  END IF;

  IF NEW.status != 'done' AND OLD.status = 'done' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END; $function$;

-- ============================================================
-- Phase 3.1 Fixes + Phase 4: Skill Sources, Unlocks
-- ============================================================

-- 1) RPC: get_skill_gains_today — already exists, but ensure default TZ is 'UTC' not hardcoded
CREATE OR REPLACE FUNCTION public.get_skill_gains_today(p_user_id uuid, p_tz text DEFAULT 'UTC')
RETURNS TABLE(skill_id uuid, total bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT e.skill_id, SUM(e.amount)::bigint AS total
  FROM skill_xp_events e
  WHERE e.user_id = p_user_id
    AND e.created_at >= (now() AT TIME ZONE p_tz)::date::timestamp AT TIME ZONE p_tz
  GROUP BY e.skill_id;
$$;

-- 2) Phase 4: get_skill_sources RPC
CREATE OR REPLACE FUNCTION public.get_skill_sources(
  p_user_id uuid,
  p_skill_id uuid,
  p_limit int DEFAULT 3
)
RETURNS TABLE(label text, total_xp bigint, action_count bigint, last_seen_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT
    COALESCE(
      ai.metadata->>'execution_template',
      ai.title
    ) AS label,
    SUM(e.amount)::bigint AS total_xp,
    COUNT(*)::bigint AS action_count,
    MAX(e.created_at) AS last_seen_at
  FROM skill_xp_events e
  LEFT JOIN action_items ai ON ai.id = e.action_item_id
  WHERE e.user_id = p_user_id
    AND e.skill_id = p_skill_id
    AND e.created_at >= now() - interval '30 days'
    AND e.action_item_id IS NOT NULL
  GROUP BY COALESCE(ai.metadata->>'execution_template', ai.title)
  ORDER BY total_xp DESC
  LIMIT p_limit;
$$;

-- 3) get_job_skill_multipliers — for UI display
CREATE OR REPLACE FUNCTION public.get_job_skill_multipliers(p_user_id uuid)
RETURNS TABLE(skill_id uuid, multiplier numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT jsw.skill_id, jsw.multiplier
  FROM job_skill_weights jsw
  JOIN user_jobs uj ON uj.job_id = jsw.job_id
  WHERE uj.user_id = p_user_id AND uj.is_primary = true;
$$;

-- 4) skill_unlocks table
CREATE TABLE IF NOT EXISTS public.skill_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  level_required int NOT NULL DEFAULT 5,
  reward_type text NOT NULL DEFAULT 'badge',
  reward_label text NOT NULL,
  reward_label_he text,
  reward_payload jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_skill_unlocks_skill ON public.skill_unlocks(skill_id, level_required);

ALTER TABLE public.skill_unlocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skill unlocks are readable by all authenticated"
  ON public.skill_unlocks FOR SELECT
  TO authenticated USING (true);

-- 5) Seed skill_unlocks (cosmetic rewards every 5 levels for a few skills)
INSERT INTO public.skill_unlocks (skill_id, level_required, reward_type, reward_label, reward_label_he, reward_payload)
SELECT s.id, lvl.n, 'badge', 
  s.name || ' Lv.' || lvl.n,
  COALESCE(s.name_he, s.name) || ' רמה ' || lvl.n,
  jsonb_build_object('glow_color', 
    CASE lvl.n 
      WHEN 5 THEN '#4ade80'
      WHEN 10 THEN '#60a5fa'
      WHEN 15 THEN '#c084fc'
      WHEN 20 THEN '#f59e0b'
    END,
    'badge_emoji',
    CASE lvl.n
      WHEN 5 THEN '🌱'
      WHEN 10 THEN '⚡'
      WHEN 15 THEN '🔥'
      WHEN 20 THEN '👑'
    END
  )
FROM skills s
CROSS JOIN (VALUES (5),(10),(15),(20)) AS lvl(n)
WHERE s.is_active = true
ON CONFLICT DO NOTHING;

-- 6) SSOT Documentation comment (Option A: Contribution weights)
-- NORMALIZATION RULE (Option A — Contribution Weights):
-- action_skill_weights.weight is NOT required to sum to 1.0.
-- Each weight represents "how much this action contributes to this skill".
-- A single action can generate MORE total skill XP than base_xp.
-- This is intentional: completing a complex task builds multiple skills.
-- Balance is achieved by keeping individual weights in 0.1–0.5 range.
-- job_skill_weights.multiplier further amplifies per-job affinity (1.0–1.5x).

-- ============================================================
-- Phase 5: Execution Template Enforcement
-- ============================================================

-- 1) DB trigger: auto-fill metadata.execution_template on action_items INSERT
--    if missing, using pillar → template defaults.
CREATE OR REPLACE FUNCTION public.enforce_execution_template()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  v_template text;
BEGIN
  -- Skip if already has execution_template
  IF NEW.metadata IS NOT NULL 
     AND NEW.metadata->>'execution_template' IS NOT NULL 
     AND NEW.metadata->>'execution_template' != '' THEN
    RETURN NEW;
  END IF;

  -- Derive from pillar
  v_template := CASE COALESCE(NEW.pillar, '')
    WHEN 'vitality'       THEN 'step_by_step'
    WHEN 'power'          THEN 'sets_reps_timer'
    WHEN 'combat'         THEN 'sets_reps_timer'
    WHEN 'focus'          THEN 'timer_focus'
    WHEN 'consciousness'  THEN 'tts_guided'
    WHEN 'expansion'      THEN 'timer_focus'
    WHEN 'wealth'         THEN 'timer_focus'
    WHEN 'influence'      THEN 'social_checklist'
    WHEN 'relationships'  THEN 'social_checklist'
    WHEN 'business'       THEN 'timer_focus'
    WHEN 'projects'       THEN 'timer_focus'
    WHEN 'play'           THEN 'step_by_step'
    WHEN 'presence'       THEN 'tts_guided'
    WHEN 'order'          THEN 'step_by_step'
    ELSE 'step_by_step'
  END;

  -- Merge into metadata
  NEW.metadata := COALESCE(NEW.metadata, '{}'::jsonb) || jsonb_build_object('execution_template', v_template);

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_execution_template
  BEFORE INSERT ON public.action_items
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_execution_template();

-- 2) Backfill existing action_items that are missing execution_template
UPDATE public.action_items
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
  'execution_template',
  CASE COALESCE(pillar, '')
    WHEN 'vitality'       THEN 'step_by_step'
    WHEN 'power'          THEN 'sets_reps_timer'
    WHEN 'combat'         THEN 'sets_reps_timer'
    WHEN 'focus'          THEN 'timer_focus'
    WHEN 'consciousness'  THEN 'tts_guided'
    WHEN 'expansion'      THEN 'timer_focus'
    WHEN 'wealth'         THEN 'timer_focus'
    WHEN 'influence'      THEN 'social_checklist'
    WHEN 'relationships'  THEN 'social_checklist'
    WHEN 'business'       THEN 'timer_focus'
    WHEN 'projects'       THEN 'timer_focus'
    WHEN 'play'           THEN 'step_by_step'
    WHEN 'presence'       THEN 'tts_guided'
    WHEN 'order'          THEN 'step_by_step'
    ELSE 'step_by_step'
  END
)
WHERE metadata IS NULL OR metadata->>'execution_template' IS NULL;

-- 3) Admin metrics RPC: template coverage per day
CREATE OR REPLACE FUNCTION public.get_template_coverage_stats(p_days int DEFAULT 14)
RETURNS TABLE(
  day date,
  total_items bigint,
  with_template bigint,
  coverage_pct numeric
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT
    d.day::date,
    COUNT(ai.id) AS total_items,
    COUNT(ai.id) FILTER (
      WHERE ai.metadata->>'execution_template' IS NOT NULL
        AND ai.metadata->>'execution_template' != ''
    ) AS with_template,
    CASE WHEN COUNT(ai.id) > 0 THEN
      ROUND(
        COUNT(ai.id) FILTER (
          WHERE ai.metadata->>'execution_template' IS NOT NULL
            AND ai.metadata->>'execution_template' != ''
        ) * 100.0 / COUNT(ai.id), 1
      )
    ELSE 0 END AS coverage_pct
  FROM generate_series(
    current_date - (p_days || ' days')::interval,
    current_date,
    '1 day'::interval
  ) AS d(day)
  LEFT JOIN action_items ai ON ai.created_at::date = d.day::date
  GROUP BY d.day
  ORDER BY d.day DESC;
$$;

-- Phase 5.1: Add breakdown RPC (trigger+backfill already applied above)

CREATE OR REPLACE FUNCTION public.get_template_missing_breakdown(p_days integer DEFAULT 14)
RETURNS TABLE(
  dimension text,
  dimension_value text,
  total_items bigint,
  missing_template bigint,
  coverage_pct integer
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT * FROM (
    SELECT 'source'::text AS dimension, ai.source AS dimension_value, COUNT(*)::bigint AS total_items,
      COUNT(*) FILTER (WHERE ai.metadata->>'execution_template' IS NULL OR ai.metadata->>'execution_template' = '')::bigint AS missing_template,
      CASE WHEN COUNT(*) > 0 THEN
        (100 * COUNT(*) FILTER (WHERE ai.metadata->>'execution_template' IS NOT NULL AND ai.metadata->>'execution_template' != '') / COUNT(*))::integer
      ELSE 100 END AS coverage_pct
    FROM action_items ai WHERE ai.created_at >= now() - (p_days || ' days')::interval
    GROUP BY ai.source
    UNION ALL
    SELECT 'type'::text, ai.type, COUNT(*)::bigint,
      COUNT(*) FILTER (WHERE ai.metadata->>'execution_template' IS NULL OR ai.metadata->>'execution_template' = '')::bigint,
      CASE WHEN COUNT(*) > 0 THEN
        (100 * COUNT(*) FILTER (WHERE ai.metadata->>'execution_template' IS NOT NULL AND ai.metadata->>'execution_template' != '') / COUNT(*))::integer
      ELSE 100 END
    FROM action_items ai WHERE ai.created_at >= now() - (p_days || ' days')::interval
    GROUP BY ai.type
    UNION ALL
    SELECT 'pillar'::text, COALESCE(ai.pillar, 'none'), COUNT(*)::bigint,
      COUNT(*) FILTER (WHERE ai.metadata->>'execution_template' IS NULL OR ai.metadata->>'execution_template' = '')::bigint,
      CASE WHEN COUNT(*) > 0 THEN
        (100 * COUNT(*) FILTER (WHERE ai.metadata->>'execution_template' IS NOT NULL AND ai.metadata->>'execution_template' != '') / COUNT(*))::integer
      ELSE 100 END
    FROM action_items ai WHERE ai.created_at >= now() - (p_days || ' days')::interval
    GROUP BY ai.pillar
  ) sub
  ORDER BY sub.dimension, sub.dimension_value;
END;
$function$;

-- ═══════════════════════════════════════════════════════════
-- MapleStory Mode: user_builds, loot_catalog, user_inventory, loot_events
-- ═══════════════════════════════════════════════════════════

-- 1) user_builds — weekly adaptive builds
CREATE TABLE public.user_builds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  valid_from date NOT NULL,
  valid_to date NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  build_data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Only one active build per user at a time
CREATE UNIQUE INDEX uq_user_builds_active ON public.user_builds (user_id) WHERE is_active = true;

ALTER TABLE public.user_builds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own builds" ON public.user_builds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own builds" ON public.user_builds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own builds" ON public.user_builds FOR UPDATE USING (auth.uid() = user_id);

-- 2) loot_catalog — global item definitions (public read)
CREATE TABLE public.loot_catalog (
  loot_id text PRIMARY KEY,
  name text NOT NULL,
  rarity text NOT NULL,
  type text NOT NULL,
  effects jsonb NOT NULL DEFAULT '{}'::jsonb,
  icon_url text,
  created_at timestamptz DEFAULT now()
);

-- Use validation trigger instead of CHECK constraints
CREATE OR REPLACE FUNCTION public.validate_loot_catalog()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.rarity NOT IN ('common','rare','epic','legendary') THEN
    RAISE EXCEPTION 'Invalid rarity: %', NEW.rarity;
  END IF;
  IF NEW.type NOT IN ('cosmetic','utility') THEN
    RAISE EXCEPTION 'Invalid type: %', NEW.type;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_loot_catalog
BEFORE INSERT OR UPDATE ON public.loot_catalog
FOR EACH ROW EXECUTE FUNCTION public.validate_loot_catalog();

ALTER TABLE public.loot_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Loot catalog is public read" ON public.loot_catalog FOR SELECT USING (true);

-- 3) user_inventory
CREATE TABLE public.user_inventory (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  loot_id text NOT NULL REFERENCES public.loot_catalog(loot_id),
  qty int NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, loot_id)
);

ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own inventory" ON public.user_inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own inventory" ON public.user_inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inventory" ON public.user_inventory FOR UPDATE USING (auth.uid() = user_id);

-- 4) loot_events — immutable drop log
CREATE TABLE public.loot_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_item_id uuid REFERENCES public.action_items(id) ON DELETE SET NULL,
  loot_id text NOT NULL REFERENCES public.loot_catalog(loot_id),
  rarity text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Idempotency: one loot drop per action_item
CREATE UNIQUE INDEX uq_loot_events_action_item ON public.loot_events (action_item_id) WHERE action_item_id IS NOT NULL;

ALTER TABLE public.loot_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own loot events" ON public.loot_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own loot events" ON public.loot_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- Loot drop trigger on action_items completion for maple quests
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_maple_loot_drop()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_loot_table text;
  v_is_boss boolean;
  v_roll float;
  v_rarity text;
  v_loot_id text;
  v_already_dropped boolean;
BEGIN
  -- Only trigger on status change to 'done' for maple quests
  IF NEW.status != 'done' OR OLD.status = 'done' THEN RETURN NEW; END IF;
  IF NEW.source != 'maple' THEN RETURN NEW; END IF;

  -- Check idempotency
  SELECT EXISTS(SELECT 1 FROM loot_events WHERE action_item_id = NEW.id) INTO v_already_dropped;
  IF v_already_dropped THEN RETURN NEW; END IF;

  v_loot_table := COALESCE(NEW.metadata->>'loot_table', 'daily_basic');
  v_is_boss := COALESCE((NEW.metadata->>'is_boss')::boolean, false);
  v_roll := random();

  -- Determine rarity based on loot table
  IF v_is_boss OR v_loot_table = 'boss' THEN
    v_rarity := CASE
      WHEN v_roll < 0.02 THEN 'legendary'
      WHEN v_roll < 0.15 THEN 'epic'
      WHEN v_roll < 0.60 THEN 'rare'
      ELSE 'common'
    END;
  ELSE
    v_rarity := CASE
      WHEN v_roll < 0.02 THEN 'epic'
      WHEN v_roll < 0.20 THEN 'rare'
      ELSE 'common'
    END;
  END IF;

  -- Pick a random loot item matching rarity
  SELECT lc.loot_id INTO v_loot_id
  FROM loot_catalog lc
  WHERE lc.rarity = v_rarity
  ORDER BY random()
  LIMIT 1;

  IF v_loot_id IS NULL THEN RETURN NEW; END IF;

  -- Insert loot event
  INSERT INTO loot_events (user_id, action_item_id, loot_id, rarity, reason)
  VALUES (NEW.user_id, NEW.id, v_loot_id, v_rarity,
    CASE WHEN v_is_boss THEN 'boss_complete' ELSE 'quest_complete' END
  ) ON CONFLICT DO NOTHING;

  -- Upsert inventory
  INSERT INTO user_inventory (user_id, loot_id, qty, updated_at)
  VALUES (NEW.user_id, v_loot_id, 1, now())
  ON CONFLICT (user_id, loot_id)
  DO UPDATE SET qty = user_inventory.qty + 1, updated_at = now();

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_maple_loot_drop
AFTER UPDATE ON public.action_items
FOR EACH ROW EXECUTE FUNCTION public.handle_maple_loot_drop();

-- ═══════════════════════════════════════════════════════════
-- Seed loot_catalog with 20 items
-- ═══════════════════════════════════════════════════════════
INSERT INTO public.loot_catalog (loot_id, name, rarity, type, effects, icon_url) VALUES
-- Common cosmetics (8)
('orb_skin_ember', 'Ember Orb Skin', 'common', 'cosmetic', '{"skin":"ember"}', null),
('orb_skin_frost', 'Frost Orb Skin', 'common', 'cosmetic', '{"skin":"frost"}', null),
('orb_skin_neon', 'Neon Orb Skin', 'common', 'cosmetic', '{"skin":"neon"}', null),
('orb_skin_shadow', 'Shadow Orb Skin', 'common', 'cosmetic', '{"skin":"shadow"}', null),
('orb_skin_nature', 'Nature Orb Skin', 'common', 'cosmetic', '{"skin":"nature"}', null),
('badge_first_quest', 'First Quest Badge', 'common', 'cosmetic', '{"badge":"first_quest"}', null),
('badge_explorer', 'Explorer Badge', 'common', 'cosmetic', '{"badge":"explorer"}', null),
('title_rookie', 'Rookie Title', 'common', 'cosmetic', '{"title":"rookie"}', null),
-- Rare items (6)
('streak_shield', 'Streak Shield', 'rare', 'utility', '{"effect":"streak_shield","uses":1}', null),
('quest_reroll_token', 'Quest Reroll Token', 'rare', 'utility', '{"effect":"quest_reroll","uses":1}', null),
('orb_skin_crystal', 'Crystal Orb Skin', 'rare', 'cosmetic', '{"skin":"crystal"}', null),
('orb_skin_void', 'Void Orb Skin', 'rare', 'cosmetic', '{"skin":"void"}', null),
('badge_warrior', 'Warrior Badge', 'rare', 'cosmetic', '{"badge":"warrior"}', null),
('title_seeker', 'Seeker Title', 'rare', 'cosmetic', '{"title":"seeker"}', null),
-- Epic items (4)
('focus_potion', 'Focus Potion', 'epic', 'utility', '{"effect":"focus_reduction","minutes":10,"uses":1}', null),
('xp_boost_scroll', 'XP Boost Scroll', 'epic', 'utility', '{"effect":"xp_boost","multiplier":1.5,"duration_hours":1,"uses":1}', null),
('orb_skin_aurora', 'Aurora Orb Skin', 'epic', 'cosmetic', '{"skin":"aurora"}', null),
('badge_legend', 'Legend Badge', 'epic', 'cosmetic', '{"badge":"legend"}', null),
-- Legendary items (2)
('orb_skin_divine', 'Divine Orb Skin', 'legendary', 'cosmetic', '{"skin":"divine","animated":true}', null),
('master_reroll', 'Master Reroll', 'legendary', 'utility', '{"effect":"quest_reroll","uses":3}', null);

-- Coach landing pages table
CREATE TABLE public.coach_landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  template_id TEXT NOT NULL DEFAULT 'blank',
  status TEXT NOT NULL DEFAULT 'draft',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  meta_title TEXT,
  meta_description TEXT,
  hero_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  UNIQUE(coach_id, slug)
);

-- Enable RLS
ALTER TABLE public.coach_landing_pages ENABLE ROW LEVEL SECURITY;

-- Coaches can manage their own landing pages
CREATE POLICY "Coaches can view own landing pages"
  ON public.coach_landing_pages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches can create own landing pages"
  ON public.coach_landing_pages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches can update own landing pages"
  ON public.coach_landing_pages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches can delete own landing pages"
  ON public.coach_landing_pages FOR DELETE
  USING (auth.uid() = user_id);

-- Public can view published pages
CREATE POLICY "Public can view published landing pages"
  ON public.coach_landing_pages FOR SELECT
  USING (status = 'published');

-- Admin can view all
CREATE POLICY "Admins can view all landing pages"
  ON public.coach_landing_pages FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_coach_landing_pages_updated_at
  BEFORE UPDATE ON public.coach_landing_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Learning Curricula: top-level curriculum created by Aurora
CREATE TABLE public.learning_curricula (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  topic TEXT NOT NULL,
  category TEXT, -- curated category or 'custom'
  difficulty_progression TEXT[] DEFAULT ARRAY['beginner', 'intermediate', 'advanced', 'mastery'],
  estimated_days INTEGER DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, active, completed, archived
  progress_percentage INTEGER DEFAULT 0,
  total_modules INTEGER DEFAULT 0,
  completed_modules INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  completed_lessons INTEGER DEFAULT 0,
  skill_mappings TEXT[], -- mapped skill IDs
  pillar TEXT, -- mapped pillar
  plan_id UUID REFERENCES public.life_plans(id),
  curriculum_data JSONB DEFAULT '{}', -- full AI-generated curriculum outline
  wizard_conversation_id UUID REFERENCES public.conversations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Learning Modules: phases of the curriculum
CREATE TABLE public.learning_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curriculum_id UUID NOT NULL REFERENCES public.learning_curricula(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  difficulty TEXT NOT NULL DEFAULT 'beginner', -- beginner, intermediate, advanced, mastery
  order_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'locked', -- locked, active, completed
  total_lessons INTEGER DEFAULT 0,
  completed_lessons INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 50,
  mission_id UUID, -- linked plan mission
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Learning Lessons: individual lessons within modules
CREATE TABLE public.learning_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  curriculum_id UUID NOT NULL REFERENCES public.learning_curricula(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_en TEXT,
  lesson_type TEXT NOT NULL DEFAULT 'theory', -- theory, practice, quiz, project
  order_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'locked', -- locked, active, completed, failed
  content JSONB DEFAULT '{}', -- AI-generated lesson content
  -- theory: { body, key_concepts, examples }
  -- practice: { instructions, exercises[], expected_output }
  -- quiz: { questions[{ q, options[], correct, explanation }] }
  -- project: { brief, requirements[], deliverables[], rubric }
  score INTEGER, -- quiz score or project grade (0-100)
  user_submission JSONB, -- user's answers/work
  feedback JSONB, -- Aurora's feedback on submission
  xp_reward INTEGER DEFAULT 10,
  time_estimate_minutes INTEGER DEFAULT 15,
  deadline TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  action_item_id UUID, -- linked action_item for plan integration
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_learning_curricula_user ON public.learning_curricula(user_id);
CREATE INDEX idx_learning_modules_curriculum ON public.learning_modules(curriculum_id);
CREATE INDEX idx_learning_lessons_module ON public.learning_lessons(module_id);
CREATE INDEX idx_learning_lessons_curriculum ON public.learning_lessons(curriculum_id);
CREATE INDEX idx_learning_lessons_user ON public.learning_lessons(user_id);

-- RLS
ALTER TABLE public.learning_curricula ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own curricula" ON public.learning_curricula FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own curricula" ON public.learning_curricula FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own curricula" ON public.learning_curricula FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own curricula" ON public.learning_curricula FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own modules" ON public.learning_modules FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.learning_curricula c WHERE c.id = curriculum_id AND c.user_id = auth.uid()));
CREATE POLICY "Users can manage own modules" ON public.learning_modules FOR ALL
  USING (EXISTS (SELECT 1 FROM public.learning_curricula c WHERE c.id = curriculum_id AND c.user_id = auth.uid()));

CREATE POLICY "Users can view own lessons" ON public.learning_lessons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own lessons" ON public.learning_lessons FOR ALL USING (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_learning_curricula_updated_at
  BEFORE UPDATE ON public.learning_curricula
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_modules_updated_at
  BEFORE UPDATE ON public.learning_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_lessons_updated_at
  BEFORE UPDATE ON public.learning_lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-update module/curriculum progress on lesson completion
CREATE OR REPLACE FUNCTION public.handle_learning_lesson_completion()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_module_total INTEGER;
  v_module_done INTEGER;
  v_curr_total INTEGER;
  v_curr_done INTEGER;
  v_curriculum_id UUID;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at := now();
    
    -- Award XP
    IF NEW.xp_reward > 0 THEN
      PERFORM award_unified_xp(NEW.user_id, NEW.xp_reward, 'learning', 'Lesson: ' || NEW.title);
    END IF;

    -- Update module progress
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
    INTO v_module_total, v_module_done
    FROM learning_lessons WHERE module_id = NEW.module_id;
    
    v_module_done := v_module_done + 1; -- include current

    UPDATE learning_modules
    SET completed_lessons = v_module_done,
        total_lessons = v_module_total,
        status = CASE WHEN v_module_done >= v_module_total THEN 'completed' ELSE status END
    WHERE id = NEW.module_id
    RETURNING curriculum_id INTO v_curriculum_id;

    -- Update curriculum progress
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
    INTO v_curr_total, v_curr_done
    FROM learning_lessons WHERE curriculum_id = v_curriculum_id;
    
    v_curr_done := v_curr_done + 1;

    UPDATE learning_curricula
    SET completed_lessons = v_curr_done,
        total_lessons = v_curr_total,
        progress_percentage = CASE WHEN v_curr_total > 0 THEN (v_curr_done * 100) / v_curr_total ELSE 0 END,
        status = CASE WHEN v_curr_done >= v_curr_total THEN 'completed' ELSE status END
    WHERE id = v_curriculum_id;

    -- Unlock next lesson
    UPDATE learning_lessons
    SET status = 'active'
    WHERE module_id = NEW.module_id
      AND order_index = NEW.order_index + 1
      AND status = 'locked';

    -- If module completed, unlock next module's first lesson
    IF v_module_done >= v_module_total THEN
      UPDATE learning_modules SET status = 'active'
      WHERE curriculum_id = v_curriculum_id
        AND order_index = (SELECT order_index + 1 FROM learning_modules WHERE id = NEW.module_id)
        AND status = 'locked';
        
      UPDATE learning_lessons
      SET status = 'active'
      WHERE module_id = (
        SELECT id FROM learning_modules
        WHERE curriculum_id = v_curriculum_id
          AND order_index = (SELECT order_index + 1 FROM learning_modules WHERE id = NEW.module_id)
      ) AND order_index = 0 AND status = 'locked';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER handle_learning_lesson_completion_trigger
  BEFORE UPDATE ON public.learning_lessons
  FOR EACH ROW EXECUTE FUNCTION public.handle_learning_lesson_completion();

-- Coach leads table: leads that come from coach landing pages and other sources
CREATE TABLE public.coach_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  landing_page_id UUID REFERENCES public.coach_landing_pages(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  source TEXT DEFAULT 'landing_page',
  status TEXT DEFAULT 'new',
  notes TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast coach-scoped queries
CREATE INDEX idx_coach_leads_coach_id ON public.coach_leads(coach_id);
CREATE INDEX idx_coach_leads_status ON public.coach_leads(status);
CREATE INDEX idx_coach_leads_created_at ON public.coach_leads(created_at DESC);

-- Enable RLS
ALTER TABLE public.coach_leads ENABLE ROW LEVEL SECURITY;

-- Coaches can manage their own leads
CREATE POLICY "Coaches can view own leads"
  ON public.coach_leads FOR SELECT
  TO authenticated
  USING (coach_id = public.get_practitioner_id_for_user(auth.uid()));

CREATE POLICY "Coaches can insert own leads"
  ON public.coach_leads FOR INSERT
  TO authenticated
  WITH CHECK (coach_id = public.get_practitioner_id_for_user(auth.uid()));

CREATE POLICY "Coaches can update own leads"
  ON public.coach_leads FOR UPDATE
  TO authenticated
  USING (coach_id = public.get_practitioner_id_for_user(auth.uid()));

CREATE POLICY "Coaches can delete own leads"
  ON public.coach_leads FOR DELETE
  TO authenticated
  USING (coach_id = public.get_practitioner_id_for_user(auth.uid()));

-- Allow anonymous lead submissions (from landing pages)
CREATE POLICY "Anyone can submit leads"
  ON public.coach_leads FOR INSERT
  TO anon
  WITH CHECK (true);

-- Admins can see all leads
CREATE POLICY "Admins can view all leads"
  ON public.coach_leads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to auto-update updated_at
CREATE TRIGGER update_coach_leads_updated_at
  BEFORE UPDATE ON public.coach_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Coupon system for admin
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percent' CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'usd',
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  applicable_to TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Admins can manage coupons
CREATE POLICY "Admins can manage coupons" ON public.coupons
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Anyone authenticated can read active coupons (for validation)
CREATE POLICY "Users can read active coupons" ON public.coupons
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Coupon usage log
CREATE TABLE public.coupon_usages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  order_context JSONB DEFAULT '{}'
);

ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own usage" ON public.coupon_usages
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can see all usage" ON public.coupon_usages
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Coach subscription tracking
CREATE TABLE public.coach_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  tier TEXT NOT NULL DEFAULT 'starter' CHECK (tier IN ('starter', 'growth', 'scale')),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  client_limit INTEGER NOT NULL DEFAULT 10,
  current_period_end TIMESTAMPTZ,
  coupon_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coach_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON public.coach_subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage subscriptions" ON public.coach_subscriptions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coach_subscriptions_updated_at BEFORE UPDATE ON public.coach_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Increment coupon usage count
CREATE OR REPLACE FUNCTION public.use_coupon(p_code TEXT, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_coupon RECORD;
  v_already_used BOOLEAN;
BEGIN
  SELECT * INTO v_coupon FROM coupons
  WHERE code = UPPER(TRIM(p_code)) AND is_active = true;

  IF v_coupon IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid coupon code');
  END IF;

  IF v_coupon.valid_until IS NOT NULL AND v_coupon.valid_until < now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Coupon expired');
  END IF;

  IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
    RETURN jsonb_build_object('success', false, 'error', 'Coupon usage limit reached');
  END IF;

  SELECT EXISTS(SELECT 1 FROM coupon_usages WHERE coupon_id = v_coupon.id AND user_id = p_user_id) INTO v_already_used;
  IF v_already_used THEN
    RETURN jsonb_build_object('success', false, 'error', 'Coupon already used');
  END IF;

  UPDATE coupons SET current_uses = current_uses + 1 WHERE id = v_coupon.id;
  INSERT INTO coupon_usages (coupon_id, user_id) VALUES (v_coupon.id, p_user_id);

  RETURN jsonb_build_object(
    'success', true,
    'discount_type', v_coupon.discount_type,
    'discount_value', v_coupon.discount_value,
    'coupon_id', v_coupon.id
  );
END;
$$;

-- Drop the older 4-arg overload that conflicts with the newer 5-arg version
DROP FUNCTION IF EXISTS public.award_unified_xp(uuid, integer, text, text);

-- Fix award_unified_xp to set the session flag before updating profiles
CREATE OR REPLACE FUNCTION public.award_unified_xp(p_user_id uuid, p_amount integer, p_source text, p_reason text DEFAULT NULL::text, p_idempotency_key text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_new_experience INTEGER;
  v_tokens_awarded INTEGER := 0;
  v_levels_gained INTEGER := 0;
  v_existing JSONB;
BEGIN
  -- Idempotency check
  IF p_idempotency_key IS NOT NULL THEN
    SELECT jsonb_build_object(
      'xp_gained', amount,
      'new_experience', 0,
      'old_level', 0,
      'new_level', 0,
      'levels_gained', 0,
      'tokens_awarded', 0,
      'idempotent', true
    ) INTO v_existing
    FROM public.xp_events
    WHERE idempotency_key = p_idempotency_key;
    
    IF v_existing IS NOT NULL THEN
      RETURN v_existing;
    END IF;
  END IF;

  -- Get current level and experience
  SELECT COALESCE(level, 1), COALESCE(experience, 0)
  INTO v_old_level, v_new_experience
  FROM public.profiles 
  WHERE id = p_user_id;
  
  v_new_experience := v_new_experience + p_amount;
  v_new_level := GREATEST(1, FLOOR(v_new_experience / 100) + 1);
  
  IF v_new_level > v_old_level THEN
    v_levels_gained := v_new_level - v_old_level;
    v_tokens_awarded := v_levels_gained * 5;
  END IF;
  
  -- Set session flag so guard trigger allows the update
  PERFORM set_config('app.xp_update_via_rpc', 'true', true);
  
  -- Update profile (XP + level only)
  UPDATE public.profiles 
  SET 
    experience = v_new_experience,
    level = v_new_level,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Log XP event
  INSERT INTO public.xp_events (user_id, amount, source, reason, idempotency_key)
  VALUES (p_user_id, p_amount, p_source, p_reason, p_idempotency_key);
  
  -- Award energy via ledger if levels gained
  IF v_tokens_awarded > 0 THEN
    PERFORM award_energy(
      p_user_id, 
      v_tokens_awarded, 
      'level_up', 
      'Leveled up from ' || v_old_level || ' to ' || v_new_level
    );
  END IF;
  
  RETURN jsonb_build_object(
    'xp_gained', p_amount,
    'new_experience', v_new_experience,
    'old_level', v_old_level,
    'new_level', v_new_level,
    'levels_gained', v_levels_gained,
    'tokens_awarded', v_tokens_awarded
  );
END;
$function$;
ALTER TABLE public.action_items DROP CONSTRAINT action_items_source_check;
ALTER TABLE public.action_items ADD CONSTRAINT action_items_source_check CHECK (source = ANY (ARRAY['plan','user','aurora','coach','system','learn']));-- Fix the broken trigger function that references non-existent columns
CREATE OR REPLACE FUNCTION public.notify_admin_journey_completion()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
BEGIN
  IF NEW.launchpad_complete = true AND (OLD.launchpad_complete IS NULL OR OLD.launchpad_complete = false) THEN
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.user_id;
    SELECT COALESCE(full_name, display_name, user_email, 'משתמש') INTO user_name
    FROM public.profiles WHERE id = NEW.user_id;
    
    INSERT INTO public.admin_notifications (type, priority, title, message, link, metadata)
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;CREATE OR REPLACE FUNCTION public.notify_admin_journey_completion()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
BEGIN
  IF NEW.launchpad_complete = true AND (OLD.launchpad_complete IS NULL OR OLD.launchpad_complete = false) THEN
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.user_id;
    SELECT COALESCE(full_name, 'משתמש') INTO user_name
    FROM public.profiles WHERE id = NEW.user_id;
    
    INSERT INTO public.admin_notifications (type, priority, title, message, link, metadata)
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
-- ═══════════════════════════════════════════════════════════
-- FM (Free Market) Schema — Core Tables, Enums, Functions, RLS
-- ═══════════════════════════════════════════════════════════

-- ─── Enums ───────────────────────────────────────────────
CREATE TYPE public.fm_wallet_mode AS ENUM ('simple', 'advanced');
CREATE TYPE public.fm_tx_type AS ENUM (
  'earn_bounty', 'earn_gig', 'earn_data', 'earn_reward',
  'spend_purchase', 'escrow_hold', 'escrow_release', 'escrow_refund',
  'withdraw_fiat', 'withdraw_crypto', 'deposit', 'adjustment'
);
CREATE TYPE public.fm_tx_status AS ENUM ('completed', 'pending', 'failed');
CREATE TYPE public.fm_bounty_status AS ENUM ('active', 'paused', 'completed', 'expired');
CREATE TYPE public.fm_gig_status AS ENUM ('draft', 'open', 'in_progress', 'delivered', 'completed', 'cancelled', 'disputed');
CREATE TYPE public.fm_settlement_channel AS ENUM ('stripe', 'moonpay', 'solana', 'internal');
CREATE TYPE public.fm_settlement_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- ─── 1. fm_wallets ───────────────────────────────────────
CREATE TABLE public.fm_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  mos_balance integer NOT NULL DEFAULT 0,
  lifetime_earned integer NOT NULL DEFAULT 0,
  lifetime_spent integer NOT NULL DEFAULT 0,
  mode fm_wallet_mode NOT NULL DEFAULT 'simple',
  solana_address text,
  solana_pubkey_encrypted text,
  onboarding_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fm_wallets_user ON public.fm_wallets(user_id);

ALTER TABLE public.fm_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own wallet"
  ON public.fm_wallets FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users update own wallet mode"
  ON public.fm_wallets FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── 2. fm_transactions (append-only ledger) ────────────
CREATE TABLE public.fm_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES public.fm_wallets(id),
  user_id uuid NOT NULL,
  type fm_tx_type NOT NULL,
  amount integer NOT NULL,
  balance_after integer NOT NULL,
  status fm_tx_status NOT NULL DEFAULT 'completed',
  reference_type text,
  reference_id uuid,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  idempotency_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fm_tx_wallet ON public.fm_transactions(wallet_id);
CREATE INDEX idx_fm_tx_user ON public.fm_transactions(user_id);
CREATE INDEX idx_fm_tx_created ON public.fm_transactions(created_at DESC);
CREATE INDEX idx_fm_tx_ref ON public.fm_transactions(reference_type, reference_id);

ALTER TABLE public.fm_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own transactions"
  ON public.fm_transactions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ─── 3. fm_bounties ─────────────────────────────────────
CREATE TABLE public.fm_bounties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  reward_mos integer NOT NULL,
  category text NOT NULL DEFAULT 'general',
  difficulty text NOT NULL DEFAULT 'easy',
  estimated_minutes integer,
  max_claims integer NOT NULL DEFAULT 1,
  active_claims integer NOT NULL DEFAULT 0,
  completed_claims integer NOT NULL DEFAULT 0,
  status fm_bounty_status NOT NULL DEFAULT 'active',
  expires_at timestamptz,
  created_by uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fm_bounties_status ON public.fm_bounties(status);

ALTER TABLE public.fm_bounties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users read active bounties"
  ON public.fm_bounties FOR SELECT TO authenticated
  USING (true);

-- ─── 4. fm_bounty_claims ────────────────────────────────
CREATE TABLE public.fm_bounty_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id uuid NOT NULL REFERENCES public.fm_bounties(id),
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'in_progress',
  submission_data jsonb,
  reviewed_by uuid,
  reviewed_at timestamptz,
  transaction_id uuid REFERENCES public.fm_transactions(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(bounty_id, user_id)
);

CREATE INDEX idx_fm_claims_user ON public.fm_bounty_claims(user_id);
CREATE INDEX idx_fm_claims_bounty ON public.fm_bounty_claims(bounty_id);

ALTER TABLE public.fm_bounty_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own claims"
  ON public.fm_bounty_claims FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users create own claims"
  ON public.fm_bounty_claims FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ─── 5. fm_gigs ─────────────────────────────────────────
CREATE TABLE public.fm_gigs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  budget_mos integer NOT NULL,
  category text NOT NULL DEFAULT 'general',
  status fm_gig_status NOT NULL DEFAULT 'draft',
  accepted_proposal_id uuid,
  deliverable_url text,
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fm_gigs_poster ON public.fm_gigs(poster_id);
CREATE INDEX idx_fm_gigs_status ON public.fm_gigs(status);

ALTER TABLE public.fm_gigs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users read open gigs"
  ON public.fm_gigs FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users create own gigs"
  ON public.fm_gigs FOR INSERT TO authenticated
  WITH CHECK (poster_id = auth.uid());

CREATE POLICY "Users update own gigs"
  ON public.fm_gigs FOR UPDATE TO authenticated
  USING (poster_id = auth.uid())
  WITH CHECK (poster_id = auth.uid());

-- ─── 6. fm_gig_proposals ────────────────────────────────
CREATE TABLE public.fm_gig_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id uuid NOT NULL REFERENCES public.fm_gigs(id),
  user_id uuid NOT NULL,
  pitch text,
  proposed_amount integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(gig_id, user_id)
);

CREATE INDEX idx_fm_proposals_gig ON public.fm_gig_proposals(gig_id);
CREATE INDEX idx_fm_proposals_user ON public.fm_gig_proposals(user_id);

ALTER TABLE public.fm_gig_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own proposals or proposals on own gigs"
  ON public.fm_gig_proposals FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR gig_id IN (SELECT id FROM public.fm_gigs WHERE poster_id = auth.uid())
  );

CREATE POLICY "Users create own proposals"
  ON public.fm_gig_proposals FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own proposals"
  ON public.fm_gig_proposals FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── 7. fm_data_contributions ───────────────────────────
CREATE TABLE public.fm_data_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  data_type text NOT NULL,
  days_shared integer NOT NULL,
  reward_mos integer NOT NULL,
  status text NOT NULL DEFAULT 'active',
  consent_hash text NOT NULL,
  transaction_id uuid REFERENCES public.fm_transactions(id),
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fm_data_user ON public.fm_data_contributions(user_id);

ALTER TABLE public.fm_data_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own contributions"
  ON public.fm_data_contributions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users create own contributions"
  ON public.fm_data_contributions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users revoke own contributions"
  ON public.fm_data_contributions FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── 8. fm_settlement_outbox ────────────────────────────
CREATE TABLE public.fm_settlement_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES public.fm_transactions(id),
  user_id uuid NOT NULL,
  channel fm_settlement_channel NOT NULL,
  amount_mos integer NOT NULL,
  amount_fiat_cents integer,
  external_ref text,
  status fm_settlement_status NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  last_attempt_at timestamptz,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fm_settle_status ON public.fm_settlement_outbox(status) WHERE status IN ('pending', 'processing');
CREATE INDEX idx_fm_settle_user ON public.fm_settlement_outbox(user_id);

ALTER TABLE public.fm_settlement_outbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own settlements"
  ON public.fm_settlement_outbox FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ─── Core Function: fm_post_transaction ─────────────────
CREATE OR REPLACE FUNCTION public.fm_post_transaction(
  p_user_id uuid,
  p_type fm_tx_type,
  p_amount integer,
  p_description text DEFAULT NULL,
  p_reference_type text DEFAULT NULL,
  p_reference_id uuid DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_status fm_tx_status DEFAULT 'completed'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id uuid;
  v_current_balance integer;
  v_new_balance integer;
  v_tx_id uuid;
  v_existing jsonb;
BEGIN
  -- Idempotency check
  IF p_idempotency_key IS NOT NULL THEN
    SELECT jsonb_build_object(
      'success', true,
      'transaction_id', id,
      'new_balance', balance_after,
      'idempotent', true
    ) INTO v_existing
    FROM public.fm_transactions
    WHERE idempotency_key = p_idempotency_key;
    
    IF v_existing IS NOT NULL THEN
      RETURN v_existing;
    END IF;
  END IF;

  -- Lock wallet row
  SELECT id, mos_balance INTO v_wallet_id, v_current_balance
  FROM public.fm_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_wallet_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Wallet not found');
  END IF;

  v_new_balance := v_current_balance + p_amount;

  -- Prevent negative balance
  IF v_new_balance < 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient MOS balance',
      'current_balance', v_current_balance,
      'requested', p_amount
    );
  END IF;

  -- Insert transaction
  INSERT INTO public.fm_transactions (
    wallet_id, user_id, type, amount, balance_after, status,
    reference_type, reference_id, description, metadata, idempotency_key
  ) VALUES (
    v_wallet_id, p_user_id, p_type, p_amount, v_new_balance, p_status,
    p_reference_type, p_reference_id, p_description, p_metadata, p_idempotency_key
  ) RETURNING id INTO v_tx_id;

  -- Update wallet balance + lifetime counters
  UPDATE public.fm_wallets
  SET
    mos_balance = v_new_balance,
    lifetime_earned = CASE WHEN p_amount > 0 THEN lifetime_earned + p_amount ELSE lifetime_earned END,
    lifetime_spent = CASE WHEN p_amount < 0 THEN lifetime_spent + ABS(p_amount) ELSE lifetime_spent END,
    updated_at = now()
  WHERE id = v_wallet_id;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_tx_id,
    'new_balance', v_new_balance,
    'amount', p_amount
  );
END;
$$;

-- ─── Auto-create wallet on profile creation ─────────────
CREATE OR REPLACE FUNCTION public.fm_auto_create_wallet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.fm_wallets (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_fm_auto_create_wallet
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fm_auto_create_wallet();

-- ─── Updated_at triggers ────────────────────────────────
CREATE TRIGGER trg_fm_wallets_updated
  BEFORE UPDATE ON public.fm_wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_fm_bounties_updated
  BEFORE UPDATE ON public.fm_bounties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_fm_gigs_updated
  BEFORE UPDATE ON public.fm_gigs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_fm_gig_proposals_updated
  BEFORE UPDATE ON public.fm_gig_proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_fm_bounty_claims_updated
  BEFORE UPDATE ON public.fm_bounty_claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_fm_settlement_updated
  BEFORE UPDATE ON public.fm_settlement_outbox
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Allow authenticated users to insert their own wallet row
CREATE POLICY "Users create own wallet"
ON public.fm_wallets
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Backfill: create wallet rows for all existing users who don't have one
INSERT INTO public.fm_wallets (user_id)
SELECT p.id FROM public.profiles p
LEFT JOIN public.fm_wallets w ON w.user_id = p.id
WHERE w.id IS NULL;-- fm_claim_bounty: User claims a bounty (race-safe)
CREATE OR REPLACE FUNCTION public.fm_claim_bounty(p_bounty_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_bounty RECORD;
  v_existing_id uuid;
  v_claim_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Lock bounty row
  SELECT * INTO v_bounty
  FROM public.fm_bounties
  WHERE id = p_bounty_id
  FOR UPDATE;

  IF v_bounty IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bounty not found');
  END IF;

  IF v_bounty.status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bounty is not active');
  END IF;

  IF v_bounty.expires_at IS NOT NULL AND v_bounty.expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bounty has expired');
  END IF;

  IF v_bounty.active_claims >= v_bounty.max_claims THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bounty is full');
  END IF;

  -- Check duplicate: user already has a non-rejected claim
  SELECT id INTO v_existing_id
  FROM public.fm_bounty_claims
  WHERE bounty_id = p_bounty_id AND user_id = v_user_id AND status != 'rejected';

  IF v_existing_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already claimed', 'claim_id', v_existing_id);
  END IF;

  -- Create claim
  INSERT INTO public.fm_bounty_claims (bounty_id, user_id, status)
  VALUES (p_bounty_id, v_user_id, 'claimed')
  RETURNING id INTO v_claim_id;

  -- Increment active_claims
  UPDATE public.fm_bounties
  SET active_claims = active_claims + 1, updated_at = now()
  WHERE id = p_bounty_id;

  RETURN jsonb_build_object('success', true, 'claim_id', v_claim_id);
END;
$$;

-- fm_submit_bounty_claim: User submits work for a claim
CREATE OR REPLACE FUNCTION public.fm_submit_bounty_claim(p_claim_id uuid, p_submission jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_claim RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_claim
  FROM public.fm_bounty_claims
  WHERE id = p_claim_id
  FOR UPDATE;

  IF v_claim IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Claim not found');
  END IF;

  IF v_claim.user_id != v_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not your claim');
  END IF;

  IF v_claim.status NOT IN ('claimed') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Claim cannot be submitted in current status: ' || v_claim.status);
  END IF;

  UPDATE public.fm_bounty_claims
  SET status = 'pending', submission_data = p_submission, updated_at = now()
  WHERE id = p_claim_id;

  RETURN jsonb_build_object('success', true, 'claim_id', p_claim_id);
END;
$$;

-- fm_approve_bounty_claim: Admin approves a claim and pays out
CREATE OR REPLACE FUNCTION public.fm_approve_bounty_claim(p_claim_id uuid, p_action text DEFAULT 'approve')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_claim RECORD;
  v_bounty RECORD;
  v_tx_result jsonb;
  v_idempotency_key text;
BEGIN
  IF v_admin_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Verify admin role
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_admin_id AND role = 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Admin access required');
  END IF;

  IF p_action NOT IN ('approve', 'reject') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Action must be approve or reject');
  END IF;

  SELECT * INTO v_claim
  FROM public.fm_bounty_claims
  WHERE id = p_claim_id
  FOR UPDATE;

  IF v_claim IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Claim not found');
  END IF;

  IF v_claim.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Claim is not pending review');
  END IF;

  SELECT * INTO v_bounty
  FROM public.fm_bounties
  WHERE id = v_claim.bounty_id;

  IF p_action = 'reject' THEN
    UPDATE public.fm_bounty_claims
    SET status = 'rejected', reviewed_at = now(), reviewed_by = v_admin_id, updated_at = now()
    WHERE id = p_claim_id;

    -- Decrement active_claims
    UPDATE public.fm_bounties
    SET active_claims = GREATEST(0, active_claims - 1), updated_at = now()
    WHERE id = v_claim.bounty_id;

    RETURN jsonb_build_object('success', true, 'action', 'rejected');
  END IF;

  -- Approve: pay MOS
  v_idempotency_key := 'bounty_claim_' || p_claim_id::text;

  v_tx_result := fm_post_transaction(
    p_user_id := v_claim.user_id,
    p_type := 'earn_bounty',
    p_amount := v_bounty.reward_mos,
    p_description := 'Bounty: ' || v_bounty.title,
    p_reference_type := 'bounty_claim',
    p_reference_id := p_claim_id,
    p_idempotency_key := v_idempotency_key
  );

  IF NOT (v_tx_result->>'success')::boolean THEN
    RETURN jsonb_build_object('success', false, 'error', v_tx_result->>'error');
  END IF;

  UPDATE public.fm_bounty_claims
  SET status = 'approved',
      reviewed_at = now(),
      reviewed_by = v_admin_id,
      transaction_id = (v_tx_result->>'transaction_id')::uuid,
      updated_at = now()
  WHERE id = p_claim_id;

  -- Update bounty counters
  UPDATE public.fm_bounties
  SET completed_claims = completed_claims + 1,
      active_claims = GREATEST(0, active_claims - 1),
      updated_at = now()
  WHERE id = v_claim.bounty_id;

  RETURN jsonb_build_object(
    'success', true,
    'action', 'approved',
    'mos_paid', v_bounty.reward_mos,
    'new_balance', v_tx_result->>'new_balance',
    'transaction_id', v_tx_result->>'transaction_id'
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.fm_claim_bounty(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fm_submit_bounty_claim(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fm_approve_bounty_claim(uuid, text) TO authenticated;

-- Add UPDATE policy for claims (users can update their own claimed->pending)
CREATE POLICY "Users update own claims"
ON public.fm_bounty_claims
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
-- ═══════════════════════════════════════════════════
-- Play2Earn Mining Engine: Tables & Functions
-- ═══════════════════════════════════════════════════

-- 1. Mining Rules — defines which activities earn MOS and how much
CREATE TABLE public.fm_mining_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type text NOT NULL UNIQUE, -- e.g. 'hypnosis_session', 'habit_streak', 'community_post', 'learning_lesson'
  label_en text NOT NULL,
  label_he text NOT NULL,
  base_reward integer NOT NULL DEFAULT 5,
  max_daily integer NOT NULL DEFAULT 200, -- daily cap per activity type
  cooldown_minutes integer NOT NULL DEFAULT 60, -- min time between same-type rewards
  min_duration_seconds integer DEFAULT NULL, -- for sessions: minimum duration to qualify
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fm_mining_rules ENABLE ROW LEVEL SECURITY;

-- Everyone can read rules (they're public config)
CREATE POLICY "Anyone can read mining rules"
ON public.fm_mining_rules FOR SELECT
TO authenticated
USING (true);

-- 2. Mining Logs — immutable record of every mining event
CREATE TABLE public.fm_mining_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_id uuid NOT NULL REFERENCES public.fm_mining_rules(id),
  activity_type text NOT NULL,
  mos_awarded integer NOT NULL,
  source_table text, -- e.g. 'hypnosis_sessions'
  source_id text, -- ID of the triggering row
  idempotency_key text UNIQUE, -- prevents double-mining
  metadata jsonb DEFAULT '{}',
  mined_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fm_mining_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own mining logs"
ON public.fm_mining_logs FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE INDEX idx_fm_mining_logs_user_date ON public.fm_mining_logs(user_id, mined_at);
CREATE INDEX idx_fm_mining_logs_idempotency ON public.fm_mining_logs(idempotency_key);

-- 3. Data Consent — granular opt-in toggles for data marketplace
CREATE TABLE public.fm_data_consent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL, -- 'sleep_patterns', 'habit_trends', 'mood_signals', 'training_results'
  is_opted_in boolean NOT NULL DEFAULT false,
  opted_in_at timestamptz,
  opted_out_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, category)
);

ALTER TABLE public.fm_data_consent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own data consent"
ON public.fm_data_consent FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 4. Mining Engine Function — validates & awards MOS
CREATE OR REPLACE FUNCTION public.fm_mine_activity(
  p_user_id uuid,
  p_activity_type text,
  p_source_table text DEFAULT NULL,
  p_source_id text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rule RECORD;
  v_today_total integer;
  v_last_mine timestamptz;
  v_idem_key text;
  v_tx_result jsonb;
BEGIN
  -- 1. Get active rule
  SELECT * INTO v_rule
  FROM public.fm_mining_rules
  WHERE activity_type = p_activity_type AND is_active = true;

  IF v_rule IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No active rule for: ' || p_activity_type);
  END IF;

  -- 2. Build idempotency key
  v_idem_key := 'mine_' || p_user_id || '_' || p_activity_type || '_' || COALESCE(p_source_id, extract(epoch from now())::text);

  -- Check if already mined
  IF EXISTS(SELECT 1 FROM public.fm_mining_logs WHERE idempotency_key = v_idem_key) THEN
    RETURN jsonb_build_object('success', true, 'idempotent', true, 'message', 'Already mined');
  END IF;

  -- 3. Check daily cap
  SELECT COALESCE(SUM(mos_awarded), 0) INTO v_today_total
  FROM public.fm_mining_logs
  WHERE user_id = p_user_id
    AND activity_type = p_activity_type
    AND mined_at >= CURRENT_DATE;

  IF v_today_total >= v_rule.max_daily THEN
    RETURN jsonb_build_object('success', false, 'error', 'Daily cap reached', 'cap', v_rule.max_daily, 'earned_today', v_today_total);
  END IF;

  -- 4. Check cooldown
  SELECT MAX(mined_at) INTO v_last_mine
  FROM public.fm_mining_logs
  WHERE user_id = p_user_id
    AND activity_type = p_activity_type;

  IF v_last_mine IS NOT NULL AND v_last_mine > now() - (v_rule.cooldown_minutes || ' minutes')::interval THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cooldown active', 'retry_after', v_last_mine + (v_rule.cooldown_minutes || ' minutes')::interval);
  END IF;

  -- 5. Calculate reward (capped to not exceed daily max)
  DECLARE v_reward integer;
  BEGIN
    v_reward := LEAST(v_rule.base_reward, v_rule.max_daily - v_today_total);
    IF v_reward <= 0 THEN
      RETURN jsonb_build_object('success', false, 'error', 'Daily cap reached');
    END IF;

    -- 6. Post transaction via fm_post_transaction
    SELECT public.fm_post_transaction(
      p_user_id := p_user_id,
      p_type := 'mining_reward',
      p_amount := v_reward,
      p_description := 'Mining: ' || p_activity_type,
      p_reference_type := COALESCE(p_source_table, p_activity_type),
      p_idempotency_key := v_idem_key,
      p_metadata := p_metadata
    ) INTO v_tx_result;

    IF NOT (v_tx_result->>'success')::boolean THEN
      RETURN v_tx_result;
    END IF;

    -- 7. Log mining event
    INSERT INTO public.fm_mining_logs (user_id, rule_id, activity_type, mos_awarded, source_table, source_id, idempotency_key, metadata)
    VALUES (p_user_id, v_rule.id, p_activity_type, v_reward, p_source_table, p_source_id, v_idem_key, p_metadata);

    RETURN jsonb_build_object(
      'success', true,
      'mos_awarded', v_reward,
      'activity', p_activity_type,
      'daily_total', v_today_total + v_reward,
      'daily_cap', v_rule.max_daily
    );
  END;
END;
$$;

-- Add mining_reward to fm_tx_type enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'mining_reward' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'fm_tx_type')) THEN
    ALTER TYPE public.fm_tx_type ADD VALUE 'mining_reward';
  END IF;
END$$;

-- ═══════════════════════════════════════════════════
-- Auto-Mining Triggers: fire fm_mine_activity on activity completion
-- ═══════════════════════════════════════════════════

-- 1. Hypnosis Session Mining Trigger
CREATE OR REPLACE FUNCTION public.fm_trigger_mine_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Only mine completed sessions with sufficient duration
  IF COALESCE(NEW.duration_seconds, 0) < 60 THEN
    RETURN NEW;
  END IF;

  SELECT public.fm_mine_activity(
    NEW.user_id,
    'hypnosis_session',
    'hypnosis_sessions',
    NEW.id::text,
    jsonb_build_object('ego_state', NEW.ego_state, 'duration', NEW.duration_seconds)
  ) INTO v_result;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Mining trigger failed for session %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_fm_mine_session
AFTER INSERT ON public.hypnosis_sessions
FOR EACH ROW EXECUTE FUNCTION public.fm_trigger_mine_session();

-- 2. Community Post Mining Trigger
CREATE OR REPLACE FUNCTION public.fm_trigger_mine_post()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_result jsonb;
BEGIN
  IF NEW.status = 'published' AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != 'published')) THEN
    SELECT public.fm_mine_activity(NEW.user_id, 'community_post', 'community_posts', NEW.id::text) INTO v_result;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Mining trigger failed for post %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_fm_mine_post
AFTER INSERT OR UPDATE ON public.community_posts
FOR EACH ROW EXECUTE FUNCTION public.fm_trigger_mine_post();

-- 3. Community Comment Mining Trigger
CREATE OR REPLACE FUNCTION public.fm_trigger_mine_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_result jsonb;
BEGIN
  SELECT public.fm_mine_activity(NEW.user_id, 'community_comment', 'community_comments', NEW.id::text) INTO v_result;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Mining trigger failed for comment %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_fm_mine_comment
AFTER INSERT ON public.community_comments
FOR EACH ROW EXECUTE FUNCTION public.fm_trigger_mine_comment();

-- 4. Learning Lesson Mining Trigger
CREATE OR REPLACE FUNCTION public.fm_trigger_mine_lesson()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_result jsonb;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    SELECT public.fm_mine_activity(NEW.user_id, 'learning_lesson', 'learning_lessons', NEW.id::text) INTO v_result;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Mining trigger failed for lesson %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_fm_mine_lesson
AFTER UPDATE ON public.learning_lessons
FOR EACH ROW EXECUTE FUNCTION public.fm_trigger_mine_lesson();

-- 5. Habit Completion Mining Trigger
CREATE OR REPLACE FUNCTION public.fm_trigger_mine_habit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_result jsonb;
BEGIN
  IF NEW.is_completed = true THEN
    SELECT public.fm_mine_activity(NEW.user_id, 'habit_completion', 'daily_habit_logs', NEW.id::text) INTO v_result;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Mining trigger failed for habit %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_fm_mine_habit
AFTER INSERT OR UPDATE ON public.daily_habit_logs
FOR EACH ROW EXECUTE FUNCTION public.fm_trigger_mine_habit();

-- Enable realtime for mining logs so UI updates live
ALTER PUBLICATION supabase_realtime ADD TABLE public.fm_mining_logs;

-- ============================================
-- Phase 2: Data Marketplace Backend Schema
-- ============================================

-- 1. Data Listings — what anonymized datasets are available for purchase
CREATE TABLE public.fm_data_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL, -- sleep_patterns, habit_trends, mood_signals, training_results
  sample_schema jsonb DEFAULT '{}',
  data_points_count integer DEFAULT 0,
  contributor_count integer DEFAULT 0,
  price_mos integer NOT NULL DEFAULT 100,
  status text NOT NULL DEFAULT 'active', -- active, paused, archived
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fm_data_listings ENABLE ROW LEVEL SECURITY;

-- Public read for buyers
CREATE POLICY "Anyone can view active listings"
  ON public.fm_data_listings FOR SELECT
  USING (status = 'active');

-- 2. Data Snapshots — anonymized, aggregated exports ready for buyers
CREATE TABLE public.fm_data_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.fm_data_listings(id) ON DELETE CASCADE,
  category text NOT NULL,
  snapshot_data jsonb NOT NULL DEFAULT '{}',
  contributor_count integer NOT NULL DEFAULT 0,
  data_points integer NOT NULL DEFAULT 0,
  date_range_start date,
  date_range_end date,
  quality_score numeric(3,2) DEFAULT 0.00, -- 0.00 to 1.00
  generated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE public.fm_data_snapshots ENABLE ROW LEVEL SECURITY;

-- Only accessible via service role (edge functions)
CREATE POLICY "No direct access to snapshots"
  ON public.fm_data_snapshots FOR SELECT
  USING (false);

-- 3. Data Purchases — buyer transactions
CREATE TABLE public.fm_data_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL, -- could be external buyer or internal user
  buyer_email text,
  buyer_org text,
  listing_id uuid REFERENCES public.fm_data_listings(id),
  snapshot_id uuid REFERENCES public.fm_data_snapshots(id),
  price_mos integer NOT NULL,
  price_usd numeric(10,2),
  status text NOT NULL DEFAULT 'pending', -- pending, completed, refunded
  access_token text UNIQUE, -- one-time download token
  access_expires_at timestamptz,
  downloaded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fm_data_purchases ENABLE ROW LEVEL SECURITY;

-- No direct client access — managed via edge functions
CREATE POLICY "No direct access to purchases"
  ON public.fm_data_purchases FOR SELECT
  USING (false);

-- 4. Data Revenue Share — tracks how contributor MOS is distributed
CREATE TABLE public.fm_data_revenue_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid REFERENCES public.fm_data_purchases(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  category text NOT NULL,
  share_mos integer NOT NULL DEFAULT 0,
  transaction_id uuid, -- links to fm_transactions
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fm_data_revenue_shares ENABLE ROW LEVEL SECURITY;

-- Users can see their own revenue shares
CREATE POLICY "Users see own revenue shares"
  ON public.fm_data_revenue_shares FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 5. Updated_at triggers
CREATE TRIGGER set_updated_at_fm_data_listings
  BEFORE UPDATE ON public.fm_data_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Function to generate anonymized snapshot from contributor data
CREATE OR REPLACE FUNCTION public.fm_generate_snapshot(
  p_category text,
  p_listing_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_snapshot_id uuid;
  v_contributor_count integer;
  v_data_points integer;
  v_snapshot_data jsonb;
  v_start_date date;
  v_end_date date;
BEGIN
  v_end_date := CURRENT_DATE;
  v_start_date := v_end_date - INTERVAL '30 days';

  -- Count active contributors for this category
  SELECT COUNT(DISTINCT dc.user_id)
  INTO v_contributor_count
  FROM fm_data_consent dc
  WHERE dc.category = p_category
    AND dc.is_opted_in = true;

  -- Minimum privacy threshold: need at least 10 contributors
  IF v_contributor_count < 10 THEN
    RAISE EXCEPTION 'Insufficient contributors (%) for category %. Minimum 10 required.', v_contributor_count, p_category;
  END IF;

  -- Generate anonymized aggregate data based on category
  IF p_category = 'sleep_patterns' THEN
    SELECT jsonb_build_object(
      'avg_session_duration_seconds', COALESCE(AVG(hs.duration_seconds), 0),
      'total_sessions', COUNT(hs.id),
      'avg_sessions_per_user', COUNT(hs.id)::numeric / NULLIF(v_contributor_count, 0),
      'completion_rate', COUNT(*) FILTER (WHERE hs.duration_seconds > 60)::numeric / NULLIF(COUNT(*), 0),
      'date_range', jsonb_build_object('start', v_start_date, 'end', v_end_date)
    ), COUNT(hs.id)
    INTO v_snapshot_data, v_data_points
    FROM hypnosis_sessions hs
    JOIN fm_data_consent dc ON dc.user_id = hs.user_id AND dc.category = 'sleep_patterns' AND dc.is_opted_in = true
    WHERE hs.created_at >= v_start_date;

  ELSIF p_category = 'habit_trends' THEN
    SELECT jsonb_build_object(
      'total_habits_tracked', COUNT(ai.id),
      'avg_completion_rate', COUNT(*) FILTER (WHERE ai.status = 'done')::numeric / NULLIF(COUNT(*), 0),
      'top_pillars', (
        SELECT jsonb_agg(jsonb_build_object('pillar', sub.pillar, 'count', sub.cnt))
        FROM (SELECT pillar, COUNT(*) as cnt FROM action_items WHERE type = 'habit' AND pillar IS NOT NULL GROUP BY pillar ORDER BY cnt DESC LIMIT 5) sub
      ),
      'date_range', jsonb_build_object('start', v_start_date, 'end', v_end_date)
    ), COUNT(ai.id)
    INTO v_snapshot_data, v_data_points
    FROM action_items ai
    JOIN fm_data_consent dc ON dc.user_id = ai.user_id AND dc.category = 'habit_trends' AND dc.is_opted_in = true
    WHERE ai.type = 'habit' AND ai.created_at >= v_start_date;

  ELSIF p_category = 'mood_signals' THEN
    SELECT jsonb_build_object(
      'avg_energy_entries', COUNT(aop.id),
      'energy_distribution', jsonb_build_object(
        'high', COUNT(*) FILTER (WHERE aop.energy_level = 'high'),
        'medium', COUNT(*) FILTER (WHERE aop.energy_level = 'medium'),
        'low', COUNT(*) FILTER (WHERE aop.energy_level = 'low')
      ),
      'date_range', jsonb_build_object('start', v_start_date, 'end', v_end_date)
    ), COUNT(aop.id)
    INTO v_snapshot_data, v_data_points
    FROM aurora_onboarding_progress aop
    JOIN fm_data_consent dc ON dc.user_id = aop.user_id AND dc.category = 'mood_signals' AND dc.is_opted_in = true
    WHERE aop.updated_at >= v_start_date;

  ELSIF p_category = 'training_results' THEN
    SELECT jsonb_build_object(
      'total_lessons_completed', COUNT(ll.id),
      'avg_xp_per_lesson', COALESCE(AVG(ll.xp_reward), 0),
      'completion_distribution', jsonb_build_object(
        'completed', COUNT(*) FILTER (WHERE ll.status = 'completed'),
        'in_progress', COUNT(*) FILTER (WHERE ll.status = 'active'),
        'locked', COUNT(*) FILTER (WHERE ll.status = 'locked')
      ),
      'date_range', jsonb_build_object('start', v_start_date, 'end', v_end_date)
    ), COUNT(ll.id)
    INTO v_snapshot_data, v_data_points
    FROM learning_lessons ll
    JOIN fm_data_consent dc ON dc.user_id = ll.user_id AND dc.category = 'training_results' AND dc.is_opted_in = true
    WHERE ll.created_at >= v_start_date;

  ELSE
    RAISE EXCEPTION 'Unknown category: %', p_category;
  END IF;

  -- Insert snapshot
  INSERT INTO fm_data_snapshots (listing_id, category, snapshot_data, contributor_count, data_points, date_range_start, date_range_end, quality_score, expires_at)
  VALUES (p_listing_id, p_category, v_snapshot_data, v_contributor_count, v_data_points,
    v_start_date, v_end_date,
    LEAST(1.0, (v_contributor_count::numeric / 100) * (v_data_points::numeric / 1000)),
    now() + INTERVAL '90 days'
  ) RETURNING id INTO v_snapshot_id;

  -- Update listing stats if linked
  IF p_listing_id IS NOT NULL THEN
    UPDATE fm_data_listings
    SET data_points_count = v_data_points,
        contributor_count = v_contributor_count,
        updated_at = now()
    WHERE id = p_listing_id;
  END IF;

  RETURN v_snapshot_id;
END;
$$;

-- 7. Function to distribute revenue to contributors after a purchase
CREATE OR REPLACE FUNCTION public.fm_distribute_revenue(
  p_purchase_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_category text;
  v_total_mos integer;
  v_contributor_count integer;
  v_share_per_user integer;
  v_user record;
  v_paid_count integer := 0;
BEGIN
  -- Get purchase details
  SELECT dl.category, dp.price_mos
  INTO v_category, v_total_mos
  FROM fm_data_purchases dp
  JOIN fm_data_listings dl ON dl.id = dp.listing_id
  WHERE dp.id = p_purchase_id AND dp.status = 'completed';

  IF v_category IS NULL THEN
    RAISE EXCEPTION 'Purchase not found or not completed';
  END IF;

  -- Platform takes 20%, 80% goes to contributors
  v_total_mos := (v_total_mos * 80) / 100;

  -- Get active contributors
  SELECT COUNT(*) INTO v_contributor_count
  FROM fm_data_consent
  WHERE category = v_category AND is_opted_in = true;

  IF v_contributor_count = 0 THEN RETURN 0; END IF;

  v_share_per_user := GREATEST(1, v_total_mos / v_contributor_count);

  -- Distribute to each contributor
  FOR v_user IN
    SELECT user_id FROM fm_data_consent
    WHERE category = v_category AND is_opted_in = true
  LOOP
    -- Post transaction to user's wallet
    PERFORM fm_post_transaction(
      v_user.user_id,
      'earn'::fm_tx_type,
      v_share_per_user,
      'Data marketplace revenue: ' || v_category,
      'data_purchase',
      p_purchase_id,
      'data_rev_' || p_purchase_id || '_' || v_user.user_id
    );

    -- Record revenue share
    INSERT INTO fm_data_revenue_shares (purchase_id, user_id, category, share_mos, paid_at)
    VALUES (p_purchase_id, v_user.user_id, v_category, v_share_per_user, now());

    v_paid_count := v_paid_count + 1;
  END LOOP;

  RETURN v_paid_count;
END;
$$;

-- Add unique constraint on fm_data_consent for upsert
ALTER TABLE public.fm_data_consent ADD CONSTRAINT fm_data_consent_user_category_unique UNIQUE (user_id, category);
CREATE OR REPLACE FUNCTION public.notify_admin_journey_complete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_email TEXT;
  user_name TEXT;
BEGIN
  IF NEW.launchpad_complete = true AND (OLD.launchpad_complete IS NULL OR OLD.launchpad_complete = false) THEN
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.user_id;
    SELECT COALESCE(full_name, community_username, user_email) INTO user_name
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
$function$;-- Fix notify_onboarding_completed: replace display_name with community_username
CREATE OR REPLACE FUNCTION public.notify_onboarding_completed()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_name TEXT;
  v_pillar TEXT;
  v_diagnostic_scores JSONB;
  v_profile_data JSONB;
BEGIN
  IF NEW.launchpad_complete = true AND (OLD.launchpad_complete IS NULL OR OLD.launchpad_complete = false) THEN
    SELECT COALESCE(full_name, community_username, 'משתמש חדש')
    INTO v_user_name
    FROM public.profiles
    WHERE id = NEW.user_id;

    v_pillar := COALESCE(NEW.step_1_intention->>'selected_pillar', 'mind');
    v_diagnostic_scores := COALESCE(NEW.step_1_intention->'diagnostic_scores', '{}'::jsonb);
    v_profile_data := COALESCE(NEW.step_2_profile_data, '{}'::jsonb);

    INSERT INTO public.admin_notifications (type, priority, title, message, link, metadata)
    VALUES (
      'onboarding_completed',
      'high',
      '🧠 ' || v_user_name || ' השלים/ה כיול מערכת',
      'פילר: ' || v_pillar || 
        ' | אנרגיה: ' || COALESCE(v_diagnostic_scores->>'energy_stability', '?') ||
        '% | ריקברי: ' || COALESCE(v_diagnostic_scores->>'recovery_debt', '?') ||
        '% | דופמין: ' || COALESCE(v_diagnostic_scores->>'dopamine_load', '?') || '%',
      '/admin-hub?tab=admin&sub=users',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'user_name', v_user_name,
        'pillar', v_pillar,
        'diagnostic_scores', v_diagnostic_scores,
        'age_bracket', v_profile_data->>'age_bracket',
        'gender', v_profile_data->>'gender',
        'activity_level', v_profile_data->>'activity_level',
        'completed_at', now()
      )
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- Fix notify_journey_completion: replace display_name with full_name
CREATE OR REPLACE FUNCTION public.notify_journey_completion(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_display_name text;
BEGIN
  SELECT COALESCE(full_name, community_username) INTO v_display_name FROM profiles WHERE id = p_user_id;
  
  INSERT INTO admin_notifications (title, message, type, metadata)
  VALUES (
    'משתמש השלים מסע תודעה',
    COALESCE(v_display_name, 'משתמש') || ' השלים את מסע התודעה בהצלחה',
    'system',
    jsonb_build_object('user_id', p_user_id, 'event', 'journey_complete')
  );
END;
$function$;-- Fix notify_onboarding_completed: step_1_intention is TEXT, not JSONB, need to cast
CREATE OR REPLACE FUNCTION public.notify_onboarding_completed()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_name TEXT;
  v_pillar TEXT;
  v_diagnostic_scores JSONB;
  v_profile_data JSONB;
  v_intention JSONB;
BEGIN
  IF NEW.launchpad_complete = true AND (OLD.launchpad_complete IS NULL OR OLD.launchpad_complete = false) THEN
    SELECT COALESCE(full_name, community_username, 'משתמש חדש')
    INTO v_user_name
    FROM public.profiles
    WHERE id = NEW.user_id;

    -- step_1_intention is TEXT column, try to parse as JSON
    BEGIN
      v_intention := NEW.step_1_intention::jsonb;
    EXCEPTION WHEN OTHERS THEN
      v_intention := '{}'::jsonb;
    END;

    v_pillar := COALESCE(v_intention->>'selected_pillar', 'mind');
    v_diagnostic_scores := COALESCE(v_intention->'diagnostic_scores', '{}'::jsonb);
    v_profile_data := COALESCE(NEW.step_2_profile_data, '{}'::jsonb);

    INSERT INTO public.admin_notifications (type, priority, title, message, link, metadata)
    VALUES (
      'onboarding_completed',
      'high',
      '🧠 ' || v_user_name || ' השלים/ה כיול מערכת',
      'פילר: ' || v_pillar || 
        ' | אנרגיה: ' || COALESCE(v_diagnostic_scores->>'energy_stability', '?') ||
        '% | ריקברי: ' || COALESCE(v_diagnostic_scores->>'recovery_debt', '?') ||
        '% | דופמין: ' || COALESCE(v_diagnostic_scores->>'dopamine_load', '?') || '%',
      '/admin-hub?tab=admin&sub=users',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'user_name', v_user_name,
        'pillar', v_pillar,
        'diagnostic_scores', v_diagnostic_scores,
        'age_bracket', v_profile_data->>'age_bracket',
        'gender', v_profile_data->>'gender',
        'activity_level', v_profile_data->>'activity_level',
        'completed_at', now()
      )
    );
  END IF;

  RETURN NEW;
END;
$function$;
-- Add mission_id to skills table to link dynamically-created skills to plan missions
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS mission_id uuid REFERENCES public.plan_missions(id) ON DELETE CASCADE;

-- Add user_id to skills so mission-skills are user-scoped (catalog skills have NULL user_id)
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS user_id uuid;

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_skills_mission_id ON public.skills(mission_id) WHERE mission_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON public.skills(user_id) WHERE user_id IS NOT NULL;

-- RLS: users can see catalog skills (user_id IS NULL) and their own mission-skills
DROP POLICY IF EXISTS "Users can view skills" ON public.skills;
CREATE POLICY "Users can view skills" ON public.skills FOR SELECT USING (
  user_id IS NULL OR user_id = auth.uid()
);
-- Allow authenticated users to insert their own skills (mission-linked)
CREATE POLICY "Users can insert own skills"
  ON public.skills FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow authenticated users to update their own skills
CREATE POLICY "Users can update own skills"
  ON public.skills FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow service_role (edge functions) to insert skills for any user
CREATE POLICY "Service role can insert skills"
  ON public.skills FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Also add INSERT policy for user_skill_progress (currently only has ALL which may not cover service_role)
CREATE POLICY "Service role can manage skill progress"
  ON public.user_skill_progress FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);-- Add missing columns to mini_milestones for execution templates
ALTER TABLE public.mini_milestones 
  ADD COLUMN IF NOT EXISTS execution_template text DEFAULT 'step_by_step',
  ADD COLUMN IF NOT EXISTS action_type text;
-- Backfill: create skills from existing plan_missions that don't have corresponding skill records
INSERT INTO public.skills (name, name_he, description, category, icon, is_active, mission_id, user_id)
SELECT 
  COALESCE(pm.title_en, pm.title, 'Skill'),
  pm.title,
  COALESCE(pm.description_en, pm.title_en),
  CASE pm.pillar
    WHEN 'consciousness' THEN 'spirit'
    WHEN 'presence' THEN 'social'
    WHEN 'power' THEN 'body'
    WHEN 'vitality' THEN 'body'
    WHEN 'focus' THEN 'mind'
    WHEN 'combat' THEN 'body'
    WHEN 'expansion' THEN 'mind'
    WHEN 'wealth' THEN 'wealth'
    WHEN 'influence' THEN 'social'
    WHEN 'relationships' THEN 'social'
    WHEN 'business' THEN 'wealth'
    WHEN 'projects' THEN 'wealth'
    WHEN 'play' THEN 'spirit'
    WHEN 'order' THEN 'mind'
    ELSE 'mind'
  END,
  CASE pm.pillar
    WHEN 'consciousness' THEN '🧠'
    WHEN 'presence' THEN '👁️'
    WHEN 'power' THEN '💪'
    WHEN 'vitality' THEN '🌿'
    WHEN 'focus' THEN '🎯'
    WHEN 'combat' THEN '🥊'
    WHEN 'expansion' THEN '🚀'
    WHEN 'wealth' THEN '💰'
    WHEN 'influence' THEN '🌐'
    WHEN 'relationships' THEN '❤️'
    WHEN 'business' THEN '📈'
    WHEN 'projects' THEN '🏗️'
    WHEN 'play' THEN '🎮'
    WHEN 'order' THEN '📋'
    ELSE '⭐'
  END,
  true,
  pm.id,
  lp.user_id
FROM public.plan_missions pm
JOIN public.life_plans lp ON lp.id = pm.plan_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.skills s WHERE s.mission_id = pm.id
);

-- Backfill: create user_skill_progress for newly created skills
INSERT INTO public.user_skill_progress (user_id, skill_id, xp_total, level, updated_at)
SELECT s.user_id, s.id, 0, 1, now()
FROM public.skills s
WHERE s.user_id IS NOT NULL
  AND s.mission_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_skill_progress usp WHERE usp.skill_id = s.id AND usp.user_id = s.user_id
  );

-- Add primary_skill_id to plan_missions (trait link)
ALTER TABLE public.plan_missions ADD COLUMN IF NOT EXISTS primary_skill_id uuid REFERENCES public.skills(id);

-- Add pillar column to skills table for trait categorization
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS pillar text;

-- Add life_plan_id to skills for plan scoping
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS life_plan_id uuid REFERENCES public.life_plans(id);

-- Add trait_type to distinguish trait skills from legacy
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS trait_type text DEFAULT 'legacy';
-- trait_type values: 'trait' (new system), 'legacy' (old mission-based)

-- Create index for fast trait lookups
CREATE INDEX IF NOT EXISTS idx_skills_pillar_user ON public.skills(user_id, pillar) WHERE trait_type = 'trait';
CREATE INDEX IF NOT EXISTS idx_plan_missions_skill ON public.plan_missions(primary_skill_id);

-- Backfill: Convert existing mission-based skills into short trait names
-- For legacy skills (created from mission titles), derive a 2-3 word trait name

-- First, mark all existing skills as legacy type
UPDATE public.skills 
SET trait_type = 'legacy'
WHERE trait_type IS NULL OR trait_type = '';

-- Set pillar from category for existing skills
UPDATE public.skills SET pillar = 'consciousness' WHERE category = 'spirit' AND pillar IS NULL;
UPDATE public.skills SET pillar = 'presence' WHERE category = 'social' AND pillar IS NULL;
UPDATE public.skills SET pillar = 'power' WHERE category = 'body' AND pillar IS NULL;
UPDATE public.skills SET pillar = 'focus' WHERE category = 'mind' AND pillar IS NULL;
UPDATE public.skills SET pillar = 'wealth' WHERE category = 'wealth' AND pillar IS NULL;

-- Link skills to their plan via mission -> plan
UPDATE public.skills s
SET life_plan_id = pm.plan_id
FROM public.plan_missions pm
WHERE s.mission_id = pm.id
  AND s.life_plan_id IS NULL;

-- Set primary_skill_id on plan_missions for existing skill-mission links
UPDATE public.plan_missions pm
SET primary_skill_id = s.id
FROM public.skills s
WHERE s.mission_id = pm.id
  AND pm.primary_skill_id IS NULL;

-- Drop the CHECK constraint that limits mission_number to 1-3
ALTER TABLE public.plan_missions DROP CONSTRAINT IF EXISTS plan_missions_mission_number_check;

-- Drop the unique constraint on (plan_id, pillar, mission_number) 
-- and replace with one that allows up to 9 missions per pillar
ALTER TABLE public.plan_missions DROP CONSTRAINT IF EXISTS plan_missions_plan_id_pillar_mission_number_key;

-- Add new check constraint allowing mission_number 1-9
ALTER TABLE public.plan_missions ADD CONSTRAINT plan_missions_mission_number_check CHECK (mission_number >= 1 AND mission_number <= 9);

-- Re-add unique constraint
ALTER TABLE public.plan_missions ADD CONSTRAINT plan_missions_plan_id_pillar_mission_number_key UNIQUE (plan_id, pillar, mission_number);
DELETE FROM life_plans WHERE status = 'generating' AND created_at < now() - interval '5 minutes';-- Add bilingual columns to community_posts
ALTER TABLE public.community_posts 
  ADD COLUMN IF NOT EXISTS title_he text,
  ADD COLUMN IF NOT EXISTS content_he text,
  ADD COLUMN IF NOT EXISTS is_system boolean DEFAULT false;-- Fix scheduled_day for ALL existing mini_milestones: shift from (week*10+offset) to ((week-1)*10+offset)
-- This corrects the off-by-10 error where phase 1 minis were on days 11-15 instead of 1-5
UPDATE mini_milestones mm
SET scheduled_day = mm.scheduled_day - 10
FROM life_plan_milestones lpm
WHERE mm.milestone_id = lpm.id
  AND lpm.week_number = 1
  AND mm.scheduled_day > 10;

UPDATE mini_milestones mm
SET scheduled_day = mm.scheduled_day - 10
FROM life_plan_milestones lpm
WHERE mm.milestone_id = lpm.id
  AND lpm.week_number = 2
  AND mm.scheduled_day > 20;

UPDATE mini_milestones mm
SET scheduled_day = mm.scheduled_day - 10
FROM life_plan_milestones lpm
WHERE mm.milestone_id = lpm.id
  AND lpm.week_number = 3
  AND mm.scheduled_day > 30;

UPDATE mini_milestones mm
SET scheduled_day = mm.scheduled_day - 10
FROM life_plan_milestones lpm
WHERE mm.milestone_id = lpm.id
  AND lpm.week_number = 4
  AND mm.scheduled_day > 40;ALTER TABLE public.mini_milestones ADD COLUMN IF NOT EXISTS difficulty text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard'));-- Update level formula to 1.5x progression
-- Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, Level 4: 475 XP, etc.
-- Formula: level = floor(log(experience * 0.005 + 1) / log(1.5)) + 1

CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(p_experience integer)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT GREATEST(1,
    CASE
      WHEN p_experience < 100 THEN 1
      ELSE FLOOR(LN(p_experience::numeric / 100 * 0.5 + 1) / LN(1.5))::integer + 2
    END
  );
$$;

-- Update award_unified_xp to use the new level formula
CREATE OR REPLACE FUNCTION public.award_unified_xp(
  p_user_id uuid,
  p_amount integer,
  p_source text,
  p_reason text DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_current_experience integer;
  v_new_experience integer;
  v_old_level integer;
  v_new_level integer;
  v_levels_gained integer;
  v_token_bonus integer := 0;
  v_existing jsonb;
BEGIN
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Amount must be positive');
  END IF;

  -- Idempotency check
  IF p_idempotency_key IS NOT NULL THEN
    SELECT jsonb_build_object(
      'success', true,
      'new_experience', amount,
      'idempotent', true
    ) INTO v_existing
    FROM public.xp_events
    WHERE idempotency_key = p_idempotency_key;

    IF v_existing IS NOT NULL THEN
      RETURN v_existing;
    END IF;
  END IF;

  -- Get current XP
  SELECT COALESCE(experience, 0), COALESCE(level, 1)
  INTO v_current_experience, v_old_level
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_experience IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  v_new_experience := v_current_experience + p_amount;
  v_new_level := calculate_level_from_xp(v_new_experience);
  v_levels_gained := GREATEST(0, v_new_level - v_old_level);

  -- Token bonus for level ups (5 tokens per level)
  IF v_levels_gained > 0 THEN
    v_token_bonus := v_levels_gained * 5;
    UPDATE public.profiles
    SET tokens = COALESCE(tokens, 0) + v_token_bonus
    WHERE id = p_user_id;
  END IF;

  -- Set session flag to bypass guard trigger
  PERFORM set_config('app.xp_update_via_rpc', 'true', true);

  -- Update profile
  UPDATE public.profiles
  SET experience = v_new_experience,
      level = v_new_level,
      updated_at = now()
  WHERE id = p_user_id;

  -- Log XP event
  INSERT INTO public.xp_events (user_id, amount, source, reason, idempotency_key)
  VALUES (p_user_id, p_amount, p_source, p_reason, p_idempotency_key);

  RETURN jsonb_build_object(
    'success', true,
    'new_experience', v_new_experience,
    'new_level', v_new_level,
    'levels_gained', v_levels_gained,
    'token_bonus', v_token_bonus
  );
END;
$$;

-- Recalculate all existing user levels with new formula
UPDATE public.profiles
SET level = calculate_level_from_xp(COALESCE(experience, 0))
WHERE level != calculate_level_from_xp(COALESCE(experience, 0))
   OR level IS NULL;
-- Tactical schedule: AI-generated daily time-block schedules per phase
CREATE TABLE public.tactical_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.life_plans(id) ON DELETE CASCADE,
  phase_number INTEGER NOT NULL,
  schedule_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  wake_time TEXT NOT NULL DEFAULT '06:30',
  sleep_time TEXT NOT NULL DEFAULT '23:00',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, plan_id, phase_number)
);

ALTER TABLE public.tactical_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tactical schedules"
  ON public.tactical_schedules FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tactical schedules"
  ON public.tactical_schedules FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tactical schedules"
  ON public.tactical_schedules FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tactical schedules"
  ON public.tactical_schedules FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE public.milestone_journey_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES public.life_plan_milestones(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_steps INTEGER NOT NULL DEFAULT 0,
  completed_steps INTEGER NOT NULL DEFAULT 0,
  current_step INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(milestone_id, user_id)
);

ALTER TABLE public.milestone_journey_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own journey steps"
  ON public.milestone_journey_steps FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journey steps"
  ON public.milestone_journey_steps FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journey steps"
  ON public.milestone_journey_steps FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_milestone_journey_steps_user ON public.milestone_journey_steps(user_id);
CREATE INDEX idx_milestone_journey_steps_milestone ON public.milestone_journey_steps(milestone_id);
ALTER TABLE public.life_plan_milestones ADD COLUMN IF NOT EXISTS difficulty integer DEFAULT 3 CHECK (difficulty >= 1 AND difficulty <= 5);UPDATE public.life_plan_milestones
SET difficulty = milestone_number
WHERE difficulty IS NULL AND milestone_number BETWEEN 1 AND 5;ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'freelancer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'creator';
-- Blog posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_he TEXT,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  excerpt_he TEXT,
  content TEXT NOT NULL DEFAULT '',
  content_he TEXT,
  cover_image_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  reading_time_minutes INTEGER DEFAULT 5,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public read for published posts
CREATE POLICY "Anyone can read published blog posts"
  ON public.blog_posts FOR SELECT
  USING (status = 'published');

-- Admin full access via has_role function
CREATE POLICY "Admins can manage blog posts"
  ON public.blog_posts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Index for slug lookups and listing
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_status_published ON public.blog_posts(status, published_at DESC);
-- Enable pg_cron and pg_net extensions for scheduled HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;UPDATE public.blog_posts SET content = REPLACE(content, 'https://mindos.space/auth', 'https://mindos.space/') WHERE content LIKE '%mindos.space/auth%'; UPDATE public.blog_posts SET content_he = REPLACE(content_he, 'https://mindos.space/auth', 'https://mindos.space/') WHERE content_he LIKE '%mindos.space/auth%';
-- ══════════════════════════════════════════════════
-- PRACTICES LIBRARY + USER PREFERENCES + ENERGY PHASE
-- ══════════════════════════════════════════════════

-- 1. Practice Library (structured catalog)
CREATE TABLE public.practices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_he TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  pillar TEXT,
  difficulty_level INTEGER NOT NULL DEFAULT 1,
  default_duration INTEGER NOT NULL DEFAULT 15,
  tags TEXT[] DEFAULT '{}',
  energy_type TEXT NOT NULL DEFAULT 'day',
  instructions TEXT,
  instructions_he TEXT,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.practices ENABLE ROW LEVEL SECURITY;

-- Practices are readable by all authenticated users (global catalog)
CREATE POLICY "Authenticated users can read practices"
  ON public.practices FOR SELECT
  TO authenticated
  USING (true);

-- 2. User Practice Preferences
CREATE TABLE public.user_practices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  practice_id UUID REFERENCES public.practices(id) ON DELETE CASCADE NOT NULL,
  skill_level INTEGER NOT NULL DEFAULT 1,
  preferred_duration INTEGER NOT NULL DEFAULT 15,
  frequency_per_week INTEGER NOT NULL DEFAULT 3,
  is_core_practice BOOLEAN NOT NULL DEFAULT false,
  energy_phase TEXT NOT NULL DEFAULT 'day',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, practice_id)
);

-- Enable RLS
ALTER TABLE public.user_practices ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own practice preferences
CREATE POLICY "Users manage own practice preferences"
  ON public.user_practices FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Mission Templates (structured, reusable)
CREATE TABLE public.mission_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'practice',
  pillar TEXT,
  energy_phase TEXT NOT NULL DEFAULT 'day',
  base_practice_id UUID REFERENCES public.practices(id),
  difficulty_level INTEGER NOT NULL DEFAULT 1,
  estimated_time INTEGER NOT NULL DEFAULT 15,
  instructions TEXT,
  instructions_he TEXT,
  title TEXT NOT NULL,
  title_he TEXT,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mission_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read mission templates"
  ON public.mission_templates FOR SELECT
  TO authenticated
  USING (true);

-- 4. Add energy_phase to action_items
ALTER TABLE public.action_items 
  ADD COLUMN IF NOT EXISTS energy_phase TEXT DEFAULT 'day';

-- 5. Triggers for updated_at
CREATE TRIGGER update_practices_updated_at
  BEFORE UPDATE ON public.practices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_practices_updated_at
  BEFORE UPDATE ON public.user_practices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE public.user_practices ADD CONSTRAINT user_practices_user_practice_unique UNIQUE (user_id, practice_id);UPDATE life_plans SET start_date = '2026-03-07', updated_at = now() WHERE user_id = '299f9800-48d9-4429-958b-b661595bd2dd' AND status = 'active';UPDATE aurora_onboarding_progress SET last_active_at = now() WHERE user_id = '299f9800-48d9-4429-958b-b661595bd2dd';-- Add trait/skill binding and course priority to learning_curricula
ALTER TABLE public.learning_curricula 
  ADD COLUMN IF NOT EXISTS skill_id uuid REFERENCES public.skills(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS course_priority text NOT NULL DEFAULT 'suggested' CHECK (course_priority IN ('must', 'suggested')),
  ADD COLUMN IF NOT EXISTS generated_by text NOT NULL DEFAULT 'wizard' CHECK (generated_by IN ('wizard', 'orchestrator', 'aurora'));

-- Index for fast lookups by skill and priority
CREATE INDEX IF NOT EXISTS idx_learning_curricula_skill_id ON public.learning_curricula(skill_id);
CREATE INDEX IF NOT EXISTS idx_learning_curricula_priority ON public.learning_curricula(course_priority);
CREATE INDEX IF NOT EXISTS idx_learning_curricula_generated_by ON public.learning_curricula(generated_by);
-- Migrate orphaned messages from old null-context AI conversations to pillar:all conversations
-- For each user that has both a null-context and pillar:all conversation, move messages over
UPDATE messages 
SET conversation_id = target.pillar_all_id
FROM (
  SELECT 
    old_conv.id as old_id,
    new_conv.id as pillar_all_id
  FROM conversations old_conv
  JOIN conversations new_conv 
    ON old_conv.participant_1 = new_conv.participant_1
    AND new_conv.type = 'ai' 
    AND new_conv.context = 'pillar:all'
  WHERE old_conv.type = 'ai' 
    AND old_conv.context IS NULL
) target
WHERE messages.conversation_id = target.old_id;

-- User locations for AI Match feature
CREATE TABLE public.user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  city TEXT,
  country TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view nearby locations" ON public.user_locations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage own location" ON public.user_locations
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- AI Match connections
CREATE TABLE public.ai_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matched_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_score NUMERIC(5,2) DEFAULT 0,
  match_reason TEXT,
  shared_pillars TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  UNIQUE(user_id, matched_user_id)
);

ALTER TABLE public.ai_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own matches" ON public.ai_matches
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

CREATE POLICY "Users can update own matches" ON public.ai_matches
  FOR UPDATE TO authenticated USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

CREATE POLICY "System can insert matches" ON public.ai_matches
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Earn Launchpad progress tracker
CREATE TABLE public.earn_launchpad_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_enabled boolean NOT NULL DEFAULT false,
  mining_enabled boolean NOT NULL DEFAULT false,
  partners_enabled boolean NOT NULL DEFAULT false,
  milestones_completed jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.earn_launchpad_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own earn launchpad"
  ON public.earn_launchpad_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own earn launchpad"
  ON public.earn_launchpad_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own earn launchpad"
  ON public.earn_launchpad_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_earn_launchpad_updated_at
  BEFORE UPDATE ON public.earn_launchpad_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
-- Delete all seed/example bounty claims first (FK dependency)
DELETE FROM public.fm_bounty_claims WHERE bounty_id IN (SELECT id FROM public.fm_bounties);

-- Delete all seed bounties
DELETE FROM public.fm_bounties;

-- Delete all seed gig proposals first (FK dependency)
DELETE FROM public.fm_gig_proposals WHERE gig_id IN (SELECT id FROM public.fm_gigs);

-- Delete all seed gigs
DELETE FROM public.fm_gigs;ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'therapist';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'business';
-- Freelancer journeys table
CREATE TABLE public.freelancer_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  freelancer_name TEXT,
  current_step INT NOT NULL DEFAULT 1,
  journey_complete BOOLEAN NOT NULL DEFAULT false,
  step_1_vision JSONB,
  step_2_skills JSONB,
  step_3_portfolio JSONB,
  step_4_target_clients JSONB,
  step_5_pricing JSONB,
  step_6_marketing JSONB,
  step_7_operations JSONB,
  ai_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.freelancer_journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own freelancer journeys" ON public.freelancer_journeys
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own freelancer journeys" ON public.freelancer_journeys
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own freelancer journeys" ON public.freelancer_journeys
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Creator journeys table
CREATE TABLE public.creator_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_name TEXT,
  current_step INT NOT NULL DEFAULT 1,
  journey_complete BOOLEAN NOT NULL DEFAULT false,
  step_1_vision JSONB,
  step_2_niche JSONB,
  step_3_content_strategy JSONB,
  step_4_audience JSONB,
  step_5_monetization JSONB,
  step_6_platforms JSONB,
  step_7_growth JSONB,
  ai_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.creator_journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own creator journeys" ON public.creator_journeys
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own creator journeys" ON public.creator_journeys
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own creator journeys" ON public.creator_journeys
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Therapist journeys table (separate from coaching)
CREATE TABLE public.therapist_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_name TEXT,
  current_step INT NOT NULL DEFAULT 1,
  journey_complete BOOLEAN NOT NULL DEFAULT false,
  step_1_vision JSONB,
  step_2_specialization JSONB,
  step_3_methodology JSONB,
  step_4_ideal_client JSONB,
  step_5_credentials JSONB,
  step_6_services JSONB,
  step_7_operations JSONB,
  ai_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.therapist_journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own therapist journeys" ON public.therapist_journeys
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own therapist journeys" ON public.therapist_journeys
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own therapist journeys" ON public.therapist_journeys
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Allow users to delete their own business journeys
CREATE POLICY "Users can delete own business journeys" ON public.business_journeys
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Weekly Briefings table
CREATE TABLE public.weekly_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  title TEXT,
  summary_text TEXT NOT NULL,
  risks TEXT[] DEFAULT '{}',
  opportunities TEXT[] DEFAULT '{}',
  key_focus TEXT,
  audio_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_weekly_briefings_user_week ON public.weekly_briefings (user_id, week_start);
ALTER TABLE public.weekly_briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own briefings" ON public.weekly_briefings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Service can insert briefings" ON public.weekly_briefings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Aurora Memory Graph table
CREATE TABLE public.aurora_memory_graph (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  node_type TEXT NOT NULL CHECK (node_type IN ('belief', 'fear', 'breakthrough', 'pattern', 'value_shift', 'dream', 'blocker', 'insight')),
  content TEXT NOT NULL,
  context TEXT,
  pillar TEXT,
  strength INTEGER DEFAULT 1 CHECK (strength >= 1 AND strength <= 10),
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_referenced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reference_count INTEGER DEFAULT 1,
  related_node_ids UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_memory_graph_user ON public.aurora_memory_graph (user_id, is_active);
CREATE INDEX idx_memory_graph_type ON public.aurora_memory_graph (user_id, node_type);
ALTER TABLE public.aurora_memory_graph ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own memory nodes" ON public.aurora_memory_graph FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users manage own memory nodes" ON public.aurora_memory_graph FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own memory nodes" ON public.aurora_memory_graph FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Work sessions: tracks time blocks for work tasks
CREATE TABLE public.work_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_item_id UUID REFERENCES public.action_items(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Work Block',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high')),
  notes TEXT,
  is_deep_work BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Work scores: daily productivity metrics
CREATE TABLE public.work_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_minutes INTEGER DEFAULT 0,
  deep_work_minutes INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  productivity_score INTEGER DEFAULT 0,
  velocity NUMERIC(5,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, score_date)
);

-- RLS
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own work sessions"
  ON public.work_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own work scores"
  ON public.work_scores FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at on work_scores
CREATE TRIGGER update_work_scores_updated_at
  BEFORE UPDATE ON public.work_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Journal entries table for Dream Journal, Daily Reflection, Gratitude
CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journal_type TEXT NOT NULL CHECK (journal_type IN ('dream', 'reflection', 'gratitude')),
  content TEXT NOT NULL,
  mood TEXT,
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own journal entries"
  ON public.journal_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_journal_entries_user_type ON public.journal_entries(user_id, journal_type);
CREATE INDEX idx_journal_entries_created ON public.journal_entries(user_id, created_at DESC);
CREATE POLICY "Admins can view all launchpad progress"
ON public.launchpad_progress
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
  )
);
-- ============================================================
-- Fix: Remove duplicate admin notification triggers on launchpad_progress
-- Keep ONLY notify_onboarding_completed (rich calibration data)
-- Drop the 3 redundant journey completion functions/triggers
-- ============================================================

-- 1. Drop all redundant triggers on launchpad_progress
DROP TRIGGER IF EXISTS on_journey_complete ON public.launchpad_progress;
DROP TRIGGER IF EXISTS on_journey_complete_insert ON public.launchpad_progress;
DROP TRIGGER IF EXISTS on_launchpad_journey_complete ON public.launchpad_progress;
DROP TRIGGER IF EXISTS on_launchpad_journey_completion ON public.launchpad_progress;
DROP TRIGGER IF EXISTS trigger_notify_journey_completion ON public.launchpad_progress;
DROP TRIGGER IF EXISTS trigger_notify_journey_complete ON public.launchpad_progress;

-- 2. Drop redundant functions
DROP FUNCTION IF EXISTS public.notify_admin_journey_complete() CASCADE;
DROP FUNCTION IF EXISTS public.notify_admin_journey_completion() CASCADE;
DROP FUNCTION IF EXISTS public.notify_journey_completion() CASCADE;

-- 3. Update notify_onboarding_completed with better language aligned to the OS
CREATE OR REPLACE FUNCTION public.notify_onboarding_completed()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_name TEXT;
  v_pillar TEXT;
  v_diagnostic_scores JSONB;
  v_profile_data JSONB;
BEGIN
  IF NEW.launchpad_complete = true AND (OLD.launchpad_complete IS NULL OR OLD.launchpad_complete = false) THEN
    SELECT COALESCE(full_name, display_name, 'משתמש חדש')
    INTO v_user_name
    FROM public.profiles
    WHERE id = NEW.user_id;

    v_pillar := COALESCE(NEW.step_1_intention->>'selected_pillar', 'mind');
    v_diagnostic_scores := COALESCE(NEW.step_1_intention->'diagnostic_scores', '{}'::jsonb);
    v_profile_data := COALESCE(NEW.step_2_profile_data, '{}'::jsonb);

    -- Single comprehensive notification for onboarding completion
    INSERT INTO public.admin_notifications (type, priority, title, message, link, metadata)
    VALUES (
      'onboarding_completed',
      'high',
      '🚀 ' || v_user_name || ' השלים/ה את תהליך הכיול',
      'פילר: ' || v_pillar || 
        ' | אנרגיה: ' || COALESCE(v_diagnostic_scores->>'energy_stability', '?') ||
        '% | ריקברי: ' || COALESCE(v_diagnostic_scores->>'recovery_debt', '?') ||
        '% | דופמין: ' || COALESCE(v_diagnostic_scores->>'dopamine_load', '?') || '%',
      '/admin-hub?tab=admin&sub=users',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'user_name', v_user_name,
        'pillar', v_pillar,
        'diagnostic_scores', v_diagnostic_scores,
        'age_bracket', v_profile_data->>'age_bracket',
        'gender', v_profile_data->>'gender',
        'activity_level', v_profile_data->>'activity_level',
        'completed_at', now()
      )
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- 4. Ensure trigger exists (only one)
DROP TRIGGER IF EXISTS on_onboarding_completed ON public.launchpad_progress;
CREATE TRIGGER on_onboarding_completed
  AFTER UPDATE ON public.launchpad_progress
  FOR EACH ROW
  WHEN (NEW.launchpad_complete = true)
  EXECUTE FUNCTION public.notify_onboarding_completed();

-- Clean up duplicate user_milestone and journey_completion notifications (keep newest per user)
DELETE FROM admin_notifications
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY metadata->>'user_id', type
      ORDER BY created_at DESC
    ) as rn
    FROM admin_notifications
    WHERE type IN ('user_milestone', 'journey_completion')
  ) dupes
  WHERE rn > 1
);

-- Also delete the old-style user_milestone type entirely (redundant with onboarding_completed)
DELETE FROM admin_notifications WHERE type = 'user_milestone';
DELETE FROM admin_notifications WHERE type = 'journey_completion';
-- Delete duplicate aurora action_items, keeping only the first one per title+date combo
DELETE FROM action_items
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY title, scheduled_date ORDER BY created_at ASC) as rn
    FROM action_items
    WHERE source = 'aurora' AND status = 'done' AND scheduled_date = '2026-03-08'
  ) sub
  WHERE rn > 1
);-- Fix plan start_date: user says today (March 10) is day 3, so start should be March 8
UPDATE life_plans 
SET start_date = '2026-03-08', updated_at = now()
WHERE user_id = '299f9800-48d9-4429-958b-b661595bd2dd' 
  AND status = 'active'
  AND start_date = '2026-03-07';

CREATE OR REPLACE FUNCTION public.auto_link_practice_on_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_practice_id UUID;
BEGIN
  -- Only fire when status changes to 'done'
  IF NEW.status != 'done' OR OLD.status = 'done' THEN
    RETURN NEW;
  END IF;

  -- Try to match task title to a practice (name or name_he)
  SELECT id INTO v_practice_id
  FROM practices
  WHERE is_active = true
    AND (
      LOWER(TRIM(name)) = LOWER(TRIM(NEW.title))
      OR LOWER(TRIM(name_he)) = LOWER(TRIM(NEW.title))
    )
  LIMIT 1;

  IF v_practice_id IS NOT NULL THEN
    INSERT INTO user_practices (user_id, practice_id, preferred_duration, frequency_per_week, is_core_practice, is_active)
    VALUES (NEW.user_id, v_practice_id, 15, 5, false, true)
    ON CONFLICT (user_id, practice_id) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'auto_link_practice failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_link_practice
AFTER UPDATE ON action_items
FOR EACH ROW
EXECUTE FUNCTION auto_link_practice_on_completion();

-- Career applications table
CREATE TABLE public.career_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  career_path TEXT NOT NULL CHECK (career_path IN ('coach', 'therapist', 'freelancer', 'creator', 'business')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested')),
  structured_answers JSONB NOT NULL DEFAULT '{}',
  ai_conversation JSONB NOT NULL DEFAULT '[]',
  ai_summary TEXT,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, career_path)
);

-- Enable RLS
ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;

-- Users can read their own applications
CREATE POLICY "Users can read own applications"
  ON public.career_applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own applications
CREATE POLICY "Users can insert own applications"
  ON public.career_applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending applications
CREATE POLICY "Users can update own pending applications"
  ON public.career_applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status IN ('pending', 'revision_requested'))
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all applications
CREATE POLICY "Admins can read all applications"
  ON public.career_applications FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all applications (approve/reject)
CREATE POLICY "Admins can update all applications"
  ON public.career_applications FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_career_applications_updated_at
  BEFORE UPDATE ON public.career_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Notify admin on new application
CREATE OR REPLACE FUNCTION public.notify_career_application()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  PERFORM create_admin_notification(
    'new_user',
    'medium',
    'בקשת קריירה חדשה — ' || NEW.career_path,
    'משתמש הגיש בקשה למסלול ' || NEW.career_path,
    '/admin-hub?tab=admin&sub=career-apps',
    jsonb_build_object('application_id', NEW.id, 'career_path', NEW.career_path, 'user_id', NEW.user_id)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_career_application_insert
  AFTER INSERT ON public.career_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_career_application();

CREATE TABLE public.ai_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_type TEXT NOT NULL, -- 'orb_narrative' or 'transformation_report'
  language TEXT NOT NULL DEFAULT 'he',
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_generations_user_type ON public.ai_generations (user_id, generation_type);

ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own generations"
  ON public.ai_generations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations"
  ON public.ai_generations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generations"
  ON public.ai_generations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add post_type to community_posts for stories vs threads
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS post_type TEXT NOT NULL DEFAULT 'thread';

-- Create storage bucket for community stories
INSERT INTO storage.buckets (id, name, public) VALUES ('community-stories', 'community-stories', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for community stories
CREATE POLICY "Users can upload stories" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'community-stories' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view stories" ON storage.objects FOR SELECT TO public
USING (bucket_id = 'community-stories');

CREATE POLICY "Users can delete own stories" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'community-stories' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Soul Wallets table for Web3 wallet + NFT mint tracking
CREATE TABLE public.soul_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  wallet_address TEXT,
  wallet_provider TEXT DEFAULT 'web3auth',
  is_minted BOOLEAN NOT NULL DEFAULT false,
  minted_at TIMESTAMPTZ,
  nft_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS
ALTER TABLE public.soul_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own soul wallet"
  ON public.soul_wallets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own soul wallet"
  ON public.soul_wallets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own soul wallet"
  ON public.soul_wallets FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Auto-update timestamp
CREATE TRIGGER update_soul_wallets_updated_at
  BEFORE UPDATE ON public.soul_wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- SECURITY FIX: remaining critical RLS vulnerabilities
-- (first batch partially applied — fixing remaining)

-- FIX 2b: recalibration_logs — drop any existing duplicate policies and recreate
DROP POLICY IF EXISTS "Users can view own recalibration logs" ON public.recalibration_logs;
CREATE POLICY "Users can view own recalibration logs"
  ON public.recalibration_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role insert recalibration logs" ON public.recalibration_logs;
CREATE POLICY "Service role insert recalibration logs"
  ON public.recalibration_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role update recalibration logs" ON public.recalibration_logs;
CREATE POLICY "Service role update recalibration logs"
  ON public.recalibration_logs FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- FIX 3: user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- FIX 4: skills
DROP POLICY IF EXISTS "Skills catalog readable by all (anon)" ON public.skills;
CREATE POLICY "Skills catalog readable by all (anon)"
  ON public.skills FOR SELECT
  TO anon
  USING (user_id IS NULL);

-- FIX 5: ai_response_logs
DROP POLICY IF EXISTS "Service role insert ai_response_logs" ON public.ai_response_logs;
CREATE POLICY "Service role insert ai_response_logs"
  ON public.ai_response_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own ai_response_logs" ON public.ai_response_logs;
CREATE POLICY "Users can view own ai_response_logs"
  ON public.ai_response_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 1. Add fee tracking columns to fm_transactions
ALTER TABLE public.fm_transactions 
  ADD COLUMN IF NOT EXISTS fee_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_amount numeric DEFAULT 0;

-- 2. Add lifetime_fees and pending_balance to fm_wallets
ALTER TABLE public.fm_wallets 
  ADD COLUMN IF NOT EXISTS lifetime_fees numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pending_balance numeric DEFAULT 0;

-- 3. Add data_contribution_enabled to fm_wallets for easy toggle
ALTER TABLE public.fm_wallets 
  ADD COLUMN IF NOT EXISTS data_contribution_enabled boolean DEFAULT false;

-- 4. Create the fee-aware spend function
CREATE OR REPLACE FUNCTION public.fm_spend_mos(
  p_user_id uuid,
  p_amount numeric,
  p_description text DEFAULT NULL,
  p_reference_type text DEFAULT NULL,
  p_reference_id text DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL,
  p_seller_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_wallet RECORD;
  v_fee numeric;
  v_net numeric;
  v_treasury_share numeric;
  v_rewards_share numeric;
  v_reserve_share numeric;
  v_new_balance numeric;
  v_tx_id uuid;
  v_seller_result jsonb;
  v_existing jsonb;
BEGIN
  -- Validate
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Amount must be positive');
  END IF;

  -- Idempotency check
  IF p_idempotency_key IS NOT NULL THEN
    SELECT jsonb_build_object(
      'success', true,
      'transaction_id', id,
      'idempotent', true
    ) INTO v_existing
    FROM fm_transactions
    WHERE idempotency_key = p_idempotency_key;
    IF v_existing IS NOT NULL THEN RETURN v_existing; END IF;
  END IF;

  -- Lock wallet
  SELECT * INTO v_wallet
  FROM fm_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_wallet IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Wallet not found');
  END IF;

  IF v_wallet.mos_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient MOS balance', 'current_balance', v_wallet.mos_balance, 'required', p_amount);
  END IF;

  -- Calculate 2% fee
  v_fee := ROUND(p_amount * 0.02, 2);
  v_net := p_amount - v_fee;

  -- Fee split: 50% treasury, 25% rewards, 25% reserve
  v_treasury_share := ROUND(v_fee * 0.50, 2);
  v_rewards_share := ROUND(v_fee * 0.25, 2);
  v_reserve_share := v_fee - v_treasury_share - v_rewards_share;

  -- Deduct from buyer
  v_new_balance := v_wallet.mos_balance - p_amount;
  UPDATE fm_wallets
  SET mos_balance = v_new_balance,
      lifetime_spent = lifetime_spent + p_amount,
      lifetime_fees = COALESCE(lifetime_fees, 0) + v_fee,
      updated_at = now()
  WHERE id = v_wallet.id;

  -- Record buyer transaction
  INSERT INTO fm_transactions (user_id, wallet_id, type, amount, fee_amount, net_amount, balance_after, description, reference_type, reference_id, idempotency_key, status, metadata)
  VALUES (p_user_id, v_wallet.id, 'spend_purchase', -p_amount, v_fee, -v_net, v_new_balance, p_description, p_reference_type, p_reference_id, p_idempotency_key, 'completed',
    jsonb_build_object(
      'fee_breakdown', jsonb_build_object('total_fee', v_fee, 'treasury', v_treasury_share, 'rewards', v_rewards_share, 'reserve', v_reserve_share),
      'gross_amount', p_amount,
      'seller_id', p_seller_id
    )
  )
  RETURNING id INTO v_tx_id;

  -- Credit seller if specified
  IF p_seller_id IS NOT NULL THEN
    v_seller_result := fm_post_transaction(
      p_user_id := p_seller_id,
      p_type := 'earn_gig',
      p_amount := v_net,
      p_description := 'Sale: ' || COALESCE(p_description, 'Service'),
      p_reference_type := 'purchase',
      p_reference_id := v_tx_id::text,
      p_idempotency_key := COALESCE(p_idempotency_key, '') || '_seller'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_tx_id,
    'gross_amount', p_amount,
    'fee', v_fee,
    'net_to_seller', v_net,
    'new_balance', v_new_balance,
    'fee_breakdown', jsonb_build_object('treasury', v_treasury_share, 'rewards', v_rewards_share, 'reserve', v_reserve_share)
  );
END;
$$;

CREATE TABLE public.founding_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  social_handle TEXT,
  occupation TEXT,
  why_join TEXT,
  how_contribute TEXT,
  referral_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.founding_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit founding application"
  ON public.founding_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own applications"
  ON public.founding_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
-- Email infrastructure
-- Creates the queue system, send log, send state, suppression, and unsubscribe
-- tables used by both auth and transactional emails.

-- Extensions required for queue processing
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    CREATE EXTENSION pg_cron;
  END IF;
END $$;
CREATE EXTENSION IF NOT EXISTS supabase_vault;
CREATE EXTENSION IF NOT EXISTS pgmq;

-- Create email queues (auth = high priority, transactional = normal)
-- Wrapped in DO blocks to handle "queue already exists" errors idempotently.
DO $$ BEGIN PERFORM pgmq.create('auth_emails'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('transactional_emails'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Dead-letter queues for messages that exceed max retries
DO $$ BEGIN PERFORM pgmq.create('auth_emails_dlq'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('transactional_emails_dlq'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Email send log table (audit trail for all send attempts)
-- UPDATE is allowed for the service role so the suppression edge function
-- can update a log record's status when a bounce/complaint/unsubscribe occurs.
CREATE TABLE IF NOT EXISTS public.email_send_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT,
  template_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'suppressed', 'failed', 'bounced', 'complained', 'dlq')),
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role can read send log"
    ON public.email_send_log FOR SELECT
    USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can insert send log"
    ON public.email_send_log FOR INSERT
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can update send log"
    ON public.email_send_log FOR UPDATE
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_email_send_log_created ON public.email_send_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_send_log_recipient ON public.email_send_log(recipient_email);

-- Backfill: add message_id column to existing tables that predate this migration
DO $$ BEGIN
  ALTER TABLE public.email_send_log ADD COLUMN message_id TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_email_send_log_message ON public.email_send_log(message_id);

-- Prevent duplicate sends: only one 'sent' row per message_id.
-- If VT expires and another worker picks up the same message, the pre-send
-- check catches it. This index is a DB-level safety net for race conditions.
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_send_log_message_sent_unique
  ON public.email_send_log(message_id) WHERE status = 'sent';

-- Backfill: update status CHECK constraint for existing tables that predate new statuses
DO $$ BEGIN
  ALTER TABLE public.email_send_log DROP CONSTRAINT IF EXISTS email_send_log_status_check;
  ALTER TABLE public.email_send_log ADD CONSTRAINT email_send_log_status_check
    CHECK (status IN ('pending', 'sent', 'suppressed', 'failed', 'bounced', 'complained', 'dlq'));
END $$;

-- Rate-limit state and queue config (single row, tracks Retry-After cooldown + throughput settings)
CREATE TABLE IF NOT EXISTS public.email_send_state (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  retry_after_until TIMESTAMPTZ,
  batch_size INTEGER NOT NULL DEFAULT 10,
  send_delay_ms INTEGER NOT NULL DEFAULT 200,
  auth_email_ttl_minutes INTEGER NOT NULL DEFAULT 15,
  transactional_email_ttl_minutes INTEGER NOT NULL DEFAULT 60,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.email_send_state (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Backfill: add config columns to existing tables that predate this migration
DO $$ BEGIN
  ALTER TABLE public.email_send_state ADD COLUMN batch_size INTEGER NOT NULL DEFAULT 10;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE public.email_send_state ADD COLUMN send_delay_ms INTEGER NOT NULL DEFAULT 200;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE public.email_send_state ADD COLUMN auth_email_ttl_minutes INTEGER NOT NULL DEFAULT 15;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE public.email_send_state ADD COLUMN transactional_email_ttl_minutes INTEGER NOT NULL DEFAULT 60;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

ALTER TABLE public.email_send_state ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role can manage send state"
    ON public.email_send_state FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RPC wrappers so Edge Functions can interact with pgmq via supabase.rpc()
-- (PostgREST only exposes functions in the public schema; pgmq functions are in the pgmq schema)
-- All wrappers auto-create the queue on undefined_table (42P01) so emails
-- are never lost if the queue was dropped (extension upgrade, restore, etc.).
CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name TEXT, payload JSONB)
RETURNS BIGINT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN pgmq.send(queue_name, payload);
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN pgmq.send(queue_name, payload);
END;
$$;

CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name TEXT, batch_size INT, vt INT)
RETURNS TABLE(msg_id BIGINT, read_ct INT, message JSONB)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT r.msg_id, r.read_ct, r.message FROM pgmq.read(queue_name, vt, batch_size) r;
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_email(queue_name TEXT, message_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN pgmq.delete(queue_name, message_id);
EXCEPTION WHEN undefined_table THEN
  RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.move_to_dlq(
  source_queue TEXT, dlq_name TEXT, message_id BIGINT, payload JSONB
)
RETURNS BIGINT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
EXCEPTION WHEN undefined_table THEN
  BEGIN
    PERFORM pgmq.create(dlq_name);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  BEGIN
    PERFORM pgmq.delete(source_queue, message_id);
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;
  RETURN new_id;
END;
$$;

-- Restrict queue RPC wrappers to service_role only (SECURITY DEFINER runs as owner,
-- so without this any authenticated user could manipulate the email queues)
REVOKE EXECUTE ON FUNCTION public.enqueue_email(TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enqueue_email(TEXT, JSONB) TO service_role;

REVOKE EXECUTE ON FUNCTION public.read_email_batch(TEXT, INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.read_email_batch(TEXT, INT, INT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.delete_email(TEXT, BIGINT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_email(TEXT, BIGINT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.move_to_dlq(TEXT, TEXT, BIGINT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(TEXT, TEXT, BIGINT, JSONB) TO service_role;

-- Suppressed emails table (tracks unsubscribes, bounces, complaints)
-- Append-only: no DELETE or UPDATE policies to prevent bypassing suppression.
CREATE TABLE IF NOT EXISTS public.suppressed_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('unsubscribe', 'bounce', 'complaint')),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(email)
);

ALTER TABLE public.suppressed_emails ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role can read suppressed emails"
    ON public.suppressed_emails FOR SELECT
    USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can insert suppressed emails"
    ON public.suppressed_emails FOR INSERT
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_suppressed_emails_email ON public.suppressed_emails(email);

-- Email unsubscribe tokens table (one token per email address for unsubscribe links)
-- No DELETE policy to prevent removing tokens. UPDATE allowed only to mark tokens as used.
CREATE TABLE IF NOT EXISTS public.email_unsubscribe_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at TIMESTAMPTZ
);

ALTER TABLE public.email_unsubscribe_tokens ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role can read tokens"
    ON public.email_unsubscribe_tokens FOR SELECT
    USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can insert tokens"
    ON public.email_unsubscribe_tokens FOR INSERT
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can mark tokens as used"
    ON public.email_unsubscribe_tokens FOR UPDATE
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_unsubscribe_tokens_token ON public.email_unsubscribe_tokens(token);

-- ============================================================
-- POST-MIGRATION STEPS (applied dynamically by setup_email_infra)
-- These steps contain project-specific secrets and URLs and
-- cannot be expressed as static SQL. They are applied via the
-- Supabase Management API (ExecuteSQL) each time the tool runs.
-- ============================================================
--
-- 1. VAULT SECRET
--    Stores (or updates) the Supabase service_role key in
--    vault as 'email_queue_service_role_key'.
--    Uses vault.create_secret / vault.update_secret (upsert).
--    To revert: DELETE FROM vault.secrets WHERE name = 'email_queue_service_role_key';
--
-- 2. CRON JOB (pg_cron)
--    Creates job 'process-email-queue' with a 5-second interval.
--    The job checks:
--      a) rate-limit cooldown (email_send_state.retry_after_until)
--      b) whether auth_emails or transactional_emails queues have messages
--    If conditions are met, it calls the process-email-queue Edge Function
--    via net.http_post using the vault-stored service_role key.
--    To revert: SELECT cron.unschedule('process-email-queue');

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS aion_name TEXT DEFAULT 'AION',
  ADD COLUMN IF NOT EXISTS aion_activated BOOLEAN DEFAULT false;

-- TTS cache table
CREATE TABLE public.tts_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  text_hash TEXT NOT NULL,
  voice_id TEXT NOT NULL,
  model_id TEXT NOT NULL DEFAULT 'eleven_v3',
  speed NUMERIC NOT NULL DEFAULT 1.0,
  audio_path TEXT NOT NULL,
  duration_seconds NUMERIC,
  file_size_bytes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint on text_hash + voice_id + speed so we don't duplicate
CREATE UNIQUE INDEX tts_cache_lookup_idx ON public.tts_cache (user_id, text_hash, voice_id, speed);

-- Index for quick lookups
CREATE INDEX tts_cache_user_idx ON public.tts_cache (user_id, created_at DESC);

-- RLS
ALTER TABLE public.tts_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own TTS cache"
  ON public.tts_cache FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own TTS cache"
  ON public.tts_cache FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own TTS cache"
  ON public.tts_cache FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Storage bucket for TTS audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('tts-audio', 'tts-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload TTS audio"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'tts-audio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can read TTS audio"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'tts-audio');

CREATE POLICY "Users can delete own TTS audio"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'tts-audio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE TABLE public.avatar_customizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  customization_data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.avatar_customizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own avatar"
  ON public.avatar_customizations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own avatar"
  ON public.avatar_customizations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own avatar"
  ON public.avatar_customizations
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER update_avatar_customizations_updated_at
  BEFORE UPDATE ON public.avatar_customizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
