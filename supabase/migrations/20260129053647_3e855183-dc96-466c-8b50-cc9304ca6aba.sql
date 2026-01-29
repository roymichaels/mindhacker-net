-- =============================================
-- GAMIFICATION SYSTEM: Libero Integration
-- =============================================

-- 1. Extend profiles table for gamification
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS level integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS experience integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS tokens integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS session_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_session_date date,
ADD COLUMN IF NOT EXISTS active_ego_state text DEFAULT 'guardian',
ADD COLUMN IF NOT EXISTS ego_state_usage jsonb DEFAULT '{}';

-- 2. Create hypnosis_sessions table for session history
CREATE TABLE IF NOT EXISTS hypnosis_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ego_state text NOT NULL DEFAULT 'guardian',
  action text,
  goal_id text,
  duration_seconds integer NOT NULL DEFAULT 0,
  experience_gained integer DEFAULT 0,
  script_data jsonb,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 3. Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  UNIQUE(user_id, achievement_id)
);

-- 4. Create custom_protocols table for user-defined sessions
CREATE TABLE IF NOT EXISTS custom_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  goals text[],
  induction text,
  duration_seconds integer DEFAULT 600,
  ego_state text DEFAULT 'guardian',
  is_public boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Enable RLS on all new tables
ALTER TABLE hypnosis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_protocols ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for hypnosis_sessions
CREATE POLICY "Users can view own sessions"
  ON hypnosis_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON hypnosis_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all sessions"
  ON hypnosis_sessions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 7. RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all achievements"
  ON user_achievements FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 8. RLS Policies for custom_protocols
CREATE POLICY "Users can view own protocols"
  ON custom_protocols FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public protocols"
  ON custom_protocols FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can insert own protocols"
  ON custom_protocols FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own protocols"
  ON custom_protocols FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own protocols"
  ON custom_protocols FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all protocols"
  ON custom_protocols FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 9. Create streak bonus function
CREATE OR REPLACE FUNCTION check_streak_bonus(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_streak integer;
  v_bonus integer := 0;
BEGIN
  SELECT session_streak INTO v_streak FROM profiles WHERE id = p_user_id;
  
  -- Weekly bonus (7 days)
  IF v_streak = 7 THEN 
    v_bonus := 10;
  -- Monthly bonus (30 days)
  ELSIF v_streak = 30 THEN 
    v_bonus := 50;
  -- 100 day bonus
  ELSIF v_streak = 100 THEN
    v_bonus := 200;
  END IF;
  
  IF v_bonus > 0 THEN
    UPDATE profiles SET tokens = tokens + v_bonus WHERE id = p_user_id;
  END IF;
  
  RETURN v_bonus;
END;
$$;

-- 10. Create function to update streak on session completion
CREATE OR REPLACE FUNCTION update_session_streak()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_date date;
  v_today date := CURRENT_DATE;
  v_new_streak integer;
BEGIN
  -- Get user's last session date
  SELECT last_session_date INTO v_last_date FROM profiles WHERE id = NEW.user_id;
  
  IF v_last_date IS NULL OR v_last_date < v_today - 1 THEN
    -- Reset streak if more than 1 day gap
    v_new_streak := 1;
  ELSIF v_last_date = v_today - 1 THEN
    -- Consecutive day - increment streak
    SELECT session_streak + 1 INTO v_new_streak FROM profiles WHERE id = NEW.user_id;
  ELSIF v_last_date = v_today THEN
    -- Same day - keep current streak
    SELECT session_streak INTO v_new_streak FROM profiles WHERE id = NEW.user_id;
  ELSE
    v_new_streak := 1;
  END IF;
  
  -- Update profile with new streak and date
  UPDATE profiles 
  SET 
    session_streak = v_new_streak,
    last_session_date = v_today,
    experience = experience + COALESCE(NEW.experience_gained, 0),
    level = GREATEST(1, FLOOR((experience + COALESCE(NEW.experience_gained, 0)) / 100) + 1),
    ego_state_usage = COALESCE(ego_state_usage, '{}') || 
      jsonb_build_object(NEW.ego_state, COALESCE((ego_state_usage->>NEW.ego_state)::integer, 0) + 1)
  WHERE id = NEW.user_id;
  
  -- Check for streak bonuses
  PERFORM check_streak_bonus(NEW.user_id);
  
  RETURN NEW;
END;
$$;

-- 11. Create trigger for session completion
DROP TRIGGER IF EXISTS on_hypnosis_session_complete ON hypnosis_sessions;
CREATE TRIGGER on_hypnosis_session_complete
  AFTER INSERT ON hypnosis_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_streak();

-- 12. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hypnosis_sessions_user_id ON hypnosis_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_hypnosis_sessions_completed_at ON hypnosis_sessions(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_protocols_user_id ON custom_protocols(user_id);