import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Aurora — an elite AI life architect inside MindOS.
This is the user's FIRST conversation with you. Your mission: understand who they are deeply through natural conversation and extract structured onboarding data matching the Neural Architecture Intake (59 variables across 5 phases).

## YOUR PERSONALITY
- You are warm yet direct. No fluff.
- You ask ONE question at a time, but can cluster related micro-questions naturally.
- You adapt your language to the user's (Hebrew or English).
- You're genuinely curious about them. Every answer shapes their 90-day plan.
- Keep messages SHORT — 1-3 sentences max plus the next question.
- Challenge surface-level answers: "What does that really mean for you?"

## CONVERSATION FLOW (20-35 messages total)
Guide the conversation through these phases naturally. You MUST cover all of them.

### Phase 1: STATE DIAGNOSIS (4-6 exchanges)
- Entry context: Why are they here? (fix structure / optimize / recover energy / build income / discipline)
- Primary pressure zone: cognitive overload / energy instability / execution failure / emotional volatility / direction fog / money stress / relationship friction
- Functional symptoms (up to 3) related to their pressure zone
- When do they fail most? (morning / midday / evening / late night / random)

### Phase 2: BIOLOGICAL BASELINE (6-10 exchanges)
- Age bracket, biological sex, body fat estimate, activity level
- Sleep architecture: wake time, sleep time, average duration, quality (1-5), screen before bed, waking during night, sunlight after waking, desired wake time, morning routine desire
- Stimulants: caffeine count & timing, alcohol frequency, nicotine, cannabis/THC
- Dopamine load: daily screen time, shorts/reels, gaming, porn frequency, late night scrolling
- Nutrition: diet type, protein awareness, meals/day, fluid volume, fluid sources, nutrition weak point

### Phase 3: TIME ARCHITECTURE (4-6 exchanges)
- Work reality: work type, active work hours, availability hours, side projects, work start/end times, commute, energy peak time
- Relationship/social: relationship status, dependents, social energy level

### Phase 4: BEHAVIORAL PATTERNS (4-6 exchanges)
- Training: exercise types, training frequency, training consistency
- Previous change attempts: what they've tried before
- Friction trigger: what usually breaks them
- Stress default behaviors
- Motivation driver

### Phase 5: TARGET + COMMITMENT (3-5 exchanges)
- 90-day targets ranked by priority
- Urgency scale (1-10)
- Restructure willingness (1-10)
- Non-negotiable constraints
- Preferred session length, reminder level
- Any final notes

## EXTRACTION
When you've covered ALL phases (after 20-35 exchanges), call extract_onboarding_profile.
Before calling the tool, say: "I think I have a complete picture. Let me build your personalized 90-day architecture."

