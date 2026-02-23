
-- =====================================================
-- Plan Missions: 3 per pillar per plan
-- =====================================================
CREATE TABLE public.plan_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.life_plans(id) ON DELETE CASCADE,
  pillar TEXT NOT NULL,
  mission_number INTEGER NOT NULL CHECK (mission_number BETWEEN 1 AND 3),
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (plan_id, pillar, mission_number)
);

ALTER TABLE public.plan_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own missions" ON public.plan_missions FOR SELECT
  USING (plan_id IN (SELECT id FROM public.life_plans WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own missions" ON public.plan_missions FOR INSERT
  WITH CHECK (plan_id IN (SELECT id FROM public.life_plans WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own missions" ON public.plan_missions FOR UPDATE
  USING (plan_id IN (SELECT id FROM public.life_plans WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own missions" ON public.plan_missions FOR DELETE
  USING (plan_id IN (SELECT id FROM public.life_plans WHERE user_id = auth.uid()));

CREATE INDEX idx_plan_missions_plan_pillar ON public.plan_missions (plan_id, pillar);

-- =====================================================
-- Add mission_id to life_plan_milestones (5 per mission)
-- =====================================================
ALTER TABLE public.life_plan_milestones
  ADD COLUMN IF NOT EXISTS mission_id UUID REFERENCES public.plan_missions(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS milestone_number INTEGER DEFAULT 1;

CREATE INDEX idx_milestones_mission ON public.life_plan_milestones (mission_id);

-- =====================================================
-- Mini-milestones table: 5 per milestone, generates daily actions
-- =====================================================
CREATE TABLE public.mini_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  milestone_id UUID NOT NULL REFERENCES public.life_plan_milestones(id) ON DELETE CASCADE,
  mini_number INTEGER NOT NULL CHECK (mini_number BETWEEN 1 AND 5),
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  scheduled_day INTEGER, -- day 1-100 in the plan
  xp_reward INTEGER NOT NULL DEFAULT 10,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (milestone_id, mini_number)
);

ALTER TABLE public.mini_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mini milestones" ON public.mini_milestones FOR SELECT
  USING (milestone_id IN (
    SELECT lpm.id FROM public.life_plan_milestones lpm
    JOIN public.life_plans lp ON lp.id = lpm.plan_id
    WHERE lp.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert own mini milestones" ON public.mini_milestones FOR INSERT
  WITH CHECK (milestone_id IN (
    SELECT lpm.id FROM public.life_plan_milestones lpm
    JOIN public.life_plans lp ON lp.id = lpm.plan_id
    WHERE lp.user_id = auth.uid()
  ));
CREATE POLICY "Users can update own mini milestones" ON public.mini_milestones FOR UPDATE
  USING (milestone_id IN (
    SELECT lpm.id FROM public.life_plan_milestones lpm
    JOIN public.life_plans lp ON lp.id = lpm.plan_id
    WHERE lp.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete own mini milestones" ON public.mini_milestones FOR DELETE
  USING (milestone_id IN (
    SELECT lpm.id FROM public.life_plan_milestones lpm
    JOIN public.life_plans lp ON lp.id = lpm.plan_id
    WHERE lp.user_id = auth.uid()
  ));

CREATE INDEX idx_mini_milestones_milestone ON public.mini_milestones (milestone_id);
CREATE INDEX idx_mini_milestones_day ON public.mini_milestones (scheduled_day);

-- =====================================================
-- Trigger: auto-complete mission when all milestones done
-- =====================================================
CREATE OR REPLACE FUNCTION public.check_mission_completion()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_mission_id UUID;
  v_total INTEGER;
  v_done INTEGER;
BEGIN
  v_mission_id := NEW.mission_id;
  IF v_mission_id IS NULL THEN RETURN NEW; END IF;

  SELECT COUNT(*), COUNT(*) FILTER (WHERE is_completed = true)
  INTO v_total, v_done
  FROM life_plan_milestones WHERE mission_id = v_mission_id;

  IF v_total > 0 AND v_done = v_total THEN
    UPDATE plan_missions SET is_completed = true, completed_at = now() WHERE id = v_mission_id AND NOT is_completed;
  ELSE
    UPDATE plan_missions SET is_completed = false, completed_at = NULL WHERE id = v_mission_id AND is_completed;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_mission_completion
  AFTER UPDATE OF is_completed ON public.life_plan_milestones
  FOR EACH ROW EXECUTE FUNCTION public.check_mission_completion();

-- =====================================================
-- Trigger: auto-complete milestone when all mini-milestones done
-- =====================================================
CREATE OR REPLACE FUNCTION public.check_milestone_from_minis()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_total INTEGER;
  v_done INTEGER;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE is_completed = true)
  INTO v_total, v_done
  FROM mini_milestones WHERE milestone_id = NEW.milestone_id;

  IF v_total > 0 AND v_done = v_total THEN
    UPDATE life_plan_milestones SET is_completed = true, completed_at = now() WHERE id = NEW.milestone_id AND (is_completed IS NULL OR NOT is_completed);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_milestone_from_minis
  AFTER UPDATE OF is_completed ON public.mini_milestones
  FOR EACH ROW EXECUTE FUNCTION public.check_milestone_from_minis();

-- =====================================================
-- Trigger: award XP on mini-milestone completion
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_mini_milestone_completion()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false) THEN
    NEW.completed_at := now();
    -- Get user_id via milestone -> plan
    SELECT lp.user_id INTO v_user_id
    FROM life_plan_milestones lpm
    JOIN life_plans lp ON lp.id = lpm.plan_id
    WHERE lpm.id = NEW.milestone_id;

    IF v_user_id IS NOT NULL AND NEW.xp_reward > 0 THEN
      PERFORM award_unified_xp(v_user_id, NEW.xp_reward, 'mini_milestone', NEW.title);
    END IF;
  END IF;
  IF NEW.is_completed = false AND OLD.is_completed = true THEN
    NEW.completed_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_mini_milestone_completion
  BEFORE UPDATE OF is_completed ON public.mini_milestones
  FOR EACH ROW EXECUTE FUNCTION public.handle_mini_milestone_completion();

-- Updated at trigger for plan_missions
CREATE TRIGGER update_plan_missions_updated_at
  BEFORE UPDATE ON public.plan_missions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
