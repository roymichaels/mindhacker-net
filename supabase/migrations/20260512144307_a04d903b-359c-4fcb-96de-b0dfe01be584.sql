
ALTER TABLE public.journal_entries
  DROP CONSTRAINT IF EXISTS journal_entries_journal_type_check;

ALTER TABLE public.journal_entries
  ADD CONSTRAINT journal_entries_journal_type_check
  CHECK (journal_type = ANY (ARRAY[
    'dream','reflection','gratitude',
    'plan','beliefs','breakthrough','emotion','lesson','win'
  ]));

ALTER TABLE public.journal_entries
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS source_excerpt text,
  ADD COLUMN IF NOT EXISTS ai_insight text,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual','aion')),
  ADD COLUMN IF NOT EXISTS linked_mission_id text;

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_type_created
  ON public.journal_entries (user_id, journal_type, created_at DESC);
