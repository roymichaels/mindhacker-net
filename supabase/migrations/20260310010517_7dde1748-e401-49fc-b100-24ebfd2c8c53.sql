
-- Journal entries table for Dream Journal, Daily Reflection, Gratitude
CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journal_type TEXT NOT NULL CHECK (journal_type IN ('dream', 'reflection', 'gratitude')),
  content TEXT NOT NULL,
  mood TEXT,
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own journal entries"
  ON public.journal_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_journal_entries_user_type ON public.journal_entries(user_id, journal_type);
CREATE INDEX idx_journal_entries_created ON public.journal_entries(user_id, created_at DESC);
