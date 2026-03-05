
-- Add mission_id to skills table to link dynamically-created skills to plan missions
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS mission_id uuid REFERENCES public.plan_missions(id) ON DELETE CASCADE;

-- Add user_id to skills so mission-skills are user-scoped (catalog skills have NULL user_id)
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS user_id uuid;

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_skills_mission_id ON public.skills(mission_id) WHERE mission_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON public.skills(user_id) WHERE user_id IS NOT NULL;

-- RLS: users can see catalog skills (user_id IS NULL) and their own mission-skills
DROP POLICY IF EXISTS "Users can view skills" ON public.skills;
CREATE POLICY "Users can view skills" ON public.skills FOR SELECT USING (
  user_id IS NULL OR user_id = auth.uid()
);
