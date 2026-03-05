
-- ═══════════════════════════════════════════════════
-- Auto-Mining Triggers: fire fm_mine_activity on activity completion
-- ═══════════════════════════════════════════════════

-- 1. Hypnosis Session Mining Trigger
CREATE OR REPLACE FUNCTION public.fm_trigger_mine_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Only mine completed sessions with sufficient duration
  IF COALESCE(NEW.duration_seconds, 0) < 60 THEN
    RETURN NEW;
  END IF;

  SELECT public.fm_mine_activity(
    NEW.user_id,
    'hypnosis_session',
    'hypnosis_sessions',
    NEW.id::text,
    jsonb_build_object('ego_state', NEW.ego_state, 'duration', NEW.duration_seconds)
  ) INTO v_result;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Mining trigger failed for session %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_fm_mine_session
AFTER INSERT ON public.hypnosis_sessions
FOR EACH ROW EXECUTE FUNCTION public.fm_trigger_mine_session();

-- 2. Community Post Mining Trigger
CREATE OR REPLACE FUNCTION public.fm_trigger_mine_post()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_result jsonb;
BEGIN
  IF NEW.status = 'published' AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != 'published')) THEN
    SELECT public.fm_mine_activity(NEW.user_id, 'community_post', 'community_posts', NEW.id::text) INTO v_result;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Mining trigger failed for post %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_fm_mine_post
AFTER INSERT OR UPDATE ON public.community_posts
FOR EACH ROW EXECUTE FUNCTION public.fm_trigger_mine_post();

-- 3. Community Comment Mining Trigger
CREATE OR REPLACE FUNCTION public.fm_trigger_mine_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_result jsonb;
BEGIN
  SELECT public.fm_mine_activity(NEW.user_id, 'community_comment', 'community_comments', NEW.id::text) INTO v_result;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Mining trigger failed for comment %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_fm_mine_comment
AFTER INSERT ON public.community_comments
FOR EACH ROW EXECUTE FUNCTION public.fm_trigger_mine_comment();

-- 4. Learning Lesson Mining Trigger
CREATE OR REPLACE FUNCTION public.fm_trigger_mine_lesson()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_result jsonb;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    SELECT public.fm_mine_activity(NEW.user_id, 'learning_lesson', 'learning_lessons', NEW.id::text) INTO v_result;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Mining trigger failed for lesson %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_fm_mine_lesson
AFTER UPDATE ON public.learning_lessons
FOR EACH ROW EXECUTE FUNCTION public.fm_trigger_mine_lesson();

-- 5. Habit Completion Mining Trigger
CREATE OR REPLACE FUNCTION public.fm_trigger_mine_habit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_result jsonb;
BEGIN
  IF NEW.is_completed = true THEN
    SELECT public.fm_mine_activity(NEW.user_id, 'habit_completion', 'daily_habit_logs', NEW.id::text) INTO v_result;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Mining trigger failed for habit %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_fm_mine_habit
AFTER INSERT OR UPDATE ON public.daily_habit_logs
FOR EACH ROW EXECUTE FUNCTION public.fm_trigger_mine_habit();

-- Enable realtime for mining logs so UI updates live
ALTER PUBLICATION supabase_realtime ADD TABLE public.fm_mining_logs;
