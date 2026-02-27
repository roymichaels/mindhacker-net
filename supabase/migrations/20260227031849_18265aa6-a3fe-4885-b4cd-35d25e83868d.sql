
-- ============================================================
-- SSOT STABILIZATION: Phase 1
-- Fixes XP leaks, energy leaks, and adds guardrails
-- ============================================================

-- 1) DROP legacy check_streak_bonus trigger (causes double XP on hypnosis_sessions)
DROP TRIGGER IF EXISTS check_streak_bonus_trigger ON public.hypnosis_sessions;
DROP FUNCTION IF EXISTS public.check_streak_bonus();

-- 2) Fix handle_hypnosis_session_complete to use award_energy instead of direct tokens update
CREATE OR REPLACE FUNCTION public.handle_hypnosis_session_complete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_last_date date;
  v_today date := CURRENT_DATE;
  v_current_streak integer;
  v_new_streak integer;
  v_bonus_xp integer := 0;
  v_bonus_tokens integer := 0;
  v_xp_result jsonb;
BEGIN
  -- SSOT: All XP must flow through award_unified_xp
  -- SSOT: All Energy must flow through award_energy
  
  -- Get user's current streak info
  SELECT session_streak, last_session_date 
  INTO v_current_streak, v_last_date
  FROM profiles 
  WHERE id = NEW.user_id;
  
  v_current_streak := COALESCE(v_current_streak, 0);
  
  -- Determine new streak value
  IF v_last_date IS NULL OR v_last_date < v_today - 1 THEN
    v_new_streak := 1;
  ELSIF v_last_date = v_today - 1 THEN
    v_new_streak := v_current_streak + 1;
  ELSIF v_last_date = v_today THEN
    v_new_streak := v_current_streak;
  ELSE
    v_new_streak := 1;
  END IF;
  
  -- Calculate streak milestone bonuses (only on new milestone)
  IF v_new_streak > v_current_streak THEN
    CASE v_new_streak
      WHEN 3 THEN v_bonus_xp := 25; v_bonus_tokens := 5;
      WHEN 7 THEN v_bonus_xp := 50; v_bonus_tokens := 10;
      WHEN 14 THEN v_bonus_xp := 100; v_bonus_tokens := 20;
      WHEN 30 THEN v_bonus_xp := 200; v_bonus_tokens := 50;
      WHEN 60 THEN v_bonus_xp := 300; v_bonus_tokens := 75;
      WHEN 100 THEN v_bonus_xp := 500; v_bonus_tokens := 100;
      ELSE
        IF v_new_streak > 7 THEN v_bonus_xp := 5; END IF;
    END CASE;
  END IF;
  
  -- Update streak and ego state usage ONLY (no XP/tokens here)
  UPDATE profiles 
  SET 
    session_streak = v_new_streak,
    last_session_date = v_today,
    ego_state_usage = COALESCE(ego_state_usage, '{}'::jsonb) || 
      jsonb_build_object(
        NEW.ego_state, 
        COALESCE((ego_state_usage ->> NEW.ego_state)::int, 0) + 1
      ),
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  -- Award session XP via unified ledger (includes level calculation)
  SELECT award_unified_xp(
    NEW.user_id, 
    COALESCE(NEW.experience_gained, 0) + v_bonus_xp,
    'hypnosis_session',
    'Session: ' || NEW.ego_state || CASE WHEN v_bonus_xp > 0 THEN ' +streak_bonus' ELSE '' END
  ) INTO v_xp_result;
  
  -- Award streak energy bonus via unified ledger
  IF v_bonus_tokens > 0 THEN
    PERFORM award_energy(
      NEW.user_id, 
      v_bonus_tokens, 
      'streak_bonus', 
      'Streak ' || v_new_streak || ' milestone'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3) Update award_unified_xp to set session variable for guardrail
CREATE OR REPLACE FUNCTION public.award_unified_xp(
  p_user_id uuid,
  p_amount integer,
  p_source text,
  p_reason text DEFAULT NULL
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_energy_bonus INTEGER := 0;
BEGIN
  -- SSOT: This is the ONLY function that may update profiles.experience
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Amount must be positive');
  END IF;

  -- Set session flag so guardrail trigger allows this update
  PERFORM set_config('app.xp_update_via_rpc', 'true', true);

  -- Log to xp_events ledger FIRST (source of truth)
  INSERT INTO public.xp_events (user_id, amount, source, reason)
  VALUES (p_user_id, p_amount, p_source, p_reason);

  -- Update profiles (derived cache)
  UPDATE public.profiles
  SET 
    experience = COALESCE(experience, 0) + p_amount,
    level = GREATEST(1, FLOOR((COALESCE(experience, 0) + p_amount) / 100) + 1),
    updated_at = now()
  WHERE id = p_user_id
  RETURNING experience, level INTO v_new_xp, v_new_level;

  IF v_new_xp IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Level-up energy bonuses
  IF v_new_level >= 5 AND v_new_level < 10 THEN
    v_energy_bonus := 10;
  ELSIF v_new_level >= 10 THEN
    v_energy_bonus := 25;
  END IF;

  IF v_energy_bonus > 0 THEN
    PERFORM award_energy(p_user_id, v_energy_bonus, 'level_up', 'Level ' || v_new_level);
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'new_xp', v_new_xp,
    'new_level', v_new_level,
    'energy_bonus', v_energy_bonus
  );
END;
$function$;

-- 4) Add guardrail trigger: block direct experience updates not via RPC
CREATE OR REPLACE FUNCTION public.guard_xp_direct_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Allow if experience didn't change
  IF NEW.experience IS NOT DISTINCT FROM OLD.experience THEN
    RETURN NEW;
  END IF;
  
  -- Allow if called from award_unified_xp (session flag set)
  IF current_setting('app.xp_update_via_rpc', true) = 'true' THEN
    -- Reset the flag after use
    PERFORM set_config('app.xp_update_via_rpc', 'false', true);
    RETURN NEW;
  END IF;
  
  -- Block direct updates
  RAISE EXCEPTION 'SSOT VIOLATION: Direct update to profiles.experience is blocked. Use award_unified_xp() RPC instead. Source: %', TG_NAME;
END;
$function$;

-- Attach guardrail trigger (BEFORE UPDATE so it can block)
DROP TRIGGER IF EXISTS guard_xp_direct_update ON public.profiles;
CREATE TRIGGER guard_xp_direct_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_xp_direct_update();
