
-- 1) pillar_confidence
CREATE TABLE IF NOT EXISTS public.pillar_confidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pillar_id text NOT NULL,
  confidence numeric(5,2) NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
  signal_count integer NOT NULL DEFAULT 0,
  gaps jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_signal_at timestamptz,
  last_probed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, pillar_id)
);

CREATE INDEX IF NOT EXISTS idx_pillar_confidence_user
  ON public.pillar_confidence (user_id, confidence);

ALTER TABLE public.pillar_confidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own pillar confidence"
  ON public.pillar_confidence FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own pillar confidence"
  ON public.pillar_confidence FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own pillar confidence"
  ON public.pillar_confidence FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_pillar_confidence_updated_at
  BEFORE UPDATE ON public.pillar_confidence
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) aurora_contradictions
CREATE TABLE IF NOT EXISTS public.aurora_contradictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pillar_id text,
  statement_a uuid REFERENCES public.aurora_memory_graph(id) ON DELETE CASCADE,
  statement_b uuid REFERENCES public.aurora_memory_graph(id) ON DELETE CASCADE,
  explanation text NOT NULL,
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','reconciled','dismissed','surfaced')),
  aion_note text,
  detected_at timestamptz NOT NULL DEFAULT now(),
  surfaced_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contradictions_user_status
  ON public.aurora_contradictions (user_id, status);

ALTER TABLE public.aurora_contradictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own contradictions"
  ON public.aurora_contradictions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own contradictions"
  ON public.aurora_contradictions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own contradictions"
  ON public.aurora_contradictions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_contradictions_updated_at
  BEFORE UPDATE ON public.aurora_contradictions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Extend allowed node_type values on aurora_memory_graph
ALTER TABLE public.aurora_memory_graph
  DROP CONSTRAINT IF EXISTS aurora_memory_graph_node_type_check;

ALTER TABLE public.aurora_memory_graph
  ADD CONSTRAINT aurora_memory_graph_node_type_check
  CHECK (node_type = ANY (ARRAY[
    'belief','fear','breakthrough','pattern','value_shift','dream','blocker','insight',
    'value','desire','wound','goal','habit','contradiction','avoidance','strength','loop'
  ]));
