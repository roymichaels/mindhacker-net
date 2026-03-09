/**
 * work-chat — AI-powered work planning conversations.
 * Helps users plan work blocks, analyze productivity, and get AI scheduling suggestions.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user_id, messages, language, mode } = await req.json();
    if (!user_id) throw new Error("user_id required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not set");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const today = new Date().toISOString().slice(0, 10);

    // Gather work context
    const { data: todaySessions } = await supabase
      .from("work_sessions")
      .select("*")
      .eq("user_id", user_id)
      .gte("started_at", `${today}T00:00:00`)
      .order("started_at", { ascending: false })
      .limit(20);

    const { data: recentSessions } = await supabase
      .from("work_sessions")
      .select("*")
      .eq("user_id", user_id)
      .order("started_at", { ascending: false })
      .limit(30);

    const { data: weekScores } = await supabase
      .from("work_scores")
      .select("*")
      .eq("user_id", user_id)
      .gte("score_date", new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10))
      .order("score_date");

    // Work-related action items
    const { data: workTasks } = await supabase
      .from("action_items")
      .select("id, title, type, status, scheduled_date, pillar, tags")
      .eq("user_id", user_id)
      .in("status", ["todo", "doing"])
      .order("order_index")
      .limit(30);

    // Build context
    let workContext = `\nToday: ${today}`;

    if (todaySessions?.length) {
      const totalMin = todaySessions
        .filter((s: any) => s.ended_at)
        .reduce((sum: number, s: any) => sum + Math.floor((s.duration_seconds || 0) / 60), 0);
      const deepMin = todaySessions
        .filter((s: any) => s.ended_at && s.is_deep_work)
        .reduce((sum: number, s: any) => sum + Math.floor((s.duration_seconds || 0) / 60), 0);
      const active = todaySessions.find((s: any) => !s.ended_at);

      workContext += `\n\n📊 TODAY'S WORK:`;
      workContext += `\nTotal: ${totalMin} minutes (${deepMin} deep work)`;
      workContext += `\nBlocks: ${todaySessions.filter((s: any) => s.ended_at).length}`;
      if (active) workContext += `\n⏱️ ACTIVE SESSION: "${active.title}" (started at ${active.started_at})`;
      workContext += `\nSessions:\n${todaySessions.filter((s: any) => s.ended_at).map((s: any) =>
        `- "${s.title}" ${Math.floor(s.duration_seconds / 60)}min ${s.is_deep_work ? '🧠deep' : ''}`
      ).join("\n")}`;
    }

    if (weekScores?.length) {
      workContext += `\n\n📈 WEEKLY SCORES:\n${weekScores.map((s: any) =>
        `- ${s.score_date}: ${s.total_minutes}min total, ${s.deep_work_minutes}min deep, ${s.tasks_completed} tasks, score:${s.productivity_score}`
      ).join("\n")}`;
    }

    if (workTasks?.length) {
      workContext += `\n\n📋 PENDING TASKS (${workTasks.length}):\n${workTasks.map((t: any) =>
        `- "${t.title}" [${t.pillar || 'general'}] type:${t.type} status:${t.status} (id: ${t.id})`
      ).join("\n")}`;
    }

    const isHe = language === "he";
    const isWizard = mode === "wizard";

    const systemPrompt = isWizard
      ? `You are Aurora, an AI work planning wizard inside Mind OS. Help the user plan their work day efficiently.

ROLE: You analyze the user's pending tasks, energy patterns, and work history to suggest an optimal work schedule.

RULES:
1. Respond in ${isHe ? 'Hebrew' : 'English'}.
2. Suggest specific work blocks with time estimates.
3. Prioritize deep work for high-energy periods.
4. Keep blocks to 25-90 minutes (Pomodoro to deep work).
5. Suggest breaks between blocks.
6. When you suggest a plan, format blocks as:
   [work:plan:title|duration_minutes|is_deep_work]
   Example: [work:plan:Write proposal|45|true]
7. You can suggest multiple blocks in one response.
8. Consider the user's existing work sessions today to avoid duplicates.

WORK CONTEXT:${workContext}

Be specific, actionable, and encouraging. Reference actual tasks when possible.`
      : `You are Aurora, an AI work coach inside Mind OS. Help the user manage their work sessions, analyze productivity, and optimize their work patterns.

ROLE: Work productivity coach — analyze patterns, suggest improvements, track progress.

RULES:
1. Respond in ${isHe ? 'Hebrew' : 'English'}.
2. Reference actual work sessions and scores when discussing productivity.
3. Help users understand their deep work vs shallow work ratio.
4. Suggest improvements based on patterns.
5. Be concise and actionable.
6. You can create work blocks using: [work:create:title|duration_minutes|is_deep_work]
7. You can suggest tasks to focus on using: [work:suggest:task_title]

WORK CONTEXT:${workContext}

Be warm, data-driven, and practical. Keep responses concise.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        temperature: 0.5,
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("work-chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
