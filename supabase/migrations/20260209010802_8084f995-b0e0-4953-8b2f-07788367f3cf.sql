
-- Fix 3 functions with mutable search paths
CREATE OR REPLACE FUNCTION public.aurora_award_xp(p_user_id uuid, p_amount integer, p_source text, p_description text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_xp integer;
  v_current_level integer;
  v_new_xp integer;
BEGIN
  -- Get current XP and level
  SELECT xp, level INTO v_current_xp, v_current_level
  FROM profiles WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  v_new_xp := COALESCE(v_current_xp, 0) + p_amount;
  
  -- Update profile
  UPDATE profiles SET xp = v_new_xp WHERE id = p_user_id;
  
  -- Log XP gain
  INSERT INTO xp_logs (user_id, amount, source, description)
  VALUES (p_user_id, p_amount, p_source, p_description);
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_launchpad_step(p_user_id uuid, p_step text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO launchpad_progress (user_id, step_key, completed, completed_at)
  VALUES (p_user_id, p_step, true, now())
  ON CONFLICT (user_id, step_key) DO UPDATE SET completed = true, completed_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_journey_completion(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_display_name text;
BEGIN
  SELECT display_name INTO v_display_name FROM profiles WHERE id = p_user_id;
  
  INSERT INTO admin_notifications (title, message, type, metadata)
  VALUES (
    'משתמש השלים מסע תודעה',
    COALESCE(v_display_name, 'משתמש') || ' השלים את מסע התודעה בהצלחה',
    'system',
    jsonb_build_object('user_id', p_user_id, 'event', 'journey_complete')
  );
END;
$$;

-- Remove duplicate page_views policies (keep the cleaner-named ones)
DROP POLICY IF EXISTS "page_views_public_insert" ON public.page_views;
DROP POLICY IF EXISTS "page_views_public_update" ON public.page_views;

-- Remove duplicate visitor_sessions policies
DROP POLICY IF EXISTS "visitor_sessions_public_insert" ON public.visitor_sessions;
DROP POLICY IF EXISTS "visitor_sessions_public_update" ON public.visitor_sessions;

-- Tighten aurora_proactive_queue: only authenticated users can insert their own
DROP POLICY IF EXISTS "Service role can insert proactive messages" ON public.aurora_proactive_queue;
CREATE POLICY "Users can insert own proactive messages" ON public.aurora_proactive_queue
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Tighten community_point_logs: only authenticated users can insert their own
DROP POLICY IF EXISTS "System can insert point logs" ON public.community_point_logs;
CREATE POLICY "Users can insert own point logs" ON public.community_point_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Tighten form_analyses: only authenticated users can insert
DROP POLICY IF EXISTS "Service role can insert analyses" ON public.form_analyses;
CREATE POLICY "Authenticated users can insert analyses" ON public.form_analyses
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Tighten analytics_reports: only service role (already restricted by roles but add auth check)
DROP POLICY IF EXISTS "Service role can insert analytics reports" ON public.analytics_reports;
CREATE POLICY "Service role can insert analytics reports" ON public.analytics_reports
  FOR INSERT TO service_role
  WITH CHECK (true);
