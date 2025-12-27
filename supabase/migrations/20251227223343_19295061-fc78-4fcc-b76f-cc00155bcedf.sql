-- First drop the partially created table if exists and recreate properly
DROP TABLE IF EXISTS public.hypnosis_videos CASCADE;

-- Create hypnosis_videos table for personal training videos
CREATE TABLE public.hypnosis_videos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  file_path text NOT NULL,
  thumbnail_path text,
  duration_seconds integer,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_video_access table FIRST (before referencing it in policy)
CREATE TABLE public.user_video_access (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  video_id uuid NOT NULL REFERENCES public.hypnosis_videos(id) ON DELETE CASCADE,
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  granted_by uuid,
  access_token text NOT NULL DEFAULT encode(extensions.gen_random_bytes(32), 'hex'::text),
  notes text
);

-- Enable RLS on hypnosis_videos
ALTER TABLE public.hypnosis_videos ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_video_access
ALTER TABLE public.user_video_access ENABLE ROW LEVEL SECURITY;

-- Admins can manage all videos
CREATE POLICY "Admins can manage all videos"
ON public.hypnosis_videos
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Users can view videos they have access to
CREATE POLICY "Users can view videos they have access to"
ON public.hypnosis_videos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_video_access uva
    WHERE uva.video_id = hypnosis_videos.id
      AND uva.user_id = auth.uid()
      AND uva.is_active = true
      AND (uva.expires_at IS NULL OR uva.expires_at > now())
  )
);

-- Admins can manage all video access
CREATE POLICY "Admins can manage all video access"
ON public.user_video_access
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own video access
CREATE POLICY "Users can view their own video access"
ON public.user_video_access
FOR SELECT
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_hypnosis_videos_updated_at
BEFORE UPDATE ON public.hypnosis_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for personal videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('hypnosis-videos', 'hypnosis-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for hypnosis-videos bucket
CREATE POLICY "Admins can manage hypnosis videos storage"
ON storage.objects
FOR ALL
USING (bucket_id = 'hypnosis-videos' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'hypnosis-videos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view hypnosis videos they have access to"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'hypnosis-videos' 
  AND EXISTS (
    SELECT 1 FROM user_video_access uva
    JOIN hypnosis_videos hv ON hv.id = uva.video_id
    WHERE hv.file_path = name
      AND uva.user_id = auth.uid()
      AND uva.is_active = true
      AND (uva.expires_at IS NULL OR uva.expires_at > now())
  )
);