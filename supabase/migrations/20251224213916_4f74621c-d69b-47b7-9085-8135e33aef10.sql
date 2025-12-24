-- Fix security issue: Explicitly block anonymous/non-admin access to leads table
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
);