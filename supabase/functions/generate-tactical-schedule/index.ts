/**
 * generate-tactical-schedule — AI-powered daily time-block schedule generator
 * 
 * Generates a 10-day schedule with THEMED BLOCKS (Morning, Training, Focus, Evening)
 * where each block contains multiple related milestones grouped by category.
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
        .select("id, title, title_en, description, description_en, focus_area, week_number, mission_id, is_completed, difficulty")
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

    if (milestones.length === 0) throw new Error("No milestones found for this phase");

    const wakeTime = profile?.wake_time || "06:30";
    const sleepTime = profile?.sleep_time || "23:00";
    const focusPeakStart = profile?.focus_peak_start || "09:00";
    const focusPeakEnd = profile?.focus_peak_end || "12:00";

    // Build mission map
    const missionMap: Record<string, { title: string; titleEn: string; pillar: string }> = {};
    for (const m of missions) {
      missionMap[m.id] = { title: m.title || "", titleEn: m.title_en || m.title || "", pillar: m.pillar || "" };
    }

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

    // Fetch existing schedule for adjustments
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
      ? `\n## DAILY ADJUSTMENT (Day ${adjust_day}):\nAdjust day ${adjust_day} based on completed items.\nExisting: ${JSON.stringify(existingSchedule.schedule_data).substring(0, 2000)}\n`
      : "";

    const prompt = `You are Aurora, the AI schedule architect for Mind OS. Generate a COMPLETE 10-day tactical schedule organized into THEMED BLOCKS.

## USER PREFERENCES:
- Wake time: ${wakeTime}
- Sleep time: ${sleepTime}
- Peak focus window: ${focusPeakStart} - ${focusPeakEnd}
- Name: ${profile?.full_name || "User"}

## MILESTONES TO SCHEDULE (${enrichedMilestones.length} total):
${enrichedMilestones.map((m, i) => `${i + 1}. [ID: ${m.id}] [${m.focus_area}] "${m.title_en}" — ${m.description} (Mission: ${m.mission_title})${m.is_completed ? ' ✅ DONE' : ''}`).join("\n")}

${adjustmentContext}

## BLOCK STRUCTURE RULES:
1. Each day has 3-5 THEMED BLOCKS. A block is a container for related milestones.
2. Block types and their ideal time slots:
   - "Morning Ritual" (🌅): Right after waking. Contains: breathing, meditation, grounding, yoga, stretching milestones.
   - "Training Block" (⚔️): Morning or late afternoon. Contains: physical training, combat, strength, cardio milestones.
   - "Deep Work" (🧠): During peak focus window (${focusPeakStart}-${focusPeakEnd}). Contains: business, creation, analysis, strategy milestones.
   - "Action Block" (⚡): Afternoon. Contains: tasks, execution, productivity milestones.
   - "Evening Review" (🌙): Before sleep. Contains: reflection, review, journaling, social milestones.
3. Each block contains 2-5 milestones inside it.
4. The same milestone can appear across multiple days based on cadence:
   - Physical/breathing/meditation: 4-6 times across 10 days
   - Training/exercise: 3-4 times
   - Deep work/business: 2-3 times
   - Social/review: 1-2 times
5. Already completed milestones (✅) should NOT be scheduled.
6. Each milestone inside a block gets its own duration (10-45 min).
7. Total daily active time: 90-180 minutes (realistic!).

## CATEGORIES: health, training, focus, action, creation, review, social

## OUTPUT (JSON only, NO markdown):
{
  "days": [
    {
      "day_number": 1,
      "blocks": [
        {
          "block_title_en": "Morning Ritual",
          "block_title_he": "ריטואל בוקר",
          "block_emoji": "🌅",
          "start_time": "06:30",
          "end_time": "07:30",
          "category": "health",
          "milestones": [
            {
              "milestone_id": "actual-uuid-from-list",
              "title_en": "Morning breathwork protocol",
              "title_he": "פרוטוקול נשימת בוקר",
              "duration_minutes": 15,
              "difficulty": "easy",
              "xp_reward": 5,
              "execution_template": "tts_guided",
              "order_index": 0
            },
            {
              "milestone_id": "actual-uuid-from-list",
              "title_en": "Tai Chi flow",
              "title_he": "תרגול טאי צ'י",
              "duration_minutes": 20,
              "difficulty": "medium",
              "xp_reward": 10,
              "execution_template": "timer_focus",
              "order_index": 1
            }
          ],
          "total_minutes": 35,
          "milestone_count": 2
        }
      ],
      "total_minutes": 120,
      "block_count": 4
    }
  ]
}

IMPORTANT: Use the EXACT milestone IDs from the list above. Group related milestones into blocks by theme. Generate ALL 10 days.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Output ONLY valid JSON. No markdown fences. No explanation. Generate realistic themed blocks with milestones grouped inside." },
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

    // Validate milestone IDs and clean up blocks
    const validIds = new Set(milestones.map(m => m.id));
    for (const day of parsed.days) {
      if (!day.blocks) day.blocks = [];
      for (const block of day.blocks) {
        if (!block.milestones) block.milestones = [];
        block.milestones = block.milestones.map((m: any, idx: number) => {
          if (m.milestone_id && !validIds.has(m.milestone_id)) {
            m.milestone_id = null;
          }
          m.order_index = idx;
          return m;
        });
        block.milestone_count = block.milestones.length;
        block.total_minutes = block.milestones.reduce((s: number, m: any) => s + (m.duration_minutes || 15), 0);
      }
      day.total_minutes = day.blocks.reduce((s: number, b: any) => s + (b.total_minutes || 0), 0);
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
