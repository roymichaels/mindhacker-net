-- Add email column to form_submissions for tracking
ALTER TABLE public.form_submissions ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_form_submissions_email ON public.form_submissions(email);

-- Add user_id column for linking to accounts (nullable, linked when user registers)
ALTER TABLE public.form_submissions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_form_submissions_user_id ON public.form_submissions(user_id);