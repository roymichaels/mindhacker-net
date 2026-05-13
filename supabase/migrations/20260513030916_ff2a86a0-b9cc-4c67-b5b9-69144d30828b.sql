-- Cleanup: purge the stuck 'generating' plan for user 299f9800-48d9-4429-958b-b661595bd2dd
-- so the next generation run starts from a clean slate.
DO $$
DECLARE
  target_user UUID := '299f9800-48d9-4429-958b-b661595bd2dd';
  stuck_ids UUID[];
BEGIN
  SELECT array_agg(id) INTO stuck_ids
  FROM public.life_plans
  WHERE user_id = target_user
    AND status IN ('generating', 'active');

  IF stuck_ids IS NOT NULL THEN
    DELETE FROM public.action_items        WHERE plan_id = ANY(stuck_ids);
    DELETE FROM public.life_plan_milestones WHERE plan_id = ANY(stuck_ids);
    DELETE FROM public.plan_missions        WHERE plan_id = ANY(stuck_ids);
    DELETE FROM public.skills               WHERE life_plan_id = ANY(stuck_ids);
    UPDATE public.life_plans
       SET status = 'archived'
     WHERE id = ANY(stuck_ids);
  END IF;
END $$;