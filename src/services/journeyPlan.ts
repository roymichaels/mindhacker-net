/**
 * Journey / Strategy / Plan service — Phase 2 Batch 1.
 *
 * Read-only helpers extracted from `safeReadExecutor` so AION capabilities
 * (journey.nextAction, journey.summarize, plan.summarize, daily.generate)
 * never embed raw Supabase queries.
 *
 * NEVER mutates `life_plans` or `action_items`. Writes still go through the
 * confirmation bridge + `safeMutationExecutor` (action.complete only).
 */
import { supabase } from '@/integrations/supabase/client';

export interface JourneyOpenAction {
  id: string;
  title: string;
  pillar: string | null;
  status: string | null;
  scheduled_date: string | null;
  due_at: string | null;
  order_index: number | null;
}

export interface ActiveLifePlan {
  id: string;
  status: string | null;
  progress_percentage: number | null;
  start_date: string | null;
  end_date: string | null;
  duration_months: number | null;
}

export async function getOpenActionItems(userId: string, limit = 5): Promise<JourneyOpenAction[]> {
  const { data, error } = await supabase
    .from('action_items')
    .select('id, title, pillar, status, scheduled_date, due_at, order_index')
    .eq('user_id', userId)
    .in('status', ['todo', 'in_progress'])
    .order('order_index', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as JourneyOpenAction[];
}

export async function getNextOpenAction(userId: string): Promise<{
  pick: JourneyOpenAction | null;
  total: number;
  todayCount: number;
}> {
  const items = await getOpenActionItems(userId, 5);
  const ymd = new Date().toISOString().slice(0, 10);
  const todayItems = items.filter((i) => i.scheduled_date === ymd);
  const pick = todayItems[0] ?? items[0] ?? null;
  return { pick, total: items.length, todayCount: todayItems.length };
}

export async function getActiveLifePlan(userId: string): Promise<ActiveLifePlan | null> {
  const { data, error } = await supabase
    .from('life_plans')
    .select('id, status, progress_percentage, start_date, end_date, duration_months')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  return ((data ?? [])[0] ?? null) as unknown as ActiveLifePlan | null;
}

export async function getActionCounts(userId: string): Promise<{ open: number; completed: number }> {
  const [openQ, doneQ] = await Promise.all([
    supabase
      .from('action_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['todo', 'in_progress']),
    supabase
      .from('action_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed'),
  ]);
  return { open: openQ.count ?? 0, completed: doneQ.count ?? 0 };
}

export interface JourneySummary {
  plan: ActiveLifePlan | null;
  open: number;
  completed: number;
  text: string;
}

export async function summarizeJourney(userId: string): Promise<JourneySummary> {
  const [plan, counts] = await Promise.all([getActiveLifePlan(userId), getActionCounts(userId)]);
  const text = plan
    ? `מסע ${plan.status ?? 'פעיל'} · ${plan.progress_percentage ?? 0}% · ${counts.open} פתוח / ${counts.completed} הושלם`
    : `אין מסע פעיל · ${counts.open} פעולות פתוחות`;
  return { plan, open: counts.open, completed: counts.completed, text };
}

/**
 * Plan summary — same data sources as journey summary today, but framed
 * around the active life_plan rather than the daily queue. Kept separate so
 * the response composer can use a different opener.
 */
export async function summarizePlan(userId: string): Promise<JourneySummary> {
  const [plan, counts] = await Promise.all([getActiveLifePlan(userId), getActionCounts(userId)]);
  const text = plan
    ? `התוכנית: סטטוס ${plan.status ?? '—'} · התקדמות ${plan.progress_percentage ?? 0}% · ${counts.open} פעולות פתוחות`
    : 'אין כרגע תוכנית פעילה.';
  return { plan, open: counts.open, completed: counts.completed, text };
}

/**
 * Preview today's queue (no write). Used by `daily.generate` capability so
 * AION can show the user what would be on their day without invoking the
 * generator edge functions silently.
 */
export interface DailyPreview {
  items: JourneyOpenAction[];
  todayCount: number;
  text: string;
}

export async function previewDailyQueue(userId: string): Promise<DailyPreview> {
  const items = await getOpenActionItems(userId, 5);
  const ymd = new Date().toISOString().slice(0, 10);
  const today = items.filter((i) => i.scheduled_date === ymd);
  const sample = (today[0] ?? items[0])?.title;
  const text = items.length
    ? `${today.length} משימות להיום · ${items.length} פתוחות סה"כ${sample ? ` · למשל: "${sample}"` : ''}`
    : 'אין כרגע משימות פתוחות. אפשר להציע יום חדש.';
  return { items, todayCount: today.length, text };
}