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

    // Parallel fetches — now includes practices, skills, identity
    const [profileRes, milestonesRes, missionsRes, planRes, userPracticesRes, identityRes, directionRes] = await Promise.all([
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
      // NEW: User practices with practice library details
      supabase.from("user_practices").select("*, practices(name, name_he, category, pillar, difficulty_level, default_duration, energy_type, instructions)").eq("user_id", user_id).eq("is_active", true),
      // NEW: Identity elements
      supabase.from("aurora_identity_elements").select("element_type, content").eq("user_id", user_id),
      supabase.from("aurora_life_direction").select("content, clarity_score").eq("user_id", user_id).order("created_at", { ascending: false }).limit(1),
    ]);

    const profile = profileRes.data;
    const milestones = milestonesRes.data || [];
    const missions = missionsRes.data || [];
    let userPractices = userPracticesRes.data || [];
    const identityElements = identityRes.data || [];
    const direction = directionRes.data?.[0];

    // Auto-populate user_practices if empty (bridge from selected pillars)
    if (userPractices.length === 0) {
      const { data: profileData } = await supabase.from("profiles").select("selected_pillars").eq("id", user_id).single();
      const selectedPillars = profileData?.selected_pillars as Record<string, string[]> | null;
      const allUserPillars = new Set([
        ...(selectedPillars?.core || []),
        ...(selectedPillars?.arena || []),
      ]);

      if (allUserPillars.size > 0) {
        const { data: allPractices } = await supabase.from("practices").select("id, name, pillar, energy_type, default_duration, category");
        if (allPractices && allPractices.length > 0) {
          // Only auto-populate a reasonable subset — max 2 per pillar, not everything
          const perPillarCount: Record<string, number> = {};
          const filtered = allPractices.filter(p => {
            if (!allUserPillars.has(p.pillar)) return false;
            perPillarCount[p.pillar] = (perPillarCount[p.pillar] || 0) + 1;
            return perPillarCount[p.pillar] <= 2; // max 2 practices per pillar
          });

          const rows = filtered.map((p, idx) => ({
              user_id,
              practice_id: p.id,
              is_active: true,
              is_core_practice: idx === 0 && p.category === 'health', // Only first health practice is core
              energy_phase: p.energy_type || 'day',
              preferred_duration: p.default_duration || 15,
              frequency_per_week: p.category === 'training' ? 3 : 5, // training 3x, health 5x
              skill_level: 1,
            }));

          if (rows.length > 0) {
            await supabase.from("user_practices").upsert(rows, { onConflict: 'user_id,practice_id', ignoreDuplicates: true });
            const { data: refreshed } = await supabase
              .from("user_practices")
              .select("*, practices(name, name_he, category, pillar, difficulty_level, default_duration, energy_type, instructions)")
              .eq("user_id", user_id).eq("is_active", true);
            userPractices = refreshed || [];
            console.log(`[practices-bridge] Auto-populated ${rows.length} practices (filtered from ${allPractices.length})`);
          }
        }
      }
    }

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
        difficulty: (m as any).difficulty || 3,
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

    // Build practices as SCHEDULABLE items alongside milestones
    const practiceItems = userPractices.map((up: any, idx: number) => {
      const p = up.practices || {};
      return {
        practice_id: up.practice_id || `practice_${idx}`,
        name: p.name || 'Unknown',
        name_he: p.name_he || p.name || '',
        pillar: p.pillar || 'general',
        energy_type: up.energy_phase || p.energy_type || 'day',
        duration: up.preferred_duration || p.default_duration || 15,
        frequency: up.frequency_per_week || 3,
        is_core: up.is_core_practice || false,
        category: p.category || 'health',
        difficulty: p.difficulty_level || 2,
      };
    });

    const practicesBlock = practiceItems.length > 0
      ? `\n## USER'S COMMITTED PRACTICES (MUST be scheduled — these are the user's real daily rituals):
${practiceItems.map((p: any, i: number) => `P${i + 1}. [PRACTICE_ID: ${p.practice_id}] [${p.pillar}] "${p.name}" (HE: "${p.name_he}") — ${p.duration}min, ${p.frequency}x/week, energy: ${p.energy_type}, ${p.is_core ? 'CORE (must appear daily)' : 'optional'}, category: ${p.category}`).join('\n')}

CRITICAL RULES FOR PRACTICES:
- CORE practices MUST appear in EVERY day's schedule.
- Non-core practices should appear ${Math.min(practiceItems.length, 3)}-${Math.min(practiceItems.length * 2, 6)} times across 10 days based on frequency.
- Place practices in their matching energy_type block: "morning" → Morning Activation, "training" → Training Block, "evening" → Evening Review, "day" → Focused Productivity.
- Use practice_id (not milestone_id) for practice entries. Set milestone_id to null for practices.
- Use the EXACT practice names — do NOT invent generic alternatives like "breathing exercise" or "meditation".
- Practices and milestones COEXIST in the same blocks. A Morning block might have 1 practice + 1 milestone.\n`
      : '';

    // Build identity context
    const identityBlock = direction
      ? `\n## USER IDENTITY:\nLife Direction: ${direction.content}\nValues: ${identityElements.filter((i: any) => i.element_type === 'value').map((i: any) => i.content).join(', ') || 'N/A'}\n`
      : '';

    const prompt = `You are Aurora, the AI schedule architect for Mind OS. Generate a COMPLETE 10-day tactical schedule organized into THEMED BLOCKS.

## USER PREFERENCES:
- Wake time: ${wakeTime}
- Sleep time: ${sleepTime}
- Peak focus window: ${focusPeakStart} - ${focusPeakEnd}
- Name: ${profile?.full_name || "User"}
${practicesBlock}${identityBlock}

## MILESTONES TO SCHEDULE (${enrichedMilestones.length} total):
${enrichedMilestones.map((m, i) => `${i + 1}. [ID: ${m.id}] [${m.focus_area}] [Difficulty: ${m.difficulty}/5] "${m.title_en}" (HE: "${m.title}") — ${m.description} (Mission: ${m.mission_title})${m.is_completed ? ' ✅ DONE' : ''}`).join("\n")}

${adjustmentContext}

## BLOCK STRUCTURE RULES:
1. Each day has 3-5 THEMED BLOCKS. A block is a CONTAINER for related milestones.
2. **CRITICAL**: Each block MUST contain a "milestones" ARRAY with 2-5 milestone objects inside it. A block is NOT a single milestone — it groups multiple milestones together.
3. Block types and their ideal time slots:
   - "Morning Activation" (🌅): Right after waking. Group: breathing, meditation, grounding, yoga, stretching, posture milestones.
   - "Training Block" (⚔️): Morning or late afternoon. Group: physical training, combat, strength, cardio milestones.
   - "Focused Productivity" (🧠): During peak focus window (${focusPeakStart}-${focusPeakEnd}). Group: business, creation, analysis, strategy, deep work milestones.
   - "Influence & Wealth" (⚡): Afternoon. Group: networking, finance, marketing, sales, execution milestones.
   - "Evening Review" (🌙): Before sleep. Group: reflection, review, journaling, social, relationships milestones.
4. The same milestone can and SHOULD appear across multiple days based on its nature:
   - Physical/breathing/meditation: 4-6 times across 10 days
   - Training/exercise: 3-4 times
   - Deep work/business: 3-5 times
   - Social/review: 1-2 times
5. Already completed milestones (✅) should NOT be scheduled.
6. Each milestone inside a block gets its own duration (10-45 min).
7. Total daily active time: 120-240 minutes.
8. CRITICAL: Use the EXACT milestone titles (title_en and title_he) from the list above — do NOT rename or paraphrase them.
9. CRITICAL: Use the EXACT difficulty value (1-5) from each milestone — do NOT change it.
10. CRITICAL: Every block MUST have at least 2 milestones in its "milestones" array. If a category only has 1 milestone, merge it into an adjacent block.
11. CRITICAL: Each milestone object MUST include a "focus_area" field with the EXACT pillar/focus_area value from the milestone list above (e.g., "vitality", "focus", "wealth"). Do NOT use block categories as focus_area.

## CATEGORIES: health, training, focus, action, creation, review, social

## OUTPUT (JSON only, NO markdown):
{
  "days": [
    {
      "day_number": 1,
      "blocks": [
        {
          "block_title_en": "Morning Activation",
          "block_title_he": "הפעלת בוקר",
          "block_emoji": "🌅",
          "start_time": "06:30",
          "end_time": "07:30",
          "category": "health",
          "milestones": [
            {
              "milestone_id": "actual-uuid-from-list",
              "practice_id": null,
              "focus_area": "vitality",
              "title_en": "Morning breathwork protocol",
              "title_he": "פרוטוקול נשימת בוקר",
              "duration_minutes": 15,
              "difficulty": 1,
              "xp_reward": 5,
              "execution_template": "tts_guided",
              "order_index": 0
            },
            {
              "milestone_id": null,
              "practice_id": "actual-practice-id",
              "focus_area": "consciousness",
              "title_en": "Tai Chi practice",
              "title_he": "תרגול טאי צ'י",
              "duration_minutes": 20,
              "difficulty": 2,
              "xp_reward": 10,
              "execution_template": "timer_focus",
              "order_index": 1
            }
          ],
          "total_minutes": 35,
          "milestone_count": 2
        }
      ],
      "total_minutes": 150,
      "block_count": 4
    }
  ]
}

WARNING: If any block has fewer than 2 milestones/practices in its "milestones" array, your output is INVALID. Every block must group multiple actions together. This is the most critical requirement.

IMPORTANT: Use the EXACT milestone IDs and practice IDs from the lists above. For practice entries, set milestone_id to null and use practice_id. For milestone entries, set practice_id to null. Group related items into blocks by theme. Generate ALL 10 days.`;

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

    // Validate milestone/practice IDs, add stable block_id, and enrich with lineage
    const validMilestoneIds = new Set(milestones.map(m => m.id));
    const validPracticeIds = new Set(practiceItems.map((p: any) => p.practice_id));
    let blockCounter = 0;
    for (const day of parsed.days) {
      if (!day.blocks) day.blocks = [];
      for (const block of day.blocks) {
        block.block_id = `phase${phase_number}_d${day.day_number}_b${blockCounter++}`;
        if (!block.milestones) block.milestones = [];
        block.milestones = block.milestones.map((m: any, idx: number) => {
          if (m.milestone_id && !validMilestoneIds.has(m.milestone_id)) {
            m.milestone_id = null;
          }
          if (m.practice_id && !validPracticeIds.has(m.practice_id)) {
            m.practice_id = null;
          }
          m.source_type = m.practice_id ? 'practice' : 'milestone';
          if (m.milestone_id) {
            const sourceMilestone = milestones.find(ms => ms.id === m.milestone_id);
            if (sourceMilestone?.mission_id) {
              const mission = missionMap[sourceMilestone.mission_id];
              m.mission_id = sourceMilestone.mission_id;
              m.mission_title = mission?.titleEn || mission?.title || '';
              m.pillar = mission?.pillar || m.focus_area || '';
            }
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
