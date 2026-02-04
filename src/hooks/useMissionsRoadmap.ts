import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type MissionCategory = 'personal' | 'business' | 'health';
export type MissionTimeScope = 'daily' | 'weekly' | 'monthly';

export interface MissionItem {
  id: string;
  content: string;
  is_completed: boolean;
  due_date: string | null;
  order_index: number;
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
}

export interface RoadmapData {
  daily: {
    personal: Mission[];
    business: Mission[];
    health: Mission[];
  };
  weekly: {
    personal: Mission[];
    business: Mission[];
    health: Mission[];
  };
  monthly: {
    personal: Mission[];
    business: Mission[];
    health: Mission[];
  };
  currentMilestone: MilestoneInfo | null;
  currentWeek: number;
  currentMonth: number;
}

export function useMissionsRoadmap() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [currentMilestone, setCurrentMilestone] = useState<MilestoneInfo | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch missions and organize them
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

      // Fetch current milestone from life plan
      const { data: lifePlan } = await supabase
        .from('life_plans')
        .select('id, start_date')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (lifePlan) {
        const startDate = new Date(lifePlan.start_date);
        const today = new Date();
        const diffTime = today.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const weekNum = Math.min(12, Math.max(1, Math.floor(diffDays / 7) + 1));
        const monthNum = Math.ceil(weekNum / 4);

        setCurrentWeek(weekNum);
        setCurrentMonth(monthNum);

        // Fetch current milestone
        const { data: milestone } = await supabase
          .from('life_plan_milestones')
          .select('id, week_number, month_number, title, goal, is_completed')
          .eq('plan_id', lifePlan.id)
          .eq('week_number', weekNum)
          .single();

        if (milestone) {
          setCurrentMilestone(milestone as MilestoneInfo);
        }
      }

      // Transform checklists to missions
      const transformedMissions: Mission[] = (checklists || []).map((checklist: any) => {
        const items = checklist.aurora_checklist_items || [];
        const completedCount = items.filter((i: any) => i.is_completed).length;
        const totalCount = items.length;

        return {
          id: checklist.id,
          title: checklist.title,
          category: (checklist.category || 'personal') as MissionCategory,
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
          })),
          completedCount,
          totalCount,
          progress: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
        };
      });

      setMissions(transformedMissions);
    } catch (error) {
      console.error('Error fetching missions:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchMissions();

    if (!user?.id) return;

    // Subscribe to realtime changes
    const channel = supabase
      .channel('missions-roadmap')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'aurora_checklists',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchMissions()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'aurora_checklist_items',
        },
        () => fetchMissions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchMissions]);

  // Organize missions into roadmap structure
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
      const timeScope = mission.time_scope || 'weekly';
      const category = mission.category || 'personal';
      
      if (structure[timeScope] && structure[timeScope][category]) {
        structure[timeScope][category].push(mission);
      }
    });

    return structure;
  }, [missions, currentMilestone, currentWeek, currentMonth]);

  // Toggle mission item
  const toggleItem = useCallback(async (itemId: string, isCompleted: boolean) => {
    const { error } = await supabase
      .from('aurora_checklist_items')
      .update({ 
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .eq('id', itemId);

    if (error) {
      console.error('Error toggling item:', error);
      return false;
    }

    // Award XP if completed
    if (isCompleted && user?.id) {
      await supabase.rpc('aurora_award_xp', {
        p_user_id: user.id,
        p_amount: 10,
        p_reason: 'Mission item completed',
      });
    }

    return true;
  }, [user?.id]);

  // Create a new mission
  const createMission = useCallback(async (
    title: string,
    category: MissionCategory,
    timeScope: MissionTimeScope,
    items?: string[]
  ) => {
    if (!user?.id) return null;

    const { data: checklist, error } = await supabase
      .from('aurora_checklists')
      .insert({
        user_id: user.id,
        title,
        category,
        time_scope: timeScope,
        origin: 'manual',
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating mission:', error);
      return null;
    }

    // Add items if provided
    if (items && items.length > 0 && checklist) {
      const itemsToInsert = items.map((content, index) => ({
        checklist_id: checklist.id,
        content,
        order_index: index,
        is_completed: false,
      }));

      await supabase.from('aurora_checklist_items').insert(itemsToInsert);
    }

    return checklist;
  }, [user?.id]);

  // Update mission category
  const updateMissionCategory = useCallback(async (missionId: string, category: MissionCategory) => {
    const { error } = await supabase
      .from('aurora_checklists')
      .update({ category })
      .eq('id', missionId);

    return !error;
  }, []);

  // Update mission time scope
  const updateMissionTimeScope = useCallback(async (missionId: string, timeScope: MissionTimeScope) => {
    const { error } = await supabase
      .from('aurora_checklists')
      .update({ time_scope: timeScope })
      .eq('id', missionId);

    return !error;
  }, []);

  // Get stats
  const stats = useMemo(() => {
    const allItems = missions.flatMap(m => m.items);
    const completed = allItems.filter(i => i.is_completed).length;
    const total = allItems.length;

    const today = new Date().toISOString().split('T')[0];
    const todayItems = allItems.filter(i => i.due_date === today);
    const todayCompleted = todayItems.filter(i => i.is_completed).length;

    return {
      total,
      completed,
      remaining: total - completed,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      todayTotal: todayItems.length,
      todayCompleted,
      todayRemaining: todayItems.length - todayCompleted,
    };
  }, [missions]);

  return {
    roadmap,
    missions,
    loading,
    stats,
    toggleItem,
    createMission,
    updateMissionCategory,
    updateMissionTimeScope,
    refetch: fetchMissions,
  };
}
