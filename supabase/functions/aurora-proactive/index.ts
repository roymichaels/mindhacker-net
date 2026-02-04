import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProactiveItem {
  id: string;
  user_id: string;
  trigger_type: string;
  trigger_data: Record<string, unknown>;
  priority: number;
  scheduled_for: string;
}

interface UserContext {
  overdue_tasks: number;
  incomplete_habits: number;
  upcoming_reminders: number;
  streak_days: number;
  last_active: string | null;
  energy_level: string;
}

// Generate proactive message based on context
const generateProactiveMessage = (
  triggerType: string,
  data: Record<string, unknown>,
  isHebrew: boolean
): { title: string; body: string; action?: string } => {
  const messages: Record<string, { he: { title: string; body: string }; en: { title: string; body: string }; action?: string }> = {
    overdue_task: {
      he: {
        title: '📋 יש לך משימות שמחכות',
        body: `יש לך ${data.count || 1} משימות שעבר הזמן שלהן. רוצה שאעזור לתזמן אותן מחדש?`,
      },
      en: {
        title: '📋 Tasks Need Attention',
        body: `You have ${data.count || 1} overdue tasks. Want me to help reschedule them?`,
      },
      action: 'open_tasks',
    },
    habit_reminder: {
      he: {
        title: '💪 זמן לפעולה יומית',
        body: data.habitName ? `עדיין לא סימנת "${data.habitName}" היום` : 'יש הרגלים יומיים שמחכים לך',
      },
      en: {
        title: '💪 Daily Action Time',
        body: data.habitName ? `You haven't logged "${data.habitName}" yet today` : 'You have daily habits waiting',
      },
      action: 'open_habits',
    },
    milestone_ending: {
      he: {
        title: '🎯 מילסטון מתקרב לסיום',
        body: `שבוע ${data.week || '?'} מסתיים מחר - את/ה ב-${data.progress || 0}% השלמה!`,
      },
      en: {
        title: '🎯 Milestone Ending Soon',
        body: `Week ${data.week || '?'} ends tomorrow - you're at ${data.progress || 0}% completion!`,
      },
      action: 'open_life_plan',
    },
    streak_risk: {
      he: {
        title: '🔥 הסטריק שלך בסכנה!',
        body: `יש לך ${data.streakDays || 0} ימים רצופים. אל תפספס את היום!`,
      },
      en: {
        title: '🔥 Your Streak is at Risk!',
        body: `You have a ${data.streakDays || 0}-day streak. Don't miss today!`,
      },
      action: 'open_dashboard',
    },
    daily_checkin: {
      he: {
        title: '☀️ בוקר טוב!',
        body: data.message as string || 'מה בתוכנית להיום?',
      },
      en: {
        title: '☀️ Good Morning!',
        body: data.message as string || 'What\'s on the agenda today?',
      },
      action: 'open_aurora',
    },
    pattern_alert: {
      he: {
        title: '💡 זיהיתי משהו',
        body: data.insight as string || 'יש לי תובנה לשתף איתך',
      },
      en: {
        title: '💡 I Noticed Something',
        body: data.insight as string || 'I have an insight to share with you',
      },
      action: 'open_aurora',
    },
    evening_reflection: {
      he: {
        title: '🌙 זמן לסיכום יום',
        body: 'איך עבר היום? בוא נעשה רפלקציה קצרה',
      },
      en: {
        title: '🌙 Time for Daily Reflection',
        body: 'How was your day? Let\'s do a quick reflection',
      },
      action: 'open_aurora',
    },
  };

  const msg = messages[triggerType] || messages.daily_checkin;
  const localized = isHebrew ? msg.he : msg.en;
  
  return {
    title: localized.title,
    body: localized.body,
    action: msg.action,
  };
};

// Get user context for proactive analysis
// deno-lint-ignore no-explicit-any
const getUserContext = async (
  supabase: SupabaseClient<any, any, any>,
  userId: string
): Promise<UserContext> => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  // Get overdue tasks
  const { data: overdueTasks } = await supabase
    .from('aurora_checklist_items')
    .select('id')
    .eq('is_completed', false)
    .lt('due_date', todayStart);

  // Get incomplete daily habits for today
  const { data: checklists } = await supabase
    .from('aurora_checklists')
    .select('id')
    .eq('user_id', userId)
    .eq('time_scope', 'daily');

  const checklistIds = (checklists as { id: string }[] | null)?.map(c => c.id) || [];
  
  let incompleteHabits = 0;
  if (checklistIds.length > 0) {
    const { count } = await supabase
      .from('aurora_checklist_items')
      .select('*', { count: 'exact', head: true })
      .in('checklist_id', checklistIds)
      .eq('is_completed', false);
    incompleteHabits = count || 0;
  }

  // Get upcoming reminders (next 2 hours)
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
  const { count: upcomingReminders } = await supabase
    .from('aurora_reminders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_delivered', false)
    .lte('reminder_date', twoHoursLater)
    .gte('reminder_date', now.toISOString());

  // Get user's last active time and energy level
  const { data: progress } = await supabase
    .from('aurora_onboarding_progress')
    .select('last_active_at, energy_level')
    .eq('user_id', userId)
    .single();

  const progressData = progress as { last_active_at?: string; energy_level?: string } | null;

  // Calculate streak (simplified - days with completed habits)
  const { count: streakDays } = await supabase
    .from('daily_habit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_completed', true)
    .gte('track_date', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  return {
    overdue_tasks: (overdueTasks as { id: string }[] | null)?.length || 0,
    incomplete_habits: incompleteHabits,
    upcoming_reminders: upcomingReminders || 0,
    streak_days: streakDays || 0,
    last_active: progressData?.last_active_at || null,
    energy_level: progressData?.energy_level || 'medium',
  };
};

