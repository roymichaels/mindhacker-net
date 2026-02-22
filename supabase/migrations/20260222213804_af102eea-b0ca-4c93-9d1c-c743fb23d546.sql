
-- Add schedule/execution fields to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS wake_time time DEFAULT '06:30',
  ADD COLUMN IF NOT EXISTS sleep_time time DEFAULT '23:00',
  ADD COLUMN IF NOT EXISTS focus_peak_start time DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS focus_peak_end time DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS crash_window_start time DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS crash_window_end time DEFAULT NULL;

-- Add execution engine fields to action_items
ALTER TABLE public.action_items
  ADD COLUMN IF NOT EXISTS time_block text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS priority_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_fallback boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS generated_payload jsonb DEFAULT NULL;

-- Create today_runs table for daily execution tracking
CREATE TABLE IF NOT EXISTS public.today_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  run_date date NOT NULL DEFAULT CURRENT_DATE,
  mode text NOT NULL DEFAULT 'normal', -- normal | min_day
  movement_score integer DEFAULT 0, -- 0-100
  body_covered boolean DEFAULT false,
  mind_covered boolean DEFAULT false,
  arena_covered boolean DEFAULT false,
  actions_completed integer DEFAULT 0,
  actions_total integer DEFAULT 0,
  schedule_data jsonb DEFAULT NULL, -- cached schedule blocks
  generated_at timestamptz DEFAULT now(),
  completed_at timestamptz DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, run_date)
);

-- Enable RLS
ALTER TABLE public.today_runs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own today_runs"
  ON public.today_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own today_runs"
  ON public.today_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own today_runs"
  ON public.today_runs FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for fast daily lookups
CREATE INDEX IF NOT EXISTS idx_today_runs_user_date ON public.today_runs(user_id, run_date);
CREATE INDEX IF NOT EXISTS idx_action_items_time_block ON public.action_items(user_id, scheduled_date, time_block);
CREATE INDEX IF NOT EXISTS idx_action_items_priority ON public.action_items(user_id, priority_score DESC);
