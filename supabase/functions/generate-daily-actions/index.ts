/**
 * generate-daily-actions — AI-powered daily action generator
 * 
 * Takes weekly objectives (from mini_milestones) and generates
 * specific, contextualized daily actions via a separate AI call.
 * 
 * Architecture: Weekly Objectives → AI → Daily Actions for Today
 * 
 * Called by generate-today-queue when building the Now page.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, isCorsPreFlight, handleCorsPreFlight } from "../_shared/cors.ts";

interface WeeklyObjective {
  id: string;
  title: string;
  titleEn: string | null;
  description: string | null;
  descriptionEn: string | null;
  pillar: string;
  missionTitle: string | null;
  executionTemplate: string | null;
  actionType: string | null;
  cadence: string | null;
}

interface DailyAction {
  title: string;
  titleEn: string;
  pillarId: string;
  durationMin: number;
  executionTemplate: string;
  actionType: string;
  weeklyObjectiveId: string;
  weeklyObjectiveTitle: string;
  missionTitle: string | null;
  isTimeBased: boolean;
}

serve(async (req) => {
  if (isCorsPreFlight(req)) return handleCorsPreFlight();

  try {
    const { user_id, weekly_objectives, language = "he", day_intensity = "medium", energy_level } = await req.json();
    if (!user_id || !weekly_objectives || weekly_objectives.length === 0) {
      return new Response(JSON.stringify({ daily_actions: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not set");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const isHe = language === "he";
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    // Check cache: did we already generate for today?
    const today = new Date().toISOString().split("T")[0];
    const cacheKey = `daily_${user_id}_${today}`;
    
    const { data: cached } = await supabase
      .from("action_items")
      .select("id")
      .eq("user_id", user_id)
      .eq("source", "daily_engine")
      .eq("scheduled_date", today)
      .limit(1);

    if (cached && cached.length > 0) {
      // Already generated for today — fetch and return
      const { data: todayActions } = await supabase
        .from("action_items")
        .select("*")
        .eq("user_id", user_id)
        .eq("source", "daily_engine")
        .eq("scheduled_date", today)
        .in("status", ["todo", "doing"])
        .order("order_index");

      const actions: DailyAction[] = (todayActions || []).map(a => ({
        title: a.title,
        titleEn: (a.metadata as any)?.title_en || a.title,
        pillarId: a.pillar || "focus",
        durationMin: (a.metadata as any)?.duration_min || 15,
        executionTemplate: (a.metadata as any)?.execution_template || "step_by_step",
        actionType: a.type || "task",
        weeklyObjectiveId: a.parent_id || "",
        weeklyObjectiveTitle: (a.metadata as any)?.weekly_objective_title || "",
        missionTitle: (a.metadata as any)?.mission_title || null,
        isTimeBased: (a.metadata as any)?.is_time_based || false,
      }));

      return new Response(JSON.stringify({ daily_actions: actions, source: "cache" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build objectives summary for the prompt
    const objectivesSummary = weekly_objectives.map((obj: WeeklyObjective, i: number) => 
      `${i + 1}. [${obj.pillar}] "${obj.titleEn || obj.title}" — ${obj.descriptionEn || obj.description || 'No description'} (template: ${obj.executionTemplate}, cadence: ${obj.cadence || 'daily'})`
    ).join('\n');

    // Determine how many daily actions to generate
    const intensityMap: Record<string, number> = {
      recovery: 3,
      light: 4,
      medium: 5,
      high: 6,
    };
    const targetCount = intensityMap[day_intensity] || 5;

    const prompt = `You are Aurora, the AI coach for Mind OS. Generate ${targetCount} SPECIFIC DAILY ACTIONS for TODAY.

## TODAY: ${dayOfWeek}, ${today}
## Day intensity: ${day_intensity}
${energy_level ? `## User energy level: ${energy_level}/5` : ''}

## WEEKLY OBJECTIVES (the user is working on these this week):
${objectivesSummary}

## YOUR TASK:
For each relevant weekly objective, generate 1-2 specific daily actions that advance it TODAY.
Each action should be:
- Completable in a single session (10-45 minutes)
- Extremely specific and actionable (not vague)
- A TREATMENT protocol (the user does something physical or concrete)

## BANNED VERBS: "identify", "check", "assess", "evaluate", "journal about", "reflect on"
## REQUIRED VERBS: "perform", "execute", "practice", "drill", "complete", "run"

## DAY ADJUSTMENT:
- ${dayOfWeek === 'Friday' || dayOfWeek === 'Saturday' ? 'LIGHTER DAY — shorter, easier actions. Skip intense training.' : ''}
- ${day_intensity === 'recovery' ? 'RECOVERY DAY — gentle, restorative actions only. No intense training.' : ''}
- ${energy_level && energy_level <= 2 ? 'LOW ENERGY — prioritize easiest wins. Keep sessions short (10-15 min max).' : ''}

## EXECUTION TEMPLATES (assign one per action):
| Template | When to use |
|----------|-------------|
| tts_guided | Meditation, breathwork, visualization, body scan |
| video_embed | Yoga, face yoga, mobility, stretching |
| sets_reps_timer | Strength, boxing, HIIT, mewing holds |
| step_by_step | Skincare, cooking, reading, routines |
| timer_focus | Deep work, studying, business tasks |
| social_checklist | Networking, relationship tasks |

## OUTPUT (JSON only, NO markdown):
{
  "daily_actions": [
    {
      "title_he": "בצע פרוטוקול נשימה סרעפתית 7 דקות",
      "title_en": "Execute 7-min diaphragmatic breathing protocol",
      "pillar": "vitality",
      "duration_min": 10,
      "execution_template": "tts_guided",
      "action_type": "breathwork_7min",
      "weekly_objective_index": 0,
      "is_time_based": true
    }
  ]
}`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Output ONLY valid JSON. No markdown. Generate SPECIFIC daily actions derived from the weekly objectives." },
          { role: "user", content: prompt },
        ],
        temperature: 0.75,
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

    if (!parsed?.daily_actions || parsed.daily_actions.length === 0) {
      return new Response(JSON.stringify({ daily_actions: [], source: "empty" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Persist daily actions as action_items for tracking/completion
    const actionRows = parsed.daily_actions.slice(0, targetCount).map((action: any, idx: number) => {
      const objIdx = action.weekly_objective_index ?? 0;
      const weeklyObj = weekly_objectives[objIdx] || weekly_objectives[0];

      return {
        user_id,
        type: "task",
        source: "daily_engine",
        status: "todo",
        title: isHe ? (action.title_he || action.title_en) : (action.title_en || action.title_he),
        pillar: action.pillar || weeklyObj?.pillar || "focus",
        scheduled_date: today,
        order_index: idx,
        xp_reward: 10,
        token_reward: 0,
        parent_id: weeklyObj?.id || null,
        metadata: {
          title_en: action.title_en,
          title_he: action.title_he,
          execution_template: action.execution_template || "step_by_step",
          execution_template_source: "daily_engine",
          action_type: action.action_type || null,
          duration_min: action.duration_min || 15,
          is_time_based: action.is_time_based || false,
          weekly_objective_title: weeklyObj?.titleEn || weeklyObj?.title || null,
          mission_title: weeklyObj?.missionTitle || null,
          generated_at: new Date().toISOString(),
        },
      };
    });

    const { error: insertError } = await supabase
      .from("action_items")
      .insert(actionRows);

    if (insertError) {
      console.error("Insert daily actions error:", insertError);
      // Don't throw — still return the generated actions
    }

    // Map to response format
    const dailyActions: DailyAction[] = parsed.daily_actions.slice(0, targetCount).map((action: any, idx: number) => {
      const objIdx = action.weekly_objective_index ?? 0;
      const weeklyObj = weekly_objectives[objIdx] || weekly_objectives[0];

      return {
        title: isHe ? (action.title_he || action.title_en) : (action.title_en || action.title_he),
        titleEn: action.title_en || action.title_he,
        pillarId: action.pillar || weeklyObj?.pillar || "focus",
        durationMin: action.duration_min || 15,
        executionTemplate: action.execution_template || "step_by_step",
        actionType: action.action_type || "task",
        weeklyObjectiveId: weeklyObj?.id || "",
        weeklyObjectiveTitle: weeklyObj?.titleEn || weeklyObj?.title || "",
        missionTitle: weeklyObj?.missionTitle || null,
        isTimeBased: action.is_time_based || false,
      };
    });

    return new Response(JSON.stringify({ daily_actions: dailyActions, source: "generated" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-daily-actions error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", daily_actions: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
