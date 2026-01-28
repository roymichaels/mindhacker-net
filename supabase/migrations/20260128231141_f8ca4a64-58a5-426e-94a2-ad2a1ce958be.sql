-- Add RLS policy to allow admins to view all form analyses
CREATE POLICY "Admins can view all form analyses"
ON public.form_analyses
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));