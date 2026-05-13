-- ─── Trigger function: derive room from node_type when null ────────────
CREATE OR REPLACE FUNCTION public.fn_derive_brain_room()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.room IS NULL THEN
    NEW.room := CASE LOWER(COALESCE(NEW.node_type, ''))
      WHEN 'belief'        THEN 'beliefs'
      WHEN 'value'         THEN 'beliefs'
      WHEN 'pattern'       THEN 'emotions'
      WHEN 'blocker'       THEN 'emotions'
      WHEN 'insight'       THEN 'emotions'
      WHEN 'identity'      THEN 'identity'
      WHEN 'role'          THEN 'identity'
      WHEN 'goal'          THEN 'identity'
      WHEN 'desire'        THEN 'identity'
      WHEN 'strength'      THEN 'identity'
      WHEN 'habit'         THEN 'identity'
      WHEN 'pillar_marker' THEN 'identity'
      WHEN 'memory'        THEN 'time'
      WHEN 'dream'         THEN 'dreams'
      WHEN 'symbol'        THEN 'dreams'
      WHEN 'transcendent'  THEN 'beyond'
      WHEN 'somatic'       THEN 'body'
      ELSE 'identity'
    END;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_derive_brain_room ON public.aurora_memory_graph;
CREATE TRIGGER trg_derive_brain_room
  BEFORE INSERT OR UPDATE OF node_type, room ON public.aurora_memory_graph
  FOR EACH ROW EXECUTE FUNCTION public.fn_derive_brain_room();

-- ─── Backfill existing 405 rows ────────────────────────────────────────
UPDATE public.aurora_memory_graph
SET room = CASE LOWER(COALESCE(node_type, ''))
  WHEN 'belief'        THEN 'beliefs'
  WHEN 'value'         THEN 'beliefs'
  WHEN 'pattern'       THEN 'emotions'
  WHEN 'blocker'       THEN 'emotions'
  WHEN 'insight'       THEN 'emotions'
  WHEN 'identity'      THEN 'identity'
  WHEN 'role'          THEN 'identity'
  WHEN 'goal'          THEN 'identity'
  WHEN 'desire'        THEN 'identity'
  WHEN 'strength'      THEN 'identity'
  WHEN 'habit'         THEN 'identity'
  WHEN 'pillar_marker' THEN 'identity'
  WHEN 'memory'        THEN 'time'
  WHEN 'dream'         THEN 'dreams'
  WHEN 'symbol'        THEN 'dreams'
  WHEN 'transcendent'  THEN 'beyond'
  WHEN 'somatic'       THEN 'body'
  ELSE 'identity'
END
WHERE room IS NULL;