
-- Drop the older 4-arg overload that conflicts with the newer 5-arg version
DROP FUNCTION IF EXISTS public.award_unified_xp(uuid, integer, text, text);
