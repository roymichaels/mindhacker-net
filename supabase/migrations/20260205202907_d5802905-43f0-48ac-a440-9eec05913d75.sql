-- Create storage bucket for bug report screenshots
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bug-screenshots', 'bug-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload screenshots
CREATE POLICY "Users can upload bug screenshots"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'bug-screenshots' AND auth.role() = 'authenticated');

-- Allow public read access for screenshots
CREATE POLICY "Bug screenshots are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'bug-screenshots');

-- Allow authenticated users to delete their own screenshots (cleanup)
CREATE POLICY "Users can delete own screenshots"
ON storage.objects FOR DELETE
USING (bucket_id = 'bug-screenshots' AND auth.role() = 'authenticated');