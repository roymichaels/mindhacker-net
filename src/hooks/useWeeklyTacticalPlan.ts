/**
 * useWeeklyTacticalPlan — Transforms mini_milestones into a structured weekly plan.
 *
 * Pipeline:
 *   milestones → mini_milestones → map scheduled_day to calendar date
 *   → filter to current week → assign day-of-week → group into blocks → render
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { usePhaseActions } from '@/hooks/usePhaseActions';

// ── Types ──

export type Cadence = 'daily' | '3x_per_week' | '2x_per_week' | 'weekly' | 'one_time';
export type BlockCategory = 'training' | 'action' | 'review' | 'creation' | 'health' | 'focus' | 'social';
export type DayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export interface TacticalAction {
  id: string;
  title: string;
  titleEn: string | null;
  description: string | null;
  descriptionEn: string | null;
  sourceMilestoneId: string;
  executionTemplate: string | null;
  actionType: string | null;
  estimatedMinutes: number;
  cadence: Cadence;
  completed: boolean;
  completedAt: string | null;
  xpReward: number;
  blockCategory: BlockCategory;
  /** Absolute plan day (1-100) */
  scheduledDay: number | null;
  /** Resolved calendar date YYYY-MM-DD */
  calendarDate: string | null;
}

export interface TacticalBlock {
  id: string;
  title: string;
  titleEn: string;
  category: BlockCategory;
  estimatedMinutes: number;
  actions: TacticalAction[];
  completedCount: number;
}

export interface DayPlan {
  dayKey: DayKey;
  dayIndex: number;
  label: string;
  labelEn: string;
  date: string; // YYYY-MM-DD
  blocks: TacticalBlock[];
  totalActions: number;
  completedActions: number;
  totalMinutes: number;
}

export interface WeeklyPlan {
  phase: string;
  phaseNumber: number;
  days: DayPlan[];
  totalActions: number;
  completedActions: number;
  totalMinutes: number;
  generating: boolean;
  weekStart: string;
  weekEnd: string;
}

// ── Constants ──

const DAY_KEYS: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_LABELS_HE = ['יום א׳', 'יום ב׳', 'יום ג׳', 'יום ד׳', 'יום ה׳', 'יום ו׳', 'שבת'];
const DAY_LABELS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const BLOCK_LABELS: Record<BlockCategory, { he: string; en: string }> = {
  health:   { he: 'בריאות ויציבה', en: 'Health & Posture' },
  training: { he: 'אימון ותנועה', en: 'Training & Movement' },
  focus:    { he: 'פוקוס ועבודה עמוקה', en: 'Focus & Deep Work' },
  action:   { he: 'ביצוע ומשימות', en: 'Execution & Tasks' },
  creation: { he: 'יצירה ובנייה', en: 'Creation & Building' },
  review:   { he: 'סקירה וניתוח', en: 'Review & Analysis' },
  social:   { he: 'חברתי ומערכות יחסים', en: 'Social & Relationships' },
};

// ── Helpers ──

