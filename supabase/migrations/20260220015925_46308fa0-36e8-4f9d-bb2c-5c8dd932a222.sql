
-- Table: presence_scans
CREATE TABLE public.presence_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scan_images JSONB DEFAULT '{}'::jsonb,
  derived_metrics JSONB DEFAULT '{}'::jsonb,
  scores JSONB DEFAULT '{}'::jsonb,
  delta_metrics JSONB,
  direct_mode_notes JSONB,
  scan_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.presence_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own scans" ON public.presence_scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scans" ON public.presence_scans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scans" ON public.presence_scans FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own scans" ON public.presence_scans FOR DELETE USING (auth.uid() = user_id);

-- Table: presence_scan_events
CREATE TABLE public.presence_scan_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scan_id UUID REFERENCES public.presence_scans(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  energy_cost INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.presence_scan_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own scan events" ON public.presence_scan_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scan events" ON public.presence_scan_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Table: presence_training_dataset (anonymized, no user_id)
CREATE TABLE public.presence_training_dataset (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  derived_metrics JSONB DEFAULT '{}'::jsonb,
  scores JSONB DEFAULT '{}'::jsonb,
  self_perception_rating INTEGER,
  improvement_outcome JSONB,
  consented BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.presence_training_dataset ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public access to training data" ON public.presence_training_dataset FOR SELECT USING (false);

-- Storage bucket: presence-scans (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('presence-scans', 'presence-scans', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- Storage RLS: users can access own folder only
CREATE POLICY "Users can upload own presence scans"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'presence-scans' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own presence scans"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'presence-scans' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own presence scans"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'presence-scans' AND auth.uid()::text = (storage.foldername(name))[1]);
