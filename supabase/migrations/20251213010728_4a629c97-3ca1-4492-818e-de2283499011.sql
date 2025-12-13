-- Create a separate table for sensitive user data (phone numbers)
-- Only the user themselves can access this - no admin access for maximum security
CREATE TABLE public.user_sensitive_data (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_sensitive_data ENABLE ROW LEVEL SECURITY;

-- ONLY the user can see their own sensitive data - NO admin access
CREATE POLICY "Users can view only their own sensitive data"
ON public.user_sensitive_data
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update only their own sensitive data"
ON public.user_sensitive_data
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert only their own sensitive data"
ON public.user_sensitive_data
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Block anonymous access
CREATE POLICY "Block anonymous access to sensitive data"
ON public.user_sensitive_data
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Migrate existing phone data from profiles to new table
INSERT INTO public.user_sensitive_data (id, phone)
SELECT id, phone FROM public.profiles WHERE phone IS NOT NULL
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;

-- Remove phone column from profiles table (security fix)
ALTER TABLE public.profiles DROP COLUMN phone;

-- Create trigger to auto-create sensitive data row when profile is created
CREATE OR REPLACE FUNCTION public.handle_new_sensitive_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_sensitive_data (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_add_sensitive_data
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_sensitive_data();