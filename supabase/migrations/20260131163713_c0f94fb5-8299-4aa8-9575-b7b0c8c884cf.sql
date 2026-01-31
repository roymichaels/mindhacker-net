-- Enable RLS (safe if already enabled)
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Public analytics write policies (non-sensitive operational data)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'visitor_sessions' AND policyname = 'visitor_sessions_public_insert'
  ) THEN
    CREATE POLICY visitor_sessions_public_insert
    ON public.visitor_sessions
    FOR INSERT
    WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'visitor_sessions' AND policyname = 'visitor_sessions_public_update'
  ) THEN
    CREATE POLICY visitor_sessions_public_update
    ON public.visitor_sessions
    FOR UPDATE
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'page_views' AND policyname = 'page_views_public_insert'
  ) THEN
    CREATE POLICY page_views_public_insert
    ON public.page_views
    FOR INSERT
    WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'page_views' AND policyname = 'page_views_public_update'
  ) THEN
    CREATE POLICY page_views_public_update
    ON public.page_views
    FOR UPDATE
    USING (true);
  END IF;
END $$;
