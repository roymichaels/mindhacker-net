
-- Backfill aurora_onboarding_progress for all existing profiles that don't have a row
INSERT INTO public.aurora_onboarding_progress (user_id, proactive_enabled, last_active_at, onboarding_complete)
SELECT p.id, true, now(), false
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.aurora_onboarding_progress aop WHERE aop.user_id = p.id
);

-- Create trigger function to auto-create onboarding progress for new profiles
CREATE OR REPLACE FUNCTION public.auto_create_aurora_onboarding_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.aurora_onboarding_progress (user_id, proactive_enabled, last_active_at, onboarding_complete)
  VALUES (NEW.id, true, now(), false)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS on_profile_created_aurora_progress ON public.profiles;
CREATE TRIGGER on_profile_created_aurora_progress
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_aurora_onboarding_progress();
