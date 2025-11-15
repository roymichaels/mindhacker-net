-- Phase 1: Database Security - RLS Policy Fixes

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
USING (false);