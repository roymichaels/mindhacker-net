
-- Add selected_pillars column to profiles for storing which pillars each user has chosen
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS selected_pillars jsonb DEFAULT '{"core": [], "arena": []}'::jsonb;

COMMENT ON COLUMN public.profiles.selected_pillars IS 'Selected pillar IDs per hub: {"core": ["consciousness", ...], "arena": ["wealth", ...]}';
