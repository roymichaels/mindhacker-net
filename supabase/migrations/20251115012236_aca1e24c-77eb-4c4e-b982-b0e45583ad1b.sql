-- Create purchases table
CREATE TABLE public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  package_type text NOT NULL,
  sessions_total integer NOT NULL,
  sessions_remaining integer NOT NULL,
  price numeric NOT NULL,
  payment_status text DEFAULT 'demo',
  payment_method text,
  purchase_date timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  booking_link text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on purchases
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
  ON public.purchases
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all purchases
CREATE POLICY "Admins can view all purchases"
  ON public.purchases
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Admins can manage purchases
CREATE POLICY "Admins can manage purchases"
  ON public.purchases
  FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Authenticated users can create their own purchases
CREATE POLICY "Authenticated users can create purchases"
  ON public.purchases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();