// Queue proactive items based on user context
// deno-lint-ignore no-explicit-any
const analyzeAndQueueProactive = async (
  supabase: SupabaseClient<any, any, any>,
  userId: string,
  context: UserContext
): Promise<void> => {
  const now = new Date();
  const hour = now.getHours();
  
  const itemsToQueue: Array<{
    trigger_type: string;
    trigger_data: Record<string, unknown>;
    priority: number;
    scheduled_for: Date;
  }> = [];

  // Check for overdue tasks (high priority)
  if (context.overdue_tasks > 0) {
    itemsToQueue.push({
      trigger_type: 'overdue_task',
      trigger_data: { count: context.overdue_tasks },
      priority: 8,
      scheduled_for: now,
    });
  }

  // Morning check-in (if it's morning and user hasn't been active today)
  if (hour >= 7 && hour <= 10 && !context.last_active) {
    itemsToQueue.push({
      trigger_type: 'daily_checkin',
      trigger_data: {},
      priority: 6,
      scheduled_for: now,
    });
  }

  // Habit reminder (if it's afternoon and habits incomplete)
  if (hour >= 14 && hour <= 18 && context.incomplete_habits > 2) {
    itemsToQueue.push({
      trigger_type: 'habit_reminder',
      trigger_data: { count: context.incomplete_habits },
      priority: 5,
      scheduled_for: now,
    });
  }

  // Streak risk warning (if user has a streak and might lose it)
  if (context.streak_days >= 3 && context.incomplete_habits > 0 && hour >= 20) {
    itemsToQueue.push({
      trigger_type: 'streak_risk',
      trigger_data: { streakDays: context.streak_days },
      priority: 9,
      scheduled_for: now,
    });
  }

  // Evening reflection (if it's late evening)
  if (hour >= 21 && hour <= 23) {
    itemsToQueue.push({
      trigger_type: 'evening_reflection',
      trigger_data: {},
      priority: 4,
      scheduled_for: now,
    });
  }

  // Insert queued items (avoid duplicates)
  for (const item of itemsToQueue) {
    // Check if similar item already exists in last 4 hours
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from('aurora_proactive_queue')
      .select('id')
      .eq('user_id', userId)
      .eq('trigger_type', item.trigger_type)
      .gte('created_at', fourHoursAgo)
      .limit(1);

    const existingItems = existing as { id: string }[] | null;
    if (!existingItems || existingItems.length === 0) {
      // deno-lint-ignore no-explicit-any
      await (supabase as any).from('aurora_proactive_queue').insert({
        user_id: userId,
        trigger_type: item.trigger_type,
        trigger_data: item.trigger_data,
        priority: item.priority,
        scheduled_for: item.scheduled_for.toISOString(),
      });
      console.log(`Queued ${item.trigger_type} for user ${userId}`);
    }
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { action, user_id, item_id } = body;

    // Action: analyze - Analyze user context and queue proactive messages
    if (action === 'analyze') {
      if (!user_id) {
        return new Response(
          JSON.stringify({ error: 'user_id required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const context = await getUserContext(supabase, user_id);
      await analyzeAndQueueProactive(supabase, user_id, context);

      return new Response(
        JSON.stringify({ success: true, context }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: get_pending - Get pending proactive items for a user
    if (action === 'get_pending') {
      if (!user_id) {
        return new Response(
          JSON.stringify({ error: 'user_id required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: items } = await supabase.rpc('get_pending_proactive_items', {
        p_user_id: user_id,
      });

      // Generate messages for each item
      const messages = ((items as ProactiveItem[] | null) || []).map((item: ProactiveItem) => {
        const message = generateProactiveMessage(item.trigger_type, item.trigger_data, true);
        return {
          id: item.id,
          ...message,
          priority: item.priority,
          scheduled_for: item.scheduled_for,
        };
      });

      return new Response(
        JSON.stringify({ items: messages }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: mark_sent - Mark item as sent
    if (action === 'mark_sent') {
      if (!item_id) {
        return new Response(
          JSON.stringify({ error: 'item_id required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await supabase
        .from('aurora_proactive_queue')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', item_id);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: dismiss - Dismiss an item
    if (action === 'dismiss') {
      if (!item_id) {
        return new Response(
          JSON.stringify({ error: 'item_id required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await supabase
        .from('aurora_proactive_queue')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', item_id);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: batch_analyze - Analyze all active users (for cron job)
    if (action === 'batch_analyze') {
      // Get users active in last 7 days with proactive enabled
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: activeUsers } = await supabase
        .from('aurora_onboarding_progress')
        .select('user_id')
        .eq('proactive_enabled', true)
        .gte('last_active_at', sevenDaysAgo);

      const usersList = activeUsers as { user_id: string }[] | null;
      const processedUsers: string[] = [];
      
      for (const user of usersList || []) {
        try {
          const context = await getUserContext(supabase, user.user_id);
          await analyzeAndQueueProactive(supabase, user.user_id, context);
          processedUsers.push(user.user_id);
        } catch (err) {
          console.error(`Error processing user ${user.user_id}:`, err);
        }
      }

      return new Response(
        JSON.stringify({ success: true, processed: processedUsers.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Aurora Proactive error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
