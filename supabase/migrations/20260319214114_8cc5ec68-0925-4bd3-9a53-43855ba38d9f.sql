
-- Add post_type to community_posts for stories vs threads
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS post_type TEXT NOT NULL DEFAULT 'thread';

-- Create storage bucket for community stories
INSERT INTO storage.buckets (id, name, public) VALUES ('community-stories', 'community-stories', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for community stories
CREATE POLICY "Users can upload stories" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'community-stories' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view stories" ON storage.objects FOR SELECT TO public
USING (bucket_id = 'community-stories');

CREATE POLICY "Users can delete own stories" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'community-stories' AND (storage.foldername(name))[1] = auth.uid()::text);
