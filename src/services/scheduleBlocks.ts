import { supabase } from '@/integrations/supabase/client';

export type BlockType = 
  | 'wake' | 'sleep' | 'shutdown' | 'focus' | 'work' 
  | 'training' | 'recovery' | 'play' | 'learning' | 'admin' | 'reflection';

export interface ScheduleBlock {
  id: string;
  title: string;
  type: string;
  status: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  pillar: string | null;
  metadata: {
    schedule_block: true;
    block_type: BlockType;
    intensity?: 'low' | 'med' | 'high';
    locked_by_commitment?: boolean;
    [key: string]: unknown;
  };
  completed_at: string | null;
}

/** Fetch schedule blocks for a specific date */
export async function getScheduleBlocks(userId: string, date: string): Promise<ScheduleBlock[]> {
  const { data, error } = await supabase
    .from('action_items')
    .select('id, title, type, status, scheduled_date, start_time, end_time, pillar, metadata, completed_at')
    .eq('user_id', userId)
    .eq('scheduled_date', date)
    .not('metadata->schedule_block', 'is', null)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return (data || []) as unknown as ScheduleBlock[];
}

/** Compute daily compliance percentage */
export async function getDailyCompliance(userId: string, date: string): Promise<number> {
  const blocks = await getScheduleBlocks(userId, date);
  if (blocks.length === 0) return 0;
  const completed = blocks.filter(b => b.status === 'done' || b.status === 'skipped').length;
  return Math.round((completed / blocks.length) * 100);
}

/** Compute weekly compliance */
export async function getWeeklyCompliance(userId: string, weekStart: string, weekEnd: string): Promise<number> {
  const { data, error } = await supabase
    .from('action_items')
    .select('id, status')
    .eq('user_id', userId)
    .gte('scheduled_date', weekStart)
    .lte('scheduled_date', weekEnd)
    .not('metadata->schedule_block', 'is', null);

  if (error) throw error;
  const blocks = data || [];
  if (blocks.length === 0) return 0;
  const done = blocks.filter((b: any) => b.status === 'done' || b.status === 'skipped').length;
  return Math.round((done / blocks.length) * 100);
}

/** Complete or skip a schedule block */
export async function updateBlockStatus(id: string, status: 'done' | 'skipped' | 'todo') {
  const update: Record<string, unknown> = { status };
  if (status === 'done') update.completed_at = new Date().toISOString();
  if (status === 'todo') update.completed_at = null;

  const { error } = await supabase
    .from('action_items')
    .update(update as any)
    .eq('id', id);
  if (error) throw error;
}

/** Generate schedule blocks for a day from a template */
export async function generateDayBlocks(
  userId: string,
  date: string,
  template: Array<{ block_type: BlockType; start_time: string; end_time: string; title: string; pillar?: string; intensity?: string }>,
  locked: boolean
) {
  // Check if blocks already exist for this date
  const existing = await getScheduleBlocks(userId, date);
  if (existing.length > 0) return existing;

  const rows = template.map((block, idx) => ({
    user_id: userId,
    type: 'task',
    source: 'plan',
    status: 'todo',
    title: block.title,
    scheduled_date: date,
    start_time: block.start_time,
    end_time: block.end_time,
    pillar: block.pillar || null,
    order_index: idx,
    metadata: {
      schedule_block: true,
      block_type: block.block_type,
      intensity: block.intensity || 'med',
      locked_by_commitment: locked,
    },
  }));

  const { data, error } = await supabase
    .from('action_items')
    .insert(rows as any)
    .select();

  if (error) throw error;
  return data as unknown as ScheduleBlock[];
}
