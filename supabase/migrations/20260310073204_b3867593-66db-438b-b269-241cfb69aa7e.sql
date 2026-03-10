
CREATE OR REPLACE FUNCTION public.auto_link_practice_on_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_practice_id UUID;
BEGIN
  -- Only fire when status changes to 'done'
  IF NEW.status != 'done' OR OLD.status = 'done' THEN
    RETURN NEW;
  END IF;

  -- Try to match task title to a practice (name or name_he)
  SELECT id INTO v_practice_id
  FROM practices
  WHERE is_active = true
    AND (
      LOWER(TRIM(name)) = LOWER(TRIM(NEW.title))
      OR LOWER(TRIM(name_he)) = LOWER(TRIM(NEW.title))
    )
  LIMIT 1;

  IF v_practice_id IS NOT NULL THEN
    INSERT INTO user_practices (user_id, practice_id, preferred_duration, frequency_per_week, is_core_practice, is_active)
    VALUES (NEW.user_id, v_practice_id, 15, 5, false, true)
    ON CONFLICT (user_id, practice_id) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'auto_link_practice failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_link_practice
AFTER UPDATE ON action_items
FOR EACH ROW
EXECUTE FUNCTION auto_link_practice_on_completion();
