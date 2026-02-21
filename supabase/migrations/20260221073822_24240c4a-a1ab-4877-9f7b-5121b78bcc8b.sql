
-- 1. Add community_username to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS community_username TEXT UNIQUE;

-- 2. Add status column to community_posts for Aurora approval gate
-- 'pending' = awaiting Aurora, 'approved' = visible, 'rejected' = hidden
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved';

-- 3. Add pillar_id to community_posts to link threads to the 13-pillar system
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS pillar TEXT;

-- 4. Add is_aurora flag to community_comments 
ALTER TABLE public.community_comments ADD COLUMN IF NOT EXISTS is_aurora BOOLEAN DEFAULT false;

-- 5. Index for fast pillar filtering
CREATE INDEX IF NOT EXISTS idx_community_posts_pillar ON public.community_posts (pillar);
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON public.community_posts (status);
CREATE INDEX IF NOT EXISTS idx_profiles_community_username ON public.profiles (community_username);
