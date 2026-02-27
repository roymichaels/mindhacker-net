
-- Phase 3: Skills MVP

-- A) skills catalog
CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_he text,
  description text,
  category text NOT NULL CHECK (category IN ('mind','body','social','wealth','spirit')),
  icon text NOT NULL DEFAULT '⭐',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skills catalog readable by all" ON public.skills FOR SELECT USING (true);

-- B) user_skill_progress (cache)
CREATE TABLE public.user_skill_progress (
  user_id uuid NOT NULL,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  xp_total int NOT NULL DEFAULT 0,
  level int NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, skill_id)
);
ALTER TABLE public.user_skill_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own skill progress" ON public.user_skill_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System upsert skill progress" ON public.user_skill_progress FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_usp_user ON public.user_skill_progress(user_id);

-- C) skill_xp_events (ledger — SOURCE OF TRUTH)
CREATE TABLE public.skill_xp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action_item_id uuid,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  amount int NOT NULL,
  source text NOT NULL DEFAULT 'action_item',
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_skill_xp_idempotency ON public.skill_xp_events(action_item_id, skill_id, source) WHERE action_item_id IS NOT NULL;
ALTER TABLE public.skill_xp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own skill xp" ON public.skill_xp_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System insert skill xp" ON public.skill_xp_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_sxe_user ON public.skill_xp_events(user_id);
CREATE INDEX idx_sxe_created ON public.skill_xp_events(user_id, created_at);

-- D) action_skill_weights (pillar -> skill mapping)
CREATE TABLE public.action_skill_weights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar text NOT NULL,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  weight numeric NOT NULL DEFAULT 0.5 CHECK (weight > 0 AND weight <= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(pillar, skill_id)
);
ALTER TABLE public.action_skill_weights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Weights readable by all" ON public.action_skill_weights FOR SELECT USING (true);

-- E) job_skill_weights (multipliers)
CREATE TABLE public.job_skill_weights (
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  multiplier numeric NOT NULL DEFAULT 1.0,
  PRIMARY KEY (job_id, skill_id)
);
ALTER TABLE public.job_skill_weights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Job weights readable by all" ON public.job_skill_weights FOR SELECT USING (true);

