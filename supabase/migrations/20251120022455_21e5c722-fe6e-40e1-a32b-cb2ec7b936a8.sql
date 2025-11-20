-- ============================================
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
USING (false);