import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface UserContext {
  overdue_tasks: number;
  overdue_task_names: string[];
  today_total: number;
  today_completed: number;
  incomplete_habits: number;
  streak_days: number;
  last_active: string | null;
  energy_level: string;
  current_week: number;
  milestone_title: string;
  milestone_progress: number;
}

const getUserContext = async (
  supabase: SupabaseClient<any, any, any>,
  userId: string
): Promise<UserContext> => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Overdue tasks
  const { data: overdueTasks } = await supabase
    .from('aurora_checklist_items')
    .select('id, content, checklist_id')
    .eq('is_completed', false)
    .lt('due_date', todayStr);

  // Filter to user's checklists
  const { data: userChecklists } = await supabase
    .from('aurora_checklists')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active');

  const userChecklistIds = new Set((userChecklists || []).map((c: any) => c.id));
  const userOverdue = (overdueTasks || []).filter((t: any) => userChecklistIds.has(t.checklist_id));

  // Today's tasks
  const { data: todayTasks } = await supabase
    .from('aurora_checklist_items')
    .select('id, is_completed, checklist_id')
    .eq('due_date', todayStr);

  const userTodayTasks = (todayTasks || []).filter((t: any) => userChecklistIds.has(t.checklist_id));
  const todayCompleted = userTodayTasks.filter((t: any) => t.is_completed).length;

  // Incomplete daily habits
  const { data: dailyChecklists } = await supabase
    .from('aurora_checklists')
    .select('id')
    .eq('user_id', userId)
    .eq('time_scope', 'daily');

  const dailyIds = (dailyChecklists || []).map((c: any) => c.id);
  let incompleteHabits = 0;
  if (dailyIds.length > 0) {
    const { count } = await supabase
      .from('aurora_checklist_items')
      .select('*', { count: 'exact', head: true })
      .in('checklist_id', dailyIds)
      .eq('is_completed', false);
    incompleteHabits = count || 0;
  }

  // User progress
  const { data: progress } = await supabase
    .from('aurora_onboarding_progress')
    .select('last_active_at, energy_level')
    .eq('user_id', userId)
    .single();

  // Current milestone
  const { data: lifePlan } = await supabase
    .from('life_plans')
    .select('id, start_date')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  let currentWeek = 1;
  let milestoneTitle = '';
  let milestoneProgress = 0;

  if (lifePlan) {
    const startDate = new Date(lifePlan.start_date);
    const diffDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    currentWeek = Math.min(12, Math.max(1, Math.floor(diffDays / 7) + 1));

    const { data: milestone } = await supabase
      .from('life_plan_milestones')
      .select('title, is_completed')
      .eq('plan_id', lifePlan.id)
      .eq('week_number', currentWeek)
      .single();

    if (milestone) {
      milestoneTitle = (milestone as any).title;
      milestoneProgress = (milestone as any).is_completed ? 100 : 0;
    }
  }

  // Streak (consecutive days with at least 1 completed task)
  let streakDays = 0;
  for (let i = 1; i <= 30; i++) {
    const checkDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { count } = await supabase
      .from('aurora_checklist_items')
      .select('*', { count: 'exact', head: true })
      .eq('due_date', checkDate)
      .not('completed_at', 'is', null);
    if ((count || 0) > 0) streakDays++;
    else break;
  }

  return {
    overdue_tasks: userOverdue.length,
    overdue_task_names: userOverdue.slice(0, 3).map((t: any) => t.content),
    today_total: userTodayTasks.length,
    today_completed: todayCompleted,
    incomplete_habits: incompleteHabits,
    streak_days: streakDays,
    last_active: (progress as any)?.last_active_at || null,
    energy_level: (progress as any)?.energy_level || 'medium',
    current_week: currentWeek,
    milestone_title: milestoneTitle,
    milestone_progress: milestoneProgress,
  };
};

