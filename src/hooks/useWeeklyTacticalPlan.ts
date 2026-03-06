/**
 * useWeeklyTacticalPlan — Transforms life_plan_milestones (strategy milestones)
 * into a 10-day phase plan.
 *
 * Each milestone is a "Standing Order" (e.g. "3x/week HIIT sprints").
 * It appears ONCE in the 10-day phase, load-balanced across days so
 * every day has roughly equal workload.
 */
import { useMemo } from 'react';
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
  scheduledDay: number | null;
  calendarDate: string | null;
  focusArea: string | null;
  missionId: string | null;
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
  date: string;
  dayNumber: number;
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

const DIFFICULTY_XP: Record<Difficulty, number> = { easy: 5, medium: 10, hard: 15 };

// ── Helpers ──

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function planDayToDate(planStartDate: string, scheduledDay: number): string {
  const start = new Date(planStartDate);
  start.setHours(0, 0, 0, 0);
  const target = new Date(start);
  target.setDate(start.getDate() + (scheduledDay - 1));
  return toDateStr(target);
}

function getPhaseWindow(planStartDate: string, phaseNumber: number) {
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

export function classifyCadence(title: string, actionType: string | null, executionTemplate: string | null): Cadence {
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

export function classifyBlockCategory(actionType: string | null, executionTemplate: string | null, title: string, focusArea?: string | null): BlockCategory {
  const combined = `${title} ${actionType || ''} ${executionTemplate || ''} ${focusArea || ''}`.toLowerCase();
  if (/נשימ|breath|posture|יציב|health|בריאות|nutrition|תזונ|sleep|שינה|skin|עור|body.?scan|סריקת/.test(combined)) return 'health';
  if (/אימון|combat|strength|כוח|shadow|boxing|hiit|training|לחימה|workout|חסימ|מכות|physical|פיזי/.test(combined)) return 'training';
  if (/מדיטציה|meditation|focus|פוקוס|deep.?work|עמוקה|timer_focus|ויזואליז|consciousness|תודע/.test(combined)) return 'focus';
  if (/יצירה|creation|content|build|בנייה|publish|פרסום|business|עסק/.test(combined)) return 'creation';
  if (/סקירה|review|audit|ניתוח|analysis|מיפוי|mapping/.test(combined)) return 'review';
  if (/social|חברת|relation|קשר|networking|outreach|dating|communication|תקשורת/.test(combined)) return 'social';
  return 'action';
}

function classifyDifficulty(milestone: any): Difficulty {
  const title = `${milestone.title || ''} ${milestone.title_en || ''}`.toLowerCase();
  if (/master|intense|advanced|complex|deep|sprint|hard|קשה|עמוק|מתקדם/.test(title)) return 'hard';
  if (/basic|simple|routine|habit|anchor|begin|easy|קל|בסיסי|הרגל/.test(title)) return 'easy';
  return 'medium';
}

function estimateMinutes(focusArea: string | null, title: string): number {
  const combined = `${title} ${focusArea || ''}`.toLowerCase();
  if (/נשימ|breath|meditation|מדיטציה|mindful|anchor/.test(combined)) return 10;
  if (/אימון|combat|strength|workout|training|hiit/.test(combined)) return 25;
  if (/deep.?work|עמוקה|sprint|content|creation/.test(combined)) return 30;
  if (/review|סקירה|audit|analysis/.test(combined)) return 15;
  if (/social|networking|relation/.test(combined)) return 15;
  return 15;
}

function inferExecutionTemplate(title: string, focusArea: string | null): string | null {
  const combined = `${title} ${focusArea || ''}`.toLowerCase();
  if (/נשימ|breath|meditation|מדיטציה|body.?scan|visuali|mindful|relaxation|הרפיה/.test(combined)) return 'tts_guided';
  if (/yoga|tai.?chi|qigong|pilates|stretching|mobility|יוגה/.test(combined)) return 'video_embed';
  if (/combat|shadow|boxing|strength|hiit|calisthen|push.?up|squat|אימון|כוח|לחימה/.test(combined)) return 'sets_reps_timer';
  if (/deep.?work|business|project|sprint|study|content|עמוקה|עסק|למידה/.test(combined)) return 'timer_focus';
  if (/social|networking|relation|outreach|dating|חברת|קשר/.test(combined)) return 'social_checklist';
  return 'step_by_step';
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

// ── Load-balanced distribution (each milestone appears ONCE) ──

/**
 * Each milestone is a Standing Order — it appears exactly once in the
 * 10-day phase, assigned to the least-loaded day for even balance.
 */
function distributeMilestonesToDays(
  milestones: any[],
  planStartDate: string,
  phaseNumber: number,
): TacticalAction[] {
  const phaseStartDay = (phaseNumber - 1) * 10 + 1;

  const items = milestones.map(m => {
    const title = m.title || '';
    const focusArea = m.focus_area || null;
    return {
      raw: m,
      title,
      titleEn: m.title_en || title,
      focusArea,
      blockCat: classifyBlockCategory(null, null, title, focusArea),
      difficulty: classifyDifficulty(m),
      mins: estimateMinutes(focusArea, title),
      execTemplate: inferExecutionTemplate(title, focusArea),
    };
  });

  // Sort heaviest first for better balance
  items.sort((a, b) => b.mins - a.mins);

  const dayLoad = new Array(10).fill(0);
  const actions: TacticalAction[] = [];

  for (const mm of items) {
    // Pick day with lowest load
    let bestDay = 0;
    for (let d = 1; d < 10; d++) {
      if (dayLoad[d] < dayLoad[bestDay]) bestDay = d;
    }

    dayLoad[bestDay] += mm.mins;
    const absDay = phaseStartDay + bestDay;
    const calendarDate = planDayToDate(planStartDate, absDay);

    actions.push({
      id: `${mm.raw.id}-d${bestDay}`,
      title: mm.title,
      titleEn: mm.titleEn,
      description: mm.raw.description || null,
      descriptionEn: mm.raw.description_en || null,
      sourceMilestoneId: mm.raw.id,
      executionTemplate: mm.execTemplate,
      actionType: mm.raw.focus_area || null,
      estimatedMinutes: mm.mins,
      cadence: classifyCadence(mm.title, null, null),
      completed: false,
      completedAt: null,
      xpReward: DIFFICULTY_XP[mm.difficulty],
      blockCategory: mm.blockCat,
      difficulty: mm.difficulty,
      scheduledDay: absDay,
      calendarDate,
      focusArea: mm.focusArea,
      missionId: mm.raw.mission_id || null,
    });
  }

  return actions;
}

// ── Hook ──

export function useWeeklyTacticalPlan(): PhasePlan & { isLoading: boolean } {
  const { user } = useAuth();
  const { milestones, currentWeek: currentPhase, plan, isLoading: planLoading } = useLifePlanWithMilestones();
  const { generating } = usePhaseActions();

  const planStartDate = plan?.start_date || null;

  const currentPhaseMilestones = useMemo(
    () => milestones.filter(m => m.week_number === currentPhase),
    [milestones, currentPhase]
  );

  const { phaseDates, phaseStart, phaseEnd } = useMemo(() => {
    if (!planStartDate) return { phaseDates: [], phaseStart: '', phaseEnd: '' };
    const { dates, start, end } = getPhaseWindow(planStartDate, currentPhase || 1);
    return { phaseDates: dates, phaseStart: start, phaseEnd: end };
  }, [planStartDate, currentPhase]);

  const todayStr = useMemo(() => toDateStr(new Date()), []);

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

    if (!planStartDate || phaseDates.length === 0 || currentPhaseMilestones.length === 0) return emptyPlan;

    const allActions = distributeMilestonesToDays(currentPhaseMilestones, planStartDate, currentPhase || 1);

    // Assign to day slots
    const dayMap = new Map<number, TacticalAction[]>();
    for (let d = 0; d < 10; d++) dayMap.set(d, []);

    for (const action of allActions) {
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
      totalActions: allActions.length,
      completedActions: allActions.filter(a => a.completed).length,
      totalMinutes: days.reduce((s, d) => s + d.totalMinutes, 0),
      generating,
      phaseStart,
      phaseEnd,
    };
  }, [currentPhaseMilestones, currentPhase, generating, planStartDate, phaseDates, phaseStart, phaseEnd, todayStr]);

  return { ...phasePlan, isLoading: planLoading };
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
