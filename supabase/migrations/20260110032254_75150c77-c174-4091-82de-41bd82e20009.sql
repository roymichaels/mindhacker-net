-- Create site-videos storage bucket for site-wide videos (hero, about, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-videos', 'site-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view site videos (they're promotional content)
CREATE POLICY "Site videos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'site-videos');

-- Only admins can upload/update/delete site videos
CREATE POLICY "Admins can manage site videos"
ON storage.objects
FOR ALL
USING (bucket_id = 'site-videos' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'site-videos' AND public.has_role(auth.uid(), 'admin'));