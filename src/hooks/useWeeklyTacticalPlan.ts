/**
 * useWeeklyTacticalPlan — Layer 3: Weekly Tactical Planner.
 * 
 * PURPOSE: Converts active phase milestones into a structured 10-day plan.
 * Consumes AI-generated tactical schedules from `tactical_schedules` table.
 * 
 * Pipeline position:
 * Identity → Strategy → Phase → **WEEKLY PLAN** → Daily Queue → Now Execution
 * 
 * Schedule structure: Day → Themed Blocks → Milestones inside each block.
 */
import { useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// ── Helpers for fuzzy title matching ──
function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/[\u0591-\u05C7]/g, '');
}
function fuzzyMatch(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 2) return false;
  let diffs = 0;
  const maxLen = Math.max(a.length, b.length);
  for (let i = 0; i < maxLen; i++) {
    if (a[i] !== b[i]) diffs++;
    if (diffs > 2) return false;
  }
  return true;
}

// ── Types ──

export type Cadence = 'daily' | '3x_per_week' | '2x_per_week' | 'weekly' | 'one_time';
export type BlockCategory = 'training' | 'action' | 'review' | 'creation' | 'health' | 'focus' | 'social';
export type Difficulty = 1 | 2 | 3 | 4 | 5;

/** A single milestone inside a themed block */
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
  startTime: string | null;
  endTime: string | null;
  orderIndex: number;
}

