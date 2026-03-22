
-- TTS cache table
CREATE TABLE public.tts_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  text_hash TEXT NOT NULL,
  voice_id TEXT NOT NULL,
  model_id TEXT NOT NULL DEFAULT 'eleven_v3',
  speed NUMERIC NOT NULL DEFAULT 1.0,
  audio_path TEXT NOT NULL,
  duration_seconds NUMERIC,
  file_size_bytes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint on text_hash + voice_id + speed so we don't duplicate
CREATE UNIQUE INDEX tts_cache_lookup_idx ON public.tts_cache (user_id, text_hash, voice_id, speed);

-- Index for quick lookups
CREATE INDEX tts_cache_user_idx ON public.tts_cache (user_id, created_at DESC);

-- RLS
ALTER TABLE public.tts_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own TTS cache"
  ON public.tts_cache FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own TTS cache"
  ON public.tts_cache FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own TTS cache"
  ON public.tts_cache FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Storage bucket for TTS audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('tts-audio', 'tts-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload TTS audio"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'tts-audio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can read TTS audio"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'tts-audio');

CREATE POLICY "Users can delete own TTS audio"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'tts-audio' AND (storage.foldername(name))[1] = auth.uid()::text);