const generateAICoachingMessage = async (
  context: UserContext,
  triggerType: string
): Promise<{ title: string; body: string }> => {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return generateFallbackMessage(context, triggerType);
  }

  try {
    const prompt = `אתה אורורה, מאמנת חיים אישית בעברית. צרי הודעת מוטיבציה קצרה ואישית למשתמש.

סוג ההודעה: ${triggerType}
נתוני משתמש:
- משימות באיחור: ${context.overdue_tasks} ${context.overdue_task_names.length > 0 ? `(${context.overdue_task_names.join(', ')})` : ''}
- משימות היום: ${context.today_completed}/${context.today_total} הושלמו
- הרגלים לא מושלמים: ${context.incomplete_habits}
- רצף ימים: ${context.streak_days}
- שבוע נוכחי בתוכנית: ${context.current_week}/12
- אבן דרך: ${context.milestone_title}
- רמת אנרגיה: ${context.energy_level}

כתבי תגובה בפורמט JSON בלבד:
{"title": "כותרת קצרה עם אימוג'י", "body": "הודעה אישית מעודדת של 1-2 משפטים"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [{ role: "user", content: prompt }],
        tools: [{
          type: "function",
          function: {
            name: "coaching_message",
            description: "Return a coaching message",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "Short title with emoji" },
                body: { type: "string", description: "1-2 sentence motivational message in Hebrew" }
              },
              required: ["title", "body"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "coaching_message" } },
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      return generateFallbackMessage(context, triggerType);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const args = JSON.parse(toolCall.function.arguments);
      return { title: args.title, body: args.body };
    }

    return generateFallbackMessage(context, triggerType);
  } catch (e) {
    console.error("AI coaching error:", e);
    return generateFallbackMessage(context, triggerType);
  }
};

const generateFallbackMessage = (context: UserContext, triggerType: string): { title: string; body: string } => {
  const messages: Record<string, { title: string; body: string }> = {
    morning_briefing: {
      title: '☀️ בוקר טוב!',
      body: context.today_total > 0
        ? `יש לך ${context.today_total} משימות היום. בואי נתחיל!`
        : 'יום חדש, הזדמנויות חדשות! מה בתוכנית?',
    },
    progress_check: {
      title: '📊 עדכון התקדמות',
      body: `השלמת ${context.today_completed}/${context.today_total} משימות היום. ${context.today_completed === context.today_total ? 'מדהים! 🎉' : 'המשיכי ככה!'}`,
    },
    missed_task_nudge: {
      title: '📋 יש משימות שמחכות',
      body: `${context.overdue_tasks} משימות באיחור. ${context.overdue_task_names[0] ? `למשל: "${context.overdue_task_names[0]}"` : ''} רוצה לטפל בזה?`,
    },
    streak_celebration: {
      title: '🔥 רצף מרשים!',
      body: `${context.streak_days} ימים רצופים! אתה לגמרי על הכיוון הנכון.`,
    },
    task_suggestion: {
      title: '💡 רעיון לשיפור',
      body: `בהתבסס על ההתקדמות שלך בשבוע ${context.current_week}, יש לי כמה הצעות לשפר את המסלול.`,
    },
    weekly_review: {
      title: '📝 סיכום שבועי',
      body: `שבוע ${context.current_week} מסתיים. בואי נסכם ונתכנן את הבא!`,
    },
  };

  return messages[triggerType] || messages.morning_briefing;
};

const analyzeAndQueue = async (
  supabase: SupabaseClient<any, any, any>,
  userId: string,
  context: UserContext
): Promise<void> => {
  const now = new Date();
  const hour = now.getHours();

  interface QueueItem {
    trigger_type: string;
    priority: number;
  }

  const items: QueueItem[] = [];

  // Morning briefing (7-10am)
  if (hour >= 7 && hour <= 10) {
    items.push({ trigger_type: 'morning_briefing', priority: 7 });
  }

  // Overdue tasks (any time, high priority)
  if (context.overdue_tasks > 0) {
    items.push({ trigger_type: 'missed_task_nudge', priority: 8 });
  }

  // Progress check (2-6pm)
  if (hour >= 14 && hour <= 18 && context.today_total > 0) {
    items.push({ trigger_type: 'progress_check', priority: 5 });
  }

  // Streak celebration
  if (context.streak_days >= 3 && context.streak_days % 3 === 0) {
    items.push({ trigger_type: 'streak_celebration', priority: 6 });
  }

  // Weekly review (Friday evening)
  if (now.getDay() === 5 && hour >= 16) {
    items.push({ trigger_type: 'weekly_review', priority: 7 });
  }

  // Task suggestions (Sunday morning)
  if (now.getDay() === 0 && hour >= 8 && hour <= 12) {
    items.push({ trigger_type: 'task_suggestion', priority: 4 });
  }

  for (const item of items) {
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from('aurora_proactive_queue')
      .select('id')
      .eq('user_id', userId)
      .eq('trigger_type', item.trigger_type)
      .gte('created_at', fourHoursAgo)
      .limit(1);

    if (!existing || existing.length === 0) {
      const msg = await generateAICoachingMessage(context, item.trigger_type);

      await (supabase as any).from('aurora_proactive_queue').insert({
        user_id: userId,
        trigger_type: item.trigger_type,
        trigger_data: { context },
        priority: item.priority,
        scheduled_for: now.toISOString(),
        title: msg.title,
        body: msg.body,
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

    if (action === 'analyze') {
      if (!user_id) return new Response(JSON.stringify({ error: 'user_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      const context = await getUserContext(supabase, user_id);
      await analyzeAndQueue(supabase, user_id, context);
      return new Response(JSON.stringify({ success: true, context }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'get_pending') {
      if (!user_id) return new Response(JSON.stringify({ error: 'user_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      const { data: items } = await supabase
        .from('aurora_proactive_queue')
        .select('*')
        .eq('user_id', user_id)
        .is('dismissed_at', null)
        .lte('scheduled_for', new Date().toISOString())
        .order('priority', { ascending: false })
        .limit(5);

      const messages = (items || []).map((item: any) => ({
        id: item.id,
        title: item.title || '💡 הודעה מאורורה',
        body: item.body || 'יש לי משהו לשתף איתך',
        action: item.trigger_type,
        priority: item.priority,
        scheduled_for: item.scheduled_for,
      }));

      return new Response(JSON.stringify({ items: messages }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'dismiss') {
      if (!item_id) return new Response(JSON.stringify({ error: 'item_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      await supabase.from('aurora_proactive_queue').update({ dismissed_at: new Date().toISOString() }).eq('id', item_id);
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'mark_sent') {
      if (!item_id) return new Response(JSON.stringify({ error: 'item_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      await supabase.from('aurora_proactive_queue').update({ sent_at: new Date().toISOString() }).eq('id', item_id);
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'batch_analyze') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: activeUsers } = await supabase
        .from('aurora_onboarding_progress')
        .select('user_id')
        .eq('proactive_enabled', true)
        .gte('last_active_at', sevenDaysAgo);

      let processed = 0;
      for (const user of (activeUsers || []) as { user_id: string }[]) {
        try {
          const context = await getUserContext(supabase, user.user_id);
          await analyzeAndQueue(supabase, user.user_id, context);
          processed++;
        } catch (err) {
          console.error(`Error processing ${user.user_id}:`, err);
        }
      }

      return new Response(JSON.stringify({ success: true, processed }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Aurora Proactive error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
