-- ============================================================================
-- GAMIFICATION SYSTEM ROBUSTNESS FIX
-- Phase 1: Fix award_unified_xp, consolidate triggers, fix existing data
-- ============================================================================

-- 1. First drop the old function to allow return type change
DROP FUNCTION IF EXISTS public.award_unified_xp(uuid, integer, text, text);

-- 2. Create improved award_unified_xp with level calculation and token bonus
CREATE OR REPLACE FUNCTION public.award_unified_xp(
  p_user_id uuid, 
  p_amount integer, 
  p_source text, 
  p_reason text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_old_level integer;
  v_new_level integer;
  v_new_experience integer;
  v_tokens_awarded integer := 0;
  v_levels_gained integer := 0;
BEGIN
  -- Get current level and experience
  SELECT COALESCE(level, 1), COALESCE(experience, 0)
  INTO v_old_level, v_new_experience
  FROM public.profiles 
  WHERE id = p_user_id;
  
  -- Calculate new experience
  v_new_experience := v_new_experience + p_amount;
  
  -- Calculate new level (100 XP per level)
  v_new_level := GREATEST(1, FLOOR(v_new_experience / 100) + 1);
  
  -- Calculate levels gained and token bonus (5 tokens per level)
  IF v_new_level > v_old_level THEN
    v_levels_gained := v_new_level - v_old_level;
    v_tokens_awarded := v_levels_gained * 5;
  END IF;
  
  -- Update profile with new experience, level, and tokens
  UPDATE public.profiles 
  SET 
    experience = v_new_experience,
    level = v_new_level,
    tokens = COALESCE(tokens, 0) + v_tokens_awarded,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Log the XP event
  INSERT INTO public.xp_events (user_id, amount, source, reason)
  VALUES (p_user_id, p_amount, p_source, p_reason);
  
  -- Return result for frontend
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

-- 3. Update aurora_award_xp to use the new function signature
CREATE OR REPLACE FUNCTION public.aurora_award_xp(p_user_id uuid, p_amount integer, p_reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Call the unified XP function with 'aurora' as the source
  PERFORM award_unified_xp(p_user_id, p_amount, 'aurora', p_reason);
END;
$function$;

-- 4. Drop old redundant triggers
DROP TRIGGER IF EXISTS on_hypnosis_session_complete ON public.hypnosis_sessions;
DROP TRIGGER IF EXISTS on_session_complete ON public.hypnosis_sessions;
DROP TRIGGER IF EXISTS on_session_track_ego ON public.hypnosis_sessions;
DROP TRIGGER IF EXISTS update_streak_on_session ON public.hypnosis_sessions;

-- 5. Create consolidated session handler function
CREATE OR REPLACE FUNCTION public.handle_hypnosis_session_complete()
RETURNS TRIGGER
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
  -- Get user's current streak info
  SELECT session_streak, last_session_date 
  INTO v_current_streak, v_last_date
  FROM profiles 
  WHERE id = NEW.user_id;
  
  v_current_streak := COALESCE(v_current_streak, 0);
  
  -- Determine new streak value
  IF v_last_date IS NULL OR v_last_date < v_today - 1 THEN
    -- Reset streak (gap > 1 day or first session)
    v_new_streak := 1;
  ELSIF v_last_date = v_today - 1 THEN
    -- Consecutive day - increment streak
    v_new_streak := v_current_streak + 1;
  ELSIF v_last_date = v_today THEN
    -- Same day - keep current streak
    v_new_streak := v_current_streak;
  ELSE
    v_new_streak := 1;
  END IF;
  
  -- Calculate streak milestone bonuses (only on new milestone)
  IF v_new_streak > v_current_streak THEN
    CASE v_new_streak
      WHEN 3 THEN 
        v_bonus_xp := 25;
        v_bonus_tokens := 5;
      WHEN 7 THEN 
        v_bonus_xp := 50;
        v_bonus_tokens := 10;
      WHEN 14 THEN 
        v_bonus_xp := 100;
        v_bonus_tokens := 20;
      WHEN 30 THEN 
        v_bonus_xp := 200;
        v_bonus_tokens := 50;
      WHEN 60 THEN 
        v_bonus_xp := 300;
        v_bonus_tokens := 75;
      WHEN 100 THEN 
        v_bonus_xp := 500;
        v_bonus_tokens := 100;
      ELSE
        -- Daily bonus after 7 day streak
        IF v_new_streak > 7 THEN
          v_bonus_xp := 5;
        END IF;
    END CASE;
  END IF;
  
  -- Update streak and ego state usage
  UPDATE profiles 
  SET 
    session_streak = v_new_streak,
    last_session_date = v_today,
    tokens = COALESCE(tokens, 0) + v_bonus_tokens,
    ego_state_usage = COALESCE(ego_state_usage, '{}'::jsonb) || 
      jsonb_build_object(
        NEW.ego_state, 
        COALESCE((ego_state_usage ->> NEW.ego_state)::int, 0) + 1
      ),
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  -- Award session XP via unified function (includes level calculation)
  SELECT award_unified_xp(
    NEW.user_id, 
    COALESCE(NEW.experience_gained, 0) + v_bonus_xp,
    'hypnosis_session',
    'Session completed: ' || NEW.ego_state
  ) INTO v_xp_result;
  
  RETURN NEW;
END;
$function$;

-- 6. Create single consolidated trigger
CREATE TRIGGER on_hypnosis_session_complete
  AFTER INSERT ON public.hypnosis_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_hypnosis_session_complete();

-- 7. Fix existing level mismatches
UPDATE public.profiles 
SET level = GREATEST(1, FLOOR(COALESCE(experience, 0) / 100) + 1)
WHERE level != GREATEST(1, FLOOR(COALESCE(experience, 0) / 100) + 1)
   OR level IS NULL;

-- 8. Drop old conflicting functions (keep only consolidated versions)
DROP FUNCTION IF EXISTS public.check_streak_bonus(uuid);
DROP FUNCTION IF EXISTS public.update_session_streak();
DROP FUNCTION IF EXISTS public.update_ego_state_usage();