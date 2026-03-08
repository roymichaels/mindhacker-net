-- Add trait/skill binding and course priority to learning_curricula
ALTER TABLE public.learning_curricula 
  ADD COLUMN IF NOT EXISTS skill_id uuid REFERENCES public.skills(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS course_priority text NOT NULL DEFAULT 'suggested' CHECK (course_priority IN ('must', 'suggested')),
  ADD COLUMN IF NOT EXISTS generated_by text NOT NULL DEFAULT 'wizard' CHECK (generated_by IN ('wizard', 'orchestrator', 'aurora'));

-- Index for fast lookups by skill and priority
CREATE INDEX IF NOT EXISTS idx_learning_curricula_skill_id ON public.learning_curricula(skill_id);
CREATE INDEX IF NOT EXISTS idx_learning_curricula_priority ON public.learning_curricula(course_priority);
CREATE INDEX IF NOT EXISTS idx_learning_curricula_generated_by ON public.learning_curricula(generated_by);