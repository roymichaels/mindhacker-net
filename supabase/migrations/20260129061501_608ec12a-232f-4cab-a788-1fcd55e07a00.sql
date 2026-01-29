-- Function to check and award streak bonus XP/tokens
CREATE OR REPLACE FUNCTION public.check_streak_bonus()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_current_streak INTEGER;
  v_last_session DATE;
  v_today DATE;
  v_bonus_xp INTEGER := 0;
  v_bonus_tokens INTEGER := 0;
BEGIN
  v_user_id := NEW.user_id;
  v_today := CURRENT_DATE;
  
  -- Get current profile data
  SELECT session_streak, last_session_date 
  INTO v_current_streak, v_last_session
  FROM profiles 
  WHERE id = v_user_id;
  
  -- Check if this is a new day session
  IF v_last_session IS NULL OR v_last_session < v_today THEN
    -- Check if streak continues (yesterday) or resets
    IF v_last_session = v_today - INTERVAL '1 day' THEN
      -- Streak continues
      v_current_streak := COALESCE(v_current_streak, 0) + 1;
      
      -- Award streak bonuses at milestones
      CASE v_current_streak
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
          -- Daily streak bonus (every day after 7)
          IF v_current_streak > 7 THEN
            v_bonus_xp := 5;
          END IF;
      END CASE;
    ELSE
      -- Streak broken, reset to 1
      v_current_streak := 1;
    END IF;
    
    -- Update profile with new streak and bonuses
    UPDATE profiles 
    SET 
      session_streak = v_current_streak,
      last_session_date = v_today,
      experience = COALESCE(experience, 0) + COALESCE(NEW.experience_gained, 0) + v_bonus_xp,
      tokens = COALESCE(tokens, 0) + v_bonus_tokens,
      updated_at = NOW()
    WHERE id = v_user_id;
  ELSE
    -- Same day, just add XP without streak update
    UPDATE profiles 
    SET 
      experience = COALESCE(experience, 0) + COALESCE(NEW.experience_gained, 0),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on hypnosis_sessions if not exists
DROP TRIGGER IF EXISTS on_session_complete ON hypnosis_sessions;
CREATE TRIGGER on_session_complete
  AFTER INSERT ON hypnosis_sessions
  FOR EACH ROW
  EXECUTE FUNCTION check_streak_bonus();

-- Function to update ego_state_usage JSONB
CREATE OR REPLACE FUNCTION public.update_ego_state_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET 
    ego_state_usage = COALESCE(ego_state_usage, '{}'::jsonb) || 
      jsonb_build_object(
        NEW.ego_state, 
        COALESCE((ego_state_usage ->> NEW.ego_state)::int, 0) + 1
      ),
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for ego state tracking
DROP TRIGGER IF EXISTS on_session_track_ego ON hypnosis_sessions;
CREATE TRIGGER on_session_track_ego
  AFTER INSERT ON hypnosis_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_ego_state_usage();