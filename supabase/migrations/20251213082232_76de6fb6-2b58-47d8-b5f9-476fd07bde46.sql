-- Fix leads table RLS - add restrictive policy to block non-admin SELECT access
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
USING (has_role(auth.uid(), 'admin'::app_role));