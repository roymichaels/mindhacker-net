-- Fix newsletter_subscribers: Block non-admin from reading subscriber data
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
USING (has_role(auth.uid(), 'admin'::app_role));