-- Fix the weekly_user_stats view - recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.weekly_user_stats;

CREATE VIEW public.weekly_user_stats WITH (security_invoker = true) AS
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE source = 'hypnosis') as hypnosis_sessions,
  COUNT(*) FILTER (WHERE source = 'aurora') as aurora_chats,
  COUNT(*) FILTER (WHERE source = 'aurora_insight') as insights_gained,
  SUM(amount) as total_xp
FROM public.xp_events
WHERE created_at > now() - interval '7 days'
GROUP BY user_id;

-- Fix the award_unified_xp function - add search_path
DROP FUNCTION IF EXISTS public.award_unified_xp(UUID, INT, TEXT, TEXT);

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;