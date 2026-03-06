
-- Add primary_skill_id to plan_missions (trait link)
ALTER TABLE public.plan_missions ADD COLUMN IF NOT EXISTS primary_skill_id uuid REFERENCES public.skills(id);

-- Add pillar column to skills table for trait categorization
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS pillar text;

-- Add life_plan_id to skills for plan scoping
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS life_plan_id uuid REFERENCES public.life_plans(id);

-- Add trait_type to distinguish trait skills from legacy
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS trait_type text DEFAULT 'legacy';
-- trait_type values: 'trait' (new system), 'legacy' (old mission-based)

-- Create index for fast trait lookups
CREATE INDEX IF NOT EXISTS idx_skills_pillar_user ON public.skills(user_id, pillar) WHERE trait_type = 'trait';
CREATE INDEX IF NOT EXISTS idx_plan_missions_skill ON public.plan_missions(primary_skill_id);
