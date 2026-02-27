
-- Phase 5.1: Add breakdown RPC (trigger+backfill already applied above)

CREATE OR REPLACE FUNCTION public.get_template_missing_breakdown(p_days integer DEFAULT 14)
RETURNS TABLE(
  dimension text,
  dimension_value text,
  total_items bigint,
  missing_template bigint,
  coverage_pct integer
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT * FROM (
    SELECT 'source'::text AS dimension, ai.source AS dimension_value, COUNT(*)::bigint AS total_items,
      COUNT(*) FILTER (WHERE ai.metadata->>'execution_template' IS NULL OR ai.metadata->>'execution_template' = '')::bigint AS missing_template,
      CASE WHEN COUNT(*) > 0 THEN
        (100 * COUNT(*) FILTER (WHERE ai.metadata->>'execution_template' IS NOT NULL AND ai.metadata->>'execution_template' != '') / COUNT(*))::integer
      ELSE 100 END AS coverage_pct
    FROM action_items ai WHERE ai.created_at >= now() - (p_days || ' days')::interval
    GROUP BY ai.source
    UNION ALL
    SELECT 'type'::text, ai.type, COUNT(*)::bigint,
      COUNT(*) FILTER (WHERE ai.metadata->>'execution_template' IS NULL OR ai.metadata->>'execution_template' = '')::bigint,
      CASE WHEN COUNT(*) > 0 THEN
        (100 * COUNT(*) FILTER (WHERE ai.metadata->>'execution_template' IS NOT NULL AND ai.metadata->>'execution_template' != '') / COUNT(*))::integer
      ELSE 100 END
    FROM action_items ai WHERE ai.created_at >= now() - (p_days || ' days')::interval
    GROUP BY ai.type
    UNION ALL
    SELECT 'pillar'::text, COALESCE(ai.pillar, 'none'), COUNT(*)::bigint,
      COUNT(*) FILTER (WHERE ai.metadata->>'execution_template' IS NULL OR ai.metadata->>'execution_template' = '')::bigint,
      CASE WHEN COUNT(*) > 0 THEN
        (100 * COUNT(*) FILTER (WHERE ai.metadata->>'execution_template' IS NOT NULL AND ai.metadata->>'execution_template' != '') / COUNT(*))::integer
      ELSE 100 END
    FROM action_items ai WHERE ai.created_at >= now() - (p_days || ' days')::interval
    GROUP BY ai.pillar
  ) sub
  ORDER BY sub.dimension, sub.dimension_value;
END;
$function$;
