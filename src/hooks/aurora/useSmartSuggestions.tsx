import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useGenderedTranslation } from '@/hooks/useGenderedTranslation';

interface SmartSuggestion {
  id: string;
  text: string;
  prompt: string;
  priority: number;
  icon: 'task' | 'hypnosis' | 'plan' | 'habit' | 'reflection' | 'milestone';
}

export function useSmartSuggestions() {
  const { user } = useAuth();
  const { tg, language } = useGenderedTranslation();
  const isHebrew = language === 'he';

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
        { data: launchpadComplete }
      ] = await Promise.all([
        // Overdue tasks
        supabase
          .from('aurora_checklist_items')
          .select('id, content, aurora_checklists!inner(user_id)')
          .lt('due_date', today)
          .eq('is_completed', false)
          .eq('aurora_checklists.user_id', user.id)
          .limit(5),
        
        // Today's tasks
        supabase
          .from('aurora_checklist_items')
          .select('id, content, aurora_checklists!inner(user_id)')
          .eq('due_date', today)
          .eq('is_completed', false)
          .eq('aurora_checklists.user_id', user.id)
          .limit(5),
        
        // Current milestone
        supabase
          .from('life_plan_milestones')
          .select('id, title, week_number, life_plans!inner(user_id, status)')
          .eq('life_plans.user_id', user.id)
          .eq('life_plans.status', 'active')
          .eq('is_completed', false)
          .order('week_number', { ascending: true })
          .limit(1)
          .maybeSingle(),
        
        // Daily habits
        supabase
          .from('aurora_daily_minimums')
          .select('id, title')
          .eq('user_id', user.id)
          .eq('is_active', true),
        
        // Today's habit logs
        supabase
          .from('daily_habit_logs')
          .select('habit_item_id, is_completed')
          .eq('user_id', user.id)
          .eq('track_date', today),
        
        // Hypnosis session today
        supabase
          .from('hypnosis_sessions')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', `${today}T00:00:00`)
          .limit(1),
        
        // Launchpad completion
        supabase
          .from('launchpad_summaries')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
      ]);

      // Calculate incomplete habits
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
      };
    },
    enabled: !!user?.id,
    staleTime: 30000, // 30 seconds
  });

  const suggestions = useMemo<SmartSuggestion[]>(() => {
    if (!userState) {
      // Default suggestions for new/loading users
      return [
        {
          id: 'start-hypnosis',
          text: isHebrew ? '🧘 התחל את ההיפנוזה היומית שלך' : '🧘 Start your daily hypnosis',
          prompt: isHebrew ? 'אני רוצה להתחיל את ההיפנוזה היומית שלי' : 'I want to start my daily hypnosis',
          priority: 1,
          icon: 'hypnosis',
        },
        {
          id: 'whats-today',
          text: isHebrew ? '📋 מה יש לי היום?' : "📋 What's on my plate today?",
          prompt: isHebrew ? 'מה יש לי היום? תן לי סיכום של המשימות וההרגלים' : "What do I have today? Give me a summary of tasks and habits",
          priority: 2,
          icon: 'task',
        },
        {
          id: 'progress-check',
          text: isHebrew ? '📊 איך אני מתקדם בתוכנית?' : '📊 How am I progressing?',
          prompt: isHebrew ? 'איך אני מתקדם בתוכנית ה-90 ימים שלי? תן לי סקירה' : 'How am I progressing in my 90-day plan? Give me an overview',
          priority: 3,
          icon: 'plan',
        },
        {
          id: 'feeling-stuck',
          text: isHebrew ? '🤔 אני מרגיש תקוע...' : "🤔 I'm feeling stuck...",
          prompt: isHebrew ? 'אני מרגיש קצת תקוע היום, בוא נדבר על זה' : "I'm feeling a bit stuck today, let's talk about it",
          priority: 4,
          icon: 'reflection',
        },
      ];
    }

    const result: SmartSuggestion[] = [];

    // Priority 1: Overdue tasks (highest urgency)
    if (userState.overdueTasks.length > 0) {
      const task = userState.overdueTasks[0];
      result.push({
        id: 'overdue-task',
        text: isHebrew 
          ? `⚠️ יש ${userState.overdueTasks.length} משימות באיחור - בוא נטפל!`
          : `⚠️ ${userState.overdueTasks.length} overdue tasks - let's handle them!`,
        prompt: isHebrew 
          ? `יש לי משימות באיחור. המשימה הראשונה היא: "${task.content}". בוא נדבר על איך להתקדם`
          : `I have overdue tasks. The first one is: "${task.content}". Let's talk about how to move forward`,
        priority: 1,
        icon: 'task',
      });
    }

    // Priority 2: Daily hypnosis (if not done today)
    if (!userState.didHypnosisToday) {
      result.push({
        id: 'daily-hypnosis',
        text: isHebrew ? '🧘 התחל את ההיפנוזה היומית שלך' : '🧘 Start your daily hypnosis',
        prompt: isHebrew ? 'אני רוצה להתחיל את ההיפנוזה היומית שלי' : 'I want to start my daily hypnosis',
        priority: 2,
        icon: 'hypnosis',
      });
    }

    // Priority 3: Incomplete daily habits
    if (userState.incompleteHabits.length > 0) {
      const habitCount = userState.incompleteHabits.length;
      result.push({
        id: 'daily-habits',
        text: isHebrew 
          ? `✨ ${habitCount} הרגלים יומיים מחכים לך`
          : `✨ ${habitCount} daily habits waiting for you`,
        prompt: isHebrew 
          ? 'בוא נעבור על ההרגלים היומיים שלי ונסמן מה עשיתי'
          : "Let's go through my daily habits and mark what I've done",
        priority: 3,
        icon: 'habit',
      });
    }

    // Priority 4: Today's tasks
    if (userState.todayTasks.length > 0) {
      const task = userState.todayTasks[0];
      result.push({
        id: 'today-task',
        text: isHebrew 
          ? `📋 המשימה הבאה שלך: ${task.content.substring(0, 30)}...`
          : `📋 Your next task: ${task.content.substring(0, 30)}...`,
        prompt: isHebrew 
          ? `בוא נדבר על המשימה הבאה שלי: "${task.content}"`
          : `Let's talk about my next task: "${task.content}"`,
        priority: 4,
        icon: 'task',
      });
    }

    // Priority 5: Current milestone progress
    if (userState.currentMilestone) {
      result.push({
        id: 'milestone-progress',
        text: isHebrew 
          ? `🎯 שבוע ${userState.currentMilestone.week_number}: ${userState.currentMilestone.title?.substring(0, 25)}...`
          : `🎯 Week ${userState.currentMilestone.week_number}: ${userState.currentMilestone.title?.substring(0, 25)}...`,
        prompt: isHebrew 
          ? `איך אני מתקדם בשבוע ${userState.currentMilestone.week_number} של התוכנית? המטרה היא: ${userState.currentMilestone.title}`
          : `How am I progressing in week ${userState.currentMilestone.week_number} of my plan? The goal is: ${userState.currentMilestone.title}`,
        priority: 5,
        icon: 'milestone',
      });
    }

    // Priority 6: General reflection (always available)
    result.push({
      id: 'reflection',
      text: isHebrew ? '💭 אני רוצה לשתף משהו...' : '💭 I want to share something...',
      prompt: isHebrew ? 'אני רוצה לשתף אותך במשהו שעובר עליי' : 'I want to share something that I\'m going through',
      priority: 6,
      icon: 'reflection',
    });

    // Sort by priority and take top 4
    return result.sort((a, b) => a.priority - b.priority).slice(0, 4);
  }, [userState, isHebrew]);

  return {
    suggestions,
    isLoading: !userState,
    userState,
  };
}
