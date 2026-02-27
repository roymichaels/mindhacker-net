
-- ============================================================
-- Phase 3.1 Fixes + Phase 4: Skill Sources, Unlocks
-- ============================================================

-- 1) RPC: get_skill_gains_today — already exists, but ensure default TZ is 'UTC' not hardcoded
CREATE OR REPLACE FUNCTION public.get_skill_gains_today(p_user_id uuid, p_tz text DEFAULT 'UTC')
RETURNS TABLE(skill_id uuid, total bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT e.skill_id, SUM(e.amount)::bigint AS total
  FROM skill_xp_events e
  WHERE e.user_id = p_user_id
    AND e.created_at >= (now() AT TIME ZONE p_tz)::date::timestamp AT TIME ZONE p_tz
  GROUP BY e.skill_id;
$$;

-- 2) Phase 4: get_skill_sources RPC
CREATE OR REPLACE FUNCTION public.get_skill_sources(
  p_user_id uuid,
  p_skill_id uuid,
  p_limit int DEFAULT 3
)
RETURNS TABLE(label text, total_xp bigint, action_count bigint, last_seen_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT
    COALESCE(
      ai.metadata->>'execution_template',
      ai.title
    ) AS label,
    SUM(e.amount)::bigint AS total_xp,
    COUNT(*)::bigint AS action_count,
    MAX(e.created_at) AS last_seen_at
  FROM skill_xp_events e
  LEFT JOIN action_items ai ON ai.id = e.action_item_id
  WHERE e.user_id = p_user_id
    AND e.skill_id = p_skill_id
    AND e.created_at >= now() - interval '30 days'
    AND e.action_item_id IS NOT NULL
  GROUP BY COALESCE(ai.metadata->>'execution_template', ai.title)
  ORDER BY total_xp DESC
  LIMIT p_limit;
$$;

-- 3) get_job_skill_multipliers — for UI display
CREATE OR REPLACE FUNCTION public.get_job_skill_multipliers(p_user_id uuid)
RETURNS TABLE(skill_id uuid, multiplier numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT jsw.skill_id, jsw.multiplier
  FROM job_skill_weights jsw
  JOIN user_jobs uj ON uj.job_id = jsw.job_id
  WHERE uj.user_id = p_user_id AND uj.is_primary = true;
$$;

-- 4) skill_unlocks table
CREATE TABLE IF NOT EXISTS public.skill_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  level_required int NOT NULL DEFAULT 5,
  reward_type text NOT NULL DEFAULT 'badge',
  reward_label text NOT NULL,
  reward_label_he text,
  reward_payload jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_skill_unlocks_skill ON public.skill_unlocks(skill_id, level_required);

ALTER TABLE public.skill_unlocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skill unlocks are readable by all authenticated"
  ON public.skill_unlocks FOR SELECT
  TO authenticated USING (true);

-- 5) Seed skill_unlocks (cosmetic rewards every 5 levels for a few skills)
INSERT INTO public.skill_unlocks (skill_id, level_required, reward_type, reward_label, reward_label_he, reward_payload)
SELECT s.id, lvl.n, 'badge', 
  s.name || ' Lv.' || lvl.n,
  COALESCE(s.name_he, s.name) || ' רמה ' || lvl.n,
  jsonb_build_object('glow_color', 
    CASE lvl.n 
      WHEN 5 THEN '#4ade80'
      WHEN 10 THEN '#60a5fa'
      WHEN 15 THEN '#c084fc'
      WHEN 20 THEN '#f59e0b'
    END,
    'badge_emoji',
    CASE lvl.n
      WHEN 5 THEN '🌱'
      WHEN 10 THEN '⚡'
      WHEN 15 THEN '🔥'
      WHEN 20 THEN '👑'
    END
  )
FROM skills s
CROSS JOIN (VALUES (5),(10),(15),(20)) AS lvl(n)
WHERE s.is_active = true
ON CONFLICT DO NOTHING;

-- 6) SSOT Documentation comment (Option A: Contribution weights)
-- NORMALIZATION RULE (Option A — Contribution Weights):
-- action_skill_weights.weight is NOT required to sum to 1.0.
-- Each weight represents "how much this action contributes to this skill".
-- A single action can generate MORE total skill XP than base_xp.
-- This is intentional: completing a complex task builds multiple skills.
-- Balance is achieved by keeping individual weights in 0.1–0.5 range.
-- job_skill_weights.multiplier further amplifies per-job affinity (1.0–1.5x).