/** Get the Sunday-based week window that contains `date`. */
function getWeekWindow(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dayOfWeek = d.getDay(); // 0=Sun
  const start = new Date(d);
  start.setDate(d.getDate() - dayOfWeek);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Convert absolute plan day (1-based) → calendar date string. */
function planDayToDate(planStartDate: string, scheduledDay: number): string {
  const start = new Date(planStartDate);
  start.setHours(0, 0, 0, 0);
  const target = new Date(start);
  target.setDate(start.getDate() + (scheduledDay - 1));
  return toDateStr(target);
}

// ── Classification ──

export function classifyCadence(
  title: string,
  actionType: string | null,
  executionTemplate: string | null,
): Cadence {
  const combined = `${title} ${actionType || ''} ${executionTemplate || ''}`.toLowerCase();

  if (/נשימ|יציב|מדיטציה|breath|posture|meditation|journal|morning|anchor|עוגן|מיינדפול|mindful|daily|יומי/.test(combined)) return 'daily';
  if (/אימון|כוח|לחימה|sparring|combat|strength|workout|hiit|calisthen|training|shadow/.test(combined)) return '3x_per_week';
  if (/עבודה עמוקה|deep.?work|content|creation|study|למידה|sprint/.test(combined)) return '2x_per_week';
  if (/סקירה|review|audit|מיפוי|mapping|analysis|ניתוח|שבוע|weekly/.test(combined)) return 'weekly';
  if (/הקמ|setup|publish|launch|פרסום|build|בנייה|one.?time|חד.?פעמי/.test(combined)) return 'one_time';

  if (executionTemplate === 'tts_guided' || executionTemplate === 'step_by_step') return 'daily';
  if (executionTemplate === 'sets_reps_timer' || executionTemplate === 'video_embed') return '3x_per_week';
  if (executionTemplate === 'timer_focus') return '2x_per_week';
  if (executionTemplate === 'social_checklist') return 'weekly';

  return '3x_per_week';
}

export function classifyBlockCategory(
  actionType: string | null,
  executionTemplate: string | null,
  title: string,
): BlockCategory {
  const combined = `${title} ${actionType || ''} ${executionTemplate || ''}`.toLowerCase();

  if (/נשימ|breath|posture|יציב|health|בריאות|nutrition|תזונ|sleep|שינה|skin|עור|body.?scan|סריקת/.test(combined)) return 'health';
  if (/אימון|combat|strength|כוח|shadow|boxing|hiit|training|לחימה|workout|חסימ|מכות/.test(combined)) return 'training';
  if (/מדיטציה|meditation|focus|פוקוס|deep.?work|עמוקה|timer_focus|ויזואליז/.test(combined)) return 'focus';
  if (/יצירה|creation|content|build|בנייה|publish|פרסום/.test(combined)) return 'creation';
  if (/סקירה|review|audit|ניתוח|analysis|מיפוי|mapping/.test(combined)) return 'review';
  if (/social|חברת|relation|קשר|networking|outreach|dating/.test(combined)) return 'social';

  return 'action';
}

function estimateMinutes(executionTemplate: string | null, _actionType: string | null): number {
  if (executionTemplate === 'tts_guided') return 10;
  if (executionTemplate === 'sets_reps_timer') return 25;
  if (executionTemplate === 'video_embed') return 20;
  if (executionTemplate === 'timer_focus') return 30;
  if (executionTemplate === 'social_checklist') return 15;
  if (executionTemplate === 'step_by_step') return 10;
  return 15;
}

// ── Block grouping ──

function groupIntoBlocks(actions: TacticalAction[]): TacticalBlock[] {
  const categoryGroups = new Map<BlockCategory, TacticalAction[]>();

  for (const action of actions) {
    const existing = categoryGroups.get(action.blockCategory) || [];
    existing.push(action);
    categoryGroups.set(action.blockCategory, existing);
  }

  const categoryOrder: BlockCategory[] = ['health', 'training', 'focus', 'action', 'creation', 'review', 'social'];

  const blocks: TacticalBlock[] = [];
  for (const cat of categoryOrder) {
    const catActions = categoryGroups.get(cat);
    if (!catActions || catActions.length === 0) continue;

    const label = BLOCK_LABELS[cat];
    blocks.push({
      id: `block-${cat}-${catActions[0].id}`,
      title: label.he,
      titleEn: label.en,
      category: cat,
      estimatedMinutes: catActions.reduce((sum, a) => sum + a.estimatedMinutes, 0),
      actions: catActions,
      completedCount: catActions.filter(a => a.completed).length,
    });
  }

  return blocks;
}

// ── Hook ──

export function useWeeklyTacticalPlan(): WeeklyPlan & { isLoading: boolean } {
  const { user } = useAuth();
  const { milestones, currentWeek: currentPhase, plan } = useLifePlanWithMilestones();
  const { generating } = usePhaseActions();

  const planStartDate = plan?.start_date || null;

  const allPlanIds = useMemo(() => {
    return (plan as any)?.all_plan_ids as string[] || (plan?.id ? [plan.id] : []);
  }, [plan]);

  // Current phase milestones
  const currentPhaseMilestones = useMemo(
    () => milestones.filter(m => m.week_number === currentPhase),
    [milestones, currentPhase]
  );

  const milestoneIds = useMemo(
    () => currentPhaseMilestones.map(m => m.id),
    [currentPhaseMilestones]
  );

  // Current week window
  const { weekStart, weekEnd, weekDates } = useMemo(() => {
    const today = new Date();
    const { start, end } = getWeekWindow(today);
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(toDateStr(d));
    }
    return { weekStart: toDateStr(start), weekEnd: toDateStr(end), weekDates: dates };
  }, []);

  // Fetch ALL mini_milestones for current phase
  const { data: allMiniMilestones, isLoading } = useQuery({
    queryKey: ['weekly-tactical-minis', milestoneIds],
    queryFn: async () => {
      if (milestoneIds.length === 0) return [];
      const { data, error } = await supabase
        .from('mini_milestones')
        .select('*')
        .in('milestone_id', milestoneIds)
        .order('milestone_id')
        .order('mini_number');

      if (error) throw error;
      return data || [];
    },
    enabled: milestoneIds.length > 0 && !!user?.id,
    staleTime: 60_000,
  });

  // Build the weekly plan
  const weeklyPlan = useMemo((): WeeklyPlan => {
    const phaseLabel = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'][(currentPhase || 1) - 1] || '?';
    const emptyPlan: WeeklyPlan = {
      phase: phaseLabel,
      phaseNumber: currentPhase || 1,
      days: buildEmptyDays(weekDates),
      totalActions: 0,
      completedActions: 0,
      totalMinutes: 0,
      generating,
      weekStart,
      weekEnd,
    };

    if (!planStartDate) return emptyPlan;

    const source = allMiniMilestones && allMiniMilestones.length > 0
      ? allMiniMilestones
      : null;

    if (!source) {
      // No mini_milestones — use milestones as fallback but still date-filter
      if (currentPhaseMilestones.length === 0) return emptyPlan;
      return buildFromMilestones(currentPhaseMilestones, planStartDate, weekDates, phaseLabel, currentPhase || 1, generating, weekStart, weekEnd);
    }

    // ── Main path: convert mini_milestones to TacticalActions with real dates ──
    const actions: TacticalAction[] = source.map(mm => {
      const calendarDate = mm.scheduled_day ? planDayToDate(planStartDate, mm.scheduled_day) : null;
      const cadence = classifyCadence(mm.title, mm.action_type, mm.execution_template);
      const blockCat = classifyBlockCategory(mm.action_type, mm.execution_template, mm.title);
      const mins = estimateMinutes(mm.execution_template, mm.action_type);

      return {
        id: mm.id,
        title: mm.title,
        titleEn: mm.title_en,
        description: mm.description,
        descriptionEn: mm.description_en,
        sourceMilestoneId: mm.milestone_id,
        executionTemplate: mm.execution_template,
        actionType: mm.action_type,
        estimatedMinutes: mins,
        cadence,
        completed: mm.is_completed || false,
        completedAt: mm.completed_at,
        xpReward: mm.xp_reward || 10,
        blockCategory: blockCat,
        scheduledDay: mm.scheduled_day,
        calendarDate,
      };
    });

    // ── Filter to only actions that fall in THIS calendar week ──
    const weekActions = actions.filter(a => {
      if (!a.calendarDate) return false;
      return a.calendarDate >= weekStart && a.calendarDate <= weekEnd;
    });

    // ── Assign to day-of-week based on calendar date ──
    const dayMap = new Map<number, TacticalAction[]>();
    for (let d = 0; d < 7; d++) dayMap.set(d, []);

    for (const action of weekActions) {
      if (action.calendarDate) {
        const dow = new Date(action.calendarDate + 'T12:00:00').getDay();
        dayMap.get(dow)!.push(action);
      }
    }

    const days = buildDayPlans(dayMap, weekDates);

    return {
      phase: phaseLabel,
      phaseNumber: currentPhase || 1,
      days,
      totalActions: weekActions.length,
      completedActions: weekActions.filter(a => a.completed).length,
      totalMinutes: days.reduce((s, d) => s + d.totalMinutes, 0),
      generating,
      weekStart,
      weekEnd,
    };
  }, [allMiniMilestones, currentPhaseMilestones, currentPhase, generating, planStartDate, weekDates, weekStart, weekEnd]);

  return { ...weeklyPlan, isLoading };
}

