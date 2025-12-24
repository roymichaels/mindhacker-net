-- Fix security issue #1: Explicitly block non-admin access to leads table
-- Drop existing policies that might allow access
DROP POLICY IF EXISTS "Block non-admin lead access" ON public.leads;

-- Create explicit deny policy for non-admins on SELECT
CREATE POLICY "Block non-admin lead select" 
ON public.leads 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix security issue #2: Remove public read access to user_audio_access
-- This exposed access tokens to everyone
DROP POLICY IF EXISTS "Anyone can read audio access by token" ON public.user_audio_access;