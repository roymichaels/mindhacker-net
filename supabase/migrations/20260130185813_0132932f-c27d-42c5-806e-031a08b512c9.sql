-- Create orb_profiles table to store computed orb configurations
CREATE TABLE public.orb_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  primary_color TEXT NOT NULL DEFAULT 'hsl(210, 100%, 50%)',
  secondary_colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  accent_color TEXT DEFAULT 'hsl(200, 100%, 60%)',
  morph_intensity NUMERIC NOT NULL DEFAULT 0.15,
  morph_speed NUMERIC NOT NULL DEFAULT 1.0,
  core_intensity NUMERIC NOT NULL DEFAULT 0.5,
  layer_count INTEGER NOT NULL DEFAULT 1,
  particle_enabled BOOLEAN NOT NULL DEFAULT false,
  particle_count INTEGER NOT NULL DEFAULT 0,
  geometry_detail INTEGER NOT NULL DEFAULT 4,
  computed_from JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orb_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own orb profile
CREATE POLICY "Users can view their own orb profile"
ON public.orb_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own orb profile
CREATE POLICY "Users can insert their own orb profile"
ON public.orb_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own orb profile
CREATE POLICY "Users can update their own orb profile"
ON public.orb_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION public.update_orb_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_orb_profiles_updated_at
BEFORE UPDATE ON public.orb_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_orb_profile_timestamp();

-- Enable realtime for orb_profiles
ALTER PUBLICATION supabase_realtime ADD TABLE public.orb_profiles;