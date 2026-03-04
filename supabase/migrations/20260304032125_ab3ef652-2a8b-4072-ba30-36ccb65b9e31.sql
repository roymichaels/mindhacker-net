
-- Fix award_unified_xp to set the session flag before updating profiles
CREATE OR REPLACE FUNCTION public.award_unified_xp(p_user_id uuid, p_amount integer, p_source text, p_reason text DEFAULT NULL::text, p_idempotency_key text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_new_experience INTEGER;
  v_tokens_awarded INTEGER := 0;
  v_levels_gained INTEGER := 0;
  v_existing JSONB;
BEGIN
  -- Idempotency check
  IF p_idempotency_key IS NOT NULL THEN
    SELECT jsonb_build_object(
      'xp_gained', amount,
      'new_experience', 0,
      'old_level', 0,
      'new_level', 0,
      'levels_gained', 0,
      'tokens_awarded', 0,
      'idempotent', true
    ) INTO v_existing
    FROM public.xp_events
    WHERE idempotency_key = p_idempotency_key;
    
    IF v_existing IS NOT NULL THEN
      RETURN v_existing;
    END IF;
  END IF;

  -- Get current level and experience
  SELECT COALESCE(level, 1), COALESCE(experience, 0)
  INTO v_old_level, v_new_experience
  FROM public.profiles 
  WHERE id = p_user_id;
  
  v_new_experience := v_new_experience + p_amount;
  v_new_level := GREATEST(1, FLOOR(v_new_experience / 100) + 1);
  
  IF v_new_level > v_old_level THEN
    v_levels_gained := v_new_level - v_old_level;
    v_tokens_awarded := v_levels_gained * 5;
  END IF;
  
  -- Set session flag so guard trigger allows the update
  PERFORM set_config('app.xp_update_via_rpc', 'true', true);
  
  -- Update profile (XP + level only)
  UPDATE public.profiles 
  SET 
    experience = v_new_experience,
    level = v_new_level,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Log XP event
  INSERT INTO public.xp_events (user_id, amount, source, reason, idempotency_key)
  VALUES (p_user_id, p_amount, p_source, p_reason, p_idempotency_key);
  
  -- Award energy via ledger if levels gained
  IF v_tokens_awarded > 0 THEN
    PERFORM award_energy(
      p_user_id, 
      v_tokens_awarded, 
      'level_up', 
      'Leveled up from ' || v_old_level || ' to ' || v_new_level
    );
  END IF;
  
  RETURN jsonb_build_object(
    'xp_gained', p_amount,
    'new_experience', v_new_experience,
    'old_level', v_old_level,
    'new_level', v_new_level,
    'levels_gained', v_levels_gained,
    'tokens_awarded', v_tokens_awarded
  );
END;
$function$;
