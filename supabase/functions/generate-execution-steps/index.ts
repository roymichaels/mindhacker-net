/**
 * generate-execution-steps — Aurora Brain-Connected Execution Engine
 * 
 * Fully integrated with Aurora's shared contextBuilder and memory systems.
 * Uses user profile, identity, energy patterns, projects, plan milestones,
 * and behavioral patterns to generate hyper-personalized execution steps.
 * 
 * Input: { title, pillar, execution_template, action_type, duration_min, language, userId }
 * Output: { steps: [{label, detail, durationSec}], tts_script?: string[] }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, isCorsPreFlight, handleCorsPreFlight } from "../_shared/cors.ts";
import { fetchWithTimeout } from "../_shared/fetchWithRetry.ts";
import { buildContext, type AuroraContext } from "../_shared/contextBuilder.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

// ─── Context → Compact User Summary for Execution ─────────

function buildUserContextBlock(ctx: AuroraContext, language: string): string {
  const isHe = language === "he";
  const parts: string[] = [];

  // Profile
  const genderNote = isHe
    ? (ctx.profile.gender === "male" ? "זכר" : ctx.profile.gender === "female" ? "נקבה" : "")
    : "";
  parts.push(`USER: ${ctx.profile.full_name}${genderNote ? ` (${genderNote})` : ""}, tone: ${ctx.profile.preferred_tone}, intensity: ${ctx.profile.challenge_intensity}`);

  // Identity
  if (ctx.identity.values.length > 0) {
    parts.push(`VALUES: ${ctx.identity.values.slice(0, 5).join(", ")}`);
  }

  // Direction
  if (ctx.direction?.content) {
    parts.push(`LIFE DIRECTION: ${ctx.direction.content.slice(0, 200)}`);
  }

  // Energy patterns
  if (ctx.energy_patterns.length > 0) {
    parts.push(`ENERGY PATTERNS: ${ctx.energy_patterns.map(e => e.description).slice(0, 3).join("; ")}`);
  }

  // Behavioral patterns & risks
  if (ctx.behavioral_risks.length > 0) {
    parts.push(`BEHAVIORAL RISKS: ${ctx.behavioral_risks.map(r => `${r.risk} (${r.severity})`).slice(0, 3).join("; ")}`);
  }

  // Active projects (so AI can reference real project names)
  if (ctx.projects.length > 0) {
    parts.push(`ACTIVE PROJECTS: ${ctx.projects.map(p => `"${p.name}" (${p.category || "general"}, ${p.progress}%)`).slice(0, 5).join(", ")}`);
  }

  // Focus
  if (ctx.focus) {
    parts.push(`CURRENT FOCUS: ${ctx.focus.title} (${ctx.focus.duration_days} days)`);
  }

  // Commitments
  if (ctx.commitments.length > 0) {
    parts.push(`COMMITMENTS: ${ctx.commitments.slice(0, 4).join(", ")}`);
  }

  // Visions
  if (ctx.visions.length > 0) {
    parts.push(`VISIONS: ${ctx.visions.map(v => `${v.timeframe}: ${v.title}`).slice(0, 3).join("; ")}`);
  }

  // Plan progress
  if (ctx.life_plan) {
    parts.push(`100-DAY PLAN: Week ${ctx.life_plan.current_week}/${ctx.life_plan.total_weeks} (started ${ctx.life_plan.start_date})`);
  }

  // Pulse (energy/mood today)
  if (ctx.pulse_today) {
    parts.push(`TODAY PULSE: energy=${ctx.pulse_today.energy}/5, mood=${ctx.pulse_today.mood}, sleep=${ctx.pulse_today.sleep}`);
  }

  // Daily minimums
  if (ctx.daily_minimums.length > 0) {
    parts.push(`DAILY MINIMUMS: ${ctx.daily_minimums.slice(0, 5).join(", ")}`);
  }

  // Launchpad summary
  if (ctx.launchpad_summary?.summary) {
    parts.push(`TRANSFORMATION SUMMARY: ${ctx.launchpad_summary.summary.slice(0, 300)}`);
  }

  // Conversation memory
  if (ctx.conversation_memories.length > 0) {
    const recentMem = ctx.conversation_memories[0];
    parts.push(`LATEST MEMORY: ${recentMem.date} — ${recentMem.summary.slice(0, 200)}`);
  }

  return parts.join("\n");
}

// ─── System Prompt Builder ─────────────────────────────────

function buildSystemPrompt(template: string, language: string, userContext: string): string {
  const lang = language === "he" ? "Hebrew" : "English";
  
  const baseRules = `You are Aurora — the user's BRAIN and personal operating system. You know EVERYTHING about this user from their profile, assessments, projects, and history. You DO NOT ask the user to think, decide, analyze, reflect, brainstorm, or journal open-ended questions. You have already done the thinking FOR THEM.

## USER CONTEXT (use this to personalize every step):
${userContext}

## ABSOLUTE RULES:
- NEVER use phrases like "think about", "consider", "reflect on", "ask yourself", "decide what", "analyze your", "write down your thoughts", "journal about"
- NEVER give vague/philosophical instructions. NO introspection tasks.
- Every step must be a CONCRETE PHYSICAL ACTION the user performs with their body: move, say, type, open, click, watch, read, eat, drink, stretch, breathe, walk, call, send
- If the task sounds abstract (e.g. "define personal values", "set style"), YOU ALREADY KNOW the user's values/identity/projects — reference them BY NAME and give concrete actions based on what you know
- Include EXACT quantities: grams, ml, minutes, reps, sets, meters, pages
- Include EXACT techniques with names: "box breathing 4-4-4-4", "push-ups with diamond grip", "cold exposure 30 seconds"
- For combat/martial arts: name REAL techniques (jab-cross-hook, single leg takedown, guard pass, armbar from mount)
- For consciousness/identity tasks: since you KNOW the user's values and identity, reference them directly. Use card-sorting, rated scales (1-10), or "pick from these specific options" formats — NEVER open-ended writing
- For business/project tasks: reference the user's ACTUAL project names and progress percentages
- Adapt intensity based on user's energy level, behavioral risks, and challenge_intensity preference
- Respond in ${lang}.`;

  const templateRules: Record<string, string> = {
    sets_reps_timer: `
FORMAT: Generate 3-6 exercise steps. Each step is one exercise round.
Name REAL exercises with proper form cues.
Adapt difficulty to user's energy level and challenge intensity.
Example: "Diamond Push-ups — 3×12 (hands together, elbows tight, chest to floor)"
Example combat: "Round 1: Jab-Cross-Hook combo × 10 reps each side, then 8 sprawls"
The durationSec should reflect actual time including rest (30-90s between sets).
NEVER say "warm up" without specifying exact movements.`,
    
    tts_guided: `
FORMAT: Generate 8-15 guided narration lines for a voice session.
Each step.label is the EXACT narration text (1-2 sentences).
Also generate a tts_script array with the full narration.
Be SPECIFIC and SENSORY — guide exact body parts, breathing patterns, imagery.
If the user has energy patterns or behavioral risks, address them directly in the script.
Use the user's name for personal connection.
Example breathwork: "Breathe in through your nose for 4 counts... hold for 7... now exhale slowly through your mouth for 8 counts."
NEVER say "clear your mind" or "relax" without specific physical instructions.`,
    
    step_by_step: `
FORMAT: Generate 4-7 concrete sequential steps.
Every step starts with a PHYSICAL ACTION VERB: open, fill, pour, apply, set, type, send, read, walk, eat, drink.
For nutrition: "Eat 2 eggs + 1 avocado + handful of spinach" NOT "prepare a healthy breakfast"
For hydration: "Fill 750ml bottle now. Drink 250ml immediately. Set phone alarm for 90 minutes." NOT "track your water intake"
For identity/values/consciousness tasks: You KNOW their values (${userContext.includes("VALUES:") ? "see above" : "ask Aurora"}). Reference them directly and give actions based on them.
For business tasks: Reference their ACTUAL project names from the context above.
NEVER include steps like "reflect", "journal freely", or "think about your goals".`,
    
    timer_focus: `
FORMAT: Generate 3-5 steps for a focused work session.
Step 1: ONE specific micro-task referencing the user's ACTUAL project or business (from context above)
Step 2: "Put phone face-down in another room. Close all browser tabs except the work tab."
Step 3-4: Work blocks with exact technique: "25 min work → 5 min stand and stretch (neck rolls × 10, arm circles × 10)"
Final: "Write 1 sentence: what you completed. Send it to yourself on WhatsApp."
NEVER say "set an intention" or "reflect on your goals". Reference REAL project names.`,
    
    social_checklist: `
FORMAT: Generate 4-6 steps with EXACT scripts and actions.
Include word-for-word conversation openers.
For networking: "Open LinkedIn. Find 3 people in [field]. Send each: 'Hi [name], I saw your post about [X].'"
For relationships: "Call [person]. Say: 'I wanted to check in — how's [specific thing] going?'"
NEVER say "think about who to contact" or "consider your network".`,

    video_embed: `
FORMAT: Generate 3-5 companion action steps for a video-guided session.
Step 1: Specific warm-up movements (name them: "arm circles × 10, hip rotations × 10 each direction")
Step 2-3: Key focus points DURING the video
Step 4: Specific cool-down or drill to do AFTER ("Hold each stretch 30 seconds: hamstring, quad, hip flexor, each side")
Adapt to user's energy level and intensity preference.
NEVER say "follow along" without specific physical cues.`,
  };

  return `${baseRules}\n${templateRules[template] || templateRules.step_by_step}`;
}

// ─── Tool Schema ───────────────────────────────────────────

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

// ─── Main Handler ──────────────────────────────────────────

serve(async (req) => {
  if (isCorsPreFlight(req)) return handleCorsPreFlight();

  try {
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const { title, pillar, execution_template, action_type, duration_min, language, userId } = await req.json();

    if (!title || !execution_template) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lang = language || "he";

    // ── Build Aurora context (same brain as chat) ──────────
    let userContext = "";
    if (userId) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );
        const ctx = await buildContext(supabase, userId, lang);
        userContext = buildUserContextBlock(ctx, lang);
        console.log(`Execution steps — User: ${userId}, Context hash: ${ctx.context_hash.slice(0, 8)}`);
      } catch (ctxErr) {
        console.warn("Context build failed, proceeding without user data:", ctxErr);
      }
    }

    const systemPrompt = buildSystemPrompt(execution_template, lang, userContext);
    const userPrompt = `Task: "${title}"
Pillar: ${pillar || "general"}
Action type: ${action_type || "general"}
Template: ${execution_template}
Total duration: ${duration_min || 15} minutes
Language: ${lang === "he" ? "Hebrew" : "English"}

CRITICAL: You are the user's brain — they should NOT think, decide, or analyze anything. Every step must be a concrete physical action they perform with their body. You have FULL context about this user above — use their real project names, values, energy patterns, and current plan week to make every step hyper-specific. The total step durations should roughly match the total duration.`;

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
    }, 90_000);

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
