-- Fix RLS policies for public data access
-- Allows public reads on theme/settings/practitioners
-- Allows analytics inserts

CREATE POLICY IF NOT EXISTS "Allow public read on site_settings" 
  ON public.site_settings FOR SELECT TO public USING (true);

CREATE POLICY IF NOT EXISTS "Allow public read on theme_settings" 
  ON public.theme_settings FOR SELECT TO public USING (true);

CREATE POLICY IF NOT EXISTS "Allow public read on practitioners" 
  ON public.practitioners FOR SELECT TO public USING (true);

CREATE POLICY IF NOT EXISTS "Allow visitor_sessions insert" 
  ON public.visitor_sessions FOR INSERT TO public WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow page_views insert" 
  ON public.page_views FOR INSERT TO public WITH CHECK (true);

-- Also allow authenticated users to read profiles
CREATE POLICY IF NOT EXISTS "Allow authenticated read profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);
