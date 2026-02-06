-- Add reviewer_name and reviewer_avatar_url for admin-managed reviews (where user_id may not have a profile)
ALTER TABLE public.practitioner_reviews 
  ADD COLUMN IF NOT EXISTS reviewer_name TEXT,
  ADD COLUMN IF NOT EXISTS reviewer_avatar_url TEXT;