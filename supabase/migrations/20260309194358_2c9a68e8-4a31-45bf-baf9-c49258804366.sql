
-- Work sessions: tracks time blocks for work tasks
CREATE TABLE public.work_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_item_id UUID REFERENCES public.action_items(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Work Block',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high')),
  notes TEXT,
  is_deep_work BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Work scores: daily productivity metrics
CREATE TABLE public.work_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_minutes INTEGER DEFAULT 0,
  deep_work_minutes INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  productivity_score INTEGER DEFAULT 0,
  velocity NUMERIC(5,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, score_date)
);

-- RLS
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own work sessions"
  ON public.work_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own work scores"
  ON public.work_scores FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at on work_scores
CREATE TRIGGER update_work_scores_updated_at
  BEFORE UPDATE ON public.work_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
