-- Add bilingual columns to community_posts
ALTER TABLE public.community_posts 
  ADD COLUMN IF NOT EXISTS title_he text,
  ADD COLUMN IF NOT EXISTS content_he text,
  ADD COLUMN IF NOT EXISTS is_system boolean DEFAULT false;