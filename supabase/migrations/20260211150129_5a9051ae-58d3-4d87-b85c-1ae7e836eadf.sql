-- Fix aurora_award_xp(uuid,int,text,text) which references non-existent profiles.xp
CREATE OR REPLACE FUNCTION public.aurora_award_xp(
  p_user_id uuid,
  p_amount integer,
  p_source text,
  p_description text DEFAULT NULL::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Use unified XP/level/token system (profiles.experience) instead of legacy profiles.xp
  PERFORM award_unified_xp(p_user_id, p_amount, p_source, p_description);
END;
$$;