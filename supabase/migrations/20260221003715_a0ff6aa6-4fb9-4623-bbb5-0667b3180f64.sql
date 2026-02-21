
-- Life Protocol Compiler tables
CREATE TABLE public.life_protocols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.life_plans(id) ON DELETE SET NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  wake_time TIME NOT NULL DEFAULT '05:00',
  sleep_time TIME NOT NULL DEFAULT '22:00',
  energy_peak_start TIME DEFAULT '06:00',
  energy_peak_end TIME DEFAULT '10:00',
  energy_crash_start TIME DEFAULT '14:00',
  energy_crash_end TIME DEFAULT '15:00',
  training_window_start TIME DEFAULT '07:00',
  training_window_end TIME DEFAULT '08:00',
  work_start TIME DEFAULT '09:00',
  work_end TIME DEFAULT '17:00',
  locked_until TIMESTAMPTZ,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'plus', 'apex')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active_locked', 'active', 'paused', 'completed')),
  compliance_avg NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.protocol_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol_id UUID NOT NULL REFERENCES public.life_protocols(id) ON DELETE CASCADE,
  day_index INTEGER NOT NULL DEFAULT 0, -- 0=template, 1-7=specific day
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  block_type TEXT NOT NULL CHECK (block_type IN ('wake', 'focus', 'training', 'recovery', 'work', 'reflection', 'combat', 'expansion', 'admin', 'meal', 'sleep', 'play', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  linked_session_id UUID,
  linked_action_id UUID REFERENCES public.action_items(id) ON DELETE SET NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  skipped BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.protocol_compliance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol_id UUID NOT NULL REFERENCES public.life_protocols(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_blocks INTEGER NOT NULL DEFAULT 0,
  completed_blocks INTEGER NOT NULL DEFAULT 0,
  skipped_blocks INTEGER NOT NULL DEFAULT 0,
  compliance_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(protocol_id, log_date)
);

-- Indexes
CREATE INDEX idx_life_protocols_user ON public.life_protocols(user_id);
CREATE INDEX idx_life_protocols_status ON public.life_protocols(status);
CREATE INDEX idx_protocol_blocks_protocol ON public.protocol_blocks(protocol_id);
CREATE INDEX idx_protocol_blocks_day ON public.protocol_blocks(protocol_id, day_index);
CREATE INDEX idx_protocol_compliance_date ON public.protocol_compliance(protocol_id, log_date);

-- RLS
ALTER TABLE public.life_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_compliance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own protocols" ON public.life_protocols FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own blocks" ON public.protocol_blocks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.life_protocols lp WHERE lp.id = protocol_id AND lp.user_id = auth.uid())
);
CREATE POLICY "Users manage own compliance" ON public.protocol_compliance FOR ALL USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_life_protocols_updated_at
  BEFORE UPDATE ON public.life_protocols
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
