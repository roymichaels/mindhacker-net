/**
 * Aurora Proactive Coaching Engine
 * 
 * Now uses shared contextBuilder from aurora-chat instead of
 * duplicating getUserContext logic.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildContext, AuroraContext } from "../_shared/contextBuilder.ts";
import { fetchWithRetry } from "../_shared/fetchWithRetry.ts";
import { logEdgeFunctionError } from "../_shared/errorLogger.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ─── Adapt AuroraContext to proactive needs ────────────────

interface ProactiveSnapshot {
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
  stalled_projects: { name: string; days_stalled: number }[];
  approaching_deadlines: { name: string; days_left: number }[];
  projects_without_milestones: string[];
}

function toProactiveSnapshot(ctx: AuroraContext): ProactiveSnapshot {
  const completedHabits = ctx.action_items.habits.filter(h => h.completed_today).length;
  const currentMilestone = ctx.action_items.milestones.find(m => !m.is_completed);
  
  // Estimate streak from habits (simplified — context builder could add this later)
  const maxStreak = ctx.action_items.habits.reduce((max, h) => Math.max(max, h.streak), 0);

  return {
    overdue_tasks: ctx.action_items.overdue_tasks.length,
    overdue_task_names: ctx.action_items.overdue_tasks.slice(0, 3).map(t => t.title),
    today_total: ctx.action_items.today_tasks.length,
    today_completed: ctx.action_items.today_tasks.filter(t => t.status === 'done').length,
    incomplete_habits: ctx.action_items.habits.length - completedHabits,
    streak_days: maxStreak,
    last_active: null,
    energy_level: 'medium',
    current_week: ctx.life_plan?.current_week || 1,
    milestone_title: currentMilestone?.title || '',
    milestone_progress: currentMilestone ? (currentMilestone.is_completed ? 100 : 0) : 0,
    stalled_projects: ctx.projects.filter(p => p.days_since_update >= 7).map(p => ({ name: p.name, days_stalled: p.days_since_update })),
    approaching_deadlines: ctx.projects
      .filter(p => p.target_date)
      .map(p => {
        const daysLeft = Math.floor((new Date(p.target_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return { name: p.name, days_left: daysLeft };
      })
      .filter(p => p.days_left >= 0 && p.days_left <= 14),
    projects_without_milestones: ctx.projects.filter(p => p.progress === 0).map(p => p.name),
  };
}

// ─── AI Coaching Message ───────────────────────────────────

const generateAICoachingMessage = async (
  snapshot: ProactiveSnapshot,
  triggerType: string
): Promise<{ title: string; body: string }> => {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return generateFallbackMessage(snapshot, triggerType);
  }

  try {
    const prompt = `אתה אורורה, מאמנת חיים אישית בעברית. צרי הודעת מוטיבציה קצרה ואישית למשתמש.

סוג ההודעה: ${triggerType}
נתוני משתמש:
- משימות באיחור: ${snapshot.overdue_tasks} ${snapshot.overdue_task_names.length > 0 ? `(${snapshot.overdue_task_names.join(', ')})` : ''}
- משימות היום: ${snapshot.today_completed}/${snapshot.today_total} הושלמו
- הרגלים לא מושלמים: ${snapshot.incomplete_habits}
- רצף ימים: ${snapshot.streak_days}
- שבוע נוכחי בתוכנית: ${snapshot.current_week}/12
- אבן דרך: ${snapshot.milestone_title}
- רמת אנרגיה: ${snapshot.energy_level}
${snapshot.stalled_projects.length > 0 ? `- פרויקטים תקועים: ${snapshot.stalled_projects.map(p => `${p.name} (${p.days_stalled} ימים)`).join(', ')}` : ''}
${snapshot.approaching_deadlines.length > 0 ? `- דדליינים מתקרבים: ${snapshot.approaching_deadlines.map(p => `${p.name} (${p.days_left} ימים)`).join(', ')}` : ''}

כתבי תגובה בפורמט JSON בלבד:
{"title": "כותרת קצרה עם אימוג'י", "body": "הודעה אישית מעודדת של 1-2 משפטים"}`;

    const response = await fetchWithRetry("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
    }, { timeoutMs: 30_000, maxRetries: 1 });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      return generateFallbackMessage(snapshot, triggerType);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const args = JSON.parse(toolCall.function.arguments);
      return { title: args.title, body: args.body };
    }

    return generateFallbackMessage(snapshot, triggerType);
  } catch (e) {
    console.error("AI coaching error:", e);
    return generateFallbackMessage(snapshot, triggerType);
  }
};

// ─── Fallback Messages ─────────────────────────────────────

const generateFallbackMessage = (snapshot: ProactiveSnapshot, triggerType: string): { title: string; body: string } => {
  const messages: Record<string, { title: string; body: string }> = {
    morning_briefing: {
      title: '☀️ בוקר טוב!',
      body: snapshot.today_total > 0
        ? `יש לך ${snapshot.today_total} משימות היום. בואי נתחיל!`
        : 'יום חדש, הזדמנויות חדשות! מה בתוכנית?',
    },
    progress_check: {
      title: '📊 עדכון התקדמות',
      body: `השלמת ${snapshot.today_completed}/${snapshot.today_total} משימות היום. ${snapshot.today_completed === snapshot.today_total ? 'מדהים! 🎉' : 'המשיכי ככה!'}`,
    },
    missed_task_nudge: {
      title: '📋 יש משימות שמחכות',
      body: `${snapshot.overdue_tasks} משימות באיחור. ${snapshot.overdue_task_names[0] ? `למשל: "${snapshot.overdue_task_names[0]}"` : ''} רוצה לטפל בזה?`,
    },
    streak_celebration: {
      title: '🔥 רצף מרשים!',
      body: `${snapshot.streak_days} ימים רצופים! אתה לגמרי על הכיוון הנכון.`,
    },
    task_suggestion: {
      title: '💡 רעיון לשיפור',
      body: `בהתבסס על ההתקדמות שלך בשבוע ${snapshot.current_week}, יש לי כמה הצעות לשפר את המסלול.`,
    },
    weekly_review: {
      title: '📝 סיכום שבועי',
      body: `שבוע ${snapshot.current_week} מסתיים. בואי נסכם ונתכנן את הבא!`,
    },
    project_stalled: {
      title: '📂 פרויקט מחכה לך',
      body: snapshot.stalled_projects.length > 0
        ? `"${snapshot.stalled_projects[0].name}" לא עודכן ${snapshot.stalled_projects[0].days_stalled} ימים. מה המצב?`
        : 'יש פרויקט שלא עודכן הרבה זמן. בואי נבדוק!',
    },
    project_deadline: {
      title: '⏳ דדליין מתקרב!',
      body: snapshot.approaching_deadlines.length > 0
        ? `"${snapshot.approaching_deadlines[0].name}" מסתיים בעוד ${snapshot.approaching_deadlines[0].days_left} ימים!`
        : 'יש פרויקט עם דדליין קרוב.',
    },
    project_setup: {
      title: '🚀 התחל עם הפרויקט',
      body: snapshot.projects_without_milestones.length > 0
        ? `"${snapshot.projects_without_milestones[0]}" עדיין ב-0%. בואי נתחיל לתכנן!`
        : 'יש פרויקט חדש שמחכה לתכנון.',
    },
  };

  return messages[triggerType] || messages.morning_briefing;
};

// ─── Analyze & Queue ───────────────────────────────────────

const analyzeAndQueue = async (
  supabase: SupabaseClient<any, any, any>,
  userId: string,
  snapshot: ProactiveSnapshot
): Promise<void> => {
  const now = new Date();
  const hour = now.getHours();

  interface QueueItem { trigger_type: string; priority: number; }
  const items: QueueItem[] = [];

  if (hour >= 7 && hour <= 10) items.push({ trigger_type: 'morning_briefing', priority: 7 });
  if (snapshot.overdue_tasks > 0) items.push({ trigger_type: 'missed_task_nudge', priority: 8 });
  if (hour >= 14 && hour <= 18 && snapshot.today_total > 0) items.push({ trigger_type: 'progress_check', priority: 5 });
  if (snapshot.streak_days >= 3 && snapshot.streak_days % 3 === 0) items.push({ trigger_type: 'streak_celebration', priority: 6 });
  if (now.getDay() === 5 && hour >= 16) items.push({ trigger_type: 'weekly_review', priority: 7 });
  if (now.getDay() === 0 && hour >= 8 && hour <= 12) items.push({ trigger_type: 'task_suggestion', priority: 4 });
  if (snapshot.stalled_projects.length > 0) items.push({ trigger_type: 'project_stalled', priority: 7 });
  if (snapshot.approaching_deadlines.length > 0) items.push({ trigger_type: 'project_deadline', priority: 8 });
  if (snapshot.projects_without_milestones.length > 0) items.push({ trigger_type: 'project_setup', priority: 5 });

  for (const item of items) {
    // Generate deterministic idempotency key: user:trigger:date
    const idempotencyKey = `proactive:${userId}:${item.trigger_type}:${now.toISOString().split("T")[0]}:${now.getHours()}`;

    // Check by idempotency key first (replaces time-window dedup)
    const { data: existing } = await supabase
      .from('aurora_proactive_queue')
      .select('id')
      .eq('idempotency_key', idempotencyKey)
      .limit(1);

    if (!existing || existing.length === 0) {
      const msg = await generateAICoachingMessage(snapshot, item.trigger_type);
      await (supabase as any).from('aurora_proactive_queue').insert({
        user_id: userId,
        trigger_type: item.trigger_type,
        trigger_data: { context: snapshot },
        priority: item.priority,
        scheduled_for: now.toISOString(),
        title: msg.title,
        body: msg.body,
        idempotency_key: idempotencyKey,
      });
      console.log(`Queued ${item.trigger_type} for user ${userId}`);
    }
  }
};

// ─── Serve ─────────────────────────────────────────────────

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
      const ctx = await buildContext(supabase, user_id, 'he');
      const snapshot = toProactiveSnapshot(ctx);
      await analyzeAndQueue(supabase, user_id, snapshot);
      return new Response(JSON.stringify({ success: true, context: snapshot }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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
          const ctx = await buildContext(supabase, user.user_id, 'he');
          const snapshot = toProactiveSnapshot(ctx);
          await analyzeAndQueue(supabase, user.user_id, snapshot);
          processed++;
        } catch (e) {
          console.error(`Error processing user ${user.user_id}:`, e);
        }
      }

      return new Response(JSON.stringify({ success: true, processed, total: (activeUsers || []).length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error('Aurora proactive error:', error);
    logEdgeFunctionError({ functionName: "aurora-proactive", error, requestContext: { action: "unknown" } });
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
