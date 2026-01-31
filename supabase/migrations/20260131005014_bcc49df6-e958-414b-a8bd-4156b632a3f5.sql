-- Create hypnosis script cache table
CREATE TABLE public.hypnosis_script_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cache_key TEXT NOT NULL,
  ego_state TEXT NOT NULL,
  goal TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  language TEXT NOT NULL DEFAULT 'he',
  script_data JSONB NOT NULL,
  audio_paths JSONB, -- Array of segment audio file paths in Storage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  use_count INTEGER DEFAULT 1,
  UNIQUE(user_id, cache_key)
);

-- Enable Row Level Security
ALTER TABLE public.hypnosis_script_cache ENABLE ROW LEVEL SECURITY;

-- Users can only access their own cache
CREATE POLICY "Users can view own cache" ON public.hypnosis_script_cache 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cache" ON public.hypnosis_script_cache 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cache" ON public.hypnosis_script_cache 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cache" ON public.hypnosis_script_cache 
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_hypnosis_script_cache_lookup ON public.hypnosis_script_cache(user_id, cache_key);

-- Create Storage bucket for audio cache
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('hypnosis-cache', 'hypnosis-cache', false, 52428800, ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav']);

-- Storage policies for hypnosis-cache bucket
CREATE POLICY "Users can view own audio cache" ON storage.objects
  FOR SELECT USING (bucket_id = 'hypnosis-cache' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own audio cache" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'hypnosis-cache' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own audio cache" ON storage.objects
  FOR DELETE USING (bucket_id = 'hypnosis-cache' AND auth.uid()::text = (storage.foldername(name))[1]);