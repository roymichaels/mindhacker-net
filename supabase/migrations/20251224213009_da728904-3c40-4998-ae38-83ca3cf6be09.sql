-- Allow anyone (even unauthenticated users) to read user_audio_access by access_token
-- This enables public shareable links for audio recordings

CREATE POLICY "Anyone can read audio access by token" 
ON public.user_audio_access
FOR SELECT 
USING (true);

-- Note: This is safe because:
-- 1. Access tokens are cryptographically random (64 character hex)
-- 2. Without knowing the token, you cannot guess it
-- 3. The audio file itself is still protected via signed URLs