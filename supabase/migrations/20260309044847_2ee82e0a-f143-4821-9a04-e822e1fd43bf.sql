
-- Allow users to delete their own business journeys
CREATE POLICY "Users can delete own business journeys" ON public.business_journeys
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
