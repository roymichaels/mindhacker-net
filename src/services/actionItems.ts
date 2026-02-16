import { supabase } from '@/integrations/supabase/client';

export type ActionItemType = 'task' | 'habit' | 'session' | 'milestone' | 'reflection';
export type ActionItemSource = 'plan' | 'user' | 'aurora' | 'coach' | 'system';
export type ActionItemStatus = 'todo' | 'doing' | 'done' | 'skipped';

export interface ActionItem {
  id: string;
  user_id: string;
  type: ActionItemType;
  source: ActionItemSource;
  status: ActionItemStatus;
  title: string;
  description: string | null;
  due_at: string | null;
  recurrence_rule: string | null;
  pillar: string | null;
  project_id: string | null;
  plan_id: string | null;
  milestone_id: string | null;
  parent_id: string | null;
  ego_state: string | null;
  tags: string[];
  xp_reward: number;
  token_reward: number;
  order_index: number;
  metadata: Record<string, any>;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateActionItemInput = Partial<ActionItem> & Pick<ActionItem, 'user_id' | 'type' | 'title'>;

// ─── Queries ───────────────────────────────────────────────

export async function getTodayActions(userId: string): Promise<ActionItem[]> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('action_items')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['todo', 'doing'])
    .in('type', ['task', 'habit'])
    .or(`due_at.gte.${today}T00:00:00,due_at.lte.${today}T23:59:59,recurrence_rule.not.is.null`)
    .order('order_index');
  if (error) throw error;
  return (data || []) as unknown as ActionItem[];
}

export async function getHabits(userId: string): Promise<ActionItem[]> {
  const { data, error } = await supabase
    .from('action_items')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'habit')
    .order('created_at');
  if (error) throw error;
  return (data || []) as unknown as ActionItem[];
}

export async function getMilestones(userId: string, planId?: string): Promise<ActionItem[]> {
  let query = supabase
    .from('action_items')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'milestone')
    .order('order_index');
  if (planId) query = query.eq('plan_id', planId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as unknown as ActionItem[];
}

export async function getByParent(parentId: string): Promise<ActionItem[]> {
  const { data, error } = await supabase
    .from('action_items')
    .select('*')
    .eq('parent_id', parentId)
    .order('order_index');
  if (error) throw error;
  return (data || []) as unknown as ActionItem[];
}

export async function getTaskChecklists(userId: string): Promise<ActionItem[]> {
  const { data, error } = await supabase
    .from('action_items')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'task')
    .is('parent_id', null)
    .in('status', ['todo', 'doing'])
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as ActionItem[];
}

export async function getOverdueCount(userId: string): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const { count, error } = await supabase
    .from('action_items')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('type', 'task')
    .in('status', ['todo', 'doing'])
    .lt('due_at', `${today}T00:00:00`);
  if (error) throw error;
  return count || 0;
}

export async function getSessionCountToday(userId: string): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const { count, error } = await supabase
    .from('action_items')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('type', 'session')
    .eq('status', 'done')
    .gte('completed_at', `${today}T00:00:00`)
    .lt('completed_at', `${today}T23:59:59`);
  if (error) throw error;
  return count || 0;
}

// ─── Mutations ─────────────────────────────────────────────

export async function completeAction(id: string) {
  const { data, error } = await supabase
    .from('action_items')
    .update({ status: 'done' as any })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as ActionItem;
}

export async function uncompleteAction(id: string) {
  const { data, error } = await supabase
    .from('action_items')
    .update({ status: 'todo' as any, completed_at: null })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as ActionItem;
}

export async function toggleActionStatus(id: string, done: boolean) {
  return done ? completeAction(id) : uncompleteAction(id);
}

export async function createAction(input: CreateActionItemInput): Promise<ActionItem> {
  const { data, error } = await supabase
    .from('action_items')
    .insert(input as any)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as ActionItem;
}

export async function deleteAction(id: string) {
  const { error } = await supabase.from('action_items').delete().eq('id', id);
  if (error) throw error;
}
