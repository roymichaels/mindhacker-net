/**
 * generate-weekly-briefing — Monday morning AI briefing
 * Summarizes the week ahead: tasks, milestones, risks, opportunities.
 * Can be called manually or via cron job.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;
    const today = new Date();
    // Calculate Monday of this week
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    const weekStart = monday.toISOString().split("T")[0];

    // Check if briefing already exists for this week
    const { data: existing } = await supabase
      .from("weekly_briefings")
      .select("id, summary_text")
      .eq("user_id", userId)
      .eq("week_start", weekStart)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ briefing: existing, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Gather context for briefing
    const endOfWeek = new Date(monday);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    const weekEnd = endOfWeek.toISOString().split("T")[0];

    const [
      profileRes,
      weekTasksRes,
      planRes,
      habitsRes,
      pulseRes,
      memoriesRes,
      memoryGraphRes,
    ] = await Promise.all([
      supabase.from("profiles").select("full_name, level, experience, session_streak, aurora_preferences").eq("id", userId).single(),
      supabase.from("action_items").select("title, status, pillar, scheduled_date, due_at, type").eq("user_id", userId).in("status", ["todo", "doing"]).or(`scheduled_date.gte.${weekStart},due_at.gte.${weekStart}T00:00:00`).or(`scheduled_date.lte.${weekEnd},due_at.lte.${weekEnd}T23:59:59`),
      supabase.from("life_plans").select("*, life_plan_milestones(title, week_number, is_completed, focus_area)").eq("user_id", userId).eq("status", "active").maybeSingle(),
      supabase.from("action_items").select("title, metadata").eq("user_id", userId).eq("type", "habit"),
      supabase.from("daily_pulse_logs").select("energy_rating, mood_signal, task_confidence").eq("user_id", userId).gte("log_date", new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]),
      supabase.from("aurora_conversation_memory").select("summary, action_items").eq("user_id", userId).order("created_at", { ascending: false }).limit(3),
      supabase.from("aurora_memory_graph").select("node_type, content, strength").eq("user_id", userId).eq("is_active", true).order("strength", { ascending: false }).limit(10),
    ]);

    const profile = profileRes.data;
    const weekTasks = weekTasksRes.data || [];
    const plan = planRes.data;
    const habits = habitsRes.data || [];
    const pulseData = pulseRes.data || [];
    const memories = memoriesRes.data || [];
    const memoryGraph = memoryGraphRes.data || [];

    // Build AI prompt
    const isHe = profile?.aurora_preferences?.language === "he" || true;
    const currentWeek = plan ? Math.min(15, Math.max(1, Math.floor((Date.now() - new Date(plan.start_date).getTime()) / (7 * 86400000)) + 1)) : null;
    const weekMilestones = plan?.life_plan_milestones?.filter((m: any) => m.week_number === currentWeek) || [];

    const avgEnergy = pulseData.length > 0
      ? (pulseData.reduce((s: number, p: any) => s + p.energy_rating, 0) / pulseData.length).toFixed(1)
      : "N/A";

    const contextLines = [
      `User: ${profile?.full_name || "User"} (Level ${profile?.level || 1}, Streak: ${profile?.session_streak || 0})`,
      `Week: ${weekStart} to ${weekEnd}`,
      plan ? `100-Day Plan: Day ${Math.floor((Date.now() - new Date(plan.start_date).getTime()) / 86400000) + 1}, Week ${currentWeek}` : "No active plan",
      `Tasks this week: ${weekTasks.length} (${weekTasks.filter((t: any) => t.status === "todo").length} pending)`,
      `Active habits: ${habits.length}`,
      `Avg energy (7d): ${avgEnergy}/5`,
      weekMilestones.length > 0 ? `This week's milestones: ${weekMilestones.map((m: any) => `"${m.title}" [${m.is_completed ? "✅" : "⬜"}]`).join(", ")}` : "",
      memories.length > 0 ? `Recent conversation insights: ${memories.map((m: any) => m.summary).join("; ")}` : "",
      memoryGraph.length > 0 ? `Known patterns/beliefs: ${memoryGraph.map((n: any) => `[${n.node_type}] ${n.content} (strength:${n.strength})`).join("; ")}` : "",
    ].filter(Boolean).join("\n");

    const systemPrompt = isHe
      ? `אתה אורורה, המלווה AI של Mind OS. צור תדריך שבועי קצר ומעורר השראה.
הפורמט: JSON עם השדות: title (כותרת קצרה), summary (3-4 פסקאות), risks (מערך של 2-3 סיכונים), opportunities (מערך של 2-3 הזדמנויות), key_focus (משפט אחד של פוקוס השבוע).
כתוב בעברית עם ניקוד. היה ישיר, חם, ופרקטי. אל תהיה גנרי — השתמש בנתונים האמיתיים.`
      : `You are Aurora, the AI companion of Mind OS. Create a brief, inspiring weekly briefing.
Format: JSON with fields: title (short title), summary (3-4 paragraphs), risks (array of 2-3 risks), opportunities (array of 2-3 opportunities), key_focus (one sentence weekly focus).
Be direct, warm, and practical. Don't be generic — use the real data.`;

    // Call AI
    const aiResponse = await fetch("https://tsvfsbluyuaajqmkpzdv.supabase.co/functions/v1/ai-gateway", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate this week's briefing based on:\n\n${contextLines}` },
        ],
        temperature: 0.7,
        maxTokens: 1200,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const rawContent = aiResult.choices?.[0]?.message?.content || aiResult.content || "";

    // Parse JSON from AI response
    let briefingData: any;
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      briefingData = jsonMatch ? JSON.parse(jsonMatch[0]) : { title: "Weekly Briefing", summary: rawContent, risks: [], opportunities: [], key_focus: "" };
    } catch {
      briefingData = { title: "Weekly Briefing", summary: rawContent, risks: [], opportunities: [], key_focus: "" };
    }

    // Save to DB
    const { data: saved, error: saveError } = await supabase
      .from("weekly_briefings")
      .insert({
        user_id: userId,
        week_start: weekStart,
        title: briefingData.title || "Weekly Briefing",
        summary_text: briefingData.summary || rawContent,
        risks: Array.isArray(briefingData.risks) ? briefingData.risks : [],
        opportunities: Array.isArray(briefingData.opportunities) ? briefingData.opportunities : [],
        key_focus: briefingData.key_focus || null,
        metadata: { avg_energy: avgEnergy, tasks_count: weekTasks.length, current_week: currentWeek },
      })
      .select()
      .single();

    if (saveError) throw saveError;

    // Create a user notification
    await supabase.rpc("create_user_notification", {
      p_user_id: userId,
      p_type: "weekly_briefing",
      p_title: isHe ? "תדריך שבועי חדש מוכן! 📋" : "Your Weekly Briefing is Ready! 📋",
      p_message: briefingData.title || "Your week ahead summary is waiting",
      p_link: "/dashboard",
    });

    return new Response(JSON.stringify({ briefing: saved, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Weekly briefing error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
