
-- Learning Curricula: top-level curriculum created by Aurora
CREATE TABLE public.learning_curricula (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  topic TEXT NOT NULL,
  category TEXT, -- curated category or 'custom'
  difficulty_progression TEXT[] DEFAULT ARRAY['beginner', 'intermediate', 'advanced', 'mastery'],
  estimated_days INTEGER DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, active, completed, archived
  progress_percentage INTEGER DEFAULT 0,
  total_modules INTEGER DEFAULT 0,
  completed_modules INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  completed_lessons INTEGER DEFAULT 0,
  skill_mappings TEXT[], -- mapped skill IDs
  pillar TEXT, -- mapped pillar
  plan_id UUID REFERENCES public.life_plans(id),
  curriculum_data JSONB DEFAULT '{}', -- full AI-generated curriculum outline
  wizard_conversation_id UUID REFERENCES public.conversations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Learning Modules: phases of the curriculum
CREATE TABLE public.learning_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curriculum_id UUID NOT NULL REFERENCES public.learning_curricula(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  difficulty TEXT NOT NULL DEFAULT 'beginner', -- beginner, intermediate, advanced, mastery
  order_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'locked', -- locked, active, completed
  total_lessons INTEGER DEFAULT 0,
  completed_lessons INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 50,
  mission_id UUID, -- linked plan mission
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Learning Lessons: individual lessons within modules
CREATE TABLE public.learning_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  curriculum_id UUID NOT NULL REFERENCES public.learning_curricula(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_en TEXT,
  lesson_type TEXT NOT NULL DEFAULT 'theory', -- theory, practice, quiz, project
  order_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'locked', -- locked, active, completed, failed
  content JSONB DEFAULT '{}', -- AI-generated lesson content
  -- theory: { body, key_concepts, examples }
  -- practice: { instructions, exercises[], expected_output }
  -- quiz: { questions[{ q, options[], correct, explanation }] }
  -- project: { brief, requirements[], deliverables[], rubric }
  score INTEGER, -- quiz score or project grade (0-100)
  user_submission JSONB, -- user's answers/work
  feedback JSONB, -- Aurora's feedback on submission
  xp_reward INTEGER DEFAULT 10,
  time_estimate_minutes INTEGER DEFAULT 15,
  deadline TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  action_item_id UUID, -- linked action_item for plan integration
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_learning_curricula_user ON public.learning_curricula(user_id);
CREATE INDEX idx_learning_modules_curriculum ON public.learning_modules(curriculum_id);
CREATE INDEX idx_learning_lessons_module ON public.learning_lessons(module_id);
CREATE INDEX idx_learning_lessons_curriculum ON public.learning_lessons(curriculum_id);
CREATE INDEX idx_learning_lessons_user ON public.learning_lessons(user_id);

-- RLS
ALTER TABLE public.learning_curricula ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own curricula" ON public.learning_curricula FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own curricula" ON public.learning_curricula FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own curricula" ON public.learning_curricula FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own curricula" ON public.learning_curricula FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own modules" ON public.learning_modules FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.learning_curricula c WHERE c.id = curriculum_id AND c.user_id = auth.uid()));
CREATE POLICY "Users can manage own modules" ON public.learning_modules FOR ALL
  USING (EXISTS (SELECT 1 FROM public.learning_curricula c WHERE c.id = curriculum_id AND c.user_id = auth.uid()));

CREATE POLICY "Users can view own lessons" ON public.learning_lessons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own lessons" ON public.learning_lessons FOR ALL USING (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_learning_curricula_updated_at
  BEFORE UPDATE ON public.learning_curricula
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_modules_updated_at
  BEFORE UPDATE ON public.learning_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_lessons_updated_at
  BEFORE UPDATE ON public.learning_lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-update module/curriculum progress on lesson completion
CREATE OR REPLACE FUNCTION public.handle_learning_lesson_completion()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_module_total INTEGER;
  v_module_done INTEGER;
  v_curr_total INTEGER;
  v_curr_done INTEGER;
  v_curriculum_id UUID;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at := now();
    
    -- Award XP
    IF NEW.xp_reward > 0 THEN
      PERFORM award_unified_xp(NEW.user_id, NEW.xp_reward, 'learning', 'Lesson: ' || NEW.title);
    END IF;

    -- Update module progress
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
    INTO v_module_total, v_module_done
    FROM learning_lessons WHERE module_id = NEW.module_id;
    
    v_module_done := v_module_done + 1; -- include current

    UPDATE learning_modules
    SET completed_lessons = v_module_done,
        total_lessons = v_module_total,
        status = CASE WHEN v_module_done >= v_module_total THEN 'completed' ELSE status END
    WHERE id = NEW.module_id
    RETURNING curriculum_id INTO v_curriculum_id;

    -- Update curriculum progress
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
    INTO v_curr_total, v_curr_done
    FROM learning_lessons WHERE curriculum_id = v_curriculum_id;
    
    v_curr_done := v_curr_done + 1;

    UPDATE learning_curricula
    SET completed_lessons = v_curr_done,
        total_lessons = v_curr_total,
        progress_percentage = CASE WHEN v_curr_total > 0 THEN (v_curr_done * 100) / v_curr_total ELSE 0 END,
        status = CASE WHEN v_curr_done >= v_curr_total THEN 'completed' ELSE status END
    WHERE id = v_curriculum_id;

    -- Unlock next lesson
    UPDATE learning_lessons
    SET status = 'active'
    WHERE module_id = NEW.module_id
      AND order_index = NEW.order_index + 1
      AND status = 'locked';

    -- If module completed, unlock next module's first lesson
    IF v_module_done >= v_module_total THEN
      UPDATE learning_modules SET status = 'active'
      WHERE curriculum_id = v_curriculum_id
        AND order_index = (SELECT order_index + 1 FROM learning_modules WHERE id = NEW.module_id)
        AND status = 'locked';
        
      UPDATE learning_lessons
      SET status = 'active'
      WHERE module_id = (
        SELECT id FROM learning_modules
        WHERE curriculum_id = v_curriculum_id
          AND order_index = (SELECT order_index + 1 FROM learning_modules WHERE id = NEW.module_id)
      ) AND order_index = 0 AND status = 'locked';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER handle_learning_lesson_completion_trigger
  BEFORE UPDATE ON public.learning_lessons
  FOR EACH ROW EXECUTE FUNCTION public.handle_learning_lesson_completion();