-- ============================================================
-- RPC: award_skill_xp (ONLY write path for skills)
-- ============================================================
CREATE OR REPLACE FUNCTION public.award_skill_xp(
  p_user_id uuid, p_skill_id uuid, p_amount int, p_source text,
  p_reason text DEFAULT NULL, p_action_item_id uuid DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_new_total int; v_new_level int;
BEGIN
  IF p_amount <= 0 THEN RETURN jsonb_build_object('success', false, 'error', 'Amount must be positive'); END IF;

  INSERT INTO public.skill_xp_events (user_id, action_item_id, skill_id, amount, source, reason)
  VALUES (p_user_id, p_action_item_id, p_skill_id, p_amount, p_source, p_reason)
  ON CONFLICT (action_item_id, skill_id, source) WHERE action_item_id IS NOT NULL DO NOTHING;

  IF NOT FOUND THEN RETURN jsonb_build_object('success', true, 'idempotent', true); END IF;

  INSERT INTO public.user_skill_progress (user_id, skill_id, xp_total, level, updated_at)
  VALUES (p_user_id, p_skill_id, p_amount, GREATEST(1, FLOOR(p_amount / 100) + 1), now())
  ON CONFLICT (user_id, skill_id) DO UPDATE SET
    xp_total = user_skill_progress.xp_total + p_amount,
    level = GREATEST(1, FLOOR((user_skill_progress.xp_total + p_amount) / 100) + 1),
    updated_at = now()
  RETURNING xp_total, level INTO v_new_total, v_new_level;

  RETURN jsonb_build_object('success', true, 'skill_id', p_skill_id, 'new_total', v_new_total, 'new_level', v_new_level);
END; $$;

-- ============================================================
-- Updated trigger: handle_action_item_completion + skill XP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_action_item_completion()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_weight RECORD;
  v_base_xp int;
  v_multiplier numeric;
  v_primary_job_id uuid;
  v_skill_amount int;
BEGIN
  IF NEW.status = 'done' AND (OLD.status IS DISTINCT FROM 'done') THEN
    NEW.completed_at = now();
    IF NEW.xp_reward > 0 THEN
      PERFORM award_unified_xp(NEW.user_id, NEW.xp_reward, 'action_item', NEW.title);
    END IF;
    IF NEW.token_reward > 0 THEN
      PERFORM award_energy(NEW.user_id, NEW.token_reward, 'action_item', NEW.title);
    END IF;

    -- Phase 3: Skill XP via pillar weights + job multipliers
    IF NEW.pillar IS NOT NULL THEN
      v_base_xp := GREATEST(COALESCE(NEW.xp_reward, 10), 5);
      SELECT job_id INTO v_primary_job_id FROM public.user_jobs WHERE user_id = NEW.user_id AND is_primary = true LIMIT 1;

      FOR v_weight IN SELECT asw.skill_id, asw.weight FROM public.action_skill_weights asw WHERE asw.pillar = NEW.pillar
      LOOP
        v_skill_amount := GREATEST(1, FLOOR(v_base_xp * v_weight.weight));
        IF v_primary_job_id IS NOT NULL THEN
          SELECT COALESCE(jsw.multiplier, 1.0) INTO v_multiplier FROM public.job_skill_weights jsw WHERE jsw.job_id = v_primary_job_id AND jsw.skill_id = v_weight.skill_id;
          IF v_multiplier IS NOT NULL AND v_multiplier != 1.0 THEN v_skill_amount := GREATEST(1, FLOOR(v_skill_amount * v_multiplier)); END IF;
        END IF;
        PERFORM award_skill_xp(NEW.user_id, v_weight.skill_id, v_skill_amount, COALESCE(NEW.source, 'action_item'), NEW.title, NEW.id);
      END LOOP;
    END IF;
  END IF;
  IF NEW.status != 'done' AND OLD.status = 'done' THEN NEW.completed_at = NULL; END IF;
  RETURN NEW;
END; $$;

-- ============================================================
-- SEED: 30 skills
-- ============================================================
INSERT INTO public.skills (name, name_he, description, category, icon) VALUES
('Focus',        'ריכוז',        'Deep concentration and attention control', 'mind', '🎯'),
('Clarity',      'בהירות',       'Mental clarity and clear thinking', 'mind', '💎'),
('Memory',       'זיכרון',       'Information retention and recall', 'mind', '🧠'),
('Mindfulness',  'מיינדפולנס',    'Present-moment awareness', 'mind', '🧘'),
('Emotional IQ', 'אינטליגנציה רגשית', 'Understanding and managing emotions', 'mind', '💜'),
('Problem Solving', 'פתרון בעיות', 'Analytical and creative problem solving', 'mind', '🔧'),
('Endurance',    'סיבולת',       'Physical stamina and persistence', 'body', '🏃'),
('Strength',     'כוח',          'Physical and mental strength', 'body', '💪'),
('Flexibility',  'גמישות',       'Physical and mental adaptability', 'body', '🤸'),
('Recovery',     'התאוששות',     'Rest, recovery, and regeneration', 'body', '😴'),
('Nutrition',    'תזונה',        'Healthy eating habits', 'body', '🥗'),
('Sleep Quality','איכות שינה',   'Deep, restorative sleep patterns', 'body', '🌙'),
('Communication','תקשורת',       'Clear and effective expression', 'social', '💬'),
('Empathy',      'אמפתיה',       'Understanding others perspectives', 'social', '🤝'),
('Leadership',   'מנהיגות',      'Inspiring and guiding others', 'social', '👑'),
('Collaboration','שיתוף פעולה',  'Working effectively with others', 'social', '🤜'),
('Networking',   'נטוורקינג',    'Building meaningful connections', 'social', '🌐'),
('Boundaries',   'גבולות',       'Setting healthy personal boundaries', 'social', '🛡️'),
('Planning',     'תכנון',        'Strategic and systematic planning', 'wealth', '📋'),
('Productivity', 'פרודוקטיביות', 'Efficient task execution', 'wealth', '⚡'),
('Financial IQ', 'אוריינות פיננסית', 'Financial literacy and management', 'wealth', '💰'),
('Time Mastery', 'ניהול זמן',    'Effective time management', 'wealth', '⏰'),
('Goal Setting', 'הצבת מטרות',   'Setting and tracking meaningful goals', 'wealth', '🏹'),
('Decision Making','קבלת החלטות','Making clear, confident decisions', 'wealth', '⚖️'),
('Self-Awareness','מודעות עצמית','Understanding your inner world', 'spirit', '👁️'),
('Gratitude',    'הכרת תודה',    'Appreciation and thankfulness', 'spirit', '🙏'),
('Resilience',   'חוסן',         'Bouncing back from adversity', 'spirit', '🌊'),
('Purpose',      'ייעוד',        'Connection to life purpose', 'spirit', '🔥'),
('Inner Peace',  'שלווה פנימית', 'Calm and centered state of being', 'spirit', '☮️'),
('Creativity',   'יצירתיות',     'Creative expression and innovation', 'spirit', '🎨');

-- SEED: action_skill_weights
INSERT INTO public.action_skill_weights (pillar, skill_id, weight)
SELECT w.pillar, s.id, w.weight FROM (VALUES
  ('mind','Focus',0.8),('mind','Clarity',0.7),('mind','Memory',0.5),('mind','Mindfulness',0.6),
  ('mind','Emotional IQ',0.5),('mind','Problem Solving',0.6),('mind','Self-Awareness',0.3),
  ('body','Endurance',0.8),('body','Strength',0.7),('body','Flexibility',0.5),
  ('body','Recovery',0.6),('body','Nutrition',0.5),('body','Sleep Quality',0.5),('body','Resilience',0.3),
  ('social','Communication',0.8),('social','Empathy',0.7),('social','Leadership',0.5),
  ('social','Collaboration',0.6),('social','Networking',0.5),('social','Boundaries',0.6),('social','Emotional IQ',0.3),
  ('wealth','Planning',0.8),('wealth','Productivity',0.7),('wealth','Financial IQ',0.5),
  ('wealth','Time Mastery',0.6),('wealth','Goal Setting',0.7),('wealth','Decision Making',0.6),('wealth','Focus',0.3),
  ('spirit','Self-Awareness',0.8),('spirit','Gratitude',0.7),('spirit','Resilience',0.6),
  ('spirit','Purpose',0.8),('spirit','Inner Peace',0.7),('spirit','Creativity',0.5),('spirit','Mindfulness',0.4)
) AS w(pillar, skill_name, weight) JOIN public.skills s ON s.name = w.skill_name;

-- SEED: job_skill_weights
INSERT INTO public.job_skill_weights (job_id, skill_id, multiplier)
SELECT j.id, s.id, m.mult FROM (VALUES
  ('Warrior','Endurance',1.5),('Warrior','Strength',1.5),('Warrior','Resilience',1.5),('Warrior','Focus',1.3),
  ('Mystic','Mindfulness',1.5),('Mystic','Self-Awareness',1.5),('Mystic','Inner Peace',1.5),('Mystic','Clarity',1.3),
  ('Creator','Creativity',1.5),('Creator','Problem Solving',1.5),('Creator','Purpose',1.3),('Creator','Communication',1.3),
  ('Sage','Clarity',1.5),('Sage','Memory',1.5),('Sage','Planning',1.3),('Sage','Decision Making',1.3),
  ('Healer','Empathy',1.5),('Healer','Emotional IQ',1.5),('Healer','Recovery',1.5),('Healer','Boundaries',1.3),
  ('Explorer','Networking',1.5),('Explorer','Flexibility',1.5),('Explorer','Goal Setting',1.3),('Explorer','Creativity',1.3)
) AS m(job_name, skill_name, mult) JOIN public.jobs j ON j.name = m.job_name JOIN public.skills s ON s.name = m.skill_name;
