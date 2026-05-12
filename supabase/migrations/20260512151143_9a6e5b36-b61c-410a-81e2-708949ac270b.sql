
-- Orchestrator Brain: signals, live decision, history

CREATE TABLE IF NOT EXISTS public.aion_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  client_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_aion_signals_user_recent ON public.aion_signals (user_id, created_at DESC);
ALTER TABLE public.aion_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aion_signals: user inserts own" ON public.aion_signals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "aion_signals: user reads own" ON public.aion_signals
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.aion_decisions (
  user_id uuid PRIMARY KEY,
  mode text NOT NULL DEFAULT 'neutral',
  tone text NOT NULL DEFAULT 'grounded',
  density text NOT NULL DEFAULT 'standard',
  focus_target jsonb NOT NULL DEFAULT '{}'::jsonb,
  suggestion jsonb NOT NULL DEFAULT '{}'::jsonb,
  reasoning text,
  signals_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  expires_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.aion_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aion_decisions: user reads own" ON public.aion_decisions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE public.aion_decisions;
ALTER TABLE public.aion_decisions REPLICA IDENTITY FULL;

CREATE TABLE IF NOT EXISTS public.aion_decision_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mode text NOT NULL,
  tone text NOT NULL,
  density text NOT NULL,
  focus_target jsonb NOT NULL DEFAULT '{}'::jsonb,
  suggestion jsonb NOT NULL DEFAULT '{}'::jsonb,
  reasoning text,
  signals_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  archived_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_aion_decision_history_user ON public.aion_decision_history (user_id, archived_at DESC);
ALTER TABLE public.aion_decision_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aion_decision_history: user reads own" ON public.aion_decision_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.archive_aion_decision()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.aion_decision_history (user_id, mode, tone, density, focus_target, suggestion, reasoning, signals_snapshot)
  VALUES (OLD.user_id, OLD.mode, OLD.tone, OLD.density, OLD.focus_target, OLD.suggestion, OLD.reasoning, OLD.signals_snapshot);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS aion_decisions_archive ON public.aion_decisions;
CREATE TRIGGER aion_decisions_archive
  BEFORE UPDATE ON public.aion_decisions
  FOR EACH ROW EXECUTE FUNCTION public.archive_aion_decision();

-- Helper: list recently active users (for cron batching)
CREATE OR REPLACE FUNCTION public.aion_recent_active_users(p_minutes int DEFAULT 30)
RETURNS TABLE(user_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT s.user_id
  FROM public.aion_signals s
  WHERE s.created_at > now() - (p_minutes || ' minutes')::interval;
$$;
