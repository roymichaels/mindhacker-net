
-- Fix SECURITY DEFINER views by making them SECURITY INVOKER
DROP VIEW IF EXISTS public.v_today_actions;
DROP VIEW IF EXISTS public.v_habits;
DROP VIEW IF EXISTS public.v_milestones;

CREATE VIEW public.v_today_actions WITH (security_invoker = true) AS
SELECT * FROM public.action_items
WHERE status IN ('todo', 'doing')
  AND ((due_at IS NOT NULL AND due_at::date = CURRENT_DATE) OR recurrence_rule IS NOT NULL);

CREATE VIEW public.v_habits WITH (security_invoker = true) AS
SELECT * FROM public.action_items WHERE type = 'habit';

CREATE VIEW public.v_milestones WITH (security_invoker = true) AS
SELECT * FROM public.action_items WHERE type = 'milestone';
