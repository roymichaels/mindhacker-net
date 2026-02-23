/**
 * generate-phase-actions — On-demand mini-milestone generation.
 * Called when a user opens a milestone that has no mini-milestones yet.
 * Analyzes recent analytics (completion rate, consistency) to personalize actions.
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
    const { milestone_id, user_id } = await req.json();
    if (!milestone_id || !user_id) throw new Error("milestone_id and user_id required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not set");

    // Check if minis already exist
    const { data: existing } = await supabase
      .from("mini_milestones")
      .select("id")
      .eq("milestone_id", milestone_id)
      .limit(1);
    
    if (existing && existing.length > 0) {
      return new Response(JSON.stringify({ status: "already_generated", count: existing.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch milestone + mission + plan context
    const { data: milestone } = await supabase
      .from("life_plan_milestones")
      .select("*, plan_id, mission_id, title, title_en, description, description_en, focus_area")
      .eq("id", milestone_id)
      .single();
    
    if (!milestone) throw new Error("Milestone not found");

    // Fetch mission context
    let missionTitle = "";
    if (milestone.mission_id) {
      const { data: mission } = await supabase
        .from("plan_missions")
        .select("title, title_en, pillar")
        .eq("id", milestone.mission_id)
        .single();
      if (mission) missionTitle = mission.title_en || mission.title || "";
    }

    // Gather analytics: recent 10-day performance
    const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0];
    
    const { data: recentActions } = await supabase
      .from("action_items")
      .select("status, completed_at, scheduled_date")
      .eq("user_id", user_id)
      .gte("scheduled_date", tenDaysAgo)
      .order("scheduled_date", { ascending: false });

    const totalRecent = recentActions?.length || 0;
    const completedRecent = recentActions?.filter(a => a.status === "done").length || 0;
    const completionRate = totalRecent > 0 ? Math.round((completedRecent / totalRecent) * 100) : 50;

    // Check completed mini-milestones across the plan
    const { data: completedMinis } = await supabase
      .from("mini_milestones")
      .select("id, is_completed")
      .eq("is_completed", true);
    const miniConsistency = completedMinis?.length || 0;

    // Streak check
    const { data: profile } = await supabase
      .from("profiles")
      .select("session_streak, level")
      .eq("id", user_id)
      .single();
    const streak = profile?.session_streak || 0;
    const level = profile?.level || 1;

    // Determine intensity based on analytics
    let intensity = "standard";
    let intensityNote = "";
    if (completionRate >= 80 && streak >= 5) {
      intensity = "challenging";
      intensityNote = "User is crushing it — raise the bar with harder, more specific actions.";
    } else if (completionRate < 40) {
      intensity = "gentle";
      intensityNote = "User is struggling — make actions smaller, more achievable, build confidence.";
    } else {
      intensityNote = "Balanced approach — progressive difficulty.";
    }

    const prompt = `You are Aurora for "Mind OS". Generate exactly 5 DAILY ACTIONS (mini-milestones) for this milestone.

## MILESTONE: "${milestone.title_en || milestone.title}"
## DESCRIPTION: ${milestone.description_en || milestone.description || "N/A"}
## MISSION: "${missionTitle}"
## PILLAR: ${milestone.focus_area || "general"}

## USER ANALYTICS (last 10 days):
- Completion rate: ${completionRate}%
- Current streak: ${streak} days
- Level: ${level}
- Completed mini-milestones total: ${miniConsistency}
- Intensity: ${intensity} — ${intensityNote}

## IMPROVEMENT SUGGESTIONS:
${completionRate < 60 ? "- Break tasks into even smaller steps\n- Add a 'minimum viable' version of each action\n- Focus on building momentum" : ""}
${completionRate >= 80 ? "- Push boundaries with stretch goals\n- Add complexity or time pressure\n- Introduce new techniques" : ""}
${streak === 0 ? "- First action should be dead-simple to restart momentum" : ""}

## RULES:
- Each action must be completable in a single day/session (15-45 min).
- Be extremely specific — no generic filler like "practice more".
- Reference the milestone's actual goal.
- Progressive difficulty: action 1 (easiest) → action 5 (hardest).
- Under 15 words per action title.
- Hebrew must be natural.

## OUTPUT (JSON only, NO markdown):
{
  "minis": [
    { "title_en": "Specific daily action 1", "title_he": "פעולה יומית 1" },
    { "title_en": "Specific daily action 2", "title_he": "פעולה יומית 2" },
    { "title_en": "Specific daily action 3", "title_he": "פעולה יומית 3" },
    { "title_en": "Specific daily action 4", "title_he": "פעולה יומית 4" },
    { "title_en": "Specific daily action 5", "title_he": "פעולה יומית 5" }
  ],
  "aurora_insight_en": "Brief insight about user's progress and what to focus on",
  "aurora_insight_he": "תובנה קצרה על ההתקדמות של המשתמש"
}`;

    // Call AI
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Output ONLY valid JSON. No markdown. No explanation." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI error:", aiResp.status, errText);
      throw new Error(`AI call failed: ${aiResp.status}`);
    }

    const aiData = await aiResp.json();
    let raw = aiData?.choices?.[0]?.message?.content || "";
    raw = raw.replace(/```json\s*/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(raw);

    if (!parsed?.minis || parsed.minis.length < 1) throw new Error("AI returned no minis");

    // Calculate scheduled_day based on milestone position
    const baseDayOffset = (milestone.week_number || 1) * 10;

    // Insert mini-milestones
    const miniRows = parsed.minis.slice(0, 5).map((mini: any, idx: number) => ({
      milestone_id,
      mini_number: idx + 1,
      title: mini.title_he || mini.title_en,
      title_en: mini.title_en,
      description: mini.description_he || null,
      description_en: mini.description_en || null,
      xp_reward: 10,
      scheduled_day: Math.min(baseDayOffset + idx + 1, 100),
    }));

    const { error: insertError } = await supabase
      .from("mini_milestones")
      .insert(miniRows);

    if (insertError) throw insertError;

    return new Response(JSON.stringify({
      status: "generated",
      count: miniRows.length,
      intensity,
      completion_rate: completionRate,
      aurora_insight_en: parsed.aurora_insight_en || null,
      aurora_insight_he: parsed.aurora_insight_he || null,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-phase-actions error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
