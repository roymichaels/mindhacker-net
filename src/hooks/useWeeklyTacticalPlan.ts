/**
 * useWeeklyTacticalPlan — Transforms life_plan_milestones (strategy milestones)
 * into a 10-day phase plan.
 *
 * Each mission has ~5 milestones. These are distributed across the 10-day phase
 * window based on cadence classification, so every day has missions to execute.
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
  /** Absolute plan day (1-100) */
  scheduledDay: number | null;
  /** Resolved calendar date YYYY-MM-DD */
  calendarDate: string | null;
  /** Focus area / pillar from strategy */
  focusArea: string | null;
  /** Mission ID for lineage */
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
  focusArea?: string | null,
): BlockCategory {
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
  // Infer difficulty from milestone position and focus area
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

// ── Cadence → day distribution ──

/** Distribute milestones across 10 days based on cadence */
function distributeMilestonesToDays(
  milestones: any[],
  planStartDate: string,
  phaseNumber: number,
  phaseDates: string[],
): TacticalAction[] {
  const phaseStartDay = (phaseNumber - 1) * 10 + 1;
  const actions: TacticalAction[] = [];

  for (const m of milestones) {
    const title = m.title || '';
    const titleEn = m.title_en || title;
    const focusArea = m.focus_area || null;
    const cadence = classifyCadence(title, null, null);
    const blockCat = classifyBlockCategory(null, null, title, focusArea);
    const difficulty = classifyDifficulty(m);
    const mins = estimateMinutes(focusArea, title);
    const execTemplate = inferExecutionTemplate(title, focusArea);

    // Calculate which days this milestone appears on based on cadence
    let dayIndices: number[] = [];
    
    switch (cadence) {
      case 'daily':
        dayIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        break;
      case '3x_per_week':
        // 3 times per 7 days ≈ every ~2.3 days → days 0, 2, 4, 6, 8
        dayIndices = [0, 2, 4, 6, 8];
        break;
      case '2x_per_week':
        // 2 times per 7 days ≈ every 3.5 days → days 0, 3, 6, 9
        dayIndices = [0, 3, 6, 9];
        break;
      case 'weekly':
        // Once per week → day 2 and day 7
        dayIndices = [2, 7];
        break;
      case 'one_time':
        // Single occurrence → day 4 (mid-phase)
        dayIndices = [4];
        break;
    }

    for (const dayIdx of dayIndices) {
      const absDay = phaseStartDay + dayIdx;
      const calendarDate = planDayToDate(planStartDate, absDay);
      
      actions.push({
        id: `${m.id}-d${dayIdx}`,
        title,
        titleEn,
        description: m.description || null,
        descriptionEn: m.description_en || null,
        sourceMilestoneId: m.id,
        executionTemplate: execTemplate,
        actionType: m.focus_area || null,
        estimatedMinutes: mins,
        cadence,
        completed: false, // Per-day completion tracked separately
        completedAt: null,
        xpReward: DIFFICULTY_XP[difficulty],
        blockCategory: blockCat,
        difficulty,
        scheduledDay: absDay,
        calendarDate,
        focusArea,
        missionId: m.mission_id || null,
      });
    }
  }

  return actions;
}

// ── Hook ──

export function useWeeklyTacticalPlan(): PhasePlan & { isLoading: boolean } {
  const { user } = useAuth();
  const { milestones, currentWeek: currentPhase, plan, isLoading: planLoading } = useLifePlanWithMilestones();
  const { generating } = usePhaseActions();

  const planStartDate = plan?.start_date || null;

  // Current phase milestones (the 5 milestones per mission from strategy)
  const currentPhaseMilestones = useMemo(
    () => milestones.filter(m => m.week_number === currentPhase),
    [milestones, currentPhase]
  );

  // 10-day phase window
  const { phaseDates, phaseStart, phaseEnd } = useMemo(() => {
    if (!planStartDate) return { phaseDates: [], phaseStart: '', phaseEnd: '' };
    const { dates, start, end } = getPhaseWindow(planStartDate, currentPhase || 1);
    return { phaseDates: dates, phaseStart: start, phaseEnd: end };
  }, [planStartDate, currentPhase]);

  const todayStr = useMemo(() => toDateStr(new Date()), []);

  // Build the 10-day phase plan from strategy milestones
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

    // Distribute strategy milestones across the 10-day phase
    const allActions = distributeMilestonesToDays(
      currentPhaseMilestones,
      planStartDate,
      currentPhase || 1,
      phaseDates,
    );

    // Filter to phase window
    const phaseActions = allActions.filter(a =>
      a.calendarDate && a.calendarDate >= phaseStart && a.calendarDate <= phaseEnd
    );

    // Assign to day index
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
