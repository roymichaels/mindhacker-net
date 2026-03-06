
CREATE TABLE public.milestone_journey_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES public.life_plan_milestones(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_steps INTEGER NOT NULL DEFAULT 0,
  completed_steps INTEGER NOT NULL DEFAULT 0,
  current_step INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(milestone_id, user_id)
);

ALTER TABLE public.milestone_journey_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own journey steps"
  ON public.milestone_journey_steps FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journey steps"
  ON public.milestone_journey_steps FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journey steps"
  ON public.milestone_journey_steps FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_milestone_journey_steps_user ON public.milestone_journey_steps(user_id);
CREATE INDEX idx_milestone_journey_steps_milestone ON public.milestone_journey_steps(milestone_id);
