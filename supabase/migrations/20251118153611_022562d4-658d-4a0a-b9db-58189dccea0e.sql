-- Phase 1: Content Library Platform Database Schema

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
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));