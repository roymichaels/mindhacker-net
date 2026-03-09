
-- Earn Launchpad progress tracker
CREATE TABLE public.earn_launchpad_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_enabled boolean NOT NULL DEFAULT false,
  mining_enabled boolean NOT NULL DEFAULT false,
  partners_enabled boolean NOT NULL DEFAULT false,
  milestones_completed jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.earn_launchpad_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own earn launchpad"
  ON public.earn_launchpad_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own earn launchpad"
  ON public.earn_launchpad_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own earn launchpad"
  ON public.earn_launchpad_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_earn_launchpad_updated_at
  BEFORE UPDATE ON public.earn_launchpad_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
