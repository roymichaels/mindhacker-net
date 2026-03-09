
-- Weekly Briefings table
CREATE TABLE public.weekly_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  title TEXT,
  summary_text TEXT NOT NULL,
  risks TEXT[] DEFAULT '{}',
  opportunities TEXT[] DEFAULT '{}',
  key_focus TEXT,
  audio_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_weekly_briefings_user_week ON public.weekly_briefings (user_id, week_start);
ALTER TABLE public.weekly_briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own briefings" ON public.weekly_briefings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Service can insert briefings" ON public.weekly_briefings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Aurora Memory Graph table
CREATE TABLE public.aurora_memory_graph (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  node_type TEXT NOT NULL CHECK (node_type IN ('belief', 'fear', 'breakthrough', 'pattern', 'value_shift', 'dream', 'blocker', 'insight')),
  content TEXT NOT NULL,
  context TEXT,
  pillar TEXT,
  strength INTEGER DEFAULT 1 CHECK (strength >= 1 AND strength <= 10),
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_referenced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reference_count INTEGER DEFAULT 1,
  related_node_ids UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_memory_graph_user ON public.aurora_memory_graph (user_id, is_active);
CREATE INDEX idx_memory_graph_type ON public.aurora_memory_graph (user_id, node_type);
ALTER TABLE public.aurora_memory_graph ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own memory nodes" ON public.aurora_memory_graph FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users manage own memory nodes" ON public.aurora_memory_graph FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own memory nodes" ON public.aurora_memory_graph FOR UPDATE TO authenticated USING (auth.uid() = user_id);
