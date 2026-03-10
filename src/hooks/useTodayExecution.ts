/**
 * useTodayExecution — Layer 4: Daily Queue Generator.
 * 
 * PURPOSE: Single Source of Truth for "what does the user do today?"
 * Derives all daily actions from the Weekly Tactical Plan (Layer 3).
 * 
 * Pipeline position:
 * Identity → Strategy → Phase → Weekly Plan → **DAILY QUEUE** → Now Execution
 * 
 * Core rules:
 * - Everything comes from useWeeklyTacticalPlan (Layer 3)
 * - Converts TacticalAction[] → NowQueueItem[] for UI and execution
 * - Movement Score tracks daily compliance
 * - No direct AI calls — planning is upstream
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { useWeeklyTacticalPlan, type TacticalAction, type DayPlan } from '@/hooks/useWeeklyTacticalPlan';
import type { NowQueueItem, ExecutionTemplate } from '@/types/planning';

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

// ── Pillar classification for coverage scoring ──
const BODY_PILLARS = ['vitality', 'power', 'combat'];
const MIND_PILLARS = ['focus', 'consciousness', 'expansion'];
const ARENA_PILLARS = ['wealth', 'influence', 'relationships', 'business', 'projects', 'play'];

// ── Block category → pillar mapping ──
function blockCategoryToPillar(category: string): string {
  switch (category) {
    case 'health': return 'vitality';
    case 'training': return 'power';
    case 'focus': return 'focus';
    case 'creation': return 'projects';
    case 'review': return 'consciousness';
    case 'social': return 'relationships';
    case 'action': return 'business';
    default: return 'focus';
  }
}

// ── Block category → hub mapping ──
function blockCategoryToHub(category: string): 'core' | 'arena' {
  if (['health', 'training'].includes(category)) return 'core';
  if (['focus'].includes(category)) return 'core';
  return 'arena';
}

// ── Convert TacticalAction → NowQueueItem ──
function tacticalToNowItem(action: TacticalAction, blockCategory: string): NowQueueItem {
  const pillarId = action.focusArea || blockCategoryToPillar(blockCategory);
  const hub = blockCategoryToHub(blockCategory);

  return {
    pillarId,
    hub,
    actionType: action.actionType || blockCategory,
    title: action.title,
    titleEn: action.titleEn || action.title,
    durationMin: action.estimatedMinutes,
    isTimeBased: action.estimatedMinutes > 0,
    urgencyScore: action.difficulty * 20,
    reason: '',
    sourceType: 'milestone',
    sourceId: action.sourceMilestoneId || action.id,
    missionId: action.missionId || (action as any).missionId || undefined,
    missionTitle: (action as any).missionTitle || undefined,
    milestoneId: action.sourceMilestoneId || undefined,
    milestoneTitle: action.title,
    executionTemplate: (action.executionTemplate as ExecutionTemplate) || 'step_by_step',
    completed: !!action.completed,
    calendarDate: action.calendarDate,
  };
}
// ── Map block category → TimeBlock ──
function categoryToTimeBlock(category: string): TimeBlock {
  switch (category) {
    case 'health': return 'morning';
    case 'training': return 'training';
    case 'focus': return 'deepwork';
    case 'creation': return 'admin';
    case 'review': return 'recovery';
    case 'social': return 'social';
    case 'action': return 'midday';
    default: return 'midday';
  }
}

// ── Hypnosis items injected into morning & evening ──
function makeHypnosisItem(phase: 'morning' | 'evening'): NowQueueItem {
  return {
    pillarId: 'consciousness',
    hub: 'core',
    actionType: 'hypnosis',
    title: phase === 'morning' ? 'היפנוזה יומית — בוקר' : 'היפנוזה יומית — ערב',
    titleEn: phase === 'morning' ? 'Daily Hypnosis — Morning' : 'Daily Hypnosis — Evening',
    durationMin: 14,
    isTimeBased: true,
    urgencyScore: 90,
    reason: 'Daily personalized hypnosis session',
    sourceType: 'practice',
    executionTemplate: 'tts_guided',
    energyPhase: phase,
    practiceId: 'hypnosis',
  };
}

// ── Build schedule slots from today's tactical blocks (no times, quarter-based) ──
function buildScheduleFromTactics(todayPlan: DayPlan | null): ScheduleSlot[] {
  if (!todayPlan || todayPlan.blocks.length === 0) return [];

  const slots = todayPlan.blocks.map((block, idx) => {
    const timeBlock = categoryToTimeBlock(block.category);

    const actions: NowQueueItem[] = block.actions.map(action =>
      tacticalToNowItem(action, block.category)
    );

    return {
      id: block.id,
      timeBlock,
      startTime: '',
      endTime: '',
      labelKey: `today.${timeBlock}`,
      actions,
      status: 'upcoming' as const,
    };
  });

  // Inject hypnosis into morning block (first) and evening block (last or create one)
  const morningSlot = slots.find(s => s.timeBlock === 'morning');
  if (morningSlot) {
    morningSlot.actions.unshift(makeHypnosisItem('morning'));
  } else if (slots.length > 0) {
    // Prepend a morning slot with hypnosis
    slots.unshift({
      id: 'hypnosis-morning',
      timeBlock: 'morning',
      startTime: '',
      endTime: '',
      labelKey: 'today.morning',
      actions: [makeHypnosisItem('morning')],
      status: 'upcoming',
    });
  }

  const eveningSlot = slots.find(s => s.timeBlock === 'evening');
  if (eveningSlot) {
    eveningSlot.actions.push(makeHypnosisItem('evening'));
  } else {
    slots.push({
      id: 'hypnosis-evening',
      timeBlock: 'evening',
      startTime: '',
      endTime: '',
      labelKey: 'today.evening',
      actions: [makeHypnosisItem('evening')],
      status: 'upcoming',
    });
  }

  return slots;
}

// ── Movement score ──
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

// ── Main hook ──
export function useTodayExecution() {
  const { user } = useAuth();
  const { language } = useTranslation();
  const tacticalPlan = useWeeklyTacticalPlan();
  const { days, isLoading: tacticsLoading, hasAiSchedule, wakeTime, sleepTime, generateSchedule } = tacticalPlan;

  // Find today's plan from the tactical schedule
  const todayPlan = useMemo(() => {
    return days.find(d => d.isToday) || null;
  }, [days]);

  // Convert today's tactical actions → NowQueueItem[]
  const queue: NowQueueItem[] = useMemo(() => {
    if (!todayPlan) return [];
    return todayPlan.blocks.flatMap(block =>
      block.actions.map(action => tacticalToNowItem(action, block.category))
    );
  }, [todayPlan]);

  // Schedule prefs from tactical plan
  const prefs: UserSchedulePrefs = useMemo(() => ({
    wake_time: wakeTime || '06:30',
    sleep_time: sleepTime || '23:00',
    focus_peak_start: null,
    focus_peak_end: null,
  }), [wakeTime, sleepTime]);

  // Use local date (not UTC) to match the user's actual day
  const localNow = new Date();
  const today = `${localNow.getFullYear()}-${String(localNow.getMonth() + 1).padStart(2, '0')}-${String(localNow.getDate()).padStart(2, '0')}`;

  // Completed action IDs for today
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

  const wakeH = parseInt(prefs.wake_time?.split(':')[0] || '6');
  const sleepH = parseInt(prefs.sleep_time?.split(':')[0] || '23');

  // Build schedule from tactical blocks
  const schedule = useMemo(() => buildScheduleFromTactics(todayPlan), [todayPlan]);

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

  const hasPlan = hasAiSchedule || (todayPlan !== null && todayPlan.totalActions > 0);
  const tier = 'clarity'; // Tier is subscription-based, not NowEngine-based

  return {
    queue,
    nextAction: hasPlan ? nextAction : null,
    schedule,
    tier,
    maxActions: queue.length,
    isFree: false,
    hasPlan,

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

    isLoading: tacticsLoading,
    refetch: generateSchedule,
  };
}
