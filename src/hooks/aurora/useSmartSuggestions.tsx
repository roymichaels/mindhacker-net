import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useGenderedTranslation } from '@/hooks/useGenderedTranslation';

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
        { data: launchpadComplete },
        { data: existingCurricula }
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
          .limit(1),

        // Existing curricula (to suggest creation if none)
        supabase
          .from('learning_curricula')
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
        hasNoCurricula: (existingCurricula?.length || 0) === 0,
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
          action: { type: 'open_hypnosis' },
          priority: 1,
          icon: 'hypnosis',
        },
        {
          id: 'whats-today',
          text: isHebrew ? '📋 מה יש לי היום?' : "📋 What's on my plate today?",
          action: { 
            type: 'send_message', 
            prompt: isHebrew ? 'מה יש לי היום? תן לי סיכום של המשימות וההרגלים' : "What do I have today? Give me a summary of tasks and habits"
          },
          priority: 2,
          icon: 'task',
        },
        {
          id: 'progress-check',
          text: isHebrew ? '📊 איך אני מתקדם בתוכנית?' : '📊 How am I progressing?',
          action: { 
            type: 'send_message', 
            prompt: isHebrew ? 'איך אני מתקדם בתוכנית ה-90 ימים שלי? תן לי סקירה' : 'How am I progressing in my 90-day plan? Give me an overview'
          },
          priority: 3,
          icon: 'plan',
        },
        {
          id: 'feeling-stuck',
          text: isHebrew ? '🤔 אני מרגיש תקוע...' : "🤔 I'm feeling stuck...",
          action: { 
            type: 'send_message', 
            prompt: isHebrew ? 'אני מרגיש קצת תקוע היום, בוא נדבר על זה' : "I'm feeling a bit stuck today, let's talk about it"
          },
          priority: 4,
          icon: 'reflection',
        },
      ];
    }

    const result: SmartSuggestion[] = [];

    // Priority 1: Overdue tasks (highest urgency) - Opens dashboard
    if (userState.overdueTasks.length > 0) {
      result.push({
        id: 'overdue-task',
        text: isHebrew 
          ? `⚠️ יש ${userState.overdueTasks.length} משימות באיחור - בוא נטפל!`
          : `⚠️ ${userState.overdueTasks.length} overdue tasks - let's handle them!`,
        action: { type: 'open_dashboard', view: 'dashboard' },
        priority: 1,
        icon: 'task',
      });
    }

    // Priority 2: Daily hypnosis (if not done today) - Opens hypnosis modal
    if (!userState.didHypnosisToday) {
      result.push({
        id: 'daily-hypnosis',
        text: isHebrew ? '🧘 התחל את ההיפנוזה היומית שלך' : '🧘 Start your daily hypnosis',
        action: { type: 'open_hypnosis' },
        priority: 2,
        icon: 'hypnosis',
      });
    }

    // Priority 3: Incomplete daily habits - Opens dashboard
    if (userState.incompleteHabits.length > 0) {
      const habitCount = userState.incompleteHabits.length;
      result.push({
        id: 'daily-habits',
        text: isHebrew 
          ? `✨ ${habitCount} הרגלים יומיים מחכים לך`
          : `✨ ${habitCount} daily habits waiting for you`,
        action: { type: 'open_dashboard', view: 'dashboard' },
        priority: 3,
        icon: 'habit',
      });
    }

    // Priority 4: Today's tasks - Opens dashboard
    if (userState.todayTasks.length > 0) {
      const task = userState.todayTasks[0];
      result.push({
        id: 'today-task',
        text: isHebrew 
          ? `📋 המשימה הבאה שלך: ${task.content.substring(0, 30)}...`
          : `📋 Your next task: ${task.content.substring(0, 30)}...`,
        action: { type: 'open_dashboard', view: 'dashboard' },
        priority: 4,
        icon: 'task',
      });
    }

    // Priority 5: Current milestone progress - Opens dashboard
    if (userState.currentMilestone) {
      result.push({
        id: 'milestone-progress',
        text: isHebrew 
          ? `🎯 שבוע ${userState.currentMilestone.week_number}: ${userState.currentMilestone.title?.substring(0, 25)}...`
          : `🎯 Week ${userState.currentMilestone.week_number}: ${userState.currentMilestone.title?.substring(0, 25)}...`,
        action: { type: 'open_dashboard', view: 'dashboard' },
        priority: 5,
        icon: 'milestone',
      });
    }

    // Priority 2.5: Post-onboarding curriculum suggestion (expansion pillar)
    if (userState.hasNoCurricula) {
      result.push({
        id: 'create-curriculum',
        text: isHebrew 
          ? '📚 בנה קורס מותאם אישית להתרחבות שלך'
          : '📚 Build a personalized Expansion course',
        action: { 
          type: 'send_message', 
          prompt: isHebrew 
            ? 'אני רוצה ליצור קורס מותאם אישית בתחום ההתרחבות. עזור לי לבנות תוכנית לימודים שמתאימה לי, מבוססת על מה שאתה כבר יודע עליי.' 
            : 'I want to create a personalized course in the Expansion domain. Help me build a curriculum that fits me, based on what you already know about me.'
        },
        priority: 2,
        icon: 'plan',
      });
    }

    // Priority 6: Health-based suggestions (time-aware)
    const currentHour = new Date().getHours();
    if (currentHour >= 20 || currentHour < 6) {
      // Evening/night: sleep hypnosis
      result.push({
        id: 'health-sleep',
        text: isHebrew ? '🌙 היפנוזה לשינה עמוקה' : '🌙 Deep sleep hypnosis',
        action: { type: 'open_hypnosis', goal: 'sleep' },
        priority: 6,
        icon: 'health',
      });
    } else if (currentHour >= 6 && currentHour < 10) {
      // Morning: energy boost
      result.push({
        id: 'health-energy',
        text: isHebrew ? '⚡ היפנוזה לאנרגיה בוקרית' : '⚡ Morning energy hypnosis',
        action: { type: 'open_hypnosis', goal: 'energy' },
        priority: 6,
        icon: 'energy',
      });
    } else if (currentHour >= 14 && currentHour < 16) {
      // Afternoon slump: quick recharge
      result.push({
        id: 'health-recharge',
        text: isHebrew ? '🔋 טעינה מהירה של 5 דקות' : '🔋 Quick 5-minute recharge',
        action: { type: 'navigate', path: '/health' },
        priority: 6,
        icon: 'energy',
      });
    }

    // Priority 7: General reflection (always available) - Sends message
    result.push({
      id: 'reflection',
      text: isHebrew ? '💭 אני רוצה לשתף משהו...' : '💭 I want to share something...',
      action: { 
        type: 'send_message', 
        prompt: isHebrew ? 'אני רוצה לשתף אותך במשהו שעובר עליי' : 'I want to share something that I\'m going through'
      },
      priority: 7,
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
