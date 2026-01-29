-- Create xp_events table for unified XP tracking
CREATE TABLE public.xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  source TEXT NOT NULL, -- 'hypnosis', 'aurora', 'aurora_insight', 'community', 'course'
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own XP events
CREATE POLICY "Users can view own xp events"
ON public.xp_events
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own XP events (via triggers/functions)
CREATE POLICY "Users can insert own xp events"
ON public.xp_events
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Index for efficient querying
CREATE INDEX idx_xp_events_user_date ON public.xp_events(user_id, created_at DESC);
CREATE INDEX idx_xp_events_source ON public.xp_events(source);

-- Unified XP awarding function
CREATE OR REPLACE FUNCTION public.award_unified_xp(
  p_user_id UUID,
  p_amount INT,
  p_source TEXT,
  p_reason TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Update profile experience
  UPDATE public.profiles 
  SET experience = COALESCE(experience, 0) + p_amount,
      updated_at = now()
  WHERE id = p_user_id;
  
  -- Log the XP event
  INSERT INTO public.xp_events (user_id, amount, source, reason)
  VALUES (p_user_id, p_amount, p_source, p_reason);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Weekly stats view for dashboard
CREATE VIEW public.weekly_user_stats AS
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE source = 'hypnosis') as hypnosis_sessions,
  COUNT(*) FILTER (WHERE source = 'aurora') as aurora_chats,
  COUNT(*) FILTER (WHERE source = 'aurora_insight') as insights_gained,
  SUM(amount) as total_xp
FROM public.xp_events
WHERE created_at > now() - interval '7 days'
GROUP BY user_id;