
-- Phase 3.1 Skills Hardening: mapping key, idempotency, timezone, trigger perf

-- 1) Add mapping_key + mapping_type to action_skill_weights
ALTER TABLE public.action_skill_weights
  ADD COLUMN IF NOT EXISTS mapping_key text,
  ADD COLUMN IF NOT EXISTS mapping_type text DEFAULT 'pillar';

-- Backfill existing rows: mapping_key = pillar value
UPDATE public.action_skill_weights SET mapping_key = pillar, mapping_type = 'pillar' WHERE mapping_key IS NULL;

-- Drop old unique constraint, add new one on (mapping_type, mapping_key, skill_id)
ALTER TABLE public.action_skill_weights DROP CONSTRAINT IF EXISTS action_skill_weights_pillar_skill_id_key;
CREATE UNIQUE INDEX idx_asw_mapping ON public.action_skill_weights (mapping_type, mapping_key, skill_id);

-- 2) Fix idempotency: (action_item_id, skill_id) without source
DROP INDEX IF EXISTS idx_skill_xp_idempotency;
CREATE UNIQUE INDEX idx_skill_xp_idempotency ON public.skill_xp_events (action_item_id, skill_id) WHERE action_item_id IS NOT NULL;

-- 3) Timezone-correct today gains RPC
CREATE OR REPLACE FUNCTION public.get_skill_gains_today(p_user_id uuid, p_tz text DEFAULT 'Asia/Jerusalem')
RETURNS TABLE(skill_id uuid, total bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT e.skill_id, SUM(e.amount)::bigint AS total
  FROM public.skill_xp_events e
  WHERE e.user_id = p_user_id
    AND (e.created_at AT TIME ZONE p_tz)::date = (now() AT TIME ZONE p_tz)::date
  GROUP BY e.skill_id;
$$;

-- 4) Updated award_skill_xp with fixed idempotency (no source in conflict)
CREATE OR REPLACE FUNCTION public.award_skill_xp(
  p_user_id uuid, p_skill_id uuid, p_amount integer,
  p_source text, p_reason text DEFAULT NULL, p_action_item_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_new_total int; v_new_level int;
BEGIN
  IF p_amount <= 0 THEN RETURN jsonb_build_object('success', false, 'error', 'Amount must be positive'); END IF;

  INSERT INTO public.skill_xp_events (user_id, action_item_id, skill_id, amount, source, reason)
  VALUES (p_user_id, p_action_item_id, p_skill_id, p_amount, p_source, p_reason)
  ON CONFLICT (action_item_id, skill_id) WHERE action_item_id IS NOT NULL DO NOTHING;

  IF NOT FOUND THEN RETURN jsonb_build_object('success', true, 'idempotent', true); END IF;

  INSERT INTO public.user_skill_progress (user_id, skill_id, xp_total, level, updated_at)
  VALUES (p_user_id, p_skill_id, p_amount, GREATEST(1, FLOOR(p_amount / 100) + 1), now())
  ON CONFLICT (user_id, skill_id) DO UPDATE SET
    xp_total = user_skill_progress.xp_total + p_amount,
    level = GREATEST(1, FLOOR((user_skill_progress.xp_total + p_amount) / 100) + 1),
    updated_at = now()
  RETURNING xp_total, level INTO v_new_total, v_new_level;

  RETURN jsonb_build_object('success', true, 'skill_id', p_skill_id, 'new_total', v_new_total, 'new_level', v_new_level);
END; $function$;

-- 5) Optimized trigger: single join, template→pillar fallback
CREATE OR REPLACE FUNCTION public.handle_action_item_completion()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_row RECORD;
  v_base_xp int;
  v_primary_job_id uuid;
  v_template text;
  v_has_template_weights boolean := false;
BEGIN
  IF NEW.status = 'done' AND (OLD.status IS DISTINCT FROM 'done') THEN
    NEW.completed_at = now();

    -- Unified XP
    IF NEW.xp_reward > 0 THEN
      PERFORM award_unified_xp(NEW.user_id, NEW.xp_reward, 'action_item', NEW.title);
    END IF;
    IF NEW.token_reward > 0 THEN
      PERFORM award_energy(NEW.user_id, NEW.token_reward, 'action_item', NEW.title);
    END IF;

    -- Skill XP: resolve mapping key + job multiplier in single pass
    v_base_xp := GREATEST(COALESCE(NEW.xp_reward, 10), 5);
    v_template := COALESCE(NEW.metadata->>'execution_template', NULL);

    SELECT job_id INTO v_primary_job_id
    FROM public.user_jobs WHERE user_id = NEW.user_id AND is_primary = true LIMIT 1;

    -- Try execution_template mapping first
    IF v_template IS NOT NULL THEN
      SELECT true INTO v_has_template_weights
      FROM public.action_skill_weights
      WHERE mapping_type = 'execution_template' AND mapping_key = v_template LIMIT 1;
    END IF;

    -- Single join: weights + job multipliers in one query
    FOR v_row IN
      SELECT asw.skill_id, asw.weight, COALESCE(jsw.multiplier, 1.0) AS multiplier
      FROM public.action_skill_weights asw
      LEFT JOIN public.job_skill_weights jsw
        ON jsw.skill_id = asw.skill_id AND jsw.job_id = v_primary_job_id
      WHERE
        CASE
          WHEN v_has_template_weights THEN asw.mapping_type = 'execution_template' AND asw.mapping_key = v_template
          WHEN NEW.pillar IS NOT NULL THEN asw.mapping_type = 'pillar' AND asw.mapping_key = NEW.pillar
          ELSE false
        END
    LOOP
      PERFORM award_skill_xp(
        NEW.user_id, v_row.skill_id,
        GREATEST(1, FLOOR(v_base_xp * v_row.weight * v_row.multiplier)::int),
        COALESCE(NEW.source, 'action_item'), NEW.title, NEW.id
      );
    END LOOP;
  END IF;

  IF NEW.status != 'done' AND OLD.status = 'done' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END; $function$;
