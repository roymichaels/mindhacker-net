import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Aurora — an elite AI life architect inside MindOS.
This is the user's FIRST conversation with you. Your mission: understand who they are deeply through natural conversation and extract structured onboarding data.

## YOUR PERSONALITY
- You are warm yet direct. No fluff.
- You ask ONE question at a time.
- You adapt your language to the user's (Hebrew or English).
- You're genuinely curious about them. Every answer shapes their 90-day plan.
- Keep messages SHORT — 1-3 sentences max plus the next question.
- Challenge surface-level answers: "What does that really mean for you?"

## CONVERSATION FLOW (15-25 messages total)
Guide the conversation through these topics naturally — don't follow them rigidly, but make sure you cover them:

### Phase 1: Who Are You (3-5 exchanges)
- What brings them here? What's their main life focus right now?
- Age range, gender (ask naturally, don't make it feel like a form)
- What do they do for work/career?
- Relationship status, family situation

### Phase 2: Daily Life & Energy (3-5 exchanges)
- What time do they wake up and go to sleep?
- How's their energy throughout the day? (1-10)
- Do they exercise? What kind? How often?
- Diet/nutrition habits — processed vs. whole foods? Hydration?
- Substances — caffeine, alcohol, nicotine, cannabis?
- Stress levels and how they manage stress?

### Phase 3: What's Working & What's Not (3-5 exchanges)
- What are they most proud of recently?
- What feels stuck or broken in their life?
- What have they tried before to improve?
- What's their biggest fear about change?

### Phase 4: Vision & Direction (3-5 exchanges)
- If everything went perfectly for 90 days — what would change?
- What's ONE thing they'd focus on if they could only pick one?
- What habits do they want to build? What habits do they want to break?
- How committed are they to change? (probe for real commitment, not just words)
- What's their preferred coaching style — gentle encouragement or direct challenges?

### Phase 5: Wrap-Up
- When you have enough data (after 15-25 exchanges), call extract_onboarding_profile.
- Before calling the tool, say something like: "I think I have a good picture of where you are. Let me put together your personalized plan."

## RULES
- NEVER ask more than ONE question per message
- Adapt based on answers — if someone mentions burnout, dig into energy/stress
- If they give short answers, probe deeper: "Tell me more about that"
- Mirror their energy — if they're casual, be casual. If they're serious, be serious.
- Don't lecture. Don't give advice yet. Just understand.
- IMPORTANT: You must cover ALL phases before calling the extract tool.`;

function buildExtractTool() {
  return {
    type: "function",
    function: {
      name: "extract_onboarding_profile",
      description:
        "Extract the complete onboarding profile from the conversation. Call after 15-25 exchanges when you have enough data across all phases.",
      parameters: {
        type: "object",
        properties: {
          // Phase 1: Identity
          main_life_areas: {
            type: "array",
            items: { type: "string" },
            description: "Main life areas they're focused on. Values from: career, business, relationships, family, health, energy, finance, purpose, emotional, social, learning, spirituality",
          },
          age_bracket: {
            type: "string",
            enum: ["18-24", "25-34", "35-44", "45-54", "55+"],
            description: "Estimated age range from conversation",
          },
          gender: {
            type: "string",
            enum: ["male", "female", "other"],
            description: "Gender if mentioned",
          },
          occupation: {
            type: "string",
            description: "What they do for work, short description",
          },
          relationship_status: {
            type: "string",
            enum: ["single", "dating", "relationship", "married", "divorced", "other"],
            description: "Relationship status if mentioned",
          },

          // Phase 2: Daily life
          wake_time: {
            type: "string",
            description: "Typical wake time, e.g. '06:30' or '7:00'",
          },
          sleep_time: {
            type: "string",
            description: "Typical bed time, e.g. '23:00' or '00:30'",
          },
          energy_level: {
            type: "number",
            description: "Self-reported energy level 1-10",
          },
          activity_level: {
            type: "string",
            enum: ["sedentary", "light", "moderate", "active", "very_active"],
            description: "Physical activity level",
          },
          exercise_types: {
            type: "array",
            items: { type: "string" },
            description: "Types of exercise they do",
          },
          diet_quality: {
            type: "string",
            enum: ["poor", "average", "good", "excellent"],
            description: "Overall diet quality assessment",
          },
          substances: {
            type: "object",
            properties: {
              caffeine: { type: "string", description: "Caffeine usage description" },
              alcohol: { type: "string", description: "Alcohol usage description" },
              nicotine: { type: "boolean", description: "Uses nicotine" },
              cannabis: { type: "boolean", description: "Uses cannabis" },
            },
          },
          stress_level: {
            type: "string",
            enum: ["low", "moderate", "high", "very_high"],
            description: "Perceived stress level",
          },

          // Phase 3: Current state
          proudest_achievement: {
            type: "string",
            description: "What they're most proud of, 1 sentence",
          },
          biggest_struggle: {
            type: "string",
            description: "What feels most stuck/broken, 1 sentence",
          },
          previous_attempts: {
            type: "string",
            description: "What they've tried before to improve",
          },

          // Phase 4: Vision
          ninety_day_vision: {
            type: "string",
            description: "What they want to achieve in 90 days, 1-2 sentences",
          },
          primary_focus: {
            type: "string",
            description: "The ONE thing they'd focus on if they could only pick one",
          },
          habits_to_build: {
            type: "array",
            items: { type: "string" },
            description: "Habits they want to build",
          },
          habits_to_break: {
            type: "array",
            items: { type: "string" },
            description: "Habits they want to break",
          },
          coaching_style: {
            type: "string",
            enum: ["gentle", "balanced", "direct", "intense"],
            description: "Preferred coaching style",
          },
          commitment_level: {
            type: "string",
            enum: ["exploring", "ready", "committed", "all_in"],
            description: "How committed they are to change",
          },

          // Diagnostic scores (Aurora's assessment based on conversation)
          diagnostic_scores: {
            type: "object",
            properties: {
              energy_stability: { type: "number", description: "0-100 energy stability score" },
              recovery_debt: { type: "number", description: "0-100 recovery capacity (100=good)" },
              dopamine_load: { type: "number", description: "0-100 dopamine balance (100=healthy)" },
              direction_clarity: { type: "number", description: "0-100 how clear their life direction is" },
              stress_resilience: { type: "number", description: "0-100 stress management capacity" },
            },
          },

          // Summary
          aurora_summary: {
            type: "string",
            description: "Aurora's 3-5 sentence assessment of this person — who they are, where they're at, what they need. Written in their language.",
          },
          selected_pillar: {
            type: "string",
            enum: ["mind", "body", "career", "relationships", "finance", "purpose"],
            description: "Primary transformation pillar based on conversation",
          },
        },
        required: [
          "main_life_areas",
          "diagnostic_scores",
          "aurora_summary",
          "selected_pillar",
          "primary_focus",
          "ninety_day_vision",
          "commitment_level",
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
      ? "היי! אני אורורה 👋 אני כאן כדי להכיר אותך ולבנות לך תוכנית חיים מותאמת אישית ל-90 ימים הקרובים.\n\nבוא נתחיל — מה הביא אותך לכאן? מה אתה מחפש לשנות?"
      : "Hey! I'm Aurora 👋 I'm here to get to know you and build a personalized 90-day life plan.\n\nLet's start — what brought you here? What are you looking to change?";

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
