/**
 * useWeeklyTacticalPlan — Consumes AI-generated tactical schedules from
 * the tactical_schedules table. Falls back to local distribution if no
 * AI schedule exists yet.
 *
 * The schedule is a 10-day plan with fixed time blocks (e.g., 06:30-06:45).
 * Each block references a milestone and includes execution metadata.
 */
import { useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  sourceMilestoneId: string | null;
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
  /** Time block start (HH:MM) */
  startTime: string | null;
  /** Time block end (HH:MM) */
  endTime: string | null;
}

export interface TacticalBlock {
  id: string;
  title: string;
  titleEn: string;
  category: BlockCategory;
  estimatedMinutes: number;
  actions: TacticalAction[];
  completedCount: number;
  startTime: string | null;
  endTime: string | null;
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
  hasAiSchedule: boolean;
  wakeTime: string;
  sleepTime: string;
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

function validCategory(cat: string): BlockCategory {
  const valid: BlockCategory[] = ['health', 'training', 'focus', 'action', 'creation', 'review', 'social'];
  return valid.includes(cat as BlockCategory) ? (cat as BlockCategory) : 'action';
}

function validDifficulty(d: string): Difficulty {
  return ['easy', 'medium', 'hard'].includes(d) ? (d as Difficulty) : 'medium';
}

const DIFFICULTY_XP: Record<Difficulty, number> = { easy: 5, medium: 10, hard: 15 };

// ── Parse AI schedule into DayPlans ──

function parseAiSchedule(
  scheduleDays: any[],
  phaseDates: string[],
  todayStr: string,
  phaseNumber: number,
  planStartDate: string,
): DayPlan[] {
  const days: DayPlan[] = [];
  const phaseStartDay = (phaseNumber - 1) * 10 + 1;

  for (let d = 0; d < 10; d++) {
    const aiDay = scheduleDays.find((sd: any) => sd.day_number === d + 1) || scheduleDays[d];
    const date = phaseDates[d] || '';
    const absDay = phaseStartDay + d;

    if (!aiDay || !aiDay.blocks || aiDay.blocks.length === 0) {
      days.push({
        dayIndex: d, label: `יום ${d + 1}`, labelEn: `Day ${d + 1}`,
        date, dayNumber: d + 1, blocks: [], totalActions: 0,
        completedActions: 0, totalMinutes: 0, isToday: date === todayStr,
      });
      continue;
    }

    // Convert AI blocks into TacticalBlocks (each AI block = one action in one block)
    const actions: TacticalAction[] = aiDay.blocks.map((b: any, idx: number) => ({
      id: `ai-${d}-${idx}-${b.milestone_id || 'gen'}`,
      title: b.title_he || b.title_en || 'משימה',
      titleEn: b.title_en || b.title_he || 'Task',
      description: null,
      descriptionEn: null,
      sourceMilestoneId: b.milestone_id || null,
      executionTemplate: b.execution_template || 'step_by_step',
      actionType: b.category || null,
      estimatedMinutes: b.estimated_minutes || 15,
      cadence: 'daily' as Cadence,
      completed: false,
      completedAt: null,
      xpReward: b.xp_reward || DIFFICULTY_XP[validDifficulty(b.difficulty)] || 10,
      blockCategory: validCategory(b.category),
      difficulty: validDifficulty(b.difficulty),
      scheduledDay: absDay,
      calendarDate: date,
      focusArea: b.category || null,
      missionId: null,
      startTime: b.start_time || null,
      endTime: b.end_time || null,
    }));

    // Group actions by time slot into blocks — each action IS its own time block
    const blocks: TacticalBlock[] = actions.map((action: TacticalAction) => {
      const label = BLOCK_LABELS[action.blockCategory] || BLOCK_LABELS.action;
      return {
        id: `tblock-${d}-${action.id}`,
        title: label.he,
        titleEn: label.en,
        category: action.blockCategory,
        estimatedMinutes: action.estimatedMinutes,
        actions: [action],
        completedCount: action.completed ? 1 : 0,
        startTime: action.startTime,
        endTime: action.endTime,
      };
    });

    days.push({
      dayIndex: d,
      label: `יום ${d + 1}`,
      labelEn: `Day ${d + 1}`,
      date,
      dayNumber: d + 1,
      blocks,
      totalActions: actions.length,
      completedActions: actions.filter(a => a.completed).length,
      totalMinutes: aiDay.total_minutes || actions.reduce((s: number, a: TacticalAction) => s + a.estimatedMinutes, 0),
      isToday: date === todayStr,
    });
  }

  return days;
}

// ── Fallback: simple distribution (no AI schedule yet) ──

function buildFallbackDays(
  milestones: any[],
  phaseDates: string[],
  todayStr: string,
  phaseNumber: number,
  planStartDate: string,
): DayPlan[] {
  const phaseStartDay = (phaseNumber - 1) * 10 + 1;
  const dayLoad = new Array(10).fill(0);
  const dayActions: TacticalAction[][] = Array.from({ length: 10 }, () => []);

  // Sort heaviest first
  const items = milestones.map(m => ({
    raw: m,
    mins: 15,
    blockCat: 'action' as BlockCategory,
  }));
  items.sort((a, b) => b.mins - a.mins);

  for (const mm of items) {
    let bestDay = 0;
    for (let d = 1; d < 10; d++) {
      if (dayLoad[d] < dayLoad[bestDay]) bestDay = d;
    }
    dayLoad[bestDay] += mm.mins;
    const absDay = phaseStartDay + bestDay;
    dayActions[bestDay].push({
      id: `${mm.raw.id}-d${bestDay}`,
      title: mm.raw.title || '',
      titleEn: mm.raw.title_en || mm.raw.title || '',
      description: mm.raw.description || null,
      descriptionEn: mm.raw.description_en || null,
      sourceMilestoneId: mm.raw.id,
      executionTemplate: 'step_by_step',
      actionType: mm.raw.focus_area || null,
      estimatedMinutes: mm.mins,
      cadence: 'daily',
      completed: false,
      completedAt: null,
      xpReward: 10,
      blockCategory: mm.blockCat,
      difficulty: 'medium',
      scheduledDay: absDay,
      calendarDate: phaseDates[bestDay] || '',
      focusArea: mm.raw.focus_area || null,
      missionId: mm.raw.mission_id || null,
      startTime: null,
      endTime: null,
    });
  }

  return phaseDates.map((date, d) => {
    const actions = dayActions[d];
    const blocks: TacticalBlock[] = actions.length > 0 ? [{
      id: `fallback-block-${d}`,
      title: BLOCK_LABELS.action.he,
      titleEn: BLOCK_LABELS.action.en,
      category: 'action',
      estimatedMinutes: actions.reduce((s, a) => s + a.estimatedMinutes, 0),
      actions,
      completedCount: 0,
      startTime: null,
      endTime: null,
    }] : [];

    return {
      dayIndex: d, label: `יום ${d + 1}`, labelEn: `Day ${d + 1}`,
      date, dayNumber: d + 1, blocks,
      totalActions: actions.length,
      completedActions: 0,
      totalMinutes: actions.reduce((s, a) => s + a.estimatedMinutes, 0),
      isToday: date === todayStr,
    };
  });
}

// ── Hook ──

export function useWeeklyTacticalPlan(): PhasePlan & { isLoading: boolean; generateSchedule: () => Promise<void>; isGenerating: boolean } {
  const { user } = useAuth();
  const { milestones, currentWeek: currentPhase, plan, isLoading: planLoading } = useLifePlanWithMilestones();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const planId = plan?.id || null;
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

  // Fetch AI-generated schedule
  const { data: aiSchedule, isLoading: scheduleLoading } = useQuery({
    queryKey: ['tactical-schedule', planId, currentPhase],
    queryFn: async () => {
      if (!planId || !currentPhase || !user?.id) return null;
      const { data, error } = await supabase
        .from('tactical_schedules')
        .select('schedule_data, wake_time, sleep_time, version, generated_at')
        .eq('user_id', user.id)
        .eq('plan_id', planId)
        .eq('phase_number', currentPhase)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!planId && !!currentPhase && !!user?.id,
    staleTime: 5 * 60_000,
  });

  // Generate schedule function
  const generateSchedule = useCallback(async () => {
    if (!user?.id || !planId || !currentPhase) return;
    try {
      const { error } = await supabase.functions.invoke('generate-tactical-schedule', {
        body: { user_id: user.id, plan_id: planId, phase_number: currentPhase },
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['tactical-schedule'] });
    } catch (e) {
      console.error('Schedule generation failed:', e);
      toast({ title: 'Schedule generation failed', variant: 'destructive' });
    }
  }, [user?.id, planId, currentPhase, queryClient, toast]);

  // Track generating state
  const { data: isGenerating = false } = useQuery({
    queryKey: ['tactical-schedule-generating'],
    queryFn: () => false,
    staleTime: Infinity,
  });

  const phasePlan = useMemo((): PhasePlan => {
    const phaseLabel = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'][(currentPhase || 1) - 1] || '?';
    const wakeTime = aiSchedule?.wake_time || '06:30';
    const sleepTime = aiSchedule?.sleep_time || '23:00';
    
    const emptyPlan: PhasePlan = {
      phase: phaseLabel,
      phaseNumber: currentPhase || 1,
      days: phaseDates.map((date, i) => ({
        dayIndex: i, label: `יום ${i + 1}`, labelEn: `Day ${i + 1}`,
        date, dayNumber: i + 1, blocks: [], totalActions: 0,
        completedActions: 0, totalMinutes: 0, isToday: date === todayStr,
      })),
      totalActions: 0,
      completedActions: 0,
      totalMinutes: 0,
      generating: false,
      phaseStart,
      phaseEnd,
      hasAiSchedule: false,
      wakeTime,
      sleepTime,
    };

    if (phaseDates.length === 0 || currentPhaseMilestones.length === 0) return emptyPlan;

    let days: DayPlan[];

    if (aiSchedule?.schedule_data && Array.isArray(aiSchedule.schedule_data)) {
      // Use AI-generated schedule
      days = parseAiSchedule(
        aiSchedule.schedule_data,
        phaseDates,
        todayStr,
        currentPhase || 1,
        planStartDate || '',
      );
    } else {
      // Fallback to simple distribution
      days = buildFallbackDays(
        currentPhaseMilestones,
        phaseDates,
        todayStr,
        currentPhase || 1,
        planStartDate || '',
      );
    }

    const totalActions = days.reduce((s, d) => s + d.totalActions, 0);
    const completedActions = days.reduce((s, d) => s + d.completedActions, 0);

    return {
      phase: phaseLabel,
      phaseNumber: currentPhase || 1,
      days,
      totalActions,
      completedActions,
      totalMinutes: days.reduce((s, d) => s + d.totalMinutes, 0),
      generating: false,
      phaseStart,
      phaseEnd,
      hasAiSchedule: !!aiSchedule?.schedule_data,
      wakeTime,
      sleepTime,
    };
  }, [currentPhaseMilestones, currentPhase, planStartDate, phaseDates, phaseStart, phaseEnd, todayStr, aiSchedule]);

  return { ...phasePlan, isLoading: planLoading || scheduleLoading, generateSchedule, isGenerating };
}

// Classification exports (used by other components)
export function classifyCadence(title: string, _at: string | null, _et: string | null): Cadence {
  const t = title.toLowerCase();
  if (/daily|יומי|breath|נשימ|meditation|מדיטציה/.test(t)) return 'daily';
  if (/3x|training|אימון|combat|לחימה/.test(t)) return '3x_per_week';
  if (/2x|deep.?work|עמוקה/.test(t)) return '2x_per_week';
  if (/weekly|שבוע|review|סקירה/.test(t)) return 'weekly';
  if (/one.?time|חד.?פעמי/.test(t)) return 'one_time';
  return '3x_per_week';
}

export function classifyBlockCategory(_at: string | null, _et: string | null, title: string, focusArea?: string | null): BlockCategory {
  const t = `${title} ${focusArea || ''}`.toLowerCase();
  if (/health|בריאות|breath|נשימ|posture|יציב/.test(t)) return 'health';
  if (/training|אימון|combat|לחימה|strength|כוח/.test(t)) return 'training';
  if (/focus|פוקוס|deep.?work|עמוקה|meditation|מדיטציה/.test(t)) return 'focus';
  if (/creation|יצירה|build|בנייה|content/.test(t)) return 'creation';
  if (/review|סקירה|analysis|ניתוח/.test(t)) return 'review';
  if (/social|חברת|relation|קשר/.test(t)) return 'social';
  return 'action';
}
