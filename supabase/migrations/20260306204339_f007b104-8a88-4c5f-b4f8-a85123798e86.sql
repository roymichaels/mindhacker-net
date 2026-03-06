
-- Tactical schedule: AI-generated daily time-block schedules per phase
CREATE TABLE public.tactical_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.life_plans(id) ON DELETE CASCADE,
  phase_number INTEGER NOT NULL,
  schedule_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  wake_time TEXT NOT NULL DEFAULT '06:30',
  sleep_time TEXT NOT NULL DEFAULT '23:00',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, plan_id, phase_number)
);

ALTER TABLE public.tactical_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tactical schedules"
  ON public.tactical_schedules FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tactical schedules"
  ON public.tactical_schedules FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tactical schedules"
  ON public.tactical_schedules FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tactical schedules"
  ON public.tactical_schedules FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
