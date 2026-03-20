
CREATE TABLE public.founding_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  social_handle TEXT,
  occupation TEXT,
  why_join TEXT,
  how_contribute TEXT,
  referral_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.founding_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit founding application"
  ON public.founding_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own applications"
  ON public.founding_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
