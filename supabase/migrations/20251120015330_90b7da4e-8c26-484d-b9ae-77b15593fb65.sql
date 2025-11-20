-- ============================================
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
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);