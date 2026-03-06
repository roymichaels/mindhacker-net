UPDATE public.life_plan_milestones
SET difficulty = milestone_number
WHERE difficulty IS NULL AND milestone_number BETWEEN 1 AND 5;