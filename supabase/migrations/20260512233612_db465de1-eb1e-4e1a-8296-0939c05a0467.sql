-- 1) Allow new node types used by backfill / UI
ALTER TABLE public.aurora_memory_graph
  DROP CONSTRAINT IF EXISTS aurora_memory_graph_node_type_check;
ALTER TABLE public.aurora_memory_graph
  ADD CONSTRAINT aurora_memory_graph_node_type_check CHECK (node_type IN (
    'belief','fear','breakthrough','pattern','value_shift','dream','blocker','insight',
    'value','desire','wound','goal','habit','contradiction','avoidance','strength','loop',
    'mission','emotion','identity','archetype','behavioral_pattern',
    'memory','pillar_marker'
  ));

-- 2) Allow new evidence source kinds emitted by backfill
ALTER TABLE public.brain_evidence
  DROP CONSTRAINT IF EXISTS brain_evidence_source_kind_check;
ALTER TABLE public.brain_evidence
  ADD CONSTRAINT brain_evidence_source_kind_check CHECK (source_kind IN (
    'conversation','onboarding','assessment','journal','hypnosis','mission','habit','pulse','dna','manual',
    'profile','identity_element','action_item','behavioral_pattern','pillar_confidence','journal_entry',
    'life_plan','milestone','presence'
  ));

-- 3) Repair brain_get_overview: pillar_confidence has pillar_id, not pillar
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

  BEGIN
    EXECUTE 'SELECT COALESCE(jsonb_object_agg(pillar_id, jsonb_build_object(''confidence'', confidence, ''signal_count'', signal_count)), ''{}''::jsonb)
            FROM public.pillar_confidence WHERE user_id = $1'
    INTO v_pillars USING p_user_id;
  EXCEPTION WHEN OTHERS THEN
    v_pillars := '{}'::jsonb;
  END;

  BEGIN
    EXECUTE 'SELECT COALESCE(jsonb_agg(jsonb_build_object(''id'', id, ''pillar'', pillar_id, ''a'', statement_a, ''b'', statement_b, ''status'', status)), ''[]''::jsonb)
            FROM public.aurora_contradictions WHERE user_id = $1 AND status = ''open'' LIMIT 10'
    INTO v_contras USING p_user_id;
  EXCEPTION WHEN OTHERS THEN
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
    EXECUTE 'SELECT COALESCE(jsonb_agg(pillar_id), ''[]''::jsonb)
            FROM public.pillar_confidence
            WHERE user_id = $1 AND (confidence < 20 OR signal_count < 3)'
    INTO v_unknown USING p_user_id;
  EXCEPTION WHEN OTHERS THEN
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

GRANT EXECUTE ON FUNCTION public.brain_get_overview(uuid, integer, integer) TO authenticated;