
-- ============================================================
-- Phase 5: Execution Template Enforcement
-- ============================================================

-- 1) DB trigger: auto-fill metadata.execution_template on action_items INSERT
--    if missing, using pillar → template defaults.
CREATE OR REPLACE FUNCTION public.enforce_execution_template()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  v_template text;
BEGIN
  -- Skip if already has execution_template
  IF NEW.metadata IS NOT NULL 
     AND NEW.metadata->>'execution_template' IS NOT NULL 
     AND NEW.metadata->>'execution_template' != '' THEN
    RETURN NEW;
  END IF;

  -- Derive from pillar
  v_template := CASE COALESCE(NEW.pillar, '')
    WHEN 'vitality'       THEN 'step_by_step'
    WHEN 'power'          THEN 'sets_reps_timer'
    WHEN 'combat'         THEN 'sets_reps_timer'
    WHEN 'focus'          THEN 'timer_focus'
    WHEN 'consciousness'  THEN 'tts_guided'
    WHEN 'expansion'      THEN 'timer_focus'
    WHEN 'wealth'         THEN 'timer_focus'
    WHEN 'influence'      THEN 'social_checklist'
    WHEN 'relationships'  THEN 'social_checklist'
    WHEN 'business'       THEN 'timer_focus'
    WHEN 'projects'       THEN 'timer_focus'
    WHEN 'play'           THEN 'step_by_step'
    WHEN 'presence'       THEN 'tts_guided'
    WHEN 'order'          THEN 'step_by_step'
    ELSE 'step_by_step'
  END;

  -- Merge into metadata
  NEW.metadata := COALESCE(NEW.metadata, '{}'::jsonb) || jsonb_build_object('execution_template', v_template);

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_execution_template
  BEFORE INSERT ON public.action_items
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_execution_template();

-- 2) Backfill existing action_items that are missing execution_template
UPDATE public.action_items
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
  'execution_template',
  CASE COALESCE(pillar, '')
    WHEN 'vitality'       THEN 'step_by_step'
    WHEN 'power'          THEN 'sets_reps_timer'
    WHEN 'combat'         THEN 'sets_reps_timer'
    WHEN 'focus'          THEN 'timer_focus'
    WHEN 'consciousness'  THEN 'tts_guided'
    WHEN 'expansion'      THEN 'timer_focus'
    WHEN 'wealth'         THEN 'timer_focus'
    WHEN 'influence'      THEN 'social_checklist'
    WHEN 'relationships'  THEN 'social_checklist'
    WHEN 'business'       THEN 'timer_focus'
    WHEN 'projects'       THEN 'timer_focus'
    WHEN 'play'           THEN 'step_by_step'
    WHEN 'presence'       THEN 'tts_guided'
    WHEN 'order'          THEN 'step_by_step'
    ELSE 'step_by_step'
  END
)
WHERE metadata IS NULL OR metadata->>'execution_template' IS NULL;

-- 3) Admin metrics RPC: template coverage per day
CREATE OR REPLACE FUNCTION public.get_template_coverage_stats(p_days int DEFAULT 14)
RETURNS TABLE(
  day date,
  total_items bigint,
  with_template bigint,
  coverage_pct numeric
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT
    d.day::date,
    COUNT(ai.id) AS total_items,
    COUNT(ai.id) FILTER (
      WHERE ai.metadata->>'execution_template' IS NOT NULL
        AND ai.metadata->>'execution_template' != ''
    ) AS with_template,
    CASE WHEN COUNT(ai.id) > 0 THEN
      ROUND(
        COUNT(ai.id) FILTER (
          WHERE ai.metadata->>'execution_template' IS NOT NULL
            AND ai.metadata->>'execution_template' != ''
        ) * 100.0 / COUNT(ai.id), 1
      )
    ELSE 0 END AS coverage_pct
  FROM generate_series(
    current_date - (p_days || ' days')::interval,
    current_date,
    '1 day'::interval
  ) AS d(day)
  LEFT JOIN action_items ai ON ai.created_at::date = d.day::date
  GROUP BY d.day
  ORDER BY d.day DESC;
$$;
