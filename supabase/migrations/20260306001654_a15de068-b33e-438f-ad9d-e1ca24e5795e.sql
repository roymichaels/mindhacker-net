-- Allow authenticated users to insert their own skills (mission-linked)
CREATE POLICY "Users can insert own skills"
  ON public.skills FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow authenticated users to update their own skills
CREATE POLICY "Users can update own skills"
  ON public.skills FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow service_role (edge functions) to insert skills for any user
CREATE POLICY "Service role can insert skills"
  ON public.skills FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Also add INSERT policy for user_skill_progress (currently only has ALL which may not cover service_role)
CREATE POLICY "Service role can manage skill progress"
  ON public.user_skill_progress FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);