
-- Clean up any leftover functions from failed migrations
DROP FUNCTION IF EXISTS public.handle_action_item_completion() CASCADE;
DROP FUNCTION IF EXISTS public.migrate_to_action_items() CASCADE;

-- 1. Create table
CREATE TABLE public.action_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('task', 'habit', 'session', 'milestone', 'reflection')),
  source TEXT NOT NULL DEFAULT 'user' CHECK (source IN ('plan', 'user', 'aurora', 'coach', 'system')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'doing', 'done', 'skipped')),
  title TEXT NOT NULL,
  description TEXT,
  due_at TIMESTAMPTZ,
  recurrence_rule TEXT,
  pillar TEXT,
  project_id UUID REFERENCES public.user_projects(id) ON DELETE SET NULL,
  plan_id UUID REFERENCES public.life_plans(id) ON DELETE SET NULL,
  milestone_id UUID REFERENCES public.life_plan_milestones(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.action_items(id) ON DELETE CASCADE,
  ego_state TEXT,
  tags TEXT[] DEFAULT '{}',
  xp_reward INTEGER NOT NULL DEFAULT 10,
  token_reward INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes
CREATE INDEX idx_action_items_user_type_status ON public.action_items (user_id, type, status);
CREATE INDEX idx_action_items_user_due ON public.action_items (user_id, due_at) WHERE due_at IS NOT NULL;
CREATE INDEX idx_action_items_parent ON public.action_items (parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_action_items_plan ON public.action_items (plan_id) WHERE plan_id IS NOT NULL;
CREATE INDEX idx_action_items_recurrence ON public.action_items (user_id, recurrence_rule) WHERE recurrence_rule IS NOT NULL;

-- 3. RLS
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own action_items" ON public.action_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own action_items" ON public.action_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own action_items" ON public.action_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own action_items" ON public.action_items FOR DELETE USING (auth.uid() = user_id);

-- 4. Updated_at trigger
CREATE TRIGGER update_action_items_updated_at
  BEFORE UPDATE ON public.action_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. XP auto-award trigger
CREATE OR REPLACE FUNCTION public.handle_action_item_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'done' AND (OLD.status IS DISTINCT FROM 'done') THEN
    NEW.completed_at = now();
    IF NEW.xp_reward > 0 THEN
      PERFORM award_unified_xp(NEW.user_id, NEW.xp_reward, 'action_item', NEW.title);
    END IF;
    IF NEW.token_reward > 0 THEN
      UPDATE public.profiles SET tokens = COALESCE(tokens, 0) + NEW.token_reward WHERE id = NEW.user_id;
    END IF;
  END IF;
  IF NEW.status != 'done' AND OLD.status = 'done' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_action_item_completion
  BEFORE UPDATE ON public.action_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_action_item_completion();

-- 6. Migration function
CREATE OR REPLACE FUNCTION public.migrate_to_action_items()
RETURNS TEXT AS $$
DECLARE
  v_tasks INTEGER := 0;
  v_items INTEGER := 0;
  v_habits INTEGER := 0;
  v_milestones INTEGER := 0;
  v_sessions INTEGER := 0;
  v_checklist RECORD;
BEGIN
  FOR v_checklist IN SELECT * FROM public.aurora_checklists LOOP
    INSERT INTO public.action_items (id, user_id, type, source, status, title, description, pillar, milestone_id, order_index, metadata, created_at)
    VALUES (
      v_checklist.id, v_checklist.user_id, 'task',
      CASE WHEN v_checklist.origin = 'aurora' THEN 'aurora' WHEN v_checklist.origin = 'plan' THEN 'plan' ELSE 'user' END,
      CASE WHEN v_checklist.status = 'completed' THEN 'done' WHEN v_checklist.status = 'in_progress' THEN 'doing' ELSE 'todo' END,
      v_checklist.title, v_checklist.context, v_checklist.category, v_checklist.milestone_id,
      COALESCE(v_checklist.priority, 0),
      jsonb_build_object('time_scope', v_checklist.time_scope, 'legacy_table', 'aurora_checklists'),
      v_checklist.created_at
    ) ON CONFLICT (id) DO NOTHING;
    v_tasks := v_tasks + 1;
  END LOOP;

  INSERT INTO public.action_items (user_id, type, source, status, title, parent_id, order_index, due_at, completed_at, metadata, created_at)
  SELECT c.user_id, 'task', 'user',
    CASE WHEN ci.is_completed THEN 'done' ELSE 'todo' END,
    ci.content, ci.checklist_id, ci.order_index, ci.due_date::timestamptz, ci.completed_at,
    jsonb_build_object('is_recurring', ci.is_recurring, 'legacy_table', 'aurora_checklist_items', 'legacy_id', ci.id),
    ci.created_at
  FROM public.aurora_checklist_items ci
  JOIN public.aurora_checklists c ON c.id = ci.checklist_id;
  GET DIAGNOSTICS v_items = ROW_COUNT;

  INSERT INTO public.action_items (user_id, type, source, status, title, pillar, recurrence_rule, xp_reward, metadata, created_at)
  SELECT user_id, 'habit', 'user', 'todo', title, category, 'daily', 10,
    jsonb_build_object('is_active', is_active, 'legacy_table', 'aurora_daily_minimums', 'legacy_id', id), created_at
  FROM public.aurora_daily_minimums WHERE is_active = true;
  GET DIAGNOSTICS v_habits = ROW_COUNT;

  INSERT INTO public.action_items (user_id, type, source, status, title, description, plan_id, milestone_id, xp_reward, token_reward, completed_at, metadata, created_at)
  SELECT lp.user_id, 'milestone', 'plan',
    CASE WHEN m.is_completed THEN 'done' ELSE 'todo' END,
    m.title, m.description, m.plan_id, m.id,
    COALESCE(m.xp_reward, 50), COALESCE(m.tokens_reward, 0), m.completed_at,
    jsonb_build_object('week_number', m.week_number, 'focus_area', m.focus_area, 'tasks', m.tasks, 'legacy_table', 'life_plan_milestones'),
    m.created_at
  FROM public.life_plan_milestones m
  JOIN public.life_plans lp ON lp.id = m.plan_id;
  GET DIAGNOSTICS v_milestones = ROW_COUNT;

  INSERT INTO public.action_items (user_id, type, source, status, title, ego_state, xp_reward, completed_at, metadata, created_at)
  SELECT user_id, 'session', 'system', 'done',
    COALESCE(action, 'Power-Up Session'), ego_state, COALESCE(experience_gained, 15), completed_at,
    jsonb_build_object('duration_seconds', duration_seconds, 'goal_id', goal_id, 'script_data', script_data, 'legacy_table', 'hypnosis_sessions', 'legacy_id', id),
    created_at
  FROM public.hypnosis_sessions;
  GET DIAGNOSTICS v_sessions = ROW_COUNT;

  RETURN format('Migrated: %s parents, %s items, %s habits, %s milestones, %s sessions', v_tasks, v_items, v_habits, v_milestones, v_sessions);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Run migration
SELECT public.migrate_to_action_items();

-- 8. Views
CREATE OR REPLACE VIEW public.v_today_actions AS
SELECT * FROM public.action_items
WHERE status IN ('todo', 'doing')
  AND ((due_at IS NOT NULL AND due_at::date = CURRENT_DATE) OR recurrence_rule IS NOT NULL);

CREATE OR REPLACE VIEW public.v_habits AS
SELECT * FROM public.action_items WHERE type = 'habit';

CREATE OR REPLACE VIEW public.v_milestones AS
SELECT * FROM public.action_items WHERE type = 'milestone';
