/**
 * SSOT: All roadmap data comes from action_items table ONLY.
 * aurora_checklists is LEGACY — do not read or write from production code.
 * All XP must flow through award_unified_xp RPC (handled by action_items completion trigger).
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfDay, endOfDay, addDays, format, isSameDay, isBefore, startOfWeek, differenceInDays } from 'date-fns';
import { toggleActionStatus, createAction } from '@/services/actionItems';

export type MissionCategory = 'personal' | 'business' | 'health';
export type MissionTimeScope = 'daily' | 'weekly' | 'monthly';

export interface MissionItem {
  id: string;
  content: string;
  is_completed: boolean;
  due_date: string | null;
  order_index: number;
  is_recurring: boolean;
  checklist_title?: string;
  category?: MissionCategory;
}

export interface Mission {
  id: string;
  title: string;
  category: MissionCategory;
  time_scope: MissionTimeScope;
  origin: 'manual' | 'aurora';
  priority: number;
  milestone_id: string | null;
  items: MissionItem[];
  completedCount: number;
  totalCount: number;
  progress: number;
}

export interface MilestoneInfo {
  id: string;
  week_number: number;
  month_number: number;
  title: string;
  title_en: string | null;
  goal: string;
  goal_en: string | null;
  is_completed: boolean;
  start_date?: string;
  end_date?: string;
  tasks?: any;
  tasks_en?: any;
}

export interface DayData {
  date: Date;
  dateStr: string;
  items: MissionItem[];
  completedCount: number;
  totalCount: number;
  isToday: boolean;
  isPast: boolean;
}

export interface WeekData {
  weekNumber: number;
  milestone: MilestoneInfo | null;
  days: DayData[];
  completedCount: number;
  totalCount: number;
  progress: number;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
}

export interface MonthData {
  monthNumber: number;
  label: string;
  weeks: WeekData[];
  completedCount: number;
  totalCount: number;
  progress: number;
}

export interface RoadmapData {
  daily: { personal: Mission[]; business: Mission[]; health: Mission[] };
  weekly: { personal: Mission[]; business: Mission[]; health: Mission[] };
  monthly: { personal: Mission[]; business: Mission[]; health: Mission[] };
  currentMilestone: MilestoneInfo | null;
  currentWeek: number;
  currentMonth: number;
}

export interface CalendarData {
  today: DayData;
  currentWeekDays: DayData[];
  months: MonthData[];
  allMilestones: MilestoneInfo[];
  planStartDate: Date | null;
  overdueTasks: MissionItem[];
}

// Map pillar strings to roadmap categories
function pillarToCategory(pillar: string | null): MissionCategory {
  if (!pillar) return 'personal';
  const lower = pillar.toLowerCase();
  if (['business', 'career', 'finance', 'money'].includes(lower)) return 'business';
  if (['body', 'health', 'fitness', 'combat'].includes(lower)) return 'health';
  return 'personal';
}

export function useMissionsRoadmap() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [allItems, setAllItems] = useState<MissionItem[]>([]);
  const [milestones, setMilestones] = useState<MilestoneInfo[]>([]);
  const [planStartDate, setPlanStartDate] = useState<Date | null>(null);
  const [currentMilestone, setCurrentMilestone] = useState<MilestoneInfo | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchMissions = useCallback(async () => {
    if (!user?.id) return;

    try {
      // SSOT: Read from action_items ONLY
      // Fetch parent items (missions/groups) — parent_id IS NULL, type='task'
      const { data: parentItems, error: parentError } = await supabase
        .from('action_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'task')
        .is('parent_id', null)
        .in('status', ['todo', 'doing', 'done'])
        .order('order_index');

      if (parentError) throw parentError;

      // Fetch child items (sub-tasks under parents)
      const parentIds = (parentItems || []).map(p => p.id);
      let childItems: any[] = [];
      if (parentIds.length > 0) {
        const { data: children, error: childError } = await supabase
          .from('action_items')
          .select('*')
          .in('parent_id', parentIds)
          .in('status', ['todo', 'doing', 'done'])
          .order('order_index');
        if (childError) throw childError;
        childItems = children || [];
      }

      // Also fetch standalone tasks (no parent, no children) for today view
      const standaloneIds = parentIds.filter(
        pid => !childItems.some(c => c.parent_id === pid)
      );

      // Fetch life plan and milestones
      const { data: lifePlan } = await supabase
        .from('life_plans')
        .select('id, start_date')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let fetchedMilestones: MilestoneInfo[] = [];

      if (lifePlan) {
        const startDate = new Date(lifePlan.start_date);
        setPlanStartDate(startDate);
        const today = new Date();
        const diffDays = differenceInDays(today, startDate);
        const weekNum = Math.min(12, Math.max(1, Math.floor(diffDays / 7) + 1));
        const monthNum = Math.ceil(weekNum / 4);

        setCurrentWeek(weekNum);
        setCurrentMonth(monthNum);

        const { data: allMilestones } = await supabase
          .from('life_plan_milestones')
          .select('id, week_number, month_number, title, title_en, goal, goal_en, is_completed, tasks, tasks_en')
          .eq('plan_id', lifePlan.id)
          .order('week_number', { ascending: true });

        if (allMilestones) {
          fetchedMilestones = (allMilestones as any[]).map(m => ({
            ...m,
            start_date: addDays(startDate, (m.week_number - 1) * 7).toISOString(),
            end_date: addDays(startDate, m.week_number * 7 - 1).toISOString(),
          }));
          setMilestones(fetchedMilestones);

          const current = fetchedMilestones.find(m => m.week_number === weekNum);
          if (current) setCurrentMilestone(current);
        }
      }

      // Build missions from parent items that have children
      const transformedMissions: Mission[] = [];
      const collectedItems: MissionItem[] = [];
      const childrenByParent = new Map<string, any[]>();
      
      childItems.forEach(child => {
        const list = childrenByParent.get(child.parent_id) || [];
        list.push(child);
        childrenByParent.set(child.parent_id, list);
      });

      (parentItems || []).forEach((parent: any) => {
        const children = childrenByParent.get(parent.id) || [];
        const category = pillarToCategory(parent.pillar);
        const timeScope = (parent.metadata?.time_scope || 'weekly') as MissionTimeScope;
        
        // If parent has children, treat as mission group
        if (children.length > 0) {
          const items: MissionItem[] = children.map((child: any) => ({
            id: child.id,
            content: child.title,
            is_completed: child.status === 'done',
            due_date: child.scheduled_date || (child.due_at ? child.due_at.slice(0, 10) : null),
            order_index: child.order_index,
            is_recurring: !!child.recurrence_rule,
            checklist_title: parent.title,
            category,
          }));

          const completedCount = items.filter(i => i.is_completed).length;
          transformedMissions.push({
            id: parent.id,
            title: parent.title,
            category,
            time_scope: timeScope,
            origin: parent.source === 'aurora' ? 'aurora' : 'manual',
            priority: parent.priority_score || parent.order_index || 0,
            milestone_id: parent.milestone_id,
            items,
            completedCount,
            totalCount: items.length,
            progress: items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0,
          });

          collectedItems.push(...items);
        } else {
          // Standalone task — treat as single-item mission
          const item: MissionItem = {
            id: parent.id,
            content: parent.title,
            is_completed: parent.status === 'done',
            due_date: parent.scheduled_date || (parent.due_at ? parent.due_at.slice(0, 10) : null),
            order_index: parent.order_index,
            is_recurring: !!parent.recurrence_rule,
            category,
          };
          collectedItems.push(item);
        }
      });

      setMissions(transformedMissions);
      setAllItems(collectedItems);
    } catch (error) {
      console.error('Error fetching missions:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchMissions();
    if (!user?.id) return;

    // SSOT: Subscribe to action_items changes only
    const channel = supabase
      .channel('missions-roadmap')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'action_items', filter: `user_id=eq.${user.id}` }, () => fetchMissions())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, fetchMissions]);

  // Build calendar data from items and milestones
  const calendarData = useMemo<CalendarData>(() => {
    const today = new Date();

    const getItemsForDate = (date: Date): MissionItem[] => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return allItems.filter(item => {
        if (item.due_date === dateStr) return true;
        if (item.is_recurring && item.due_date && !isBefore(date, new Date(item.due_date))) return true;
        return false;
      });
    };

    const buildDayData = (date: Date): DayData => {
      const items = getItemsForDate(date);
      const dateStr = format(date, 'yyyy-MM-dd');
      return {
        date,
        dateStr,
        items,
        completedCount: items.filter(i => i.is_completed).length,
        totalCount: items.length,
        isToday: isSameDay(date, today),
        isPast: isBefore(endOfDay(date), startOfDay(today)),
      };
    };

    const todayData = buildDayData(today);
    const weekStart = startOfWeek(today, { weekStartsOn: 0 });
    const currentWeekDays = Array.from({ length: 7 }, (_, i) => buildDayData(addDays(weekStart, i)));

    const overdueTasks = allItems.filter(item => {
      if (item.is_completed || !item.due_date) return false;
      return isBefore(new Date(item.due_date), startOfDay(today));
    });

    const months: MonthData[] = [];
    if (planStartDate) {
      for (let m = 0; m < 3; m++) {
        const monthWeeks: WeekData[] = [];
        for (let w = 0; w < 4; w++) {
          const weekIdx = m * 4 + w;
          const weekNum = weekIdx + 1;
          if (weekNum > 12) break;

          const wStart = addDays(planStartDate, weekIdx * 7);
          const wEnd = addDays(wStart, 6);
          const days = Array.from({ length: 7 }, (_, i) => buildDayData(addDays(wStart, i)));
          const milestone = milestones.find(ms => ms.week_number === weekNum) || null;
          const totalItems = days.reduce((acc, d) => acc + d.totalCount, 0);
          const completedItems = days.reduce((acc, d) => acc + d.completedCount, 0);

          monthWeeks.push({
            weekNumber: weekNum,
            milestone,
            days,
            completedCount: completedItems,
            totalCount: totalItems,
            progress: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
            startDate: wStart,
            endDate: wEnd,
            isCurrent: weekNum === currentWeek,
          });
        }

        const monthTotal = monthWeeks.reduce((acc, w) => acc + w.totalCount, 0);
        const monthCompleted = monthWeeks.reduce((acc, w) => acc + w.completedCount, 0);

        months.push({
          monthNumber: m + 1,
          label: `חודש ${m + 1}`,
          weeks: monthWeeks,
          completedCount: monthCompleted,
          totalCount: monthTotal,
          progress: monthTotal > 0 ? Math.round((monthCompleted / monthTotal) * 100) : 0,
        });
      }
    }

    return {
      today: todayData,
      currentWeekDays,
      months,
      allMilestones: milestones,
      planStartDate,
      overdueTasks,
    };
  }, [allItems, milestones, planStartDate, currentWeek]);

  // Legacy roadmap structure (kept for backward compat)
  const roadmap = useMemo<RoadmapData>(() => {
    const structure: RoadmapData = {
      daily: { personal: [], business: [], health: [] },
      weekly: { personal: [], business: [], health: [] },
      monthly: { personal: [], business: [], health: [] },
      currentMilestone,
      currentWeek,
      currentMonth,
    };
    missions.forEach((mission) => {
      const ts = mission.time_scope || 'weekly';
      const cat = mission.category || 'personal';
      if (structure[ts]?.[cat]) structure[ts][cat].push(mission);
    });
    return structure;
  }, [missions, currentMilestone, currentWeek, currentMonth]);

  // SSOT: Toggle uses action_items status. XP is awarded automatically by DB trigger.
  const toggleItem = useCallback(async (itemId: string, isCompleted: boolean) => {
    try {
      await toggleActionStatus(itemId, isCompleted);
      return true;
    } catch (error) {
      console.error('Error toggling item:', error);
      return false;
    }
  }, []);

  // SSOT: Create mission as action_item with type='task'
  const createMission = useCallback(async (title: string, category: MissionCategory, timeScope: MissionTimeScope, items?: string[]) => {
    if (!user?.id) return null;
    try {
      const parent = await createAction({
        user_id: user.id,
        type: 'task',
        title,
        source: 'user',
        pillar: category,
        metadata: { time_scope: timeScope },
      });

      if (items?.length && parent) {
        for (let i = 0; i < items.length; i++) {
          await createAction({
            user_id: user.id,
            type: 'task',
            title: items[i],
            source: 'user',
            parent_id: parent.id,
            order_index: i,
          });
        }
      }
      return parent;
    } catch (error) {
      console.error('Error creating mission:', error);
      return null;
    }
  }, [user?.id]);

  // Update category via action_items
  const updateMissionCategory = useCallback(async (missionId: string, category: MissionCategory) => {
    const { error } = await supabase
      .from('action_items')
      .update({ pillar: category } as any)
      .eq('id', missionId);
    return !error;
  }, []);

  // Update time scope via action_items metadata
  const updateMissionTimeScope = useCallback(async (missionId: string, timeScope: MissionTimeScope) => {
    // Read current metadata, merge time_scope
    const { data } = await supabase
      .from('action_items')
      .select('metadata')
      .eq('id', missionId)
      .single();
    
    const currentMeta = (data?.metadata as Record<string, any>) || {};
    const { error } = await supabase
      .from('action_items')
      .update({ metadata: { ...currentMeta, time_scope: timeScope } } as any)
      .eq('id', missionId);
    return !error;
  }, []);

  const stats = useMemo(() => {
    const items = allItems;
    const completed = items.filter(i => i.is_completed).length;
    const total = items.length;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayItems = items.filter(i => i.due_date === todayStr);
    const todayCompleted = todayItems.filter(i => i.is_completed).length;

    return {
      total, completed, remaining: total - completed,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      todayTotal: todayItems.length, todayCompleted,
      todayRemaining: todayItems.length - todayCompleted,
    };
  }, [allItems]);

  return {
    roadmap, calendarData, missions, loading, stats,
    toggleItem, createMission, updateMissionCategory, updateMissionTimeScope,
    refetch: fetchMissions, currentWeek, currentMonth,
  };
}
