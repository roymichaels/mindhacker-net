-- Aurora Proactive Intelligence System Tables

-- Table for queued proactive outreach messages
CREATE TABLE public.aurora_proactive_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  trigger_type TEXT NOT NULL, -- 'overdue_task', 'habit_reminder', 'milestone_ending', 'pattern_alert', 'streak_risk', 'daily_checkin'
  trigger_data JSONB DEFAULT '{}',
  priority INTEGER DEFAULT 5, -- 1-10, higher = more urgent
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.aurora_proactive_queue ENABLE ROW LEVEL SECURITY;

-- Users can only see their own proactive messages
CREATE POLICY "Users can view their own proactive queue"
ON public.aurora_proactive_queue
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update (dismiss) their own messages
CREATE POLICY "Users can update their own proactive queue"
ON public.aurora_proactive_queue
FOR UPDATE
USING (auth.uid() = user_id);

-- Service role can insert for any user
CREATE POLICY "Service role can insert proactive messages"
ON public.aurora_proactive_queue
FOR INSERT
WITH CHECK (true);

-- Index for efficient scheduled query
CREATE INDEX idx_proactive_queue_scheduled ON public.aurora_proactive_queue(scheduled_for, sent_at) WHERE sent_at IS NULL;
CREATE INDEX idx_proactive_queue_user ON public.aurora_proactive_queue(user_id, scheduled_for);

-- Table for user action preferences (trust levels)
CREATE TABLE public.aurora_action_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'task_complete', 'habit_log', 'reminder_set', 'navigate', etc.
  trust_level TEXT NOT NULL DEFAULT 'always_ask', -- 'always_ask', 'auto_execute', 'confirm_once'
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, action_type)
);

-- Enable RLS
ALTER TABLE public.aurora_action_preferences ENABLE ROW LEVEL SECURITY;

-- Users can manage their own preferences
CREATE POLICY "Users can view their action preferences"
ON public.aurora_action_preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their action preferences"
ON public.aurora_action_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their action preferences"
ON public.aurora_action_preferences
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their action preferences"
ON public.aurora_action_preferences
FOR DELETE
USING (auth.uid() = user_id);

-- Add enhanced context columns to existing aurora tables
ALTER TABLE public.aurora_onboarding_progress 
ADD COLUMN IF NOT EXISTS mood_signals JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS energy_level TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS last_active_page TEXT,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS proactive_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS voice_mode_enabled BOOLEAN DEFAULT false;

-- Function to get pending proactive items for a user
CREATE OR REPLACE FUNCTION public.get_pending_proactive_items(p_user_id UUID)
RETURNS SETOF public.aurora_proactive_queue
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.aurora_proactive_queue
  WHERE user_id = p_user_id
    AND sent_at IS NULL
    AND dismissed_at IS NULL
    AND scheduled_for <= NOW()
  ORDER BY priority DESC, scheduled_for ASC
  LIMIT 5;
$$;

-- Function to queue a proactive message
CREATE OR REPLACE FUNCTION public.queue_proactive_message(
  p_user_id UUID,
  p_trigger_type TEXT,
  p_trigger_data JSONB DEFAULT '{}',
  p_priority INTEGER DEFAULT 5,
  p_scheduled_for TIMESTAMPTZ DEFAULT NOW()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.aurora_proactive_queue (user_id, trigger_type, trigger_data, priority, scheduled_for)
  VALUES (p_user_id, p_trigger_type, p_trigger_data, p_priority, p_scheduled_for)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;