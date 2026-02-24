import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, isCorsPreFlight, handleCorsPreFlight } from "../_shared/cors.ts";
import { fetchWithTimeout } from "../_shared/fetchWithRetry.ts";

/**
 * generate-execution-steps
 * 
 * Generates detailed, AI-powered execution steps for a given task.
 * Uses tool calling to extract structured JSON output.
 * 
 * Input: { title, pillar, execution_template, action_type, duration_min, language }
 * Output: { steps: [{label, detail, durationSec}], tts_script?: string[] }
 */

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

function buildSystemPrompt(template: string, language: string): string {
  const lang = language === "he" ? "Hebrew" : "English";
  
  const baseRules = `You are Aurora — the user's BRAIN and personal operating system. You DO NOT ask the user to think, decide, analyze, reflect, brainstorm, or journal open-ended questions. You have already done the thinking FOR THEM based on their life data.

ABSOLUTE RULES:
- NEVER use phrases like "think about", "consider", "reflect on", "ask yourself", "decide what", "analyze your", "write down your thoughts", "journal about"
- NEVER give vague/philosophical instructions. NO introspection tasks.
- Every step must be a CONCRETE PHYSICAL ACTION the user performs with their body: move, say, type, open, click, watch, read, eat, drink, stretch, breathe, walk, call, send
- If the task sounds abstract (e.g. "define personal values", "identify patterns"), convert it into a CONCRETE RITUAL: watch a specific video, follow a guided exercise, do a physical sorting activity, or complete a fill-in-the-blank template
- Include EXACT quantities: grams, ml, minutes, reps, sets, meters, pages
- Include EXACT techniques with names: "box breathing 4-4-4-4", "push-ups with diamond grip", "cold exposure 30 seconds"
- For combat/martial arts: name REAL techniques (jab-cross-hook, single leg takedown, guard pass, armbar from mount)
- For consciousness/identity tasks: convert to card-sorting exercises, rated scales (1-10), or "pick from these 5 options" formats — NEVER open-ended writing
- Respond in ${lang}.`;

  const templateRules: Record<string, string> = {
    sets_reps_timer: `
FORMAT: Generate 3-6 exercise steps. Each step is one exercise round.
Name REAL exercises with proper form cues.
Example: "Diamond Push-ups — 3×12 (hands together, elbows tight, chest to floor)"
Example combat: "Round 1: Jab-Cross-Hook combo × 10 reps each side, then 8 sprawls"
Example grappling: "Drill: Hip escape (shrimp) left-right × 10 each side, then stand-up from guard × 5"
The durationSec should reflect actual time including rest (30-90s between sets).
NEVER say "warm up" without specifying exact movements.`,
    
    tts_guided: `
FORMAT: Generate 8-15 guided narration lines for a voice session.
Each step.label is the EXACT narration text (1-2 sentences).
Also generate a tts_script array with the full narration.
Be SPECIFIC and SENSORY — guide exact body parts, breathing patterns, imagery.
Example meditation: "Focus on the weight of your hands on your thighs. Feel the warmth spreading from your palms into your legs."
Example breathwork: "Breathe in through your nose for 4 counts... hold for 7... now exhale slowly through your mouth for 8 counts."
Example body scan: "Bring your attention to your right shoulder. Notice any tension there. Now imagine warm water flowing over that shoulder, melting the tightness."
NEVER say "clear your mind" or "relax" without specific physical instructions.`,
    
    step_by_step: `
FORMAT: Generate 4-7 concrete sequential steps.
Every step starts with a PHYSICAL ACTION VERB: open, fill, pour, apply, set, type, send, read, walk, eat, drink.
For nutrition: "Eat 2 eggs + 1 avocado + handful of spinach" NOT "prepare a healthy breakfast"
For skincare: "Apply sunscreen SPF50 — two finger-lengths on face, one on neck" NOT "apply sun protection"
For hydration: "Fill 750ml bottle now. Drink 250ml immediately. Set phone alarm for 90 minutes." NOT "track your water intake"
For identity/values/consciousness tasks: "Open notes app. From this list pick your top 3: [courage, freedom, mastery, connection, growth, creativity, security, adventure, wisdom, impact]. Done." NOT "reflect on what matters to you"
For sleep: "Set bedroom AC to 19°C. Put phone in another room. Apply 2mg melatonin under tongue." NOT "create a relaxing environment"
NEVER include steps like "reflect", "journal freely", or "think about your goals".`,
    
    timer_focus: `
FORMAT: Generate 3-5 steps for a focused work session.
Step 1: ONE specific micro-task to complete first (e.g. "Open [project], find the [specific thing], fix/write/send it")
Step 2: "Put phone face-down in another room. Close all browser tabs except the work tab."
Step 3-4: Work blocks with exact technique: "25 min work → 5 min stand and stretch (neck rolls × 10, arm circles × 10)"
Final: "Write 1 sentence: what you completed. Send it to yourself on WhatsApp."
NEVER say "set an intention" or "reflect on your goals". Just tell them WHAT to work on based on the task title.`,
    
    social_checklist: `
FORMAT: Generate 4-6 steps with EXACT scripts and actions.
Include word-for-word conversation openers: "Send this message: 'Hey [name], I was thinking about [topic]. Want to grab coffee this week?'"
For networking: "Open LinkedIn. Find 3 people in [field]. Send each: 'Hi [name], I saw your post about [X]. I'm working on something similar — would love to hear your approach.'"
For relationships: "Call [person]. Say: 'I wanted to check in — how's [specific thing] going?'. Listen for 3 minutes before responding."
For influence: "Open Instagram. Post a 60-second story about [specific topic from task]. Use these 3 hashtags: #X #Y #Z"
NEVER say "think about who to contact" or "consider your network".`,

    video_embed: `
FORMAT: Generate 3-5 companion action steps for a video-guided session.
Step 1: Specific warm-up movements (name them: "arm circles × 10, hip rotations × 10 each direction")
Step 2-3: Key focus points DURING the video ("In the first 5 min, mirror the instructor's stance width exactly")
Step 4: Specific cool-down or drill to do AFTER ("Hold each stretch 30 seconds: hamstring, quad, hip flexor, each side")
NEVER say "follow along" without specific physical cues.`,
  };

  return `${baseRules}\n${templateRules[template] || templateRules.step_by_step}`;
}

