-- Create visitor_sessions table
CREATE TABLE public.visitor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  user_id UUID,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  device_type TEXT,
  browser TEXT,
  os TEXT,
  screen_size TEXT,
  language TEXT,
  country TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  landing_page TEXT,
  is_returning BOOLEAN DEFAULT FALSE,
  page_views INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0
);

-- Create page_views table
CREATE TABLE public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer_path TEXT,
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  exited_at TIMESTAMPTZ,
  time_on_page_seconds INTEGER,
  scroll_depth_percent INTEGER,
  is_bounce BOOLEAN DEFAULT TRUE
);

-- Create conversion_events table
CREATE TABLE public.conversion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID,
  event_type TEXT NOT NULL,
  event_category TEXT,
  source TEXT,
  page_path TEXT,
  event_data JSONB DEFAULT '{}',
  conversion_value NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_visitor_sessions_session_id ON public.visitor_sessions(session_id);
CREATE INDEX idx_visitor_sessions_created ON public.visitor_sessions(first_seen);
CREATE INDEX idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX idx_page_views_page_path ON public.page_views(page_path);
CREATE INDEX idx_page_views_entered ON public.page_views(entered_at);
CREATE INDEX idx_conversion_events_session_id ON public.conversion_events(session_id);
CREATE INDEX idx_conversion_events_type ON public.conversion_events(event_type);
CREATE INDEX idx_conversion_events_category ON public.conversion_events(event_category);
CREATE INDEX idx_conversion_events_created ON public.conversion_events(created_at);

-- Enable RLS on all tables
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for visitor_sessions
CREATE POLICY "Anyone can insert visitor sessions" ON public.visitor_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update their own session" ON public.visitor_sessions
  FOR UPDATE USING (true);

CREATE POLICY "Admins can view all sessions" ON public.visitor_sessions
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for page_views
CREATE POLICY "Anyone can insert page views" ON public.page_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update page views" ON public.page_views
  FOR UPDATE USING (true);

CREATE POLICY "Admins can view all page views" ON public.page_views
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for conversion_events
CREATE POLICY "Anyone can insert conversion events" ON public.conversion_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all conversion events" ON public.conversion_events
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for conversion tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversion_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.visitor_sessions;