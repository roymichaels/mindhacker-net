
-- SECURITY FIX: remaining critical RLS vulnerabilities
-- (first batch partially applied — fixing remaining)

-- FIX 2b: recalibration_logs — drop any existing duplicate policies and recreate
DROP POLICY IF EXISTS "Users can view own recalibration logs" ON public.recalibration_logs;
CREATE POLICY "Users can view own recalibration logs"
  ON public.recalibration_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role insert recalibration logs" ON public.recalibration_logs;
CREATE POLICY "Service role insert recalibration logs"
  ON public.recalibration_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role update recalibration logs" ON public.recalibration_logs;
CREATE POLICY "Service role update recalibration logs"
  ON public.recalibration_logs FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- FIX 3: user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- FIX 4: skills
DROP POLICY IF EXISTS "Skills catalog readable by all (anon)" ON public.skills;
CREATE POLICY "Skills catalog readable by all (anon)"
  ON public.skills FOR SELECT
  TO anon
  USING (user_id IS NULL);

-- FIX 5: ai_response_logs
DROP POLICY IF EXISTS "Service role insert ai_response_logs" ON public.ai_response_logs;
CREATE POLICY "Service role insert ai_response_logs"
  ON public.ai_response_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own ai_response_logs" ON public.ai_response_logs;
CREATE POLICY "Users can view own ai_response_logs"
  ON public.ai_response_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
