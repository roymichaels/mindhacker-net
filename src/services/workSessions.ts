/**
 * Work Sessions & Scores service layer.
 */
import { supabase } from '@/integrations/supabase/client';

export interface WorkSession {
  id: string;
  user_id: string;
  action_item_id: string | null;
  title: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  energy_level: 'low' | 'medium' | 'high' | null;
  notes: string | null;
  is_deep_work: boolean;
  tags: string[];
  metadata: Record<string, any>;
  created_at: string;
}

export interface WorkScore {
  id: string;
  user_id: string;
  score_date: string;
  total_minutes: number;
  deep_work_minutes: number;
  tasks_completed: number;
  productivity_score: number;
  velocity: number;
  created_at: string;
  updated_at: string;
}

// ── Queries ─────────────────────────────────────────

export async function getTodaySessions(userId: string): Promise<WorkSession[]> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('work_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('started_at', `${today}T00:00:00`)
    .order('started_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as WorkSession[];
}

export async function getRecentSessions(userId: string, limit = 20): Promise<WorkSession[]> {
  const { data, error } = await supabase
    .from('work_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as unknown as WorkSession[];
}

export async function getTodayWorkScore(userId: string): Promise<WorkScore | null> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('work_scores')
    .select('*')
    .eq('user_id', userId)
    .eq('score_date', today)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as WorkScore | null;
}

export async function getWeekScores(userId: string): Promise<WorkScore[]> {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { data, error } = await supabase
    .from('work_scores')
    .select('*')
    .eq('user_id', userId)
    .gte('score_date', weekAgo.toISOString().slice(0, 10))
    .order('score_date');
  if (error) throw error;
  return (data || []) as unknown as WorkScore[];
}

// ── Mutations ───────────────────────────────────────

export async function startWorkSession(input: {
  user_id: string;
  title: string;
  action_item_id?: string;
  is_deep_work?: boolean;
  tags?: string[];
}): Promise<WorkSession> {
  const { data, error } = await supabase
    .from('work_sessions')
    .insert({
      user_id: input.user_id,
      title: input.title,
      action_item_id: input.action_item_id || null,
      is_deep_work: input.is_deep_work || false,
      tags: input.tags || [],
      started_at: new Date().toISOString(),
    } as any)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as WorkSession;
}

export async function stopWorkSession(id: string): Promise<WorkSession> {
  const now = new Date();
  // First get the session to calculate duration
  const { data: session, error: fetchErr } = await supabase
    .from('work_sessions')
    .select('started_at')
    .eq('id', id)
    .single();
  if (fetchErr) throw fetchErr;

  const startedAt = new Date((session as any).started_at);
  const durationSeconds = Math.round((now.getTime() - startedAt.getTime()) / 1000);

  const { data, error } = await supabase
    .from('work_sessions')
    .update({
      ended_at: now.toISOString(),
      duration_seconds: durationSeconds,
    } as any)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as WorkSession;
}

export async function createManualWorkBlock(input: {
  user_id: string;
  title: string;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  is_deep_work?: boolean;
  energy_level?: 'low' | 'medium' | 'high';
  notes?: string;
  tags?: string[];
}): Promise<WorkSession> {
  const { data, error } = await supabase
    .from('work_sessions')
    .insert({
      ...input,
      is_deep_work: input.is_deep_work || false,
      tags: input.tags || [],
    } as any)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as WorkSession;
}

export async function deleteWorkSession(id: string) {
  const { error } = await supabase.from('work_sessions').delete().eq('id', id);
  if (error) throw error;
}

export async function upsertWorkScore(input: {
  user_id: string;
  total_minutes: number;
  deep_work_minutes: number;
  tasks_completed: number;
  productivity_score: number;
}): Promise<WorkScore> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('work_scores')
    .upsert({
      user_id: input.user_id,
      score_date: today,
      ...input,
    } as any, { onConflict: 'user_id,score_date' })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as WorkScore;
}
