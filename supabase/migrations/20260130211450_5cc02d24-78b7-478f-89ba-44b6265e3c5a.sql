-- Fix RLS for form_submissions so authenticated users can save questionnaire answers

-- Ensure RLS is enabled
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Allow authenticated users to INSERT their own submissions (and allow public submissions with user_id NULL)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'form_submissions' 
      AND policyname = 'form_submissions_insert_own_or_public'
  ) THEN
    CREATE POLICY form_submissions_insert_own_or_public
    ON public.form_submissions
    FOR INSERT
    WITH CHECK (
      (auth.uid() IS NOT NULL AND user_id = auth.uid())
      OR user_id IS NULL
    );
  END IF;

  -- Allow authenticated users to SELECT their own submissions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'form_submissions' 
      AND policyname = 'form_submissions_select_own'
  ) THEN
    CREATE POLICY form_submissions_select_own
    ON public.form_submissions
    FOR SELECT
    USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
  END IF;
END $$;
