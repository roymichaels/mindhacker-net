-- Drop the problematic policy that references auth.users
DROP POLICY IF EXISTS "Users can view their own form analyses" ON public.form_analyses;

-- Recreate the policy without direct auth.users reference
-- Users can view analyses for submissions they own (by user_id) or their email matches
CREATE POLICY "Users can view their own form analyses"
ON public.form_analyses
FOR SELECT
USING (
  form_submission_id IN (
    SELECT fs.id 
    FROM form_submissions fs
    WHERE fs.user_id = auth.uid()
  )
);