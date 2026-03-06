/**
 * generate-phase-actions v2 — Weekly Objective Generator
 * 
 * Generates 3 SUBSTANTIAL weekly objectives per milestone instead of micro-tasks.
 * Each objective is a meaningful weekly goal that will be broken down into
 * daily actions by the separate `generate-daily-actions` engine.
 * 
 * Architecture: Milestone → Weekly Objectives → Daily Actions (separate call)
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildContext } from "../_shared/contextBuilder.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildConstraintsBlock(ctx: any): string {
  const parts: string[] = [];
  const bio = ctx.biological_profile || {};

  const dietType = Array.isArray(bio.diet_type) ? bio.diet_type : [];
  if (dietType.length > 0) {
    const label = dietType.join(' + ').toUpperCase();
    const isVegan = dietType.some((d: string) => ['vegan', 'alkaline'].includes(d.toLowerCase()));
    const forbidden: string[] = [];
    if (isVegan) {
      forbidden.push('dairy, eggs, meat, fish, seafood, honey, gelatin, any animal products');
    } else if (dietType.some((d: string) => d.toLowerCase() === 'vegetarian')) {
      forbidden.push('meat, fish, seafood');
    }
    if (dietType.some((d: string) => d.toLowerCase() === 'alkaline')) {
      forbidden.push('refined sugar, white flour, processed foods, soda');
    }
    parts.push(`- DIET: ${label} — NEVER include: ${forbidden.join(', ')}`);
  }

  if (bio.substances?.alcohol === 'never') parts.push('- NO ALCOHOL');
  if (bio.substances?.nicotine === 'no' || bio.substances?.nicotine === 'never') parts.push('- NO NICOTINE');
  if (bio.sleep?.time || bio.sleep?.wake) {
    parts.push(`- SLEEP: ${bio.sleep.time || '?'} → ${bio.sleep.wake || '?'}`);
  }

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

    // Delete any existing minis for this milestone (supports recalibration)
    await supabase
      .from("mini_milestones")
      .delete()
      .eq("milestone_id", milestone_id);

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
    let missionTitleEn = "";
    if (milestone.mission_id) {
      const { data: mission } = await supabase
        .from("plan_missions")
        .select("title, title_en, pillar")
        .eq("id", milestone.mission_id)
        .single();
      if (mission) {
        missionTitle = mission.title || "";
        missionTitleEn = mission.title_en || mission.title || "";
      }
    }

    // Analytics
    const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0];
    const { data: recentActions } = await supabase
      .from("action_items")
      .select("status")
      .eq("user_id", user_id)
      .gte("scheduled_date", tenDaysAgo);

    const totalRecent = recentActions?.length || 0;
    const completedRecent = recentActions?.filter(a => a.status === "done").length || 0;
    const completionRate = totalRecent > 0 ? Math.round((completedRecent / totalRecent) * 100) : 50;

    let intensity = "standard";
    if (completionRate >= 80) intensity = "challenging";
    else if (completionRate < 40) intensity = "gentle";

    const constraintsBlock = buildConstraintsBlock(ctx);

    // Build user goals context to prevent hallucination
    const userGoalsContext = buildUserGoalsContext(ctx);

    const prompt = `You are Aurora for "Mind OS". Generate exactly 3 WEEKLY OBJECTIVES for this milestone.

## IMPORTANT: These are WEEKLY-LEVEL OBJECTIVES, NOT daily micro-tasks.
Each objective should represent a meaningful week-long training goal that will later be
broken down into daily actions by a separate system.

## MILESTONE: "${milestone.title_en || milestone.title}"
## DESCRIPTION: ${milestone.description_en || milestone.description || "N/A"}
## MISSION: "${missionTitleEn || missionTitle}"
## PILLAR: ${milestone.focus_area || "general"}

## USER PROFILE:
Name: ${ctx.profile?.full_name || 'Unknown'}
Values: ${ctx.identity?.values?.slice(0, 5).join(', ') || 'N/A'}
Intensity: ${intensity} (completion rate: ${completionRate}%)
${userGoalsContext}

${constraintsBlock}

## CRITICAL — RELEVANCE RULE:
- ONLY generate objectives that are DIRECTLY relevant to the milestone title, description, and pillar above.
- NEVER invent topics the user hasn't expressed interest in (e.g., trading, stocks, crypto, cooking, etc.) unless those topics appear in the milestone, mission, user direction, or user projects.
- If the milestone is vague, generate objectives within the pillar's domain ONLY.
- Cross-reference the USER'S ACTUAL GOALS below to ensure relevance.

## WHAT MAKES A GOOD WEEKLY OBJECTIVE:
- It's a SUBSTANTIAL goal that takes 5-7 days to master or complete
- It has clear measurable criteria (e.g., "Establish a consistent morning breathwork protocol" not "Do breathing")
- It builds upon the previous objective (progressive)
- It directly advances the milestone's strategic goal
- Under 12 words per title

## EXAMPLES OF GOOD vs BAD:
- BAD: "Perform 10-minute breathing exercise" (too small — this is a daily action)
- GOOD: "Master 4-phase diaphragmatic breathing protocol" (takes a week to master)
- BAD: "Do 5 chin tucks" (micro-task)
- GOOD: "Build posterior chain posture correction habit" (weekly goal)
- BAD: "Journal about feelings" (diagnostic)
- GOOD: "Execute daily shadow work integration ritual" (treatment protocol)

## TREATMENT-ONLY RULES:
- BANNED: "identify", "check", "test", "evaluate", "journal about", "reflect on", "assess"
- REQUIRED: "master", "build", "execute", "establish", "develop", "strengthen", "complete"

## CADENCE (assign one per objective):
| Cadence | Meaning |
|---------|---------|
| daily | User should do something related to this EVERY DAY |
| 3x_per_week | 3 sessions per week (training, workouts) |
| 2x_per_week | 2 sessions per week (deep work, creation) |
| weekly | Once per week (reviews, audits) |

## EXECUTION TEMPLATE (primary mode for daily actions derived from this):
| Template | When to use |
|----------|-------------|
| tts_guided | Meditation, breathwork, visualization |
| video_embed | Yoga, face yoga, mobility, stretching |
| sets_reps_timer | Strength, boxing, HIIT, mewing holds |
| step_by_step | Skincare, cooking, reading, routines |
| timer_focus | Deep work, studying, business tasks |
| social_checklist | Networking, relationship tasks |

## DIFFICULTY:
Each objective MUST have a difficulty level:
- "easy" — Simple habits, routines, journaling, basic stretches (5 XP)
- "medium" — Moderate training, focused work, skill practice (10 XP)
- "hard" — Intense workouts, deep work sprints, complex challenges (15 XP)

Distribute difficulty: aim for 1 easy, 1 medium, 1 hard per set of 3.

## OUTPUT (JSON only, NO markdown):
{
  "objectives": [
    {
      "title_en": "Weekly objective 1 (foundation)",
      "title_he": "יעד שבועי 1",
      "description_en": "What this objective achieves",
      "description_he": "מה היעד הזה משיג",
      "cadence": "daily",
      "execution_template": "tts_guided",
      "action_type": "breathwork_protocol",
      "difficulty": "easy",
      "estimated_daily_minutes": 15
    },
    {
      "title_en": "Weekly objective 2 (application)",
      "title_he": "יעד שבועי 2",
      "description_en": "...",
      "description_he": "...",
      "cadence": "3x_per_week",
      "execution_template": "sets_reps_timer",
      "action_type": "strength_training",
      "difficulty": "hard",
      "estimated_daily_minutes": 25
    },
    {
      "title_en": "Weekly objective 3 (integration)",
      "title_he": "יעד שבועי 3",
      "description_en": "...",
      "description_he": "...",
      "cadence": "daily",
      "execution_template": "step_by_step",
      "action_type": "evening_routine",
      "difficulty": "medium",
      "estimated_daily_minutes": 10
    }
  ]
}`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Output ONLY valid JSON. No markdown. No explanation. Generate WEEKLY OBJECTIVES, not daily micro-tasks." },
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
    
    // Try to extract JSON object if wrapped in extra text
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("AI raw output:", raw.substring(0, 500));
      throw new Error("AI returned no valid JSON");
    }
    
    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("JSON parse failed, raw:", jsonMatch[0].substring(0, 500));
      throw new Error("AI returned invalid JSON");
    }

    if (!parsed?.objectives || parsed.objectives.length < 1) throw new Error("AI returned no objectives");

    // Calculate scheduled_day distribution
    const baseDayOffset = ((milestone.week_number || 1) - 1) * 10;

    const { data: siblings } = await supabase
      .from("life_plan_milestones")
      .select("id")
      .eq("plan_id", milestone.plan_id)
      .eq("week_number", milestone.week_number)
      .order("id");
    const milestoneIdx = siblings?.findIndex(s => s.id === milestone_id) ?? 0;

    // Each weekly objective spans multiple days based on cadence
    const DIFFICULTY_XP: Record<string, number> = { easy: 5, medium: 10, hard: 15 };

    const miniRows = parsed.objectives.slice(0, 3).map((obj: any, idx: number) => {
      const difficulty = ['easy', 'medium', 'hard'].includes(obj.difficulty) ? obj.difficulty : 'medium';
      return {
        milestone_id,
        mini_number: idx + 1,
        title: obj.title_he || obj.title_en,
        title_en: obj.title_en,
        description: obj.description_he || null,
        description_en: obj.description_en || null,
        xp_reward: DIFFICULTY_XP[difficulty] || 10,
        difficulty,
        scheduled_day: Math.min(baseDayOffset + ((milestoneIdx * 3 + idx) % 10) + 1, 100),
        execution_template: obj.execution_template || 'step_by_step',
        action_type: obj.action_type || null,
      };
    });

    const { error: insertError } = await supabase
      .from("mini_milestones")
      .insert(miniRows);

    if (insertError) throw insertError;

    return new Response(JSON.stringify({
      status: "generated",
      count: miniRows.length,
      intensity,
      completion_rate: completionRate,
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
