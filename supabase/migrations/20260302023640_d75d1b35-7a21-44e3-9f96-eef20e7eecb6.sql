
-- Coach leads table: leads that come from coach landing pages and other sources
CREATE TABLE public.coach_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  landing_page_id UUID REFERENCES public.coach_landing_pages(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  source TEXT DEFAULT 'landing_page',
  status TEXT DEFAULT 'new',
  notes TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast coach-scoped queries
CREATE INDEX idx_coach_leads_coach_id ON public.coach_leads(coach_id);
CREATE INDEX idx_coach_leads_status ON public.coach_leads(status);
CREATE INDEX idx_coach_leads_created_at ON public.coach_leads(created_at DESC);

-- Enable RLS
ALTER TABLE public.coach_leads ENABLE ROW LEVEL SECURITY;

-- Coaches can manage their own leads
CREATE POLICY "Coaches can view own leads"
  ON public.coach_leads FOR SELECT
  TO authenticated
  USING (coach_id = public.get_practitioner_id_for_user(auth.uid()));

CREATE POLICY "Coaches can insert own leads"
  ON public.coach_leads FOR INSERT
  TO authenticated
  WITH CHECK (coach_id = public.get_practitioner_id_for_user(auth.uid()));

CREATE POLICY "Coaches can update own leads"
  ON public.coach_leads FOR UPDATE
  TO authenticated
  USING (coach_id = public.get_practitioner_id_for_user(auth.uid()));

CREATE POLICY "Coaches can delete own leads"
  ON public.coach_leads FOR DELETE
  TO authenticated
  USING (coach_id = public.get_practitioner_id_for_user(auth.uid()));

-- Allow anonymous lead submissions (from landing pages)
CREATE POLICY "Anyone can submit leads"
  ON public.coach_leads FOR INSERT
  TO anon
  WITH CHECK (true);

-- Admins can see all leads
CREATE POLICY "Admins can view all leads"
  ON public.coach_leads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to auto-update updated_at
CREATE TRIGGER update_coach_leads_updated_at
  BEFORE UPDATE ON public.coach_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
