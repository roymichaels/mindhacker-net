-- Create storage buckets for content files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('content-videos', 'content-videos', false, 524288000, ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']::text[]),
  ('content-thumbnails', 'content-thumbnails', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]),
  ('content-resources', 'content-resources', false, 52428800, NULL)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for content-videos bucket
-- Admins can upload videos
CREATE POLICY "Admins can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'content-videos' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Admins can update videos
CREATE POLICY "Admins can update videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'content-videos' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Admins can delete videos
CREATE POLICY "Admins can delete videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'content-videos' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Users with access can view videos
CREATE POLICY "Users with access can view videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'content-videos' AND
  (
    has_role(auth.uid(), 'admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM content_episodes ce
      WHERE ce.video_url = storage.objects.name AND ce.is_preview = true
    ) OR
    EXISTS (
      SELECT 1 FROM content_episodes ce
      JOIN user_subscriptions us ON us.user_id = auth.uid()
      JOIN subscription_tiers st ON st.id = us.tier_id
      JOIN content_products cp ON cp.id = ce.product_id
      WHERE ce.video_url = storage.objects.name
        AND us.status = 'active'
        AND (
          st.access_level = 'vip' OR
          (st.access_level = 'premium' AND cp.access_level IN ('free', 'basic', 'premium')) OR
          (st.access_level = 'basic' AND cp.access_level IN ('free', 'basic')) OR
          cp.access_level = 'free'
        )
    ) OR
    EXISTS (
      SELECT 1 FROM content_episodes ce
      JOIN content_purchases cp ON cp.product_id = ce.product_id
      WHERE ce.video_url = storage.objects.name
        AND cp.user_id = auth.uid()
        AND cp.payment_status = 'completed'
        AND (cp.access_expires_at IS NULL OR cp.access_expires_at > now())
    )
  )
);

-- RLS Policies for content-thumbnails bucket (public)
-- Anyone can view thumbnails (bucket is public)
CREATE POLICY "Anyone can view thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'content-thumbnails');

-- Admins can upload thumbnails
CREATE POLICY "Admins can upload thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'content-thumbnails' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Admins can update thumbnails
CREATE POLICY "Admins can update thumbnails"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'content-thumbnails' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Admins can delete thumbnails
CREATE POLICY "Admins can delete thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'content-thumbnails' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- RLS Policies for content-resources bucket
-- Admins can upload resources
CREATE POLICY "Admins can upload resources"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'content-resources' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Admins can update resources
CREATE POLICY "Admins can update resources"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'content-resources' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Admins can delete resources
CREATE POLICY "Admins can delete resources"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'content-resources' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Users with access can download resources
CREATE POLICY "Users with access can download resources"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'content-resources' AND
  (
    has_role(auth.uid(), 'admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM content_episodes ce
      WHERE storage.objects.name = ANY(ce.resources_url)
        AND (
          EXISTS (
            SELECT 1 FROM user_subscriptions us
            JOIN subscription_tiers st ON st.id = us.tier_id
            JOIN content_products cp ON cp.id = ce.product_id
            WHERE us.user_id = auth.uid()
              AND us.status = 'active'
              AND st.can_download_resources = true
              AND (
                st.access_level = 'vip' OR
                (st.access_level = 'premium' AND cp.access_level IN ('free', 'basic', 'premium')) OR
                (st.access_level = 'basic' AND cp.access_level IN ('free', 'basic')) OR
                cp.access_level = 'free'
              )
          ) OR
          EXISTS (
            SELECT 1 FROM content_purchases cp
            WHERE cp.user_id = auth.uid()
              AND cp.product_id = ce.product_id
              AND cp.payment_status = 'completed'
              AND (cp.access_expires_at IS NULL OR cp.access_expires_at > now())
          )
        )
    )
  )
);