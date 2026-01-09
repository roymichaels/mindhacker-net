-- Create analytics_reports table to store daily report history
CREATE TABLE public.analytics_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE NOT NULL UNIQUE,
  report_data JSONB NOT NULL DEFAULT '{}',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.analytics_reports ENABLE ROW LEVEL SECURITY;

-- Only admins can view reports
CREATE POLICY "Admins can view analytics reports" 
ON public.analytics_reports 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Only service role can insert (from edge function)
CREATE POLICY "Service role can insert analytics reports" 
ON public.analytics_reports 
FOR INSERT 
WITH CHECK (true);

-- Add video URL settings to site_settings if they don't exist
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description) VALUES
  ('introspection_promo_video_url', '', 'url', 'Video URL for introspection promo section'),
  ('introspection_promo_video_enabled', 'false', 'boolean', 'Enable video in introspection promo'),
  ('personal_hypnosis_sample_video_url', '', 'url', 'Sample video URL for personal hypnosis'),
  ('personal_hypnosis_sample_video_enabled', 'false', 'boolean', 'Enable sample video in personal hypnosis'),
  ('consciousness_leap_intro_video_url', '', 'url', 'Intro video URL for consciousness leap'),
  ('consciousness_leap_intro_video_enabled', 'false', 'boolean', 'Enable intro video in consciousness leap'),
  ('daily_report_enabled', 'true', 'boolean', 'Enable daily analytics reports'),
  ('daily_report_email', '', 'text', 'Email address for daily analytics reports')
ON CONFLICT (setting_key) DO NOTHING;