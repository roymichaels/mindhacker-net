/**
 * useWeeklyTacticalPlan — Transforms mini_milestones into a structured weekly plan.
 * 
 * Pipeline: milestones → mini_milestones → classify cadence → distribute into days → render
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
  scheduledDay: number | null;
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

// ── Cadence Classification ──

export function classifyCadence(
  title: string,
  actionType: string | null,
  executionTemplate: string | null,
): Cadence {
  const combined = `${title} ${actionType || ''} ${executionTemplate || ''}`.toLowerCase();

  // Daily patterns: breathing, posture, meditation, journaling, morning routine
  if (/נשימ|יציב|מדיטציה|breath|posture|meditation|journal|morning|anchor|עוגן|מיינדפול|mindful|daily|יומי/.test(combined)) {
    return 'daily';
  }
  // 3x/week: strength, combat, sparring, workout, training
  if (/אימון|כוח|לחימה|sparring|combat|strength|workout|hiit|calisthen|training|shadow/.test(combined)) {
    return '3x_per_week';
  }
  // 2x/week: deep work, content creation, study
  if (/עבודה עמוקה|deep.?work|content|creation|study|למידה|sprint/.test(combined)) {
    return '2x_per_week';
  }
  // Weekly: review, audit, mapping, analysis
  if (/סקירה|review|audit|מיפוי|mapping|analysis|ניתוח|שבוע|weekly/.test(combined)) {
    return 'weekly';
  }
  // One-time: build, setup, publish, launch, create
  if (/הקמ|setup|publish|launch|פרסום|build|בנייה|one.?time|חד.?פעמי/.test(combined)) {
    return 'one_time';
  }

  // Default based on execution template
  if (executionTemplate === 'tts_guided' || executionTemplate === 'step_by_step') return 'daily';
  if (executionTemplate === 'sets_reps_timer' || executionTemplate === 'video_embed') return '3x_per_week';
  if (executionTemplate === 'timer_focus') return '2x_per_week';
  if (executionTemplate === 'social_checklist') return 'weekly';

  return '3x_per_week'; // fallback
}

export function classifyBlockCategory(
  actionType: string | null,
  executionTemplate: string | null,
  title: string,
): BlockCategory {
  const combined = `${title} ${actionType || ''} ${executionTemplate || ''}`.toLowerCase();

  if (/נשימ|breath|posture|יציב|health|בריאות|nutrition|תזונ|sleep|שינה|skin|עור/.test(combined)) return 'health';
  if (/אימון|combat|strength|כוח|shadow|boxing|hiit|training|לחימה|workout/.test(combined)) return 'training';
  if (/מדיטציה|meditation|focus|פוקוס|deep.?work|עמוקה|timer_focus/.test(combined)) return 'focus';
  if (/יצירה|creation|content|build|בנייה|publish|פרסום/.test(combined)) return 'creation';
  if (/סקירה|review|audit|ניתוח|analysis|מיפוי|mapping/.test(combined)) return 'review';
  if (/social|חברת|relation|קשר|networking|outreach|dating/.test(combined)) return 'social';

  return 'action';
}

function estimateMinutes(executionTemplate: string | null, actionType: string | null): number {
  if (executionTemplate === 'tts_guided') return 10;
  if (executionTemplate === 'sets_reps_timer') return 25;
  if (executionTemplate === 'video_embed') return 20;
  if (executionTemplate === 'timer_focus') return 30;
  if (executionTemplate === 'social_checklist') return 15;
  if (executionTemplate === 'step_by_step') return 10;
  return 15;
}

// ── Distribution Logic ──

const CADENCE_DAYS: Record<Cadence, number[]> = {
  daily:        [0, 1, 2, 3, 4, 5, 6],
  '3x_per_week': [0, 2, 4],      // Sun, Tue, Thu
  '2x_per_week': [1, 3],          // Mon, Wed
  weekly:       [4],              // Thursday
  one_time:     [0],              // Sunday (first occurrence)
};

function distributeActions(actions: TacticalAction[]): Map<number, TacticalAction[]> {
  const dayMap = new Map<number, TacticalAction[]>();
  for (let d = 0; d < 7; d++) dayMap.set(d, []);

  // Track load per day for balancing
  const dayLoad = new Array(7).fill(0);

  for (const action of actions) {
    // If the action has a scheduled_day from the DB, respect it
    if (action.scheduledDay !== null && action.scheduledDay >= 0 && action.scheduledDay <= 6) {
      dayMap.get(action.scheduledDay)!.push(action);
      dayLoad[action.scheduledDay] += action.estimatedMinutes;
      continue;
    }

    const cadenceDays = CADENCE_DAYS[action.cadence];

    if (action.cadence === 'daily') {
      // Add to all days
      for (const d of cadenceDays) {
        dayMap.get(d)!.push(action);
        dayLoad[d] += action.estimatedMinutes;
      }
    } else {
      // For non-daily, pick the least-loaded days from the cadence pattern
      const sortedCadenceDays = [...cadenceDays].sort((a, b) => dayLoad[a] - dayLoad[b]);
      for (const d of sortedCadenceDays) {
        dayMap.get(d)!.push(action);
        dayLoad[d] += action.estimatedMinutes;
      }
    }
  }

  return dayMap;
}

function groupIntoBlocks(actions: TacticalAction[]): TacticalBlock[] {
  const categoryGroups = new Map<BlockCategory, TacticalAction[]>();

  for (const action of actions) {
    const existing = categoryGroups.get(action.blockCategory) || [];
    existing.push(action);
    categoryGroups.set(action.blockCategory, existing);
  }

  // Sort blocks by category priority: health → training → focus → action → creation → review → social
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

  // Fetch mini_milestones for all current phase milestones
  const { data: miniMilestones, isLoading } = useQuery({
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

    if (!miniMilestones || miniMilestones.length === 0) {
      // Fallback: if no mini_milestones yet, create tactical actions from milestones directly
      const fallbackActions: TacticalAction[] = currentPhaseMilestones.map(m => {
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
          scheduledDay: null,
        };
      });

      const dayMap = distributeActions(fallbackActions);
      const days = buildDayPlans(dayMap);

      return {
        phase: phaseLabel,
        phaseNumber: currentPhase || 1,
        days,
        totalActions: fallbackActions.length,
        completedActions: fallbackActions.filter(a => a.completed).length,
        totalMinutes: days.reduce((s, d) => s + d.totalMinutes, 0),
        generating,
      };
    }

    // Transform mini_milestones into TacticalActions
    const actions: TacticalAction[] = miniMilestones.map(mm => {
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
      };
    });

    const dayMap = distributeActions(actions);
    const days = buildDayPlans(dayMap);
    const uniqueActions = new Set(actions.map(a => a.id));

    return {
      phase: phaseLabel,
      phaseNumber: currentPhase || 1,
      days,
      totalActions: uniqueActions.size,
      completedActions: actions.filter(a => a.completed).length,
      totalMinutes: days.reduce((s, d) => s + d.totalMinutes, 0),
      generating,
    };
  }, [miniMilestones, currentPhaseMilestones, currentPhase, generating]);

  return { ...weeklyPlan, isLoading };
}

function buildDayPlans(dayMap: Map<number, TacticalAction[]>): DayPlan[] {
  const days: DayPlan[] = [];

  for (let d = 0; d < 7; d++) {
    const actions = dayMap.get(d) || [];
    const blocks = groupIntoBlocks(actions);

    days.push({
      dayKey: DAY_KEYS[d],
      dayIndex: d,
      label: DAY_LABELS_HE[d],
      labelEn: DAY_LABELS_EN[d],
      blocks,
      totalActions: actions.length,
      completedActions: actions.filter(a => a.completed).length,
      totalMinutes: actions.reduce((sum, a) => sum + a.estimatedMinutes, 0),
    });
  }

  return days;
}
