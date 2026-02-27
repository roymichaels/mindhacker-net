
-- ================================================
-- Phase 2: Job System — First-Class Entity
-- ================================================

-- 1. Jobs catalog (seeded with the 6 archetypes + 1 fallback)
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_he TEXT,
  description TEXT,
  description_he TEXT,
  icon TEXT DEFAULT '🎯',
  role_tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Jobs are readable by everyone" ON public.jobs FOR SELECT USING (true);

-- Seed the 6 archetype jobs
INSERT INTO public.jobs (name, name_he, description, description_he, icon, role_tags) VALUES
  ('Warrior', 'לוחם', 'Driven by action, courage, and determination', 'מונע על ידי פעולה, אומץ ונחישות', '⚔️', ARRAY['action','discipline','strength']),
  ('Mystic', 'מיסטיקן', 'Connected to intuition, wisdom, and the unseen', 'מחובר לאינטואיציה, חוכמה והנסתר', '🔮', ARRAY['intuition','meditation','depth']),
  ('Creator', 'יוצר', 'Fueled by imagination, expression, and innovation', 'מונע על ידי דמיון, ביטוי עצמי וחדשנות', '🎨', ARRAY['creativity','expression','innovation']),
  ('Sage', 'חכם', 'Guided by knowledge, analysis, and understanding', 'מונחה על ידי ידע, ניתוח והבנה', '📚', ARRAY['knowledge','analysis','strategy']),
  ('Healer', 'מרפא', 'Nurturing connection, empathy, and restoration', 'מטפח חיבור, אמפתיה והחלמה', '💚', ARRAY['empathy','nurturing','restoration']),
  ('Explorer', 'חוקר', 'Driven by curiosity, adventure, and discovery', 'מונע על ידי סקרנות, הרפתקאות וגילוי', '🌟', ARRAY['curiosity','adventure','discovery']);

-- 2. User jobs (assignment history)
CREATE TABLE public.user_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id),
  assigned_by TEXT NOT NULL DEFAULT 'ai' CHECK (assigned_by IN ('ai','user','coach','admin')),
  is_primary BOOLEAN NOT NULL DEFAULT false,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_user_jobs_user ON public.user_jobs (user_id);
CREATE INDEX idx_user_jobs_primary ON public.user_jobs (user_id) WHERE is_primary = true;

ALTER TABLE public.user_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs" ON public.user_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jobs" ON public.user_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own jobs" ON public.user_jobs FOR UPDATE USING (auth.uid() = user_id);

-- Coach can view client jobs (via practitioner relationship)
CREATE POLICY "Coaches can view client jobs" ON public.user_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.practitioners p
      JOIN public.coach_client_plans ccp ON ccp.coach_id = p.id
      WHERE p.user_id = auth.uid() AND ccp.client_user_id = user_jobs.user_id
    )
  );

-- 3. Function to assign a job (ensures single primary)
CREATE OR REPLACE FUNCTION public.assign_user_job(
  p_user_id UUID,
  p_job_name TEXT,
  p_assigned_by TEXT DEFAULT 'ai',
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_job_id UUID;
  v_new_id UUID;
BEGIN
  -- Look up job by name
  SELECT id INTO v_job_id FROM public.jobs WHERE LOWER(name) = LOWER(p_job_name) AND is_active = true;
  IF v_job_id IS NULL THEN
    -- Default to Explorer
    SELECT id INTO v_job_id FROM public.jobs WHERE name = 'Explorer';
  END IF;

  -- Demote existing primary
  UPDATE public.user_jobs SET is_primary = false WHERE user_id = p_user_id AND is_primary = true;

  -- Insert new primary
  INSERT INTO public.user_jobs (user_id, job_id, assigned_by, is_primary, metadata)
  VALUES (p_user_id, v_job_id, p_assigned_by, true, p_metadata)
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;

-- 4. Backfill: Create user_jobs from orb_profiles.computed_from for existing users
DO $$
DECLARE
  r RECORD;
  v_archetype TEXT;
  v_job_id UUID;
BEGIN
  FOR r IN
    SELECT op.user_id, op.computed_from
    FROM public.orb_profiles op
    WHERE op.computed_from IS NOT NULL
  LOOP
    -- Extract dominant archetype (new format) or egoState (legacy)
    v_archetype := COALESCE(
      r.computed_from->>'dominantArchetype',
      r.computed_from->>'egoState',
      'explorer'
    );

    -- Map legacy egoState names to archetype names
    v_archetype := CASE LOWER(v_archetype)
      WHEN 'guardian' THEN 'Warrior'
      WHEN 'visionary' THEN 'Explorer'
      WHEN 'achiever' THEN 'Warrior'
      WHEN 'nurturer' THEN 'Healer'
      WHEN 'analyst' THEN 'Sage'
      WHEN 'rebel' THEN 'Explorer'
      WHEN 'warrior' THEN 'Warrior'
      WHEN 'mystic' THEN 'Mystic'
      WHEN 'creator' THEN 'Creator'
      WHEN 'sage' THEN 'Sage'
      WHEN 'healer' THEN 'Healer'
      WHEN 'explorer' THEN 'Explorer'
      ELSE 'Explorer'
    END;

    SELECT id INTO v_job_id FROM public.jobs WHERE name = v_archetype;
    IF v_job_id IS NULL THEN
      SELECT id INTO v_job_id FROM public.jobs WHERE name = 'Explorer';
    END IF;

    -- Only insert if user doesn't already have a primary job
    IF NOT EXISTS (SELECT 1 FROM public.user_jobs WHERE user_id = r.user_id AND is_primary = true) THEN
      INSERT INTO public.user_jobs (user_id, job_id, assigned_by, is_primary, metadata)
      VALUES (r.user_id, v_job_id, 'ai', true, jsonb_build_object(
        'backfilled', true,
        'source', 'orb_profiles.computed_from',
        'original_archetype', r.computed_from->>'dominantArchetype',
        'original_egoState', r.computed_from->>'egoState'
      ));
    END IF;
  END LOOP;
END;
$$;