function buildToolSchema(template: string) {
  const stepProperties: Record<string, unknown> = {
    label: { type: "string", description: "Short action label (1-8 words)" },
    detail: { type: "string", description: "Additional detail or tip (1-2 sentences)" },
    durationSec: { type: "number", description: "Duration in seconds for this step" },
  };

  const properties: Record<string, unknown> = {
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: stepProperties,
        required: ["label", "durationSec"],
        additionalProperties: false,
      },
    },
  };

  if (template === "tts_guided") {
    properties.tts_script = {
      type: "array",
      items: { type: "string" },
      description: "Array of narration lines for TTS playback",
    };
  }

  return {
    type: "function" as const,
    function: {
      name: "generate_steps",
      description: "Generate detailed execution steps for the task",
      parameters: {
        type: "object",
        properties,
        required: template === "tts_guided" ? ["steps", "tts_script"] : ["steps"],
        additionalProperties: false,
      },
    },
  };
}

serve(async (req) => {
  if (isCorsPreFlight(req)) return handleCorsPreFlight();

  try {
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const { title, pillar, execution_template, action_type, duration_min, language } = await req.json();

    if (!title || !execution_template) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lang = language || "he";
    const systemPrompt = buildSystemPrompt(execution_template, lang);
    const userPrompt = `Task: "${title}"
Pillar: ${pillar || "general"}
Action type: ${action_type || "general"}
Template: ${execution_template}
Total duration: ${duration_min || 15} minutes
Language: ${lang === "he" ? "Hebrew" : "English"}

CRITICAL: You are the user's brain — they should NOT think, decide, or analyze anything. Every step must be a concrete physical action they perform with their body. If this task sounds abstract or introspective (like "define values", "identify patterns", "explore beliefs"), CONVERT it into a hands-on activity: a sorting exercise, a fill-in-the-blank, a rated scale, or a specific video/article to consume. NEVER generate steps that say "think about", "reflect on", "journal freely", or "consider". The total step durations should roughly match the total duration.`;

    const tool = buildToolSchema(execution_template);

    const response = await fetchWithTimeout(AI_GATEWAY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "generate_steps" } },
      }),
    }, 15_000);

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    
    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "Invalid AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result;
    try {
      result = JSON.parse(toolCall.function.arguments);
    } catch (parseErr) {
      console.error("Failed to parse tool arguments:", toolCall.function.arguments);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate steps exist
    if (!result.steps || !Array.isArray(result.steps) || result.steps.length === 0) {
      return new Response(JSON.stringify({ error: "No steps generated" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("generate-execution-steps error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
