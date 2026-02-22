/**
 * useTodayExecution — Central hook for the Today Execution Engine.
 * Combines the Now Engine queue with schedule blocks and movement tracking.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { useNowEngine, NowQueueItem } from '@/hooks/useNowEngine';

export type TimeBlock = 'morning' | 'midday' | 'evening' | 'deepwork' | 'training' | 'recovery' | 'admin' | 'social' | 'play';

export interface ScheduleSlot {
  id: string;
  timeBlock: TimeBlock;
  startTime: string; // HH:MM
  endTime: string;
  label: string;
  actions: NowQueueItem[];
  status: 'upcoming' | 'active' | 'done' | 'skipped';
}

export interface TodayRunData {
  id: string;
  run_date: string;
  mode: 'normal' | 'min_day';
  movement_score: number;
  body_covered: boolean;
  mind_covered: boolean;
  arena_covered: boolean;
  actions_completed: number;
  actions_total: number;
}

export interface UserSchedulePrefs {
  wake_time: string;
  sleep_time: string;
  focus_peak_start: string | null;
  focus_peak_end: string | null;
}

// Map queue items to time blocks based on action type
function assignTimeBlock(item: NowQueueItem, hour: number): TimeBlock {
  if (item.actionType.includes('morning') || item.actionType.includes('hydration')) return 'morning';
  if (item.actionType.includes('training') || item.actionType.includes('strength') || item.actionType.includes('shadowboxing') || item.actionType.includes('footwork') || item.actionType.includes('combat')) return 'training';
  if (item.actionType.includes('deep_work') || item.actionType.includes('focus') || item.actionType.includes('learning')) return 'deepwork';
  if (item.actionType.includes('meditation') || item.actionType.includes('recovery') || item.actionType.includes('shutdown') || item.actionType.includes('sleep')) return 'recovery';
  if (item.actionType.includes('business') || item.actionType.includes('money') || item.actionType.includes('project') || item.actionType.includes('influence')) return 'admin';
  if (item.actionType.includes('relationship') || item.actionType.includes('presence')) return 'social';
  if (item.actionType.includes('play')) return 'play';
  // Time-based fallback
  if (hour < 12) return 'morning';
  if (hour < 17) return 'midday';
  return 'evening';
}

// Generate schedule from queue + preferences
function buildSchedule(
  queue: NowQueueItem[],
  prefs: UserSchedulePrefs,
  tier: string,
  isHe: boolean,
): ScheduleSlot[] {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const currentTimeStr = `${String(currentHour).padStart(2,'0')}:${String(currentMin).padStart(2,'0')}`;

  const wakeH = parseInt(prefs.wake_time?.split(':')[0] || '6');
  const sleepH = parseInt(prefs.sleep_time?.split(':')[0] || '23');

  // Free tier: 3 simple blocks
  if (tier === 'clarity') {
    const blocks: ScheduleSlot[] = [
      { id: 'morning', timeBlock: 'morning', startTime: `${String(wakeH).padStart(2,'0')}:00`, endTime: '12:00', label: isHe ? '🌅 בוקר' : '🌅 Morning', actions: [], status: 'upcoming' },
      { id: 'midday', timeBlock: 'midday', startTime: '12:00', endTime: '17:00', label: isHe ? '⚡ צהריים' : '⚡ Midday', actions: [], status: 'upcoming' },
      { id: 'evening', timeBlock: 'evening', startTime: '17:00', endTime: `${String(sleepH).padStart(2,'0')}:00`, label: isHe ? '🌙 ערב' : '🌙 Evening', actions: [], status: 'upcoming' },
    ];

    // Distribute queue items across blocks
    queue.forEach((item, i) => {
      const blockIdx = i % 3;
      blocks[blockIdx].actions.push(item);
    });

    // Set active status
    blocks.forEach(b => {
      if (currentTimeStr >= b.startTime && currentTimeStr < b.endTime) b.status = 'active';
      else if (currentTimeStr >= b.endTime) b.status = 'done';
    });

    return blocks;
  }

  // Plus/Apex: hourly blocks based on action types
  const blockMap = new Map<TimeBlock, NowQueueItem[]>();
  queue.forEach(item => {
    const block = assignTimeBlock(item, currentHour);
    if (!blockMap.has(block)) blockMap.set(block, []);
    blockMap.get(block)!.push(item);
  });

  const blockOrder: { key: TimeBlock; label: string; labelHe: string; startH: number; endH: number }[] = [
    { key: 'morning', label: '🌅 Morning Routine', labelHe: '🌅 שגרת בוקר', startH: wakeH, endH: wakeH + 2 },
    { key: 'training', label: '💪 Training', labelHe: '💪 אימון', startH: wakeH + 2, endH: wakeH + 3 },
    { key: 'deepwork', label: '🎯 Deep Work', labelHe: '🎯 עבודה עמוקה', startH: wakeH + 3, endH: wakeH + 5 },
    { key: 'admin', label: '📊 Business & Projects', labelHe: '📊 עסקים ופרויקטים', startH: wakeH + 5, endH: wakeH + 7 },
    { key: 'midday', label: '⚡ Midday', labelHe: '⚡ צהריים', startH: 12, endH: 14 },
    { key: 'social', label: '🤝 Relationships & Influence', labelHe: '🤝 קשרים והשפעה', startH: 17, endH: 19 },
    { key: 'recovery', label: '🧘 Recovery & Reflection', labelHe: '🧘 התאוששות', startH: sleepH - 2, endH: sleepH },
    { key: 'play', label: '🎮 Play', labelHe: '🎮 משחק', startH: 19, endH: 21 },
  ];

  const slots: ScheduleSlot[] = [];
  blockOrder.forEach(b => {
    const actions = blockMap.get(b.key) || [];
    if (actions.length === 0) return;
    const startStr = `${String(Math.min(23, b.startH)).padStart(2,'0')}:00`;
    const endStr = `${String(Math.min(23, b.endH)).padStart(2,'0')}:00`;
    let status: ScheduleSlot['status'] = 'upcoming';
    if (currentTimeStr >= startStr && currentTimeStr < endStr) status = 'active';
    else if (currentTimeStr >= endStr) status = 'done';
    slots.push({
      id: b.key,
      timeBlock: b.key,
      startTime: startStr,
      endTime: endStr,
      label: isHe ? b.labelHe : b.label,
      actions,
      status,
    });
  });

  // Add unassigned items to a generic midday block
  const assigned = new Set(slots.flatMap(s => s.actions));
  const unassigned = queue.filter(q => !assigned.has(q));
  if (unassigned.length > 0) {
    const existing = slots.find(s => s.timeBlock === 'midday');
    if (existing) {
      existing.actions.push(...unassigned);
    } else {
      slots.push({
        id: 'midday',
        timeBlock: 'midday',
        startTime: '12:00',
        endTime: '14:00',
        label: isHe ? '⚡ צהריים' : '⚡ Midday',
        actions: unassigned,
        status: currentTimeStr >= '12:00' && currentTimeStr < '14:00' ? 'active' : currentTimeStr >= '14:00' ? 'done' : 'upcoming',
      });
    }
  }

  // Sort by start time
  slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
  return slots;
}

// Compute movement score
function computeMovementScore(queue: NowQueueItem[], completedIds: Set<string>): {
  score: number;
  bodyCovered: boolean;
  mindCovered: boolean;
  arenaCovered: boolean;
} {
  const bodyPillars = ['vitality', 'power', 'combat'];
  const mindPillars = ['focus', 'consciousness', 'expansion'];
  const arenaPillars = ['wealth', 'influence', 'relationships', 'business', 'projects', 'play'];

  const completed = queue.filter(q => q.sourceId && completedIds.has(q.sourceId));
  const total = queue.length;
  const baseScore = total > 0 ? Math.round((completed.length / total) * 70) : 0;

  const bodyCovered = queue.some(q => bodyPillars.includes(q.pillarId) && q.sourceId && completedIds.has(q.sourceId));
  const mindCovered = queue.some(q => mindPillars.includes(q.pillarId) && q.sourceId && completedIds.has(q.sourceId));
  const arenaCovered = queue.some(q => arenaPillars.includes(q.pillarId) && q.sourceId && completedIds.has(q.sourceId));

  const coverageBonus = [bodyCovered, mindCovered, arenaCovered].filter(Boolean).length * 10;

  return {
    score: Math.min(100, baseScore + coverageBonus),
    bodyCovered,
    mindCovered,
    arenaCovered,
  };
}

export function useTodayExecution() {
  const { user } = useAuth();
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { queue, tier, maxActions, isLoading: queueLoading, refetch } = useNowEngine();

  // Fetch user schedule preferences
  const { data: schedulePrefs } = useQuery({
    queryKey: ['schedule-prefs', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('wake_time, sleep_time, focus_peak_start, focus_peak_end')
        .eq('id', user!.id)
        .single();
      return (data || { wake_time: '06:30', sleep_time: '23:00', focus_peak_start: null, focus_peak_end: null }) as UserSchedulePrefs;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch today's run data
  const today = new Date().toISOString().slice(0, 10);
  const { data: todayRun } = useQuery({
    queryKey: ['today-run', user?.id, today],
    queryFn: async () => {
      const { data } = await supabase
        .from('today_runs')
        .select('*')
        .eq('user_id', user!.id)
        .eq('run_date', today)
        .maybeSingle();
      return data as TodayRunData | null;
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  // Fetch completed action IDs for today
  const { data: completedIds = new Set<string>() } = useQuery({
    queryKey: ['completed-today', user?.id, today],
    queryFn: async () => {
      const { data } = await supabase
        .from('action_items')
        .select('id')
        .eq('user_id', user!.id)
        .eq('status', 'done')
        .gte('completed_at', `${today}T00:00:00`)
        .lte('completed_at', `${today}T23:59:59`);
      return new Set((data || []).map((d: any) => d.id));
    },
    enabled: !!user?.id,
    staleTime: 15_000,
  });

  const prefs = schedulePrefs || { wake_time: '06:30', sleep_time: '23:00', focus_peak_start: null, focus_peak_end: null };

  // Build schedule and movement score
  const schedule = queue.length > 0 ? buildSchedule(queue, prefs, tier, isHe) : [];
  const movement = computeMovementScore(queue, completedIds);

  // Next action = first non-completed item
  const nextAction = queue.find(q => !q.sourceId || !completedIds.has(q.sourceId)) || null;

  // Fallback plan (top 3 high-impact actions for min_day mode)
  const fallbackPlan = queue
    .filter(q => !q.sourceId || !completedIds.has(q.sourceId))
    .slice(0, 3);

  // Check if we should auto-switch to minimum viable day
  const now = new Date();
  const sleepH = parseInt(prefs.sleep_time?.split(':')[0] || '23');
  const hoursRemaining = Math.max(0, sleepH - now.getHours());
  const pendingActions = queue.filter(q => !q.sourceId || !completedIds.has(q.sourceId));
  const totalPendingMin = pendingActions.reduce((sum, a) => sum + a.durationMin, 0);
  const isMinDayMode = hoursRemaining * 60 < totalPendingMin && pendingActions.length > 3;

  return {
    // Core data
    queue,
    nextAction,
    schedule,
    tier,
    maxActions,

    // Movement tracking
    movementScore: todayRun?.movement_score ?? movement.score,
    bodyCovered: todayRun?.body_covered ?? movement.bodyCovered,
    mindCovered: todayRun?.mind_covered ?? movement.mindCovered,
    arenaCovered: todayRun?.arena_covered ?? movement.arenaCovered,
    actionsCompleted: completedIds.size,
    actionsTotal: queue.length,

    // Mode
    isMinDayMode,
    fallbackPlan,
    hoursRemaining,

    // Schedule prefs
    wakeTime: prefs.wake_time,
    sleepTime: prefs.sleep_time,

    // State
    isLoading: queueLoading,
    refetch,
  };
}