// ── Build helpers ──

function buildEmptyDays(weekDates: string[]): DayPlan[] {
  return weekDates.map((date, i) => ({
    dayKey: DAY_KEYS[i],
    dayIndex: i,
    label: DAY_LABELS_HE[i],
    labelEn: DAY_LABELS_EN[i],
    date,
    blocks: [],
    totalActions: 0,
    completedActions: 0,
    totalMinutes: 0,
  }));
}

function buildDayPlans(dayMap: Map<number, TacticalAction[]>, weekDates: string[]): DayPlan[] {
  const days: DayPlan[] = [];

  for (let d = 0; d < 7; d++) {
    const actions = dayMap.get(d) || [];
    const blocks = groupIntoBlocks(actions);

    days.push({
      dayKey: DAY_KEYS[d],
      dayIndex: d,
      label: DAY_LABELS_HE[d],
      labelEn: DAY_LABELS_EN[d],
      date: weekDates[d],
      blocks,
      totalActions: actions.length,
      completedActions: actions.filter(a => a.completed).length,
      totalMinutes: actions.reduce((sum, a) => sum + a.estimatedMinutes, 0),
    });
  }

  return days;
}

/** Fallback: build plan from raw milestones (no mini_milestones yet). */
function buildFromMilestones(
  milestones: any[],
  planStartDate: string,
  weekDates: string[],
  phaseLabel: string,
  phaseNumber: number,
  generating: boolean,
  weekStart: string,
  weekEnd: string,
): WeeklyPlan {
  // Each milestone gets a synthetic scheduled_day based on its position in the phase
  // Phase N starts at day (N-1)*10 + 1. Distribute milestones evenly across 10 days.
  const phaseStartDay = (phaseNumber - 1) * 10 + 1;
  const milestonesPerDay = Math.max(1, Math.ceil(milestones.length / 10));

  const actions: TacticalAction[] = milestones.map((m, idx) => {
    const dayOffset = Math.floor(idx / milestonesPerDay);
    const absDay = phaseStartDay + dayOffset;
    const calendarDate = planDayToDate(planStartDate, absDay);
    const cadence = classifyCadence(m.title, null, null);
    const blockCat = classifyBlockCategory(null, null, m.title);

    return {
      id: m.id,
      title: m.title,
      titleEn: m.title_en,
      description: m.description,
      descriptionEn: m.description_en,
      sourceMilestoneId: m.id,
      executionTemplate: null,
      actionType: null,
      estimatedMinutes: 15,
      cadence,
      completed: m.is_completed,
      completedAt: m.completed_at,
      xpReward: m.xp_reward || 10,
      blockCategory: blockCat,
      scheduledDay: absDay,
      calendarDate,
    };
  });

  // Filter to current week
  const weekActions = actions.filter(a =>
    a.calendarDate && a.calendarDate >= weekStart && a.calendarDate <= weekEnd
  );

  const dayMap = new Map<number, TacticalAction[]>();
  for (let d = 0; d < 7; d++) dayMap.set(d, []);

  for (const action of weekActions) {
    if (action.calendarDate) {
      const dow = new Date(action.calendarDate + 'T12:00:00').getDay();
      dayMap.get(dow)!.push(action);
    }
  }

  const days = buildDayPlans(dayMap, weekDates);

  return {
    phase: phaseLabel,
    phaseNumber,
    days,
    totalActions: weekActions.length,
    completedActions: weekActions.filter(a => a.completed).length,
    totalMinutes: days.reduce((s, d) => s + d.totalMinutes, 0),
    generating,
    weekStart,
    weekEnd,
  };
}
