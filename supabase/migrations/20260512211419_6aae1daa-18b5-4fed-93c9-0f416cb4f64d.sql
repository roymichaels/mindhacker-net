
-- ============================================================
-- Phase A: User Brain unified graph
-- ============================================================

-- 1) Extend aurora_memory_graph
ALTER TABLE public.aurora_memory_graph
  ADD COLUMN IF NOT EXISTS layer text,
  ADD COLUMN IF NOT EXISTS confidence integer NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS emotional_charge integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_evidence_at timestamptz,
  ADD COLUMN IF NOT EXISTS evidence_count integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS user_confirmed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS user_corrected_at timestamptz,
  ADD COLUMN IF NOT EXISTS superseded_by uuid REFERENCES public.aurora_memory_graph(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS content_key text,
  ADD COLUMN IF NOT EXISTS room text;

ALTER TABLE public.aurora_memory_graph
  DROP CONSTRAINT IF EXISTS aurora_memory_graph_confidence_check;
ALTER TABLE public.aurora_memory_graph
  ADD CONSTRAINT aurora_memory_graph_confidence_check CHECK (confidence >= 0 AND confidence <= 100);

ALTER TABLE public.aurora_memory_graph
  DROP CONSTRAINT IF EXISTS aurora_memory_graph_emotional_charge_check;
ALTER TABLE public.aurora_memory_graph
  ADD CONSTRAINT aurora_memory_graph_emotional_charge_check CHECK (emotional_charge >= -100 AND emotional_charge <= 100);

ALTER TABLE public.aurora_memory_graph
  DROP CONSTRAINT IF EXISTS aurora_memory_graph_layer_check;
ALTER TABLE public.aurora_memory_graph
  ADD CONSTRAINT aurora_memory_graph_layer_check CHECK (layer IS NULL OR layer IN ('surface','pattern','deep'));

-- Extend node_type enum (string check)
ALTER TABLE public.aurora_memory_graph
  DROP CONSTRAINT IF EXISTS aurora_memory_graph_node_type_check;
ALTER TABLE public.aurora_memory_graph
  ADD CONSTRAINT aurora_memory_graph_node_type_check CHECK (node_type IN (
    'belief','fear','breakthrough','pattern','value_shift','dream','blocker','insight',
    'value','desire','wound','goal','habit','contradiction','avoidance','strength','loop',
    'mission','emotion','identity','archetype','behavioral_pattern'
  ));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_memory_graph_layer ON public.aurora_memory_graph(user_id, layer) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_memory_graph_pillar ON public.aurora_memory_graph(user_id, pillar) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_memory_graph_confidence ON public.aurora_memory_graph(user_id, confidence DESC) WHERE is_active = true;
CREATE UNIQUE INDEX IF NOT EXISTS uq_memory_graph_dedupe ON public.aurora_memory_graph(user_id, node_type, content_key) WHERE content_key IS NOT NULL;

-- Backfill
UPDATE public.aurora_memory_graph
SET
  layer = CASE
    WHEN node_type IN ('goal','habit','mission','emotion') THEN 'surface'
    WHEN node_type IN ('loop','avoidance','strength','behavioral_pattern','pattern') THEN 'pattern'
    WHEN node_type IN ('belief','value','wound','identity','archetype','desire','contradiction','fear','dream','blocker','insight','value_shift','breakthrough') THEN 'deep'
    ELSE 'surface'
  END
WHERE layer IS NULL;

UPDATE public.aurora_memory_graph
SET last_evidence_at = COALESCE(last_referenced_at, created_at)
WHERE last_evidence_at IS NULL;

UPDATE public.aurora_memory_graph
SET evidence_count = GREATEST(1, COALESCE(reference_count, 1))
WHERE evidence_count IS NULL OR evidence_count = 1;

UPDATE public.aurora_memory_graph
SET content_key = lower(regexp_replace(trim(content), '\s+', ' ', 'g'))
WHERE content_key IS NULL AND content IS NOT NULL;

-- 2) brain_evidence
CREATE TABLE IF NOT EXISTS public.brain_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  node_id uuid NOT NULL REFERENCES public.aurora_memory_graph(id) ON DELETE CASCADE,
  source_kind text NOT NULL CHECK (source_kind IN (
    'conversation','onboarding','assessment','journal','hypnosis','mission','habit','pulse','dna','manual'
  )),
  source_ref jsonb NOT NULL DEFAULT '{}'::jsonb,
  delta_confidence integer NOT NULL DEFAULT 0,
  delta_strength integer NOT NULL DEFAULT 0,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brain_evidence_node ON public.brain_evidence(node_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brain_evidence_user ON public.brain_evidence(user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_brain_evidence_idem ON public.brain_evidence(node_id, source_kind, (source_ref::text));

ALTER TABLE public.brain_evidence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "brain_evidence_select_own" ON public.brain_evidence;
CREATE POLICY "brain_evidence_select_own" ON public.brain_evidence
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "brain_evidence_insert_own" ON public.brain_evidence;
CREATE POLICY "brain_evidence_insert_own" ON public.brain_evidence
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "brain_evidence_delete_own" ON public.brain_evidence;
CREATE POLICY "brain_evidence_delete_own" ON public.brain_evidence
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 3) brain_edges
CREATE TABLE IF NOT EXISTS public.brain_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_node uuid NOT NULL REFERENCES public.aurora_memory_graph(id) ON DELETE CASCADE,
  to_node uuid NOT NULL REFERENCES public.aurora_memory_graph(id) ON DELETE CASCADE,
  relation text NOT NULL CHECK (relation IN (
    'causes','contradicts','reinforces','avoids','derives_from','manifests_as','belongs_to_pillar'
  )),
  weight integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_brain_edges ON public.brain_edges(from_node, to_node, relation);
CREATE INDEX IF NOT EXISTS idx_brain_edges_user ON public.brain_edges(user_id);

ALTER TABLE public.brain_edges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "brain_edges_select_own" ON public.brain_edges;
CREATE POLICY "brain_edges_select_own" ON public.brain_edges
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "brain_edges_insert_own" ON public.brain_edges;
CREATE POLICY "brain_edges_insert_own" ON public.brain_edges
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "brain_edges_update_own" ON public.brain_edges;
CREATE POLICY "brain_edges_update_own" ON public.brain_edges
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "brain_edges_delete_own" ON public.brain_edges;
CREATE POLICY "brain_edges_delete_own" ON public.brain_edges
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 4) RPC: brain_upsert_node
CREATE OR REPLACE FUNCTION public.brain_upsert_node(
  p_user_id uuid,
  p_type text,
  p_content text,
  p_layer text DEFAULT NULL,
  p_pillar text DEFAULT NULL,
  p_source_kind text DEFAULT 'conversation',
  p_source_ref jsonb DEFAULT '{}'::jsonb,
  p_delta_conf integer DEFAULT 5,
  p_delta_strength integer DEFAULT 1,
  p_emotional_charge integer DEFAULT NULL,
  p_summary text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key text;
  v_layer text;
  v_node_id uuid;
  v_old_conf int;
  v_new_conf int;
  v_old_strength int;
  v_new_strength int;
  v_capped_delta int;
  v_created boolean := false;
BEGIN
  IF p_user_id IS NULL OR p_type IS NULL OR p_content IS NULL OR length(trim(p_content)) = 0 THEN
    RAISE EXCEPTION 'brain_upsert_node: missing required arguments';
  END IF;

  v_key := lower(regexp_replace(trim(p_content), '\s+', ' ', 'g'));
  v_layer := COALESCE(p_layer, CASE
    WHEN p_type IN ('goal','habit','mission','emotion') THEN 'surface'
    WHEN p_type IN ('loop','avoidance','strength','behavioral_pattern','pattern') THEN 'pattern'
    ELSE 'deep'
  END);

  -- Cap delta to +30 per event, with diminishing returns above 70
  v_capped_delta := LEAST(GREATEST(p_delta_conf, -30), 30);

  SELECT id, confidence, COALESCE(strength,1)
    INTO v_node_id, v_old_conf, v_old_strength
  FROM public.aurora_memory_graph
  WHERE user_id = p_user_id AND node_type = p_type AND content_key = v_key
  LIMIT 1;

  IF v_node_id IS NULL THEN
    INSERT INTO public.aurora_memory_graph (
      user_id, node_type, content, content_key, pillar, layer, strength, confidence,
      emotional_charge, last_evidence_at, evidence_count
    ) VALUES (
      p_user_id, p_type, p_content, v_key, p_pillar, v_layer,
      LEAST(10, GREATEST(1, p_delta_strength)),
      LEAST(100, GREATEST(0, 50 + v_capped_delta)),
      COALESCE(p_emotional_charge, 0),
      now(), 1
    )
    RETURNING id, confidence, strength INTO v_node_id, v_new_conf, v_new_strength;
    v_created := true;
  ELSE
    -- Diminishing returns above 70
    IF v_old_conf >= 70 AND v_capped_delta > 0 THEN
      v_capped_delta := GREATEST(1, v_capped_delta / 2);
    END IF;
    v_new_conf := LEAST(100, GREATEST(0, v_old_conf + v_capped_delta));
    v_new_strength := LEAST(10, v_old_strength + GREATEST(0, p_delta_strength));

    UPDATE public.aurora_memory_graph SET
      confidence = v_new_conf,
      strength = v_new_strength,
      pillar = COALESCE(pillar, p_pillar),
      layer = COALESCE(layer, v_layer),
      emotional_charge = CASE WHEN p_emotional_charge IS NULL THEN emotional_charge
                              ELSE LEAST(100, GREATEST(-100, (emotional_charge + p_emotional_charge) / 2)) END,
      last_evidence_at = now(),
      last_referenced_at = now(),
      evidence_count = evidence_count + 1,
      reference_count = COALESCE(reference_count,1) + 1,
      is_active = true
    WHERE id = v_node_id;
  END IF;

  -- Idempotent evidence write
  INSERT INTO public.brain_evidence (
    user_id, node_id, source_kind, source_ref, delta_confidence, delta_strength, summary
  ) VALUES (
    p_user_id, v_node_id, p_source_kind, COALESCE(p_source_ref, '{}'::jsonb),
    v_capped_delta, GREATEST(0, p_delta_strength), left(COALESCE(p_summary, p_content), 200)
  )
  ON CONFLICT (node_id, source_kind, (source_ref::text)) DO NOTHING;

  RETURN jsonb_build_object(
    'node_id', v_node_id,
    'created', v_created,
    'new_confidence', v_new_conf,
    'new_strength', v_new_strength
  );
END;
$$;

-- 5) RPC: brain_get_overview
CREATE OR REPLACE FUNCTION public.brain_get_overview(
  p_user_id uuid,
  p_min_confidence integer DEFAULT 25,
  p_limit integer DEFAULT 120
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nodes jsonb;
  v_edges jsonb;
  v_pillars jsonb;
  v_contras jsonb;
  v_recent jsonb;
  v_unknown jsonb;
BEGIN
  SELECT COALESCE(jsonb_agg(n ORDER BY (n->>'score')::numeric DESC), '[]'::jsonb)
  INTO v_nodes
  FROM (
    SELECT jsonb_build_object(
      'id', id, 'type', node_type, 'layer', layer, 'pillar', pillar,
      'content', content, 'confidence', confidence, 'strength', COALESCE(strength,1),
      'emotional_charge', emotional_charge, 'user_confirmed', user_confirmed,
      'last_evidence_at', last_evidence_at, 'evidence_count', evidence_count,
      'score', (COALESCE(strength,1) * confidence)
    ) AS n
    FROM public.aurora_memory_graph
    WHERE user_id = p_user_id
      AND is_active = true
      AND superseded_by IS NULL
      AND (confidence >= p_min_confidence OR user_confirmed = true)
    ORDER BY (COALESCE(strength,1) * confidence) DESC
    LIMIT p_limit
  ) sub;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'from', from_node, 'to', to_node, 'relation', relation, 'weight', weight
  )), '[]'::jsonb)
  INTO v_edges
  FROM public.brain_edges WHERE user_id = p_user_id;

  -- Pillar confidences (best-effort; table may or may not exist)
  BEGIN
    EXECUTE 'SELECT COALESCE(jsonb_object_agg(pillar, jsonb_build_object(''confidence'', confidence, ''signal_count'', signal_count)), ''{}''::jsonb)
            FROM public.pillar_confidence WHERE user_id = $1'
    INTO v_pillars USING p_user_id;
  EXCEPTION WHEN undefined_table THEN
    v_pillars := '{}'::jsonb;
  END;

  BEGIN
    EXECUTE 'SELECT COALESCE(jsonb_agg(jsonb_build_object(''id'', id, ''pillar'', pillar_id, ''a'', statement_a, ''b'', statement_b, ''status'', status)), ''[]''::jsonb)
            FROM public.aurora_contradictions WHERE user_id = $1 AND status = ''open'' LIMIT 10'
    INTO v_contras USING p_user_id;
  EXCEPTION WHEN undefined_table THEN
    v_contras := '[]'::jsonb;
  END;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', id, 'type', node_type, 'content', content, 'confidence', confidence, 'last_evidence_at', last_evidence_at
  ) ORDER BY last_evidence_at DESC), '[]'::jsonb)
  INTO v_recent
  FROM (
    SELECT id, node_type, content, confidence, last_evidence_at
    FROM public.aurora_memory_graph
    WHERE user_id = p_user_id AND is_active = true
      AND last_evidence_at > now() - interval '14 days'
    ORDER BY last_evidence_at DESC
    LIMIT 20
  ) r;

  v_unknown := '[]'::jsonb;
  BEGIN
    EXECUTE 'SELECT COALESCE(jsonb_agg(pillar), ''[]''::jsonb)
            FROM public.pillar_confidence
            WHERE user_id = $1 AND (confidence < 20 OR signal_count < 3)'
    INTO v_unknown USING p_user_id;
  EXCEPTION WHEN undefined_table THEN
    v_unknown := '[]'::jsonb;
  END;

  RETURN jsonb_build_object(
    'nodes', v_nodes,
    'edges', v_edges,
    'pillars', v_pillars,
    'contradictions', v_contras,
    'recent', v_recent,
    'unknown_areas', v_unknown,
    'generated_at', now()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.brain_upsert_node(uuid, text, text, text, text, text, jsonb, integer, integer, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.brain_get_overview(uuid, integer, integer) TO authenticated;
