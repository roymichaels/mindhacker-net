import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useGenderedTranslation } from '@/hooks/useGenderedTranslation';
import { useTranslation } from '@/hooks/useTranslation';

// Action types for smart suggestions
export type SuggestionAction = 
  | { type: 'open_hypnosis'; goal?: string }
  | { type: 'open_dashboard'; view?: 'dashboard' | 'profile' }
  | { type: 'send_message'; prompt: string }
  | { type: 'navigate'; path: string }
  | { type: 'open_health_modal'; modal: string };

export interface SmartSuggestion {
  id: string;
  text: string;
  action: SuggestionAction;
  priority: number;
  icon: 'task' | 'hypnosis' | 'plan' | 'habit' | 'reflection' | 'milestone' | 'health' | 'energy';
}

export function useSmartSuggestions() {
  const { user } = useAuth();
  const { tg, language } = useGenderedTranslation();
  const { t } = useTranslation();

  // Fetch user's current state
  const { data: userState } = useQuery({
    queryKey: ['smart-suggestions-state', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const today = new Date().toISOString().split('T')[0];
      
      const [
        { data: overdueTasks },
        { data: todayTasks },
        { data: currentMilestone },
        { data: dailyHabits },
        { data: habitLogs },
        { data: hypnosisToday },
        { data: launchpadComplete },
        { data: existingCurricula }
      ] = await Promise.all([
        supabase
          .from('aurora_checklist_items')
          .select('id, content, aurora_checklists!inner(user_id)')
          .lt('due_date', today)
          .eq('is_completed', false)
          .eq('aurora_checklists.user_id', user.id)
          .limit(5),
        
        supabase
          .from('aurora_checklist_items')
          .select('id, content, aurora_checklists!inner(user_id)')
          .eq('due_date', today)
          .eq('is_completed', false)
          .eq('aurora_checklists.user_id', user.id)
          .limit(5),
        
        supabase
          .from('life_plan_milestones')
          .select('id, title, week_number, life_plans!inner(user_id, status)')
          .eq('life_plans.user_id', user.id)
          .eq('life_plans.status', 'active')
          .eq('is_completed', false)
          .order('week_number', { ascending: true })
          .limit(1)
          .maybeSingle(),
        
        supabase
          .from('aurora_daily_minimums')
          .select('id, title')
          .eq('user_id', user.id)
          .eq('is_active', true),
        
        supabase
          .from('daily_habit_logs')
          .select('habit_item_id, is_completed')
          .eq('user_id', user.id)
          .eq('track_date', today),
        
        supabase
          .from('hypnosis_sessions')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', `${today}T00:00:00`)
          .limit(1),
        
        supabase
          .from('launchpad_summaries')
          .select('id')
          .eq('user_id', user.id)
          .limit(1),

        supabase
          .from('learning_curricula')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
      ]);

      const completedHabitIds = new Set(
        (habitLogs || []).filter(l => l.is_completed).map(l => l.habit_item_id)
      );
      const incompleteHabits = (dailyHabits || []).filter(h => !completedHabitIds.has(h.id));

      return {
        overdueTasks: overdueTasks || [],
        todayTasks: todayTasks || [],
        currentMilestone,
        incompleteHabits,
        didHypnosisToday: (hypnosisToday?.length || 0) > 0,
        hasCompletedLaunchpad: (launchpadComplete?.length || 0) > 0,
        hasNoCurricula: (existingCurricula?.length || 0) === 0,
      };
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  const suggestions = useMemo<SmartSuggestion[]>(() => {
    if (!userState) {
      return [
        {
          id: 'start-hypnosis',
          text: t('smartSuggestions.startHypnosis'),
          action: { type: 'open_hypnosis' },
          priority: 1,
          icon: 'hypnosis',
        },
        {
          id: 'whats-today',
          text: t('smartSuggestions.whatsToday'),
          action: { 
            type: 'send_message', 
            prompt: t('smartSuggestions.whatsTodayPrompt')
          },
          priority: 2,
          icon: 'task',
        },
        {
          id: 'progress-check',
          text: t('smartSuggestions.progressCheck'),
          action: { 
            type: 'send_message', 
            prompt: t('smartSuggestions.progressCheckPrompt')
          },
          priority: 3,
          icon: 'plan',
        },
        {
          id: 'feeling-stuck',
          text: t('smartSuggestions.feelingStuck'),
          action: { 
            type: 'send_message', 
            prompt: t('smartSuggestions.feelingStuckPrompt')
          },
          priority: 4,
          icon: 'reflection',
        },
      ];
    }

    const result: SmartSuggestion[] = [];

    if (userState.overdueTasks.length > 0) {
      result.push({
        id: 'overdue-task',
        text: t('smartSuggestions.overdueTasks').replace('{count}', String(userState.overdueTasks.length)),
        action: { type: 'open_dashboard', view: 'dashboard' },
        priority: 1,
        icon: 'task',
      });
    }

    if (!userState.didHypnosisToday) {
      result.push({
        id: 'daily-hypnosis',
        text: t('smartSuggestions.startHypnosis'),
        action: { type: 'open_hypnosis' },
        priority: 2,
        icon: 'hypnosis',
      });
    }

    if (userState.incompleteHabits.length > 0) {
      const habitCount = userState.incompleteHabits.length;
      result.push({
        id: 'daily-habits',
        text: t('smartSuggestions.dailyHabitsWaiting').replace('{count}', String(habitCount)),
        action: { type: 'open_dashboard', view: 'dashboard' },
        priority: 3,
        icon: 'habit',
      });
    }

    if (userState.todayTasks.length > 0) {
      const task = userState.todayTasks[0];
      result.push({
        id: 'today-task',
        text: t('smartSuggestions.nextTask').replace('{task}', task.content.substring(0, 30)),
        action: { type: 'open_dashboard', view: 'dashboard' },
        priority: 4,
        icon: 'task',
      });
    }

    if (userState.currentMilestone) {
      result.push({
        id: 'milestone-progress',
        text: t('smartSuggestions.milestoneWeek')
          .replace('{week}', String(userState.currentMilestone.week_number))
          .replace('{title}', userState.currentMilestone.title?.substring(0, 25) || ''),
        action: { type: 'open_dashboard', view: 'dashboard' },
        priority: 5,
        icon: 'milestone',
      });
    }

    if (userState.hasNoCurricula) {
      result.push({
        id: 'create-curriculum',
        text: t('smartSuggestions.buildCurriculum'),
        action: { 
          type: 'send_message', 
          prompt: t('smartSuggestions.buildCurriculumPrompt')
        },
        priority: 2,
        icon: 'plan',
      });
    }

    const currentHour = new Date().getHours();
    if (currentHour >= 20 || currentHour < 6) {
      result.push({
        id: 'health-sleep',
        text: t('smartSuggestions.sleepHypnosis'),
        action: { type: 'open_hypnosis', goal: 'sleep' },
        priority: 6,
        icon: 'health',
      });
    } else if (currentHour >= 6 && currentHour < 10) {
      result.push({
        id: 'health-energy',
        text: t('smartSuggestions.morningEnergy'),
        action: { type: 'open_hypnosis', goal: 'energy' },
        priority: 6,
        icon: 'energy',
      });
    } else if (currentHour >= 14 && currentHour < 16) {
      result.push({
        id: 'health-recharge',
        text: t('smartSuggestions.quickRecharge'),
        action: { type: 'navigate', path: '/health' },
        priority: 6,
        icon: 'energy',
      });
    }

    result.push({
      id: 'reflection',
      text: t('smartSuggestions.wantToShare'),
      action: { 
        type: 'send_message', 
        prompt: t('smartSuggestions.wantToSharePrompt')
      },
      priority: 7,
      icon: 'reflection',
    });

    return result.sort((a, b) => a.priority - b.priority).slice(0, 4);
  }, [userState, t]);

  return {
    suggestions,
    isLoading: !userState,
    userState,
  };
}