/** A themed block containing multiple milestones */
export interface TacticalBlock {
  id: string;
  title: string;
  titleEn: string;
  emoji: string;
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

const BLOCK_EMOJIS: Record<BlockCategory, string> = {
  health: '🌅',
  training: '⚔️',
  focus: '🧠',
  action: '⚡',
  creation: '🎨',
  review: '🌙',
  social: '💬',
};

// ── Helpers ──

function toDateStr(d: Date): string {
  // Use local date to avoid timezone offset issues
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getPhaseWindow(planStartDate: string, phaseNumber: number) {
  // Use date-only string to avoid timezone drift (consistent with getCurrentDayInIsrael)
  const startOnly = planStartDate.slice(0, 10); // "YYYY-MM-DD"
  const planStart = new Date(startOnly + 'T00:00:00'); // local midnight
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

function validDifficulty(d: any): Difficulty {
  const n = typeof d === 'number' ? d : parseInt(d);
  if (n >= 1 && n <= 5) return n as Difficulty;
  if (d === 'easy') return 1;
  if (d === 'medium') return 3;
  if (d === 'hard') return 5;
  return 3;
}

const DIFFICULTY_XP: Record<Difficulty, number> = { 1: 5, 2: 8, 3: 10, 4: 13, 5: 15 };

// ── Parse AI schedule (handles both nested and flat block formats) ──

function isNestedBlockFormat(blocks: any[]): boolean {
  // Nested format: blocks have a `milestones` array inside
  return blocks.some((b: any) => Array.isArray(b.milestones) && b.milestones.length > 0);
}

/** Group flat milestone-style blocks into themed containers by category + time window */
function regroupFlatBlocks(flatBlocks: any[]): any[] {
  const groups: Record<string, { block: any; items: any[] }> = {};

  for (const b of flatBlocks) {
    const cat = b.category || 'action';
    const timeKey = b.start_time || 'no-time';
    const key = `${cat}::${timeKey}`;

    if (!groups[key]) {
      groups[key] = {
        block: {
          block_title_he: b.block_title_he || b.title_he || '',
          block_title_en: b.block_title_en || b.title_en || '',
          block_emoji: b.block_emoji || b.emoji || BLOCK_EMOJIS[cat as BlockCategory] || '📋',
          category: cat,
          start_time: b.start_time || null,
          end_time: b.end_time || null,
          milestones: [],
        },
        items: [],
      };
    }

    // The flat block itself is a milestone — push it into the group
    groups[key].items.push({
      milestone_id: b.milestone_id || null,
      focus_area: b.focus_area || null,
      title_en: b.title_en || '',
      title_he: b.title_he || '',
      duration_minutes: b.duration_minutes || b.total_minutes || 15,
      difficulty: b.difficulty || 3,
      xp_reward: b.xp_reward || 10,
      execution_template: b.execution_template || 'step_by_step',
      order_index: groups[key].items.length,
    });

    // Update end_time to the latest
    if (b.end_time && (!groups[key].block.end_time || b.end_time > groups[key].block.end_time)) {
      groups[key].block.end_time = b.end_time;
    }
  }

  return Object.values(groups).map(({ block, items }) => {
    block.milestones = items;
    block.milestone_count = items.length;
    block.total_minutes = items.reduce((s: number, m: any) => s + (m.duration_minutes || 15), 0);
    return block;
  });
}

function parseAiSchedule(
  scheduleDays: any[],
  phaseDates: string[],
  todayStr: string,
  phaseNumber: number,
  milestoneFocusMap: Record<string, string>,
  completedItems?: Map<string, { title: string; completedAt: string }[]>,
): DayPlan[] {
  const days: DayPlan[] = [];
  const phaseStartDay = (phaseNumber - 1) * 10 + 1;

  for (let d = 0; d < 10; d++) {
    const aiDay = scheduleDays.find((sd: any) => sd.day_number === d + 1) || scheduleDays[d];
    const date = phaseDates[d] || '';
    const absDay = phaseStartDay + d;
    const isDayToday = date === todayStr;

    if (!aiDay || !aiDay.blocks || aiDay.blocks.length === 0) {
      days.push({
        dayIndex: d, label: `יום ${d + 1}`, labelEn: `Day ${d + 1}`,
        date, dayNumber: d + 1, blocks: [], totalActions: 0,
        completedActions: 0, totalMinutes: 0, isToday: isDayToday,
      });
      continue;
    }

    // Detect format: nested (blocks contain milestones[]) vs flat (each block IS a milestone)
    let resolvedBlocks = aiDay.blocks;
    if (!isNestedBlockFormat(aiDay.blocks)) {
      resolvedBlocks = regroupFlatBlocks(aiDay.blocks);
    }

    let totalActions = 0;
    let completedActions = 0;

    // ── Deduplicate blocks: merge blocks with same title+category ──
    const deduped: any[] = [];
    const seen = new Map<string, number>();
    for (const block of resolvedBlocks) {
      const cat = block.category || 'action';
      const title = (block.block_title_he || block.block_title_en || cat).toLowerCase().trim();
      const key = `${title}::${cat}`;
      if (seen.has(key)) {
        // Merge milestones into existing block
        const existingIdx = seen.get(key)!;
        const existing = deduped[existingIdx];
        const newMilestones = block.milestones || block.blocks || [];
        const existingMilestones = existing.milestones || existing.blocks || [];
        // Deduplicate milestones by title
        const existingTitles = new Set(existingMilestones.map((m: any) => (m.title_he || m.title_en || '').toLowerCase().trim()));
        for (const m of newMilestones) {
          const mTitle = (m.title_he || m.title_en || '').toLowerCase().trim();
          if (!existingTitles.has(mTitle)) {
            existingMilestones.push(m);
            existingTitles.add(mTitle);
          }
        }
        existing.milestones = existingMilestones;
        existing.milestone_count = existingMilestones.length;
        existing.total_minutes = existingMilestones.reduce((s: number, m: any) => s + (m.duration_minutes || 15), 0);
      } else {
        seen.set(key, deduped.length);
        deduped.push({ ...block });
      }
    }

    const blocks: TacticalBlock[] = deduped.map((block: any, bIdx: number) => {
      const category = validCategory(block.category);
      const blockMilestones = block.milestones || block.blocks || [];
      
      // Deduplicate milestones within each block by title
      const seenMilestones = new Set<string>();
      const uniqueMilestones = blockMilestones.filter((m: any) => {
        const mTitle = (m.title_he || m.title_en || '').toLowerCase().trim();
        if (seenMilestones.has(mTitle)) return false;
        seenMilestones.add(mTitle);
        return true;
      });

      const actions: TacticalAction[] = uniqueMilestones.map((m: any, mIdx: number) => {
        const difficulty = validDifficulty(m.difficulty);
        totalActions++;
        const action: TacticalAction = {
          id: `ai-${d}-${bIdx}-${mIdx}-${m.milestone_id || 'gen'}`,
          title: m.title_he || m.title_en || 'משימה',
          titleEn: m.title_en || m.title_he || 'Task',
          description: null,
          descriptionEn: null,
          sourceMilestoneId: m.milestone_id || null,
          executionTemplate: m.execution_template || 'step_by_step',
          actionType: block.category || null,
          estimatedMinutes: m.duration_minutes || 15,
          cadence: 'daily' as Cadence,
          completed: false,
          completedAt: null,
          xpReward: m.xp_reward || DIFFICULTY_XP[difficulty] || 10,
          blockCategory: category,
          difficulty,
          scheduledDay: absDay,
          calendarDate: date,
          focusArea: (m.milestone_id && milestoneFocusMap[m.milestone_id]) || m.focus_area || null,
          missionId: m.mission_id || null,
          startTime: null,
          endTime: null,
          orderIndex: m.order_index ?? mIdx,
        };
        (action as any).blockId = block.block_id || null;
        (action as any).missionTitle = m.mission_title || null;
        return action;
      });

      // Patch completion status from action_items
      if (completedItems && date) {
        const dayCompleted = completedItems.get(date) || [];
        for (const action of actions) {
          const match = dayCompleted.find(ci => {
            const ciTitle = normalize(ci.title);
            const actionTitle = normalize(action.title);
            const actionTitleEn = normalize(action.titleEn || '');
            // Exact match
            if (ciTitle === actionTitle || ciTitle === actionTitleEn) return true;
            // Substring match
            if (actionTitle.includes(ciTitle) || ciTitle.includes(actionTitle)) return true;
            if (actionTitleEn && (actionTitleEn.includes(ciTitle) || ciTitle.includes(actionTitleEn))) return true;
            // Fuzzy: Levenshtein-like — if titles are close (1-2 char diff), match
            if (ciTitle.length > 3 && actionTitle.length > 3 && fuzzyMatch(ciTitle, actionTitle)) return true;
            if (actionTitleEn && ciTitle.length > 3 && fuzzyMatch(ciTitle, actionTitleEn)) return true;
            return false;
          });
          if (match) {
            action.completed = true;
            action.completedAt = match.completedAt;
            completedActions++;
          }
        }
      }

      return {
        id: `tblock-${d}-${bIdx}`,
        title: block.block_title_he || BLOCK_LABELS[category]?.he || 'בלוק',
        titleEn: block.block_title_en || BLOCK_LABELS[category]?.en || 'Block',
        emoji: block.block_emoji || BLOCK_EMOJIS[category] || '📋',
        category,
        estimatedMinutes: block.total_minutes || actions.reduce((s: number, a: TacticalAction) => s + a.estimatedMinutes, 0),
        actions,
        completedCount: actions.filter((a: TacticalAction) => a.completed).length,
        startTime: null,
        endTime: null,
      };
    });

    days.push({
      dayIndex: d,
      label: `יום ${d + 1}`,
      labelEn: `Day ${d + 1}`,
      date,
      dayNumber: d + 1,
      blocks,
      totalActions,
      completedActions,
      totalMinutes: aiDay.total_minutes || blocks.reduce((s: number, b: TacticalBlock) => s + b.estimatedMinutes, 0),
      isToday: isDayToday,
    });
  }

  return days;
}

// ── Fallback ──

// ── Map focus_area to proper block category for fallback grouping ──
function focusAreaToCategory(focusArea: string | null): BlockCategory {
  if (!focusArea) return 'action';
  const fa = focusArea.toLowerCase();
  if (['vitality', 'presence'].includes(fa)) return 'health';
  if (['power', 'combat'].includes(fa)) return 'training';
  if (['focus', 'consciousness', 'expansion'].includes(fa)) return 'focus';
  if (['wealth', 'influence', 'business'].includes(fa)) return 'action';
  if (['projects', 'order', 'craft'].includes(fa)) return 'creation';
  if (['relationships', 'play'].includes(fa)) return 'social';
  return 'action';
}

function buildFallbackDays(
  milestones: any[],
  phaseDates: string[],
  todayStr: string,
  phaseNumber: number,
): DayPlan[] {
  const phaseStartDay = (phaseNumber - 1) * 10 + 1;
  const dayLoad = new Array(10).fill(0);
  // Store actions grouped by day AND category
  const dayActionsByCategory: Record<string, TacticalAction[]>[] = Array.from({ length: 10 }, () => ({}));

  for (const mm of milestones) {
    if (mm.is_completed) continue;
    let bestDay = 0;
    for (let d = 1; d < 10; d++) {
      if (dayLoad[d] < dayLoad[bestDay]) bestDay = d;
    }
    dayLoad[bestDay] += 15;
    const absDay = phaseStartDay + bestDay;
    const category = focusAreaToCategory(mm.focus_area);

    if (!dayActionsByCategory[bestDay][category]) {
      dayActionsByCategory[bestDay][category] = [];
    }

    dayActionsByCategory[bestDay][category].push({
      id: `${mm.id}-d${bestDay}`,
      title: mm.title || '',
      titleEn: mm.title_en || mm.title || '',
      description: mm.description || null,
      descriptionEn: mm.description_en || null,
      sourceMilestoneId: mm.id,
      executionTemplate: 'step_by_step',
      actionType: mm.focus_area || null,
      estimatedMinutes: 15,
      cadence: 'daily',
      completed: false,
      completedAt: null,
      xpReward: 10,
      blockCategory: category,
      difficulty: (mm.difficulty || 3) as Difficulty,
      scheduledDay: absDay,
      calendarDate: phaseDates[bestDay] || '',
      focusArea: mm.focus_area || null,
      missionId: mm.mission_id || null,
      startTime: null,
      endTime: null,
      orderIndex: 0,
    });
  }

  return phaseDates.map((date, d) => {
    const catGroups = dayActionsByCategory[d];
    const categoryOrder: BlockCategory[] = ['health', 'training', 'focus', 'action', 'creation', 'social', 'review'];

    const blocks: TacticalBlock[] = categoryOrder
      .filter(cat => catGroups[cat] && catGroups[cat].length > 0)
      .map((cat, bIdx) => {
        const actions = catGroups[cat];
        return {
          id: `fallback-block-${d}-${bIdx}`,
          title: BLOCK_LABELS[cat]?.he || 'בלוק',
          titleEn: BLOCK_LABELS[cat]?.en || 'Block',
          emoji: BLOCK_EMOJIS[cat] || '📋',
          category: cat,
          estimatedMinutes: actions.reduce((s, a) => s + a.estimatedMinutes, 0),
          actions,
          completedCount: 0,
          startTime: null,
          endTime: null,
        };
      });

    const totalActions = blocks.reduce((s, b) => s + b.actions.length, 0);
    return {
      dayIndex: d, label: `יום ${d + 1}`, labelEn: `Day ${d + 1}`,
      date, dayNumber: d + 1, blocks,
      totalActions,
      completedActions: 0,
      totalMinutes: blocks.reduce((s, b) => s + b.estimatedMinutes, 0),
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
  const allPlanIds = (plan as any)?.all_plan_ids as string[] | undefined;
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

  // Recompute on every render — toDateStr is trivial and must reflect current local date
  const todayStr = toDateStr(new Date());

  // Only fetch tactical schedule for the PRIMARY plan (not all plans)
  // to avoid duplicate/overlapping blocks from Arena and Core plans
  const { data: aiSchedules, isLoading: scheduleLoading } = useQuery({
    queryKey: ['tactical-schedule', planId, currentPhase],
    queryFn: async () => {
      if (!planId || !currentPhase || !user?.id) return [];
      const { data, error } = await supabase
        .from('tactical_schedules')
        .select('schedule_data, wake_time, sleep_time, version, generated_at, plan_id')
        .eq('user_id', user.id)
        .eq('plan_id', planId)
        .eq('phase_number', currentPhase)
        .order('generated_at', { ascending: false })
        .limit(1);
      if (error) throw error;
      return data || [];
    },
    enabled: !!planId && !!currentPhase && !!user?.id,
    staleTime: 5 * 60_000,
  });
  // ── Fetch completed action_items for the phase date range ──
  const { data: completedItemsRaw } = useQuery({
    queryKey: ['action-items-completed', user?.id, phaseStart, phaseEnd],
    queryFn: async () => {
      if (!user?.id || !phaseStart || !phaseEnd) return [];
      const { data, error } = await supabase
        .from('action_items')
        .select('title, scheduled_date, completed_at, status')
        .eq('user_id', user.id)
        .eq('status', 'done')
        .gte('scheduled_date', phaseStart)
        .lte('scheduled_date', phaseEnd);
      if (error) { console.error('Failed to fetch completed items:', error); return []; }
      return data || [];
    },
    enabled: !!user?.id && !!phaseStart && !!phaseEnd,
    staleTime: 30_000,
  });

  const completedItemsMap = useMemo(() => {
    const map = new Map<string, { title: string; completedAt: string }[]>();
    if (!completedItemsRaw) return map;
    for (const item of completedItemsRaw) {
      const date = item.scheduled_date || '';
      if (!map.has(date)) map.set(date, []);
      map.get(date)!.push({ title: item.title, completedAt: item.completed_at || '' });
    }
    return map;
  }, [completedItemsRaw]);

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

  const { data: isGenerating = false } = useQuery({
    queryKey: ['tactical-schedule-generating'],
    queryFn: () => false,
    staleTime: Infinity,
  });

  const phasePlan = useMemo((): PhasePlan => {
    const phaseLabel = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'][(currentPhase || 1) - 1] || '?';
    const wakeTime = aiSchedules?.[0]?.wake_time || '06:30';
    const sleepTime = aiSchedules?.[0]?.sleep_time || '23:00';
    
    const emptyPlan: PhasePlan = {
      phase: phaseLabel, phaseNumber: currentPhase || 1,
      days: phaseDates.map((date, i) => ({
        dayIndex: i, label: `יום ${i + 1}`, labelEn: `Day ${i + 1}`,
        date, dayNumber: i + 1, blocks: [], totalActions: 0,
        completedActions: 0, totalMinutes: 0, isToday: date === todayStr,
      })),
      totalActions: 0, completedActions: 0, totalMinutes: 0,
      generating: false, phaseStart, phaseEnd, hasAiSchedule: false, wakeTime, sleepTime,
    };

    if (phaseDates.length === 0 || currentPhaseMilestones.length === 0) return emptyPlan;

    // Merge schedule_data from all plans
    const validSchedules = (aiSchedules || []).filter(s => s.schedule_data && Array.isArray(s.schedule_data));
    const hasAnyAiSchedule = validSchedules.length > 0;

    let days: DayPlan[];

    if (hasAnyAiSchedule) {
      const focusMap: Record<string, string> = {};
      for (const m of currentPhaseMilestones) {
        if (m.id && m.focus_area) focusMap[m.id] = m.focus_area;
      }

      // Parse the single primary schedule
      days = parseAiSchedule(validSchedules[0].schedule_data as any[], phaseDates, todayStr, currentPhase || 1, focusMap, completedItemsMap);
    } else {
      days = buildFallbackDays(currentPhaseMilestones, phaseDates, todayStr, currentPhase || 1);
    }

    const totalActions = days.reduce((s, d) => s + d.totalActions, 0);
    const completedActions = days.reduce((s, d) => s + d.completedActions, 0);

    return {
      phase: phaseLabel, phaseNumber: currentPhase || 1, days,
      totalActions, completedActions,
      totalMinutes: days.reduce((s, d) => s + d.totalMinutes, 0),
      generating: false, phaseStart, phaseEnd,
      hasAiSchedule: hasAnyAiSchedule, wakeTime, sleepTime,
    };
  }, [currentPhaseMilestones, currentPhase, phaseDates, phaseStart, phaseEnd, todayStr, aiSchedules, completedItemsMap]);

  const toggleActionComplete = useCallback(async (action: TacticalAction) => {
    if (!user?.id) return;
    const newDone = !action.completed;
    const date = action.calendarDate || todayStr;

    // Optimistic update: immediately update cached completion data
    const prevKey = ['action-items-completed', user.id, phaseStart, phaseEnd];
    const prevData = queryClient.getQueryData<any[]>(prevKey);
    
    if (newDone) {
      // Optimistically add to completed list
      queryClient.setQueryData(prevKey, [
        ...(prevData || []),
        { title: action.title, scheduled_date: date, completed_at: new Date().toISOString(), status: 'done' },
      ]);
    } else {
      // Optimistically remove from completed list
      if (prevData) {
        const normalizedTitle = normalize(action.title);
        queryClient.setQueryData(prevKey, prevData.filter(item => {
          const itemTitle = normalize(item.title || '');
          return !(itemTitle === normalizedTitle && item.scheduled_date === date);
        }));
      }
    }

    try {
      if (newDone) {
        // Upsert an action_item as done
        const { error } = await supabase.from('action_items').upsert({
          user_id: user.id,
          title: action.title,
          type: 'task',
          source: 'plan',
          status: 'done',
          scheduled_date: date,
          completed_at: new Date().toISOString(),
          pillar: action.focusArea || null,
          order_index: action.orderIndex || 0,
        }, { onConflict: 'user_id,title,scheduled_date', ignoreDuplicates: false });
        if (error) {
          // If upsert fails due to missing unique constraint, try insert
          if (error.code === '42P10' || error.message?.includes('unique')) {
            await supabase.from('action_items').insert({
              user_id: user.id,
              title: action.title,
              type: 'task',
              source: 'plan',
              status: 'done',
              scheduled_date: date,
              completed_at: new Date().toISOString(),
              pillar: action.focusArea || null,
              order_index: action.orderIndex || 0,
            });
          }
        }
      } else {
        // Mark as todo — try exact title match first, then English title, then fuzzy
        const { data: updated } = await supabase
          .from('action_items')
          .update({ status: 'todo', completed_at: null })
          .eq('user_id', user.id)
          .eq('scheduled_date', date)
          .eq('title', action.title)
          .select('id');
        
        if (!updated || updated.length === 0) {
          // Try English title
          if (action.titleEn && action.titleEn !== action.title) {
            const { data: updated2 } = await supabase
              .from('action_items')
              .update({ status: 'todo', completed_at: null })
              .eq('user_id', user.id)
              .eq('scheduled_date', date)
              .eq('title', action.titleEn)
              .select('id');
            
            if (!updated2 || updated2.length === 0) {
              // Last resort: match any done item with similar title using ilike
              await supabase
                .from('action_items')
                .update({ status: 'todo', completed_at: null })
                .eq('user_id', user.id)
                .eq('scheduled_date', date)
                .eq('status', 'done')
                .ilike('title', `%${action.title.slice(0, 15)}%`);
            }
          } else {
            // No English title, try partial match
            await supabase
              .from('action_items')
              .update({ status: 'todo', completed_at: null })
              .eq('user_id', user.id)
              .eq('scheduled_date', date)
              .eq('status', 'done')
              .ilike('title', `%${action.title.slice(0, 15)}%`);
          }
        }
      }
    } catch (err) {
      // Rollback optimistic update on error
      queryClient.setQueryData(prevKey, prevData);
      console.error('Toggle action complete failed:', err);
    }

    // Also refresh to ensure consistency
    queryClient.invalidateQueries({ queryKey: ['action-items-completed'] });
  }, [user?.id, todayStr, phaseStart, phaseEnd, queryClient]);

  return { ...phasePlan, isLoading: planLoading || scheduleLoading, generateSchedule, isGenerating, toggleActionComplete } as PhasePlan & { isLoading: boolean; generateSchedule: () => Promise<void>; isGenerating: boolean; toggleActionComplete: (action: TacticalAction) => Promise<void> };
}

// Classification exports
export function classifyCadence(title: string): Cadence {
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
