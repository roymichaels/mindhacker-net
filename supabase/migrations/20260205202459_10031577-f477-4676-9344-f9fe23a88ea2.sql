-- Create bug_reports table
CREATE TABLE public.bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Bug Details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  priority TEXT NOT NULL DEFAULT 'medium',
  
  -- Context (auto-captured)
  page_path TEXT NOT NULL,
  page_url TEXT NOT NULL,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  screen_size TEXT,
  
  -- Optional
  screenshot_url TEXT,
  contact_email TEXT,
  
  -- Admin fields
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Users can insert their own reports (or anonymous reports)
CREATE POLICY "Users can create bug reports"
  ON public.bug_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON public.bug_reports FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can do everything (using user_roles table)
CREATE POLICY "Admins full access on bug_reports"
  ON public.bug_reports FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Indexes for performance
CREATE INDEX idx_bug_reports_status ON public.bug_reports(status);
CREATE INDEX idx_bug_reports_created ON public.bug_reports(created_at DESC);
CREATE INDEX idx_bug_reports_user ON public.bug_reports(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_bug_reports_updated_at
  BEFORE UPDATE ON public.bug_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();