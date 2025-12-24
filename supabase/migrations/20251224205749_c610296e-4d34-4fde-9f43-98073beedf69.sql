-- Drop the constraint first, then the index
ALTER TABLE public.user_audio_access 
DROP CONSTRAINT IF EXISTS user_audio_access_user_id_audio_id_key;

-- Allow user_id to be nullable for anonymous/direct links
ALTER TABLE public.user_audio_access 
ALTER COLUMN user_id DROP NOT NULL;

-- Create partial unique index to allow multiple null user entries
CREATE UNIQUE INDEX user_audio_access_user_audio_unique 
ON public.user_audio_access(user_id, audio_id) 
WHERE user_id IS NOT NULL;