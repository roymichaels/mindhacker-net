import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a consciousness diagnostic engine embedded in a personal development platform called MindOS.
Your job is to have a SHORT, SHARP, ADAPTIVE conversation (6-10 messages from you, total) that uncovers 6 subsystems:

1. Soul-Intent Clarity (בהירות כוונה) — Does the user know what they truly want?
2. Mask Awareness (מודעות למסכות) — What roles/characters do they play to be accepted?
3. Frequency Stability (יציבות רגשית) — How volatile is their emotional baseline?
4. Alignment Integrity (התאמה לערכים) — Gap between values and actions?
5. Inner Signal Access (קול פנימי) — Can they hear/trust their intuition?
6. Field Coherence (חיבור גוף-ראש) — Body-mind connection quality?

RULES:
- Ask ONE question at a time. Make it direct, personal, uncomfortable (but not clinical).
- NEVER use therapy language. No "how does that make you feel". Be real. Be sharp.
- Adapt based on answers — if someone reveals something deep, go deeper there.
- Use the user's language (Hebrew or English) — match their language.
- After gathering enough signal (usually 6-10 exchanges), call the extract_consciousness_profile tool.
- Don't announce you're analyzing. Just do it naturally.
- Keep messages SHORT. 1-3 sentences max per message.
- You can challenge the user. "Really?" / "Are you sure?" / "That sounds like a mask to me."
- Never give advice during assessment. Just probe.

STYLE:
- Direct, no fluff, no filler
- Like a sharp mentor who sees through you
- Occasional provocation is good
- Match the energy — if they're short, be short. If they open up, go deeper.

START with something like: "Tell me in one sentence — what do you actually want from life?" (in their language)
Then adapt from there.`;

const EXTRACT_TOOL = {
  type: "function",
  function: {
    name: "extract_consciousness_profile",
    description:
      "Extract the consciousness assessment results from the conversation. Call this when you have enough signal from the user (after 6-10 exchanges).",
    parameters: {
      type: "object",
      properties: {
        subscores: {
          type: "object",
          properties: {
            soul_intent_clarity: {
              type: "number",
              description: "0-100. How clear is their life direction/mission?",
            },
            mask_awareness: {
              type: "number",
              description:
                "0-100. How aware are they of the masks/roles they play?",
            },
            frequency_stability: {
              type: "number",
              description: "0-100. How emotionally stable/grounded are they?",
            },
            alignment_integrity: {
              type: "number",
              description:
                "0-100. How aligned are their actions with their values?",
            },
            inner_signal_access: {
              type: "number",
              description:
                "0-100. Can they hear and trust their inner voice/intuition?",
            },
            field_coherence: {
              type: "number",
              description:
                "0-100. Body-mind connection quality — stress response, sleep, physical state.",
            },
          },
          required: [
            "soul_intent_clarity",
            "mask_awareness",
            "frequency_stability",
            "alignment_integrity",
            "inner_signal_access",
            "field_coherence",
          ],
        },
        findings: {
          type: "array",
          description: "3-6 key findings. Be specific, not generic.",
          items: {
            type: "object",
            properties: {
              id: { type: "string", description: "Short snake_case id" },
              text_he: {
                type: "string",
                description:
                  "Finding in Hebrew. Direct, everyday language. Example: 'אתה יודע מה אתה רוצה אבל לא עושה בהתאם'",
              },
              text_en: {
                type: "string",
                description:
                  "Finding in English. Direct language. Example: 'You know what you want but you're not acting on it'",
              },
              severity: {
                type: "string",
                enum: ["low", "med", "high"],
              },
              subsystem: {
                type: "string",
                enum: [
                  "soul_intent_clarity",
                  "mask_awareness",
                  "frequency_stability",
                  "alignment_integrity",
                  "inner_signal_access",
                  "field_coherence",
                ],
              },
            },
            required: ["id", "text_he", "text_en", "severity", "subsystem"],
          },
        },
        mirror_statement: {
          type: "object",
          description:
            "A 2-3 sentence 'mirror' — reflecting back who this person really is beneath the masks. Powerful, direct.",
          properties: {
            he: { type: "string" },
            en: { type: "string" },
          },
          required: ["he", "en"],
        },
        one_next_step: {
          type: "object",
          description:
            "ONE concrete thing they should do in the next 24 hours. Not a plan. Just one action.",
          properties: {
            he: { type: "string" },
            en: { type: "string" },
          },
          required: ["he", "en"],
        },
        confidence: {
          type: "string",
          enum: ["low", "med", "high"],
          description:
            "How confident are you in this assessment? Based on depth of conversation.",
        },
      },
      required: [
        "subscores",
        "findings",
        "mirror_statement",
        "one_next_step",
        "confidence",
      ],
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { messages, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemContent = `${SYSTEM_PROMPT}\n\nUser's preferred language: ${language === "he" ? "Hebrew" : "English"}. Always respond in that language.`;

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
          messages: [
            { role: "system", content: systemContent },
            ...messages,
          ],
          tools: [EXTRACT_TOOL],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      const t = await response.text();
      console.error("AI gateway error:", status, t);

      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Try again in a moment." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "Credits exhausted." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("consciousness-assess error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
