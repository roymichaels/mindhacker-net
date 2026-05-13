-- ─── 1. Extend brain_edges relation enum ─────────────────────────────────
ALTER TABLE public.brain_edges DROP CONSTRAINT IF EXISTS brain_edges_relation_check;
ALTER TABLE public.brain_edges ADD CONSTRAINT brain_edges_relation_check
  CHECK (relation = ANY (ARRAY[
    'causes','contradicts','reinforces','avoids','derives_from','manifests_as','belongs_to_pillar',
    'triggers','blocks','heals','belongs_to_room','evolved_from','originated_from'
  ]));

-- ─── 2. Constrain aurora_memory_graph.room to 8 canonical values ────────
ALTER TABLE public.aurora_memory_graph DROP CONSTRAINT IF EXISTS aurora_memory_graph_room_check;
ALTER TABLE public.aurora_memory_graph ADD CONSTRAINT aurora_memory_graph_room_check
  CHECK (room IS NULL OR room = ANY (ARRAY[
    'beliefs','emotions','parts','time','identity','body','dreams','beyond'
  ]));

-- ─── 3. Add coverage column (derived 0..1) ──────────────────────────────
ALTER TABLE public.aurora_memory_graph ADD COLUMN IF NOT EXISTS coverage numeric;

-- ─── 4. Index for per-room queries ──────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_aurora_memory_graph_user_room
  ON public.aurora_memory_graph (user_id, room) WHERE is_active = true;

-- ─── 5. RPC: brain_get_atlas ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.brain_get_atlas(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rooms jsonb;
  v_cross_edges jsonb;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT COALESCE(jsonb_agg(r ORDER BY r->>'id'), '[]'::jsonb) INTO v_rooms
  FROM (
    SELECT
      room AS id,
      room AS slug,
      COUNT(*) AS node_count,
      ROUND(AVG(COALESCE(confidence, 0))::numeric, 2) AS avg_confidence,
      ROUND(LEAST(1.0, COUNT(*) FILTER (WHERE COALESCE(confidence,0) >= 50)::numeric / NULLIF(COUNT(*),0))::numeric, 2) AS coverage,
      COUNT(*) FILTER (WHERE COALESCE(confidence,0) < 30 AND COALESCE(reference_count,0) < 2) AS gaps_count,
      MAX(last_evidence_at) AS last_evidence_at
    FROM public.aurora_memory_graph
    WHERE user_id = p_user_id AND is_active = true AND room IS NOT NULL
    GROUP BY room
  ) AS x
  CROSS JOIN LATERAL (SELECT to_jsonb(x) AS r) lat;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'from_room', from_room,
    'to_room',   to_room,
    'weight',    weight
  )), '[]'::jsonb) INTO v_cross_edges
  FROM (
    SELECT n1.room AS from_room, n2.room AS to_room, COUNT(*)::int AS weight
    FROM public.brain_edges e
    JOIN public.aurora_memory_graph n1 ON n1.id = e.from_node
    JOIN public.aurora_memory_graph n2 ON n2.id = e.to_node
    WHERE e.user_id = p_user_id
      AND n1.room IS NOT NULL AND n2.room IS NOT NULL
      AND n1.room <> n2.room
    GROUP BY n1.room, n2.room
  ) AS ce;

  RETURN jsonb_build_object(
    'rooms', v_rooms,
    'cross_edges', v_cross_edges,
    'generated_at', now()
  );
END;
$$;

-- ─── 6. RPC: brain_get_room ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.brain_get_room(
  p_user_id uuid,
  p_room    text,
  p_limit   int DEFAULT 200
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
  v_gaps  jsonb;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT COALESCE(jsonb_agg(to_jsonb(n)), '[]'::jsonb) INTO v_nodes
  FROM (
    SELECT id, node_type, content, pillar, room, layer,
           confidence, strength, emotional_charge,
           reference_count, user_confirmed, last_evidence_at
    FROM public.aurora_memory_graph
    WHERE user_id = p_user_id AND is_active = true AND room = p_room
    ORDER BY COALESCE(confidence,0) DESC, reference_count DESC
    LIMIT p_limit
  ) AS n;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'from_node', e.from_node,
    'to_node',   e.to_node,
    'relation',  e.relation,
    'weight',    e.weight
  )), '[]'::jsonb) INTO v_edges
  FROM public.brain_edges e
  JOIN public.aurora_memory_graph n1 ON n1.id = e.from_node
  JOIN public.aurora_memory_graph n2 ON n2.id = e.to_node
  WHERE e.user_id = p_user_id AND (n1.room = p_room OR n2.room = p_room);

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', id, 'content', content, 'confidence', confidence
  )), '[]'::jsonb) INTO v_gaps
  FROM (
    SELECT id, content, confidence
    FROM public.aurora_memory_graph
    WHERE user_id = p_user_id AND is_active = true AND room = p_room
      AND COALESCE(confidence,0) < 30 AND COALESCE(reference_count,0) < 2
    ORDER BY confidence ASC NULLS FIRST
    LIMIT 8
  ) g;

  RETURN jsonb_build_object(
    'room', p_room,
    'nodes', v_nodes,
    'edges', v_edges,
    'gaps',  v_gaps,
    'generated_at', now()
  );
END;
$$;

-- ─── 7. RPC: brain_get_node ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.brain_get_node(
  p_user_id uuid,
  p_node_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_node jsonb;
  v_evidence jsonb;
  v_neighbors jsonb;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT to_jsonb(n) INTO v_node
  FROM public.aurora_memory_graph n
  WHERE n.id = p_node_id AND n.user_id = p_user_id;

  IF v_node IS NULL THEN
    RETURN jsonb_build_object('error','not_found');
  END IF;

  SELECT COALESCE(jsonb_agg(to_jsonb(e) ORDER BY (e->>'created_at') DESC), '[]'::jsonb) INTO v_evidence
  FROM (
    SELECT id, source_kind, source_ref, delta_confidence, delta_strength,
           summary, created_at
    FROM public.brain_evidence
    WHERE node_id = p_node_id AND user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 8
  ) e;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'node_id',   nb.id,
    'content',   nb.content,
    'node_type', nb.node_type,
    'room',      nb.room,
    'relation',  rel,
    'direction', dir
  )), '[]'::jsonb) INTO v_neighbors
  FROM (
    SELECT n2.id, n2.content, n2.node_type, n2.room, e.relation AS rel, 'out'::text AS dir
    FROM public.brain_edges e
    JOIN public.aurora_memory_graph n2 ON n2.id = e.to_node
    WHERE e.from_node = p_node_id AND e.user_id = p_user_id
    UNION ALL
    SELECT n1.id, n1.content, n1.node_type, n1.room, e.relation AS rel, 'in'::text AS dir
    FROM public.brain_edges e
    JOIN public.aurora_memory_graph n1 ON n1.id = e.from_node
    WHERE e.to_node = p_node_id AND e.user_id = p_user_id
  ) nb;

  RETURN jsonb_build_object(
    'node', v_node,
    'evidence', v_evidence,
    'neighbors', v_neighbors,
    'generated_at', now()
  );
END;
$$;

-- ─── 8. Grants ──────────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.brain_get_atlas(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.brain_get_room(uuid, text, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.brain_get_node(uuid, uuid) TO authenticated;