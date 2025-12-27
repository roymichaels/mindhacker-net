-- Create table for consciousness leap leads
CREATE TABLE public.consciousness_leap_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  what_resonated TEXT,
  application_token TEXT NOT NULL DEFAULT encode(extensions.gen_random_bytes(32), 'hex'),
  email_sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for consciousness leap applications (deep form responses)
CREATE TABLE public.consciousness_leap_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.consciousness_leap_leads(id) ON DELETE CASCADE,
  current_life_situation TEXT NOT NULL,
  what_feels_stuck TEXT NOT NULL,
  what_to_understand TEXT NOT NULL,
  why_now TEXT NOT NULL,
  openness_to_process TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.consciousness_leap_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consciousness_leap_applications ENABLE ROW LEVEL SECURITY;

-- RLS policies for consciousness_leap_leads
-- Anyone can insert (public form)
CREATE POLICY "Anyone can submit consciousness leap lead"
ON public.consciousness_leap_leads
FOR INSERT
WITH CHECK (true);

-- Only admins can view leads
CREATE POLICY "Admins can view consciousness leap leads"
ON public.consciousness_leap_leads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update leads
CREATE POLICY "Admins can update consciousness leap leads"
ON public.consciousness_leap_leads
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete leads
CREATE POLICY "Admins can delete consciousness leap leads"
ON public.consciousness_leap_leads
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for consciousness_leap_applications
-- Anyone can insert with valid token (validated in application)
CREATE POLICY "Anyone can submit consciousness leap application"
ON public.consciousness_leap_applications
FOR INSERT
WITH CHECK (true);

-- Only admins can view applications
CREATE POLICY "Admins can view consciousness leap applications"
ON public.consciousness_leap_applications
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update applications
CREATE POLICY "Admins can update consciousness leap applications"
ON public.consciousness_leap_applications
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete applications
CREATE POLICY "Admins can delete consciousness leap applications"
ON public.consciousness_leap_applications
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_consciousness_leap_leads_token ON public.consciousness_leap_leads(application_token);
CREATE INDEX idx_consciousness_leap_leads_status ON public.consciousness_leap_leads(status);
CREATE INDEX idx_consciousness_leap_applications_lead_id ON public.consciousness_leap_applications(lead_id);
CREATE INDEX idx_consciousness_leap_applications_status ON public.consciousness_leap_applications(status);

-- Create trigger for updated_at
CREATE TRIGGER update_consciousness_leap_leads_updated_at
BEFORE UPDATE ON public.consciousness_leap_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consciousness_leap_applications_updated_at
BEFORE UPDATE ON public.consciousness_leap_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();