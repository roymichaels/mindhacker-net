-- ============================================
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
USING (auth.uid() IS NOT NULL);