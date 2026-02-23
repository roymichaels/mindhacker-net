/**
 * useTodayExecution — Central hook for the Dynamic Execution Engine.
 * Replaces milestone-first logic with a TODAY-first, pillar-distributed system.
 * 
 * Core rules:
 * - No "Week X" or milestone-first surfaces
 * - Distributes across 13 pillars (Body / Mind / Arena coverage)
 * - Tier-gated: Free=3-5 actions, Plus=full schedule, Apex=adaptive
 * - Movement Score tracks daily compliance
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { useNowEngine, NowQueueItem } from '@/hooks/useNowEngine';

export type TimeBlock = 'morning' | 'midday' | 'evening' | 'deepwork' | 'training' | 'recovery' | 'admin' | 'social' | 'play';

export interface ScheduleSlot {
  id: string;
  timeBlock: TimeBlock;
  startTime: string;
  endTime: string;
  labelKey: string;
  actions: NowQueueItem[];
  status: 'upcoming' | 'active' | 'done' | 'skipped';
}

export interface UserSchedulePrefs {
  wake_time: string;
  sleep_time: string;
  focus_peak_start: string | null;
  focus_peak_end: string | null;
}

const BODY_PILLARS = ['vitality', 'power', 'combat'];
const MIND_PILLARS = ['focus', 'consciousness', 'expansion'];
const ARENA_PILLARS = ['wealth', 'influence', 'relationships', 'business', 'projects', 'play'];

function assignTimeBlock(item: NowQueueItem): TimeBlock {
  const t = item.actionType;
  if (t.includes('morning') || t.includes('hydration')) return 'morning';
  if (t.includes('training') || t.includes('strength') || t.includes('shadowboxing') || t.includes('footwork') || t.includes('combat')) return 'training';
  if (t.includes('deep_work') || t.includes('focus') || t.includes('learning')) return 'deepwork';
  if (t.includes('meditation') || t.includes('recovery') || t.includes('shutdown') || t.includes('sleep')) return 'recovery';
  if (t.includes('business') || t.includes('money') || t.includes('project') || t.includes('influence')) return 'admin';
  if (t.includes('relationship') || t.includes('presence')) return 'social';
  if (t.includes('play')) return 'play';
  return 'midday';
}

function getCurrentTimeStr(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function getSlotStatus(startTime: string, endTime: string): ScheduleSlot['status'] {
  const current = getCurrentTimeStr();
  if (current >= startTime && current < endTime) return 'active';
  if (current >= endTime) return 'done';
  return 'upcoming';
}

function buildFreeSchedule(queue: NowQueueItem[], wakeH: number, sleepH: number): ScheduleSlot[] {
  const blocks: ScheduleSlot[] = [
    { id: 'morning', timeBlock: 'morning', startTime: `${String(wakeH).padStart(2, '0')}:00`, endTime: '12:00', labelKey: 'today.morning', actions: [], status: 'upcoming' },
    { id: 'midday', timeBlock: 'midday', startTime: '12:00', endTime: '17:00', labelKey: 'today.midday', actions: [], status: 'upcoming' },
    { id: 'evening', timeBlock: 'evening', startTime: '17:00', endTime: `${String(sleepH).padStart(2, '0')}:00`, labelKey: 'today.evening', actions: [], status: 'upcoming' },
  ];
  queue.forEach((item, i) => blocks[i % 3].actions.push(item));
  blocks.forEach(b => { b.status = getSlotStatus(b.startTime, b.endTime); });
  return blocks;
}

function buildFullSchedule(queue: NowQueueItem[], wakeH: number, sleepH: number): ScheduleSlot[] {
  const blockMap = new Map<TimeBlock, NowQueueItem[]>();
  queue.forEach(item => {
    const block = assignTimeBlock(item);
    if (!blockMap.has(block)) blockMap.set(block, []);
    blockMap.get(block)!.push(item);
  });

  const blockDefs: { key: TimeBlock; labelKey: string; startH: number; endH: number }[] = [
    { key: 'morning', labelKey: 'today.morning', startH: wakeH, endH: wakeH + 2 },
    { key: 'training', labelKey: 'today.training', startH: wakeH + 2, endH: wakeH + 3 },
    { key: 'deepwork', labelKey: 'today.deepWork', startH: wakeH + 3, endH: wakeH + 5 },
    { key: 'admin', labelKey: 'today.businessProjects', startH: wakeH + 5, endH: wakeH + 7 },
    { key: 'midday', labelKey: 'today.midday', startH: 12, endH: 14 },
    { key: 'social', labelKey: 'today.relationships', startH: 17, endH: 19 },
    { key: 'play', labelKey: 'today.play', startH: 19, endH: 21 },
    { key: 'recovery', labelKey: 'today.recovery', startH: sleepH - 2, endH: sleepH },
  ];

  const slots: ScheduleSlot[] = [];
  blockDefs.forEach(b => {
    const actions = blockMap.get(b.key) || [];
    if (actions.length === 0) return;
    const startStr = `${String(Math.min(23, b.startH)).padStart(2, '0')}:00`;
    const endStr = `${String(Math.min(23, b.endH)).padStart(2, '0')}:00`;
    slots.push({
      id: b.key,
      timeBlock: b.key,
      startTime: startStr,
      endTime: endStr,
      labelKey: b.labelKey,
      actions,
      status: getSlotStatus(startStr, endStr),
    });
  });

  // Unassigned items → midday
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
        labelKey: 'today.midday',
        actions: unassigned,
        status: getSlotStatus('12:00', '14:00'),
      });
    }
  }

  slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
  return slots;
}

function computeMovementScore(queue: NowQueueItem[], completedIds: Set<string>) {
  const completed = queue.filter(q => q.sourceId && completedIds.has(q.sourceId));
  const total = queue.length;
  const baseScore = total > 0 ? Math.round((completed.length / total) * 70) : 0;

  const bodyCovered = queue.some(q => BODY_PILLARS.includes(q.pillarId) && q.sourceId && completedIds.has(q.sourceId));
  const mindCovered = queue.some(q => MIND_PILLARS.includes(q.pillarId) && q.sourceId && completedIds.has(q.sourceId));
  const arenaCovered = queue.some(q => ARENA_PILLARS.includes(q.pillarId) && q.sourceId && completedIds.has(q.sourceId));

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
  const { queue, tier, maxActions, isLoading: queueLoading, refetch } = useNowEngine();

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

  const today = new Date().toISOString().slice(0, 10);

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
  const wakeH = parseInt(prefs.wake_time?.split(':')[0] || '6');
  const sleepH = parseInt(prefs.sleep_time?.split(':')[0] || '23');

  // Build schedule based on tier
  const isFree = tier === 'clarity';
  const schedule = queue.length > 0
    ? (isFree ? buildFreeSchedule(queue, wakeH, sleepH) : buildFullSchedule(queue, wakeH, sleepH))
    : [];

  const movement = computeMovementScore(queue, completedIds);

  // Next action = first non-completed item
  const nextAction = queue.find(q => !q.sourceId || !completedIds.has(q.sourceId)) || null;

  // Fallback plan (top 3 for min-day)
  const fallbackPlan = queue
    .filter(q => !q.sourceId || !completedIds.has(q.sourceId))
    .slice(0, 3);

  // Min-day mode detection
  const now = new Date();
  const hoursRemaining = Math.max(0, sleepH - now.getHours());
  const pendingActions = queue.filter(q => !q.sourceId || !completedIds.has(q.sourceId));
  const totalPendingMin = pendingActions.reduce((sum, a) => sum + a.durationMin, 0);
  const isMinDayMode = hoursRemaining * 60 < totalPendingMin && pendingActions.length > 3;

  return {
    queue,
    nextAction,
    schedule,
    tier,
    maxActions,
    isFree,

    movementScore: movement.score,
    bodyCovered: movement.bodyCovered,
    mindCovered: movement.mindCovered,
    arenaCovered: movement.arenaCovered,
    actionsCompleted: completedIds.size,
    actionsTotal: queue.length,

    isMinDayMode,
    fallbackPlan,
    hoursRemaining,

    wakeTime: prefs.wake_time,
    sleepTime: prefs.sleep_time,

    isLoading: queueLoading,
    refetch,
  };
}
