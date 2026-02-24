/**
 * generate-phase-actions — On-demand mini-milestone generation.
 * Called when a user opens a milestone that has no mini-milestones yet.
 * Analyzes recent analytics (completion rate, consistency) to personalize actions.
 * NOW integrated with full user brain context (diet, willingness, biological profile).
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildContext } from "../_shared/contextBuilder.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Build constraints block from biological profile + willingness (same logic as strategy engine)
function buildConstraintsBlock(ctx: any): string {
  const parts: string[] = [];
  const bio = ctx.biological_profile || {};

  // Diet
  const dietType = Array.isArray(bio.diet_type) ? bio.diet_type : [];
  if (dietType.length > 0) {
    const label = dietType.join(' + ').toUpperCase();
    const isVegan = dietType.some((d: string) => ['vegan', 'alkaline'].includes(d.toLowerCase()));
    const forbidden: string[] = [];
    if (isVegan) {
      forbidden.push('dairy (cheese, yogurt, butter, milk, whey, feta)', 'eggs', 'meat', 'fish', 'seafood', 'honey', 'gelatin', 'any animal products');
    } else if (dietType.some((d: string) => d.toLowerCase() === 'vegetarian')) {
      forbidden.push('meat', 'fish', 'seafood');
    }
    if (dietType.some((d: string) => d.toLowerCase() === 'alkaline')) {
      forbidden.push('refined sugar', 'white flour', 'processed foods', 'soda');
    }
    parts.push(`- DIET: ${label} — NEVER include: ${forbidden.join(', ')}`);
  }

  // Substances
  if (bio.substances?.alcohol === 'never') parts.push('- NO ALCOHOL');
  if (bio.substances?.nicotine === 'no' || bio.substances?.nicotine === 'never') parts.push('- NO NICOTINE');

  // Sleep
  if (bio.sleep?.time || bio.sleep?.wake) {
    parts.push(`- SLEEP: ${bio.sleep.time || '?'} → ${bio.sleep.wake || '?'}`);
  }

  // Willingness
  const notWilling: string[] = [];
  const willingness = ctx.willingness || {};
  for (const [domain, w] of Object.entries(willingness)) {
    const wData = w as any;
    if (wData?.not_willing?.length > 0) {
      notWilling.push(...wData.not_willing.map((nw: string) => `${nw} (${domain})`));
    }
  }
  if (notWilling.length > 0) {
    parts.push(`- USER REFUSES: ${notWilling.join(', ')}`);
  }

  if (parts.length === 0) return '';
  return `\n## CRITICAL USER CONSTRAINTS (NEVER VIOLATE):\n${parts.join('\n')}\n`;
}

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

    // Parallel: fetch milestone + user brain context
    const [milestoneRes, ctx] = await Promise.all([
      supabase
        .from("life_plan_milestones")
        .select("*, plan_id, mission_id, title, title_en, description, description_en, focus_area, week_number")
        .eq("id", milestone_id)
        .single(),
      buildContext(supabase, user_id, "he"),
    ]);

    const milestone = milestoneRes.data;
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

    const streak = ctx.profile ? (ctx as any).pulse_week?.days_logged || 0 : 0;
    const level = ctx.profile ? 1 : 1; // level from profile

    // Determine intensity based on analytics
    let intensity = "standard";
    let intensityNote = "";
    if (completionRate >= 80 && streak >= 5) {
      intensity = "challenging";
      intensityNote = "User is crushing it — raise the bar with harder, more specific protocols.";
    } else if (completionRate < 40) {
      intensity = "gentle";
      intensityNote = "User is struggling — make protocols smaller, more achievable, build confidence.";
    } else {
      intensityNote = "Balanced approach — progressive difficulty.";
    }

    // Build constraints from brain context
    const constraintsBlock = buildConstraintsBlock(ctx);

    // Build user context summary
    const userContextSummary = `## USER PROFILE:
Name: ${ctx.profile?.full_name || 'Unknown'}
Values: ${ctx.identity?.values?.slice(0, 5).join(', ') || 'N/A'}
Projects: ${ctx.projects?.slice(0, 3).map(p => p.name).join(', ') || 'None'}`;

    const prompt = `You are Aurora for "Mind OS". Generate exactly 5 DAILY ACTIONS (mini-milestones) for this milestone.

## MILESTONE: "${milestone.title_en || milestone.title}"
## DESCRIPTION: ${milestone.description_en || milestone.description || "N/A"}
## MISSION: "${missionTitle}"
## PILLAR: ${milestone.focus_area || "general"}

${userContextSummary}
${constraintsBlock}
## USER ANALYTICS (last 10 days):
- Completion rate: ${completionRate}%
- Current streak: ${streak} days
- Level: ${level}
- Intensity: ${intensity} — ${intensityNote}

## TREATMENT-ONLY RULES (CRITICAL — MOST IMPORTANT):
The assessments ALREADY HAPPENED. These are TREATMENT actions, not diagnostics.
- BANNED VERBS: "identify", "check", "test", "evaluate", "journal about", "reflect on", "notice", "become aware", "assess", "measure", "track"
- REQUIRED VERBS: "perform", "execute", "practice", "drill", "complete", "run protocol", "train", "apply"
- Every action is a PHYSICAL PROTOCOL the user executes.
- Convert any abstract concept into a concrete body-based or app-based ritual.
- BAD: "Journal about your feelings" → GOOD: "Open app, rate 6 subsystems 1-10, tap submit"
- BAD: "Check posture against wall" → GOOD: "Perform 10-minute mewing hold with proper tongue posture"
- BAD: "Identify 3 cases where self-worth is tied to external achievement" → GOOD: "Execute 5-minute identity anchoring breathwork: inhale 'I am enough', exhale release"
- For IMAGE: mewing, face yoga, jawline sculpting, posture correction drills — NOT tests
- For CONSCIOUSNESS: shadow work rituals, identity anchoring, ego state integration — NOT self-analysis

## EXECUTION TEMPLATES (assign one per action):
| Template | When to use |
|----------|-------------|
| tts_guided | Meditation, breathwork, visualization, body scan, guided relaxation |
| video_embed | Yoga, face yoga, tai chi, mobility, stretching — movement with visual demo |
| sets_reps_timer | Strength, boxing, HIIT, combat drills, mewing holds — sets/reps/rounds |
| step_by_step | Skincare, cooking, morning routine, reading — sequential instructions |
| timer_focus | Deep work, studying, business tasks, content creation — timed focus blocks |
| social_checklist | Networking, relationship tasks, calls, social outreach |

## RULES:
- Each action must be completable in a single day/session (15-45 min).
- Be extremely specific — no generic filler like "practice more".
- Reference the milestone's actual goal.
- Progressive difficulty: action 1 (easiest) → action 5 (hardest).
- Under 15 words per action title.
- Hebrew must be natural.
- EVERY action MUST have execution_template and action_type fields.
- EVERY action respects user constraints (diet, willingness, sleep).

## OUTPUT (JSON only, NO markdown):
{
  "minis": [
    { "title_en": "Specific treatment protocol 1", "title_he": "פרוטוקול 1", "execution_template": "sets_reps_timer", "action_type": "mewing_hold_5min" },
    { "title_en": "Specific treatment protocol 2", "title_he": "פרוטוקול 2", "execution_template": "video_embed", "action_type": "face_yoga_routine" },
    { "title_en": "Specific treatment protocol 3", "title_he": "פרוטוקול 3", "execution_template": "step_by_step", "action_type": "skincare_evening" },
    { "title_en": "Specific treatment protocol 4", "title_he": "פרוטוקול 4", "execution_template": "tts_guided", "action_type": "breathwork_10min" },
    { "title_en": "Specific treatment protocol 5", "title_he": "פרוטוקול 5", "execution_template": "timer_focus", "action_type": "deep_work_45min" }
  ],
  "aurora_insight_en": "Brief insight about user's progress and what to focus on",
  "aurora_insight_he": "תובנה קצרה על ההתקדמות של המשתמש"
}`;

    // Call AI
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Output ONLY valid JSON. No markdown. No explanation. You are generating TREATMENT protocols, not diagnostics." },
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

    // Insert mini-milestones with execution_template and action_type
    const miniRows = parsed.minis.slice(0, 5).map((mini: any, idx: number) => ({
      milestone_id,
      mini_number: idx + 1,
      title: mini.title_he || mini.title_en,
      title_en: mini.title_en,
      description: mini.description_he || null,
      description_en: mini.description_en || null,
      xp_reward: 10,
      scheduled_day: Math.min(baseDayOffset + idx + 1, 100),
      execution_template: mini.execution_template || 'step_by_step',
      action_type: mini.action_type || null,
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
