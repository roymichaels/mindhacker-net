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
  
  const baseRules = `You are an expert life-coach and task-planning AI. Generate SPECIFIC, ACTIONABLE execution steps for the given task. Every step must be concrete — no generic "prepare/execute/close" patterns. Include real quantities, durations, techniques, and tips. Respond in ${lang}.`;

  const templateRules: Record<string, string> = {
    sets_reps_timer: `
FORMAT: Generate 3-6 exercise steps. Each step is one exercise/round.
Include specific exercises with sets, reps, and rest periods.
Example step: "Push-ups — 3 sets × 15 reps (rest 45s between sets)"
The durationSec should reflect actual time needed including rest.
For combat/shadowboxing: each step is a round with specific combos.`,
    
    tts_guided: `
FORMAT: Generate 8-15 guided script lines for a voice-guided session.
Each step.label is what the narrator says (1-2 sentences).
step.detail is an internal note (optional).
Also generate a tts_script array with the exact narration text.
For meditation: progressive relaxation, body awareness, breath cues.
For breathwork: specific patterns (4-7-8, box breathing, etc).
For visualization: vivid imagery, sensory details, empowering affirmations.
Make it personal and immersive — like a private session with a master coach.`,
    
    step_by_step: `
FORMAT: Generate 4-7 specific sequential steps.
Each step has a clear action verb, specific quantities/details, and realistic duration.
For nutrition: specific foods, portions, preparation methods.
For skincare: product types, application techniques, wait times.
For hydration: exact ml amounts, timing, tracking methods.
For journaling: specific prompts, writing techniques, reflection questions.
For sleep: exact protocols, temperatures, timing.`,
    
    timer_focus: `
FORMAT: Generate 3-5 steps framing a focused work session.
Step 1: Specific intention-setting (what exactly to accomplish).
Step 2: Environment setup (specific distractions to remove).
Step 3-4: The main work block(s) with specific technique (Pomodoro, time-boxing, etc).
Final step: Review/summary with specific reflection questions.
Make the intention step very specific to the task title.`,
    
    social_checklist: `
FORMAT: Generate 4-6 steps for social/relationship tasks.
Include specific conversation starters, body language tips, and follow-up actions.
For networking: specific outreach templates, ice-breakers.
For relationships: specific quality-time activities, conversation prompts.
For influence/content: specific platforms, formats, posting strategies.
Each step should be immediately actionable.`,

    video_embed: `
FORMAT: Generate 3-5 companion steps for a video-guided session.
Steps describe what to focus on during the video practice.
Include warm-up, main practice cues, and cool-down.`,
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

Generate specific, detailed execution steps for this task. Be concrete — use real numbers, techniques, and actionable instructions. The total step durations should roughly match the total duration.`;

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
