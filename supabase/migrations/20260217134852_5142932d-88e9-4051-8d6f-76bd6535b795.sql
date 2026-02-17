
-- Daily Pulse Logs: one row per user per day
CREATE TABLE public.daily_pulse_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  energy_rating smallint NOT NULL CHECK (energy_rating BETWEEN 1 AND 5),
  sleep_compliance text NOT NULL CHECK (sleep_compliance IN ('yes','partial','no')),
  task_confidence smallint NOT NULL CHECK (task_confidence BETWEEN 1 AND 5),
  screen_discipline boolean NOT NULL DEFAULT false,
  mood_signal text NOT NULL CHECK (mood_signal IN ('wired','drained','neutral','focused','flow')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, log_date)
);

ALTER TABLE public.daily_pulse_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pulse logs"
  ON public.daily_pulse_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pulse logs"
  ON public.daily_pulse_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pulse logs"
  ON public.daily_pulse_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for fast weekly aggregation
CREATE INDEX idx_pulse_logs_user_date ON public.daily_pulse_logs (user_id, log_date DESC);

-- Recalibration Logs: one row per user per week
CREATE TABLE public.recalibration_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  week_number smallint NOT NULL,
  compliance_score numeric NOT NULL DEFAULT 0,
  cognitive_load_score numeric NOT NULL DEFAULT 0,
  recovery_debt_score numeric NOT NULL DEFAULT 0,
  adjustments_made jsonb DEFAULT '{}'::jsonb,
  behavioral_risks jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_number)
);

ALTER TABLE public.recalibration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recalibration logs"
  ON public.recalibration_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert recalibration logs"
  ON public.recalibration_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update recalibration logs"
  ON public.recalibration_logs FOR UPDATE
  USING (true);

CREATE INDEX idx_recalib_user_week ON public.recalibration_logs (user_id, week_number DESC);
