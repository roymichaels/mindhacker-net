/**
 * generate-tactical-schedule — AI-powered daily time-block schedule generator
 * 
 * Takes milestones for a phase + user wake/sleep preferences and generates
 * a full 10-day hour-by-hour schedule stored in tactical_schedules table.
 * 
 * Each day has fixed time blocks from wake to sleep with milestones distributed
 * based on cadence, difficulty, and category.
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
    const { user_id, plan_id, phase_number, adjust_day } = await req.json();
    if (!user_id || !plan_id || !phase_number) {
      throw new Error("user_id, plan_id, and phase_number required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not set");

    // Parallel fetches
    const [profileRes, milestonesRes, missionsRes, planRes] = await Promise.all([
      supabase.from("profiles").select("full_name, wake_time, sleep_time, focus_peak_start, focus_peak_end").eq("id", user_id).single(),
      supabase.from("life_plan_milestones")
        .select("id, title, title_en, description, description_en, focus_area, week_number, mission_id, is_completed")
        .eq("plan_id", plan_id)
        .eq("week_number", phase_number)
        .order("id"),
      supabase.from("plan_missions")
        .select("id, title, title_en, pillar")
        .eq("plan_id", plan_id),
      supabase.from("life_plans").select("start_date").eq("id", plan_id).single(),
    ]);

    const profile = profileRes.data;
    const milestones = milestonesRes.data || [];
    const missions = missionsRes.data || [];
    const planStartDate = planRes.data?.start_date;

    if (milestones.length === 0) throw new Error("No milestones found for this phase");

    const wakeTime = profile?.wake_time || "06:30";
    const sleepTime = profile?.sleep_time || "23:00";
    const focusPeakStart = profile?.focus_peak_start || "09:00";
    const focusPeakEnd = profile?.focus_peak_end || "12:00";

    // Build mission map for context
    const missionMap: Record<string, { title: string; titleEn: string; pillar: string }> = {};
    for (const m of missions) {
      missionMap[m.id] = { title: m.title || "", titleEn: m.title_en || m.title || "", pillar: m.pillar || "" };
    }

    // Enrich milestones with mission context
    const enrichedMilestones = milestones.map(m => {
      const mission = m.mission_id ? missionMap[m.mission_id] : null;
      return {
        id: m.id,
        title: m.title,
        title_en: m.title_en || m.title,
        description: m.description_en || m.description || "",
        focus_area: m.focus_area || mission?.pillar || "general",
        mission_title: mission?.titleEn || mission?.title || "",
        is_completed: m.is_completed,
      };
    });

    // If adjust_day is set, we're doing a daily adjustment — fetch existing schedule
    let existingSchedule: any = null;
    if (adjust_day) {
      const { data } = await supabase
        .from("tactical_schedules")
        .select("schedule_data, version")
        .eq("user_id", user_id)
        .eq("plan_id", plan_id)
        .eq("phase_number", phase_number)
        .single();
      existingSchedule = data;
    }

    const adjustmentContext = adjust_day && existingSchedule
      ? `
## DAILY ADJUSTMENT (Day ${adjust_day}):
The existing schedule has been partially executed. Adjust day ${adjust_day} based on what was completed. Keep the overall structure but rebalance uncompleted items.
Existing schedule: ${JSON.stringify(existingSchedule.schedule_data).substring(0, 2000)}
`
      : "";

    const prompt = `You are Aurora, the AI schedule architect for Mind OS. Generate a COMPLETE 10-day tactical schedule with exact time blocks.

## USER PREFERENCES:
- Wake time: ${wakeTime}
- Sleep time: ${sleepTime}
- Peak focus window: ${focusPeakStart} - ${focusPeakEnd}
- Name: ${profile?.full_name || "User"}

## MILESTONES TO SCHEDULE (${enrichedMilestones.length} total):
${enrichedMilestones.map((m, i) => `${i + 1}. [${m.focus_area}] "${m.title_en}" — ${m.description} (Mission: ${m.mission_title})${m.is_completed ? ' ✅ DONE' : ''}`).join("\n")}

${adjustmentContext}

## SCHEDULING RULES:
1. Each milestone should appear 2-4 times across the 10 days based on its nature:
   - Physical training/exercise: 3-4 times (e.g., Mon/Wed/Fri/Sun pattern)
   - Mental/meditation/breathwork: daily or 5x (morning routine items)
   - Deep work/business/creation: 2-3 times (longer sessions)
   - Social/relationship tasks: 1-2 times
   - Review/analysis: 1-2 times (mid-phase and end)
2. Place meditation/breathwork in the MORNING right after waking
3. Place intense training in MORNING or LATE AFTERNOON (not right after meals)
4. Place deep work during the PEAK FOCUS WINDOW (${focusPeakStart}-${focusPeakEnd})
5. Place social/light tasks in AFTERNOON or EVENING
6. Place review/reflection in EVENING before sleep
7. Each day should have 3-7 time blocks, NOT more
8. Leave gaps between blocks — the user has a life!
9. No block should be longer than 60 minutes
10. Total daily active time: 90-180 minutes (realistic!)
11. Already completed milestones (marked ✅) should NOT be scheduled

## TIME BLOCK FORMAT:
Each block has: start_time (HH:MM), end_time (HH:MM), milestone_id, title, title_he, category, execution_template

## CATEGORIES: health, training, focus, action, creation, review, social
## EXECUTION TEMPLATES: tts_guided, video_embed, sets_reps_timer, step_by_step, timer_focus, social_checklist

## OUTPUT (JSON only, NO markdown):
{
  "days": [
    {
      "day_number": 1,
      "blocks": [
        {
          "start_time": "06:30",
          "end_time": "06:45",
          "milestone_id": "uuid-here",
          "title_en": "Morning breathwork protocol",
          "title_he": "פרוטוקול נשימה בוקר",
          "category": "health",
          "execution_template": "tts_guided",
          "estimated_minutes": 15,
          "difficulty": "easy",
          "xp_reward": 5
        }
      ],
      "total_minutes": 120,
      "block_count": 5
    }
  ]
}

Generate ALL 10 days. Be realistic — the user needs to actually DO this. Quality over quantity.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Output ONLY valid JSON. No markdown fences. No explanation text. Generate a realistic, balanced 10-day schedule." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI error:", aiResp.status, errText);
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI call failed: ${aiResp.status}`);
    }

    const aiData = await aiResp.json();
    let raw = aiData?.choices?.[0]?.message?.content || "";
    raw = raw.replace(/```json\s*/g, "").replace(/```/g, "").trim();

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("AI raw:", raw.substring(0, 500));
      throw new Error("AI returned no valid JSON");
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      console.error("JSON parse fail:", jsonMatch[0].substring(0, 500));
      throw new Error("AI returned invalid JSON");
    }

    if (!parsed?.days || !Array.isArray(parsed.days) || parsed.days.length === 0) {
      throw new Error("AI returned no schedule days");
    }

    // Validate and clean milestone IDs — map back to real IDs
    const validIds = new Set(milestones.map(m => m.id));
    for (const day of parsed.days) {
      if (!day.blocks) day.blocks = [];
      day.blocks = day.blocks.filter((b: any) => {
        // Keep blocks even if milestone_id is wrong — the title/category still has value
        if (b.milestone_id && !validIds.has(b.milestone_id)) {
          b.milestone_id = null; // Clear invalid ID but keep the block
        }
        return true;
      });
      day.total_minutes = day.blocks.reduce((s: number, b: any) => s + (b.estimated_minutes || 15), 0);
      day.block_count = day.blocks.length;
    }

    // Upsert schedule
    const version = (existingSchedule?.version || 0) + 1;
    const { error: upsertError } = await supabase
      .from("tactical_schedules")
      .upsert({
        user_id,
        plan_id,
        phase_number,
        schedule_data: parsed.days,
        wake_time: wakeTime,
        sleep_time: sleepTime,
        version,
        generated_at: new Date().toISOString(),
      }, { onConflict: "user_id,plan_id,phase_number" });

    if (upsertError) throw upsertError;

    return new Response(JSON.stringify({
      status: "generated",
      days: parsed.days.length,
      version,
      total_blocks: parsed.days.reduce((s: number, d: any) => s + (d.block_count || 0), 0),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-tactical-schedule error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
