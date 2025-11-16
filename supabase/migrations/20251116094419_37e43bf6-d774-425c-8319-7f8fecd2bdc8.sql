-- Create storage bucket for site images
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true);

-- Allow admins to upload images
CREATE POLICY "Admins can upload site images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'site-images' 
  AND (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ))
);

-- Allow admins to update images
CREATE POLICY "Admins can update site images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'site-images'
  AND (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ))
);

-- Allow admins to delete images
CREATE POLICY "Admins can delete site images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'site-images'
  AND (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ))
);

-- Allow public read access to site images
CREATE POLICY "Public can view site images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'site-images');