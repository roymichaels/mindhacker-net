/**
 * useWeeklyTacticalPlan — Transforms mini_milestones into a 10-day phase plan.
 *
 * Pipeline:
 *   milestones → mini_milestones → map scheduled_day to calendar date
 *   → filter to current 10-day phase window → assign day index → group into blocks → render
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
export type Difficulty = 'easy' | 'medium' | 'hard';

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
  difficulty: Difficulty;
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
  dayIndex: number;
  label: string;
  labelEn: string;
  date: string; // YYYY-MM-DD
  dayNumber: number; // 1-10 within phase
  blocks: TacticalBlock[];
  totalActions: number;
  completedActions: number;
  totalMinutes: number;
  isToday: boolean;
}

export interface PhasePlan {
  phase: string;
  phaseNumber: number;
  days: DayPlan[];
  totalActions: number;
  completedActions: number;
  totalMinutes: number;
  generating: boolean;
  phaseStart: string;
  phaseEnd: string;
}

// ── Constants ──

const BLOCK_LABELS: Record<BlockCategory, { he: string; en: string }> = {
  health:   { he: 'בריאות ויציבה', en: 'Health & Posture' },
  training: { he: 'אימון ותנועה', en: 'Training & Movement' },
  focus:    { he: 'פוקוס ועבודה עמוקה', en: 'Focus & Deep Work' },
  action:   { he: 'ביצוע ומשימות', en: 'Execution & Tasks' },
  creation: { he: 'יצירה ובנייה', en: 'Creation & Building' },
  review:   { he: 'סקירה וניתוח', en: 'Review & Analysis' },
  social:   { he: 'חברתי ומערכות יחסים', en: 'Social & Relationships' },
};

const DIFFICULTY_XP: Record<Difficulty, number> = {
  easy: 5,
  medium: 10,
  hard: 15,
};

// ── Helpers ──

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

/** Get the 10-day phase window dates from plan start. */
function getPhaseWindow(planStartDate: string, phaseNumber: number): { dates: string[]; start: string; end: string } {
  const planStart = new Date(planStartDate);
  planStart.setHours(0, 0, 0, 0);
  const phaseStartDay = (phaseNumber - 1) * 10 + 1;
  const dates: string[] = [];
  for (let i = 0; i < 10; i++) {
    const d = new Date(planStart);
    d.setDate(planStart.getDate() + (phaseStartDay - 1) + i);
    dates.push(toDateStr(d));
  }
  return { dates, start: dates[0], end: dates[9] };
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

function classifyDifficulty(raw: string | null): Difficulty {
  if (raw === 'easy' || raw === 'medium' || raw === 'hard') return raw;
  return 'medium';
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

export function useWeeklyTacticalPlan(): PhasePlan & { isLoading: boolean } {
  const { user } = useAuth();
  const { milestones, currentWeek: currentPhase, plan } = useLifePlanWithMilestones();
  const { generating } = usePhaseActions();

  const planStartDate = plan?.start_date || null;

  // Current phase milestones
  const currentPhaseMilestones = useMemo(
    () => milestones.filter(m => m.week_number === currentPhase),
    [milestones, currentPhase]
  );

  const milestoneIds = useMemo(
    () => currentPhaseMilestones.map(m => m.id),
    [currentPhaseMilestones]
  );

  // 10-day phase window
  const { phaseDates, phaseStart, phaseEnd } = useMemo(() => {
    if (!planStartDate) return { phaseDates: [], phaseStart: '', phaseEnd: '' };
    const { dates, start, end } = getPhaseWindow(planStartDate, currentPhase || 1);
    return { phaseDates: dates, phaseStart: start, phaseEnd: end };
  }, [planStartDate, currentPhase]);

  const todayStr = useMemo(() => toDateStr(new Date()), []);

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

  // Build the 10-day phase plan
  const phasePlan = useMemo((): PhasePlan => {
    const phaseLabel = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'][(currentPhase || 1) - 1] || '?';
    const emptyPlan: PhasePlan = {
      phase: phaseLabel,
      phaseNumber: currentPhase || 1,
      days: buildEmptyDays(phaseDates, todayStr),
      totalActions: 0,
      completedActions: 0,
      totalMinutes: 0,
      generating,
      phaseStart,
      phaseEnd,
    };

    if (!planStartDate || phaseDates.length === 0) return emptyPlan;

    const source = allMiniMilestones && allMiniMilestones.length > 0
      ? allMiniMilestones
      : null;

    if (!source) {
      if (currentPhaseMilestones.length === 0) return emptyPlan;
      return buildFromMilestones(currentPhaseMilestones, planStartDate, phaseDates, phaseLabel, currentPhase || 1, generating, phaseStart, phaseEnd, todayStr);
    }

    // ── Main path: convert mini_milestones to TacticalActions with real dates ──
    const actions: TacticalAction[] = source.map(mm => {
      const calendarDate = mm.scheduled_day ? planDayToDate(planStartDate, mm.scheduled_day) : null;
      const cadence = classifyCadence(mm.title, mm.action_type, mm.execution_template);
      const blockCat = classifyBlockCategory(mm.action_type, mm.execution_template, mm.title);
      const mins = estimateMinutes(mm.execution_template, mm.action_type);
      const difficulty = classifyDifficulty((mm as any).difficulty || null);

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
        xpReward: DIFFICULTY_XP[difficulty],
        blockCategory: blockCat,
        difficulty,
        scheduledDay: mm.scheduled_day,
        calendarDate,
      };
    });

    // ── Filter to only actions in this 10-day phase ──
    const phaseActions = actions.filter(a => {
      if (!a.calendarDate) return false;
      return a.calendarDate >= phaseStart && a.calendarDate <= phaseEnd;
    });

    // ── Assign to day index based on calendar date ──
    const dayMap = new Map<number, TacticalAction[]>();
    for (let d = 0; d < 10; d++) dayMap.set(d, []);

    for (const action of phaseActions) {
      if (action.calendarDate) {
        const idx = phaseDates.indexOf(action.calendarDate);
        if (idx >= 0) dayMap.get(idx)!.push(action);
      }
    }

    const days = buildDayPlans(dayMap, phaseDates, todayStr);

    return {
      phase: phaseLabel,
      phaseNumber: currentPhase || 1,
      days,
      totalActions: phaseActions.length,
      completedActions: phaseActions.filter(a => a.completed).length,
      totalMinutes: days.reduce((s, d) => s + d.totalMinutes, 0),
      generating,
      phaseStart,
      phaseEnd,
    };
  }, [allMiniMilestones, currentPhaseMilestones, currentPhase, generating, planStartDate, phaseDates, phaseStart, phaseEnd, todayStr]);

  return { ...phasePlan, isLoading };
}

// ── Build helpers ──

function buildEmptyDays(phaseDates: string[], todayStr: string): DayPlan[] {
  return phaseDates.map((date, i) => ({
    dayIndex: i,
    label: `יום ${i + 1}`,
    labelEn: `Day ${i + 1}`,
    date,
    dayNumber: i + 1,
    blocks: [],
    totalActions: 0,
    completedActions: 0,
    totalMinutes: 0,
    isToday: date === todayStr,
  }));
}

function buildDayPlans(dayMap: Map<number, TacticalAction[]>, phaseDates: string[], todayStr: string): DayPlan[] {
  const days: DayPlan[] = [];

  for (let d = 0; d < 10; d++) {
    const actions = dayMap.get(d) || [];
    const blocks = groupIntoBlocks(actions);
    const date = phaseDates[d] || '';

    days.push({
      dayIndex: d,
      label: `יום ${d + 1}`,
      labelEn: `Day ${d + 1}`,
      date,
      dayNumber: d + 1,
      blocks,
      totalActions: actions.length,
      completedActions: actions.filter(a => a.completed).length,
      totalMinutes: actions.reduce((sum, a) => sum + a.estimatedMinutes, 0),
      isToday: date === todayStr,
    });
  }

  return days;
}

/** Fallback: build plan from raw milestones (no mini_milestones yet). */
function buildFromMilestones(
  milestones: any[],
  planStartDate: string,
  phaseDates: string[],
  phaseLabel: string,
  phaseNumber: number,
  generating: boolean,
  phaseStart: string,
  phaseEnd: string,
  todayStr: string,
): PhasePlan {
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
      xpReward: DIFFICULTY_XP['medium'],
      blockCategory: blockCat,
      difficulty: 'medium' as Difficulty,
      scheduledDay: absDay,
      calendarDate,
    };
  });

  const phaseActions = actions.filter(a =>
    a.calendarDate && a.calendarDate >= phaseStart && a.calendarDate <= phaseEnd
  );

  const dayMap = new Map<number, TacticalAction[]>();
  for (let d = 0; d < 10; d++) dayMap.set(d, []);

  for (const action of phaseActions) {
    if (action.calendarDate) {
      const idx = phaseDates.indexOf(action.calendarDate);
      if (idx >= 0) dayMap.get(idx)!.push(action);
    }
  }

  const days = buildDayPlans(dayMap, phaseDates, todayStr);

  return {
    phase: phaseLabel,
    phaseNumber,
    days,
    totalActions: phaseActions.length,
    completedActions: phaseActions.filter(a => a.completed).length,
    totalMinutes: days.reduce((s, d) => s + d.totalMinutes, 0),
    generating,
    phaseStart,
    phaseEnd,
  };
}
