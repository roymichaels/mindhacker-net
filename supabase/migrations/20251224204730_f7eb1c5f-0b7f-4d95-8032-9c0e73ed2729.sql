-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create hypnosis_audios table for storing audio file metadata
CREATE TABLE public.hypnosis_audios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  duration_seconds INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_audio_access junction table for user-audio assignments
CREATE TABLE public.user_audio_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  audio_id UUID NOT NULL REFERENCES public.hypnosis_audios(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  notes TEXT,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, audio_id)
);

-- Enable RLS on both tables
ALTER TABLE public.hypnosis_audios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_audio_access ENABLE ROW LEVEL SECURITY;

-- RLS policies for hypnosis_audios
CREATE POLICY "Admins can manage all audios"
ON public.hypnosis_audios
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view audios they have access to"
ON public.hypnosis_audios
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_audio_access uaa
    WHERE uaa.audio_id = hypnosis_audios.id
      AND uaa.user_id = auth.uid()
      AND uaa.is_active = true
      AND (uaa.expires_at IS NULL OR uaa.expires_at > now())
  )
);

-- RLS policies for user_audio_access
CREATE POLICY "Admins can manage all audio access"
ON public.user_audio_access
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own audio access"
ON public.user_audio_access
FOR SELECT
USING (auth.uid() = user_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_hypnosis_audios_updated_at
BEFORE UPDATE ON public.hypnosis_audios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create private storage bucket for hypnosis audios
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hypnosis-audios', 'hypnosis-audios', false);

-- Storage policies for hypnosis-audios bucket
CREATE POLICY "Admins can upload hypnosis audios"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'hypnosis-audios' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update hypnosis audios"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'hypnosis-audios' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete hypnosis audios"
ON storage.objects
FOR DELETE
USING (bucket_id = 'hypnosis-audios' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all hypnosis audios"
ON storage.objects
FOR SELECT
USING (bucket_id = 'hypnosis-audios' AND public.has_role(auth.uid(), 'admin'));

-- Users with access can view their assigned audios
CREATE POLICY "Users can view assigned hypnosis audios"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'hypnosis-audios' 
  AND EXISTS (
    SELECT 1 FROM public.user_audio_access uaa
    JOIN public.hypnosis_audios ha ON ha.id = uaa.audio_id
    WHERE ha.file_path = name
      AND uaa.user_id = auth.uid()
      AND uaa.is_active = true
      AND (uaa.expires_at IS NULL OR uaa.expires_at > now())
  )
);

-- Create index for faster token lookups
CREATE INDEX idx_user_audio_access_token ON public.user_audio_access(access_token);
CREATE INDEX idx_user_audio_access_user ON public.user_audio_access(user_id);