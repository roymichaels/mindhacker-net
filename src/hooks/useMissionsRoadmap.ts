import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfDay, endOfDay, addDays, format, isSameDay, isBefore, startOfWeek, endOfWeek, differenceInDays } from 'date-fns';

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
  goal: string;
  is_completed: boolean;
  start_date?: string;
  end_date?: string;
  tasks?: any;
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
      // Fetch checklists with items
      const { data: checklists, error } = await supabase
        .from('aurora_checklists')
        .select('*, aurora_checklist_items(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('priority', { ascending: false });

      if (error) throw error;

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

        // Fetch ALL milestones for the plan
        const { data: allMilestones } = await supabase
          .from('life_plan_milestones')
          .select('id, week_number, month_number, title, goal, is_completed, tasks')
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

      // Transform checklists to missions + collect all items with metadata
      const transformedMissions: Mission[] = [];
      const collectedItems: MissionItem[] = [];

      (checklists || []).forEach((checklist: any) => {
        const items = checklist.aurora_checklist_items || [];
        const completedCount = items.filter((i: any) => i.is_completed).length;
        const totalCount = items.length;
        const category = (checklist.category || 'personal') as MissionCategory;

        transformedMissions.push({
          id: checklist.id,
          title: checklist.title,
          category,
          time_scope: (checklist.time_scope || 'weekly') as MissionTimeScope,
          origin: checklist.origin,
          priority: checklist.priority || 0,
          milestone_id: checklist.milestone_id,
          items: items.map((item: any) => ({
            id: item.id,
            content: item.content,
            is_completed: item.is_completed,
            due_date: item.due_date,
            order_index: item.order_index,
            is_recurring: item.is_recurring || false,
          })),
          completedCount,
          totalCount,
          progress: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
        });

        items.forEach((item: any) => {
          collectedItems.push({
            id: item.id,
            content: item.content,
            is_completed: item.is_completed,
            due_date: item.due_date,
            order_index: item.order_index,
            is_recurring: item.is_recurring || false,
            checklist_title: checklist.title,
            category,
          });
        });
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

    const channel = supabase
      .channel('missions-roadmap')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'aurora_checklists', filter: `user_id=eq.${user.id}` }, () => fetchMissions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'aurora_checklist_items' }, () => fetchMissions())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, fetchMissions]);

  // Build calendar data from items and milestones
  const calendarData = useMemo<CalendarData>(() => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

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

    // Today
    const todayData = buildDayData(today);

    // Current week
    const weekStart = startOfWeek(today, { weekStartsOn: 0 });
    const currentWeekDays = Array.from({ length: 7 }, (_, i) => buildDayData(addDays(weekStart, i)));

    // Overdue tasks
    const overdueTasks = allItems.filter(item => {
      if (item.is_completed || !item.due_date) return false;
      return isBefore(new Date(item.due_date), startOfDay(today));
    });

    // 90-day timeline: 3 months, each with ~4 weeks
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

  const toggleItem = useCallback(async (itemId: string, isCompleted: boolean) => {
    const { error } = await supabase
      .from('aurora_checklist_items')
      .update({ is_completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null })
      .eq('id', itemId);

    if (error) { console.error('Error toggling item:', error); return false; }

    if (isCompleted && user?.id) {
      await supabase.rpc('aurora_award_xp', { p_user_id: user.id, p_amount: 10, p_reason: 'Mission item completed' });
    }
    return true;
  }, [user?.id]);

  const createMission = useCallback(async (title: string, category: MissionCategory, timeScope: MissionTimeScope, items?: string[]) => {
    if (!user?.id) return null;
    const { data: checklist, error } = await supabase
      .from('aurora_checklists')
      .insert({ user_id: user.id, title, category, time_scope: timeScope, origin: 'manual', status: 'active' })
      .select().single();
    if (error) { console.error('Error creating mission:', error); return null; }
    if (items?.length && checklist) {
      await supabase.from('aurora_checklist_items').insert(items.map((content, index) => ({ checklist_id: checklist.id, content, order_index: index, is_completed: false })));
    }
    return checklist;
  }, [user?.id]);

  const updateMissionCategory = useCallback(async (missionId: string, category: MissionCategory) => {
    const { error } = await supabase.from('aurora_checklists').update({ category }).eq('id', missionId);
    return !error;
  }, []);

  const updateMissionTimeScope = useCallback(async (missionId: string, timeScope: MissionTimeScope) => {
    const { error } = await supabase.from('aurora_checklists').update({ time_scope: timeScope }).eq('id', missionId);
    return !error;
  }, []);

  const stats = useMemo(() => {
    const items = missions.flatMap(m => m.items);
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
  }, [missions]);

  return {
    roadmap, calendarData, missions, loading, stats,
    toggleItem, createMission, updateMissionCategory, updateMissionTimeScope,
    refetch: fetchMissions, currentWeek, currentMonth,
  };
}
