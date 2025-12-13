-- Fix security: Add SELECT policies to protect lead data from public access

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
END $$;