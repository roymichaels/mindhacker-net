
-- ── AION Phase 1: Observation-only trace tables ──────────────────────────

CREATE TABLE IF NOT EXISTS public.aion_turn_traces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trace_id text NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  conversation_id uuid NULL,
  route text NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz NULL,
  duration_ms integer NULL,
  status text NOT NULL DEFAULT 'open',
  input_preview text NULL,
  intent text NULL,
  emotion text NULL,
  router_decision text NULL,
  capability text NULL,
  artifact_kind text NULL,
  language text NULL,
  mode text NULL,
  lanes text NULL,
  pillar text NULL,
  graph_reads integer NOT NULL DEFAULT 0,
  graph_writes integer NOT NULL DEFAULT 0,
  signals_written integer NOT NULL DEFAULT 0,
  pillar_deltas jsonb NOT NULL DEFAULT '{}'::jsonb,
  brain_refreshed boolean NOT NULL DEFAULT false,
  sanitizer jsonb NOT NULL DEFAULT '{}'::jsonb,
  hebrew_cleanup jsonb NOT NULL DEFAULT '{}'::jsonb,
  repetition jsonb NOT NULL DEFAULT '{}'::jsonb,
  errors jsonb NOT NULL DEFAULT '[]'::jsonb,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_aion_turn_traces_user_recent
  ON public.aion_turn_traces (user_id, started_at DESC);

CREATE TABLE IF NOT EXISTS public.aion_turn_trace_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trace_id text NOT NULL,
  user_id uuid NOT NULL,
  at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL,
  stage text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_aion_turn_trace_events_trace
  ON public.aion_turn_trace_events (trace_id, at);
CREATE INDEX IF NOT EXISTS idx_aion_turn_trace_events_user_recent
  ON public.aion_turn_trace_events (user_id, at DESC);

ALTER TABLE public.aion_turn_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aion_turn_trace_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "aion_turn_traces: user reads own"
  ON public.aion_turn_traces FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "aion_turn_traces: user inserts own"
  ON public.aion_turn_traces FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "aion_turn_traces: user updates own"
  ON public.aion_turn_traces FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "aion_turn_trace_events: user reads own"
  ON public.aion_turn_trace_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "aion_turn_trace_events: user inserts own"
  ON public.aion_turn_trace_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.aion_turn_traces;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aion_turn_trace_events;
