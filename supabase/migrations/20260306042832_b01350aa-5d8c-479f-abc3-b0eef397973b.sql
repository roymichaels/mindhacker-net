
-- Backfill: Convert existing mission-based skills into short trait names
-- For legacy skills (created from mission titles), derive a 2-3 word trait name

-- First, mark all existing skills as legacy type
UPDATE public.skills 
SET trait_type = 'legacy'
WHERE trait_type IS NULL OR trait_type = '';

-- Set pillar from category for existing skills
UPDATE public.skills SET pillar = 'consciousness' WHERE category = 'spirit' AND pillar IS NULL;
UPDATE public.skills SET pillar = 'presence' WHERE category = 'social' AND pillar IS NULL;
UPDATE public.skills SET pillar = 'power' WHERE category = 'body' AND pillar IS NULL;
UPDATE public.skills SET pillar = 'focus' WHERE category = 'mind' AND pillar IS NULL;
UPDATE public.skills SET pillar = 'wealth' WHERE category = 'wealth' AND pillar IS NULL;

-- Link skills to their plan via mission -> plan
UPDATE public.skills s
SET life_plan_id = pm.plan_id
FROM public.plan_missions pm
WHERE s.mission_id = pm.id
  AND s.life_plan_id IS NULL;

-- Set primary_skill_id on plan_missions for existing skill-mission links
UPDATE public.plan_missions pm
SET primary_skill_id = s.id
FROM public.skills s
WHERE s.mission_id = pm.id
  AND pm.primary_skill_id IS NULL;
