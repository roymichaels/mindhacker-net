-- Enable public access to core tables via RLS policies

-- site_settings: Allow public read
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read for all users" ON public.site_settings;
CREATE POLICY "Allow read for all users" ON public.site_settings
  FOR SELECT USING (true);

-- theme_settings: Allow public read
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read for all users" ON public.theme_settings;
CREATE POLICY "Allow read for all users" ON public.theme_settings
  FOR SELECT USING (true);

-- practitioners: Allow public read
ALTER TABLE public.practitioners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read for all users" ON public.practitioners;
CREATE POLICY "Allow read for all users" ON public.practitioners
  FOR SELECT USING (true);

-- visitor_sessions: Allow insert without authentication
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow insert for all" ON public.visitor_sessions;
CREATE POLICY "Allow insert for all" ON public.visitor_sessions
  FOR INSERT WITH CHECK (true);

-- page_views: Allow insert without authentication
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow insert for all" ON public.page_views;
CREATE POLICY "Allow insert for all" ON public.page_views
  FOR INSERT WITH CHECK (true);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
