-- Create form_analyses table for storing AI consciousness analysis results
CREATE TABLE public.form_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_submission_id UUID NOT NULL REFERENCES public.form_submissions(id) ON DELETE CASCADE,
  analysis_summary TEXT NOT NULL,
  patterns JSONB DEFAULT '[]'::jsonb,
  transformation_potential TEXT,
  recommendation TEXT,
  recommended_product TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.form_analyses ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX idx_form_analyses_submission ON public.form_analyses(form_submission_id);

-- RLS Policies: Users can read analyses for their own submissions
CREATE POLICY "Users can view their own form analyses"
ON public.form_analyses
FOR SELECT
USING (
  form_submission_id IN (
    SELECT id FROM public.form_submissions 
    WHERE user_id = auth.uid() OR email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  )
);

-- Allow insert from service role (edge function)
CREATE POLICY "Service role can insert analyses"
ON public.form_analyses
FOR INSERT
WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE public.form_analyses IS 'Stores AI-generated consciousness analysis results for introspection form submissions';