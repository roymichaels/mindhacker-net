-- Update level formula to 1.5x progression
-- Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, Level 4: 475 XP, etc.
-- Formula: level = floor(log(experience * 0.005 + 1) / log(1.5)) + 1

CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(p_experience integer)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT GREATEST(1,
    CASE
      WHEN p_experience < 100 THEN 1
      ELSE FLOOR(LN(p_experience::numeric / 100 * 0.5 + 1) / LN(1.5))::integer + 2
    END
  );
$$;

-- Update award_unified_xp to use the new level formula
CREATE OR REPLACE FUNCTION public.award_unified_xp(
  p_user_id uuid,
  p_amount integer,
  p_source text,
  p_reason text DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_current_experience integer;
  v_new_experience integer;
  v_old_level integer;
  v_new_level integer;
  v_levels_gained integer;
  v_token_bonus integer := 0;
  v_existing jsonb;
BEGIN
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Amount must be positive');
  END IF;

  -- Idempotency check
  IF p_idempotency_key IS NOT NULL THEN
    SELECT jsonb_build_object(
      'success', true,
      'new_experience', amount,
      'idempotent', true
    ) INTO v_existing
    FROM public.xp_events
    WHERE idempotency_key = p_idempotency_key;

    IF v_existing IS NOT NULL THEN
      RETURN v_existing;
    END IF;
  END IF;

  -- Get current XP
  SELECT COALESCE(experience, 0), COALESCE(level, 1)
  INTO v_current_experience, v_old_level
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_experience IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  v_new_experience := v_current_experience + p_amount;
  v_new_level := calculate_level_from_xp(v_new_experience);
  v_levels_gained := GREATEST(0, v_new_level - v_old_level);

  -- Token bonus for level ups (5 tokens per level)
  IF v_levels_gained > 0 THEN
    v_token_bonus := v_levels_gained * 5;
    UPDATE public.profiles
    SET tokens = COALESCE(tokens, 0) + v_token_bonus
    WHERE id = p_user_id;
  END IF;

  -- Set session flag to bypass guard trigger
  PERFORM set_config('app.xp_update_via_rpc', 'true', true);

  -- Update profile
  UPDATE public.profiles
  SET experience = v_new_experience,
      level = v_new_level,
      updated_at = now()
  WHERE id = p_user_id;

  -- Log XP event
  INSERT INTO public.xp_events (user_id, amount, source, reason, idempotency_key)
  VALUES (p_user_id, p_amount, p_source, p_reason, p_idempotency_key);

  RETURN jsonb_build_object(
    'success', true,
    'new_experience', v_new_experience,
    'new_level', v_new_level,
    'levels_gained', v_levels_gained,
    'token_bonus', v_token_bonus
  );
END;
$$;

-- Recalculate all existing user levels with new formula
UPDATE public.profiles
SET level = calculate_level_from_xp(COALESCE(experience, 0))
WHERE level != calculate_level_from_xp(COALESCE(experience, 0))
   OR level IS NULL;