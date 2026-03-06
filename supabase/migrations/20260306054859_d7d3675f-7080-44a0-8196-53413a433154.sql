
-- Drop the CHECK constraint that limits mission_number to 1-3
ALTER TABLE public.plan_missions DROP CONSTRAINT IF EXISTS plan_missions_mission_number_check;

-- Drop the unique constraint on (plan_id, pillar, mission_number) 
-- and replace with one that allows up to 9 missions per pillar
ALTER TABLE public.plan_missions DROP CONSTRAINT IF EXISTS plan_missions_plan_id_pillar_mission_number_key;

-- Add new check constraint allowing mission_number 1-9
ALTER TABLE public.plan_missions ADD CONSTRAINT plan_missions_mission_number_check CHECK (mission_number >= 1 AND mission_number <= 9);

-- Re-add unique constraint
ALTER TABLE public.plan_missions ADD CONSTRAINT plan_missions_plan_id_pillar_mission_number_key UNIQUE (plan_id, pillar, mission_number);