## RULES
- NEVER ask more than ONE question per message (you can reference 2-3 related items naturally)
- Adapt based on answers — if someone mentions burnout, dig into energy/stress
- If they give short answers, probe deeper
- Mirror their energy — casual or serious
- Don't lecture. Don't give advice yet. Just understand.
- You MUST cover ALL 5 phases before calling extract.
- For sensitive topics (porn, substances), be matter-of-fact and non-judgmental.`;

function buildExtractTool() {
  return {
    type: "function",
    function: {
      name: "extract_onboarding_profile",
      description:
        "Extract the complete Neural Architecture Intake profile (~59 variables) from conversation. Call after 20-35 exchanges when all 5 phases are covered.",
      parameters: {
        type: "object",
        properties: {
          // Phase 1: State Diagnosis
          entry_context: { type: "string", enum: ["fix_structure", "optimize_performance", "recover_energy", "build_income", "build_discipline"] },
          pressure_zone: { type: "string", enum: ["cognitive_overload", "energy_instability", "execution_failure", "emotional_volatility", "direction_fog", "money_stress", "relationship_friction"] },
          functional_signals: { type: "array", items: { type: "string" }, description: "Up to 3 symptoms from their pressure zone" },
          failure_moment: { type: "string", enum: ["morning_start", "midday_drift", "evening_collapse", "late_night_spiral", "random"] },

          // Phase 2: Biological Identity
          age_bracket: { type: "string", enum: ["16_18", "19_24", "25_34", "35_44", "45_54", "55_plus"] },
          gender: { type: "string", enum: ["male", "female", "prefer_not"] },
          body_fat_estimate: { type: "string", enum: ["lean", "average", "high", "very_high"] },
          activity_level: { type: "string", enum: ["none", "1_2_week", "3_4_week", "5_plus", "athlete"] },

          // Sleep Architecture
          wake_time: { type: "string", description: "e.g. '07:00'" },
          sleep_time: { type: "string", description: "e.g. '23:30'" },
          sleep_duration_avg: { type: "string", enum: ["under_5", "5_6", "6_7", "7_8", "8_plus"] },
          sleep_quality: { type: "number", description: "1-5 scale" },
          screen_before_bed: { type: "string", enum: ["yes", "no"] },
          wake_during_night: { type: "string", enum: ["never", "1x", "2x_plus", "often"] },
          sunlight_after_waking: { type: "string", enum: ["yes", "no", "sometimes"] },
          desired_wake_time: { type: "string", description: "e.g. '06:00'" },
          morning_routine_desire: { type: "string", enum: ["none", "15_30", "30_60", "60_90", "90_plus"] },

          // Stimulants
          caffeine_intake: { type: "string", enum: ["0", "1", "2", "3_plus"] },
          first_caffeine_timing: { type: "string", enum: ["within_60min", "1_3h", "after_3h", "varies"] },
          alcohol_frequency: { type: "string", enum: ["never", "1x_week", "2_3x_week", "4x_plus"] },
          nicotine: { type: "string", enum: ["no", "sometimes", "daily"] },
          weed_thc: { type: "string", enum: ["no", "sometimes", "weekly", "daily"] },

          // Dopamine Load
          daily_screen_time: { type: "string", enum: ["under_30m", "30_60m", "1_2h", "2_4h", "4h_plus"] },
          shorts_reels: { type: "string", enum: ["never", "sometimes", "daily", "heavy_daily"] },
          gaming: { type: "string", enum: ["none", "weekends", "few_days", "daily"] },
          porn_frequency: { type: "string", enum: ["prefer_not", "never", "monthly", "weekly", "2_5x_week", "daily"] },
          late_night_scrolling: { type: "string", enum: ["never", "sometimes", "often"] },

          // Nutrition
          diet_type: { type: "array", items: { type: "string" }, description: "e.g. ['mixed', 'intermittent_fasting']" },
          protein_awareness: { type: "string", enum: ["no_idea", "some", "track_it"] },
          meals_per_day: { type: "string", enum: ["1", "2", "3", "4_plus"] },
          daily_fluid_volume: { type: "string", enum: ["under_1L", "1_2L", "2_3L", "over_3L"] },
          fluid_sources: { type: "array", items: { type: "string" } },
          nutrition_weak_point: { type: "string", enum: ["sugar", "late_night_eating", "skipping_meals", "ultra_processed", "inconsistent_timing"] },

          // Phase 3: Time Architecture
          work_type: { type: "array", items: { type: "string" }, description: "e.g. ['employed', 'building_business']" },
          active_work_hours: { type: "string", enum: ["0_2", "2_4", "4_6", "6_8", "8_10", "10_plus"] },
          availability_hours: { type: "string", enum: ["0", "2_4", "4_8", "8_12", "12_plus"] },
          side_projects: { type: "array", items: { type: "string" } },
          work_start_time: { type: "string", description: "e.g. '08:00' or 'flexible'" },
          work_end_time: { type: "string", description: "e.g. '17:00' or 'varies'" },
          commute_duration: { type: "string", enum: ["0", "under_30m", "30_60m", "over_60m"] },
          energy_peak_time: { type: "string", enum: ["early", "morning", "midday", "afternoon", "evening", "night"] },

          // Relationships
          relationship_status: { type: "string", enum: ["single", "dating", "relationship", "married", "divorced", "widowed", "complicated"] },
          dependents: { type: "string", enum: ["none", "1_child", "2_children", "3_plus", "elderly_parent", "other"] },
          social_energy_level: { type: "string", enum: ["introvert", "ambivert", "extrovert"] },

          // Phase 4: Behavioral Patterns
          exercise_types: { type: "array", items: { type: "string" } },
          training_frequency: { type: "string" },
          training_consistency: { type: "string", enum: ["never_started", "always_quit", "on_off", "mostly_consistent", "disciplined"] },
          previous_change_attempts: { type: "string", description: "What they've tried before, 1-2 sentences" },
          friction_trigger: { type: "string", enum: ["too_tired", "too_distracted", "too_overwhelmed", "too_perfectionist", "too_reactive", "no_clear_step"] },
          stress_default_behavior: { type: "array", items: { type: "string" }, description: "e.g. ['scroll_phone', 'eat', 'isolate']" },
          motivation_driver: { type: "string", enum: ["freedom", "status", "stability", "identity_upgrade", "approval", "purpose"] },

          // Phase 5: Target + Commitment
          target_90_days: { type: "array", items: { type: "string" }, description: "Ranked priority list of 90-day targets" },
          urgency_scale: { type: "number", description: "1-10" },
          restructure_willingness: { type: "number", description: "1-10" },
          non_negotiable_constraint: { type: "array", items: { type: "string" } },
          preferred_session_length: { type: "string", enum: ["8", "12", "20"] },
          preferred_reminders: { type: "string", enum: ["minimal", "normal", "strict"] },
          final_notes: { type: "string", description: "Any additional notes" },

          // Aurora's diagnostic assessment
          diagnostic_scores: {
            type: "object",
            properties: {
              energy_stability: { type: "number", description: "0-100" },
              recovery_debt: { type: "number", description: "0-100 (100=good)" },
              dopamine_load: { type: "number", description: "0-100 (100=healthy)" },
              direction_clarity: { type: "number", description: "0-100" },
              stress_resilience: { type: "number", description: "0-100" },
            },
          },

          // Pillar mapping
          selected_pillar: { type: "string", enum: ["mind", "health", "career", "relationships", "money"] },
          aurora_summary: { type: "string", description: "Aurora's 3-5 sentence assessment, written in the user's language" },
        },
        required: [
          "entry_context", "pressure_zone", "functional_signals", "failure_moment",
          "age_bracket", "gender", "activity_level",
          "wake_time", "sleep_time", "sleep_duration_avg",
          "caffeine_intake", "alcohol_frequency",
          "daily_screen_time",
          "diet_type", "meals_per_day",
          "work_type", "active_work_hours",
          "relationship_status",
          "training_consistency",
          "friction_trigger", "motivation_driver",
          "target_90_days", "urgency_scale", "restructure_willingness",
          "diagnostic_scores", "selected_pillar", "aurora_summary",
        ],
      },
    },
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { messages, language } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langLabel = language === "he" ? "Hebrew" : "English";
    const startQuestion = language === "he"
      ? "היי! אני אורורה 👋 אני כאן כדי להכיר אותך לעומק ולבנות לך ארכיטקטורת חיים מותאמת אישית ל-90 ימים הקרובים.\n\nלפני שנתחיל — מה הביא אותך לכאן? מה אתה מחפש לשנות?"
      : "Hey! I'm Aurora 👋 I'm here to get to know you deeply and build a personalized 90-day life architecture.\n\nBefore we start — what brought you here? What are you looking to change?";

    const systemContent = `${SYSTEM_PROMPT}\n\nUser's preferred language: ${langLabel}. Always respond in that language.\n\nSTART with: "${startQuestion}"`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "system", content: systemContent }, ...messages],
          tools: [buildExtractTool()],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      const t = await response.text();
      console.error("AI gateway error:", status, t);

      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("onboarding-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
