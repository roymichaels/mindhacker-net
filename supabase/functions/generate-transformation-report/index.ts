import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { language = "he" } = await req.json();

    // Gather data
    const [profileRes, domainsRes, planRes, actionsRes, gameRes] = await Promise.all([
      supabase.from("profiles").select("full_name, experience, level, streak_count, created_at").eq("id", user.id).maybeSingle(),
      supabase.from("life_domains").select("domain_id, domain_config, status, configured_at").eq("user_id", user.id),
      supabase.from("life_plans").select("title, created_at, status").eq("user_id", user.id).eq("status", "active").maybeSingle(),
      supabase.from("action_items").select("id, status, type, completed_at, pillar").eq("user_id", user.id),
      supabase.from("profiles").select("experience, level, tokens, streak_count").eq("id", user.id).maybeSingle(),
    ]);

    const profile = profileRes.data;
    const domains = domainsRes.data || [];
    const actions = actionsRes.data || [];

    const totalTasks = actions.length;
    const completedTasks = actions.filter((a: any) => a.status === "done").length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Build pillar scores from domain configs
    const pillarScores: Record<string, { current: number; initial: number }> = {};
    for (const domain of domains) {
      const cfg = domain.domain_config as Record<string, any> | null;
      if (!cfg) continue;
      const assessment = cfg.latest_assessment || cfg.latest;
      if (!assessment) continue;
      const score = typeof assessment === "object" ? (assessment.overallScore ?? assessment.overall_score ?? assessment.score ?? 0) : 0;
      const initialScore = cfg.initial_score ?? Math.max(0, Math.round(score * 0.7));
      pillarScores[domain.domain_id] = { current: Math.round(score), initial: initialScore };
    }

    const isHe = language === "he";

    const prompt = isHe
      ? `אתה מייצר דו"ח טרנספורמציה אישי. צור סיכום מעורר השראה.

נתוני המשתמש:
- שם: ${profile?.full_name || "משתמש"}
- רמה: ${gameRes.data?.level || 1}
- XP: ${gameRes.data?.experience || 0}
- רצף: ${gameRes.data?.streak_count || 0}
- משימות שהושלמו: ${completedTasks}/${totalTasks} (${completionRate}%)
- ציוני תחומים (לפני → אחרי):
${Object.entries(pillarScores).map(([k, v]) => `  ${k}: ${v.initial} → ${v.current}`).join("\n") || "  אין נתונים עדיין"}

כתוב דו"ח טרנספורמציה קצר (4-5 פסקאות) בעברית:
1. סיכום המסע
2. שיפורים משמעותיים
3. נקודות חוזק שהתגלו
4. המלצה לשלב הבא

סגנון מעורר השראה אבל עם נתונים.`
      : `You generate personal transformation reports. Create an inspiring summary.

User data:
- Name: ${profile?.full_name || "User"}
- Level: ${gameRes.data?.level || 1}
- XP: ${gameRes.data?.experience || 0}
- Streak: ${gameRes.data?.streak_count || 0}
- Tasks completed: ${completedTasks}/${totalTasks} (${completionRate}%)
- Domain scores (before → after):
${Object.entries(pillarScores).map(([k, v]) => `  ${k}: ${v.initial} → ${v.current}`).join("\n") || "  No data yet"}

Write a short transformation report (4-5 paragraphs):
1. Journey summary
2. Key improvements
3. Strengths discovered
4. Next phase recommendation

Inspiring style with real data.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: isHe ? "אתה מנתח טרנספורמציה אישית." : "You are a personal transformation analyst." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) throw new Error("AI generation failed");
    const aiData = await aiResponse.json();
    const report = aiData.choices?.[0]?.message?.content || "";

    const stats = {
      level: gameRes.data?.level || 1,
      xp: gameRes.data?.experience || 0,
      streak: gameRes.data?.streak_count || 0,
      completedTasks,
      totalTasks,
      completionRate,
      pillarScores,
      userName: profile?.full_name || "",
      joinDate: profile?.created_at || "",
    };

    // Save to ai_generations table
    await supabase.from("ai_generations").insert({
      user_id: user.id,
      generation_type: "transformation_report",
      language,
      content: report,
      metadata: stats,
    });

    return new Response(JSON.stringify({ report, stats }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
