import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { aiChatCompletion } from "../_shared/aiGateway.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Always route through OpenRouter free model. The shared aiGateway helper
// auto-selects OpenRouter when OPENROUTER_API_KEY is set, and `:free` models
// are passed through untouched (see isOpenRouterOnly).
const BRAIN_MODEL = "nvidia/nemotron-nano-9b-v2:free";

const DECISION_TOOL = {
  type: "function",
  function: {
    name: "emit_decision",
    description:
      "Emit a single AION orchestration decision describing how the app should currently feel and behave for this user.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        mode: {
          type: "string",
          enum: ["flow", "focus", "recovery", "overwhelmed", "hypnosis", "calm", "neutral"],
          description: "The dominant environment AION should activate.",
        },
        tone: {
          type: "string",
          enum: ["grounded", "energizing", "gentle", "direct"],
        },
        density: {
          type: "string",
          enum: ["minimal", "standard", "rich"],
        },
        focus_target: {
          type: "object",
          additionalProperties: true,
          description:
            "What AION wants the user looking at. Example: { type:'mission', id:'...' } or { type:'none' }.",
        },
        suggestion: {
          type: "object",
          additionalProperties: true,
          description:
            "One actionable nudge. Example: { label:'Begin recovery', action:'open_hub', hub:'hypnosis' }.",
        },
        reasoning: {
          type: "string",
          description: "One sentence explaining the choice (for debugging only).",
        },
      },
      required: ["mode", "tone", "density", "focus_target", "suggestion", "reasoning"],
    },
  },
};

const SYSTEM_PROMPT = `You are AION's orchestration brain. You decide how the MindOS app should currently feel for ONE user.
You receive recent signals (route changes, AI messages, completed actions, time-of-day, idle gaps) and a snapshot of their current state (active mission, streak, energy, recent tone).
Output exactly ONE call to the emit_decision tool.
Rules:
- Prefer 'neutral' when signals are sparse.
- Use 'overwhelmed' if recent tone is anxious or many signals in a short burst.
- Use 'recovery' late at night, after low-energy signals, or after long idle.
- Use 'focus' when the user just completed actions or is mid-mission.
- Use 'hypnosis' only after explicit hypnosis-related signals.
- Density 'minimal' pairs with overwhelmed/recovery; 'rich' with flow/focus.
- focus_target.type ∈ ('mission','journal','hypnosis','none'). suggestion.action ∈ ('open_hub','start_session','breathe','none').
Be terse and decisive.`;

async function decideForUser(admin: any, userId: string, force: boolean) {
  // Debounce
  const { data: existing } = await admin
    .from("aion_decisions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!force && existing?.updated_at) {
    const ageMs = Date.now() - new Date(existing.updated_at).getTime();
    if (ageMs < 20_000) return { ...existing, debounced: true };
  }

  const { data: signals } = await admin
    .from("aion_signals")
    .select("kind, payload, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  const snapshot = {
    now: new Date().toISOString(),
    hour_local: new Date().getUTCHours(),
    signal_count_recent: signals?.length ?? 0,
    signals: (signals ?? []).map((s: any) => ({
      k: s.kind,
      p: s.payload,
      at: s.created_at,
    })),
    previous: existing
      ? { mode: existing.mode, tone: existing.tone, density: existing.density }
      : null,
  };

  function heuristicDecision() {
    const sigs = signals ?? [];
    const hour = new Date().getUTCHours();
    let mode: string = "neutral";
    let tone: string = "grounded";
    let density: string = "standard";
    // Tone signals from recent emotion/intent events
    const lastEmotion = sigs.find((s: any) => s.kind === "emotion.detected");
    const valence = lastEmotion?.payload?.valence ?? 0;
    const arousal = lastEmotion?.payload?.arousal ?? 0;
    const burst = sigs.filter((s: any) => Date.now() - new Date(s.created_at).getTime() < 5 * 60_000).length;
    if (burst >= 12 || (arousal > 0.7 && valence < 0)) {
      mode = "overwhelmed"; tone = "gentle"; density = "minimal";
    } else if (hour >= 22 || hour < 5) {
      mode = "recovery"; tone = "gentle"; density = "minimal";
    } else if (sigs.some((s: any) => s.kind === "action.completed")) {
      mode = "focus"; tone = "energizing"; density = "rich";
    } else if (valence > 0.4) {
      mode = "flow"; tone = "energizing"; density = "rich";
    }
    return {
      mode, tone, density,
      focus_target: { type: "none" },
      suggestion: { action: "none" },
      reasoning: `heuristic: hour=${hour} burst=${burst} valence=${valence} arousal=${arousal}`,
    };
  }

  async function persist(decision: any, source: "llm" | "heuristic") {
    const row = {
      user_id: userId,
      mode: decision.mode,
      tone: decision.tone,
      density: decision.density,
      focus_target: decision.focus_target ?? {},
      suggestion: decision.suggestion ?? {},
      reasoning: decision.reasoning ?? null,
      signals_snapshot: snapshot,
      source,
      expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { data: upserted, error } = await admin
      .from("aion_decisions")
      .upsert(row, { onConflict: "user_id" })
      .select()
      .single();
    if (error) throw error;
    return upserted;
  }

  const aiResp = await aiChatCompletion({
    model: BRAIN_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify(snapshot) },
    ],
    tools: [DECISION_TOOL],
    tool_choice: { type: "function", function: { name: "emit_decision" } },
  });

  if (!aiResp.ok) {
    const bodyText = await aiResp.text().catch(() => "");
    console.warn(`[aion-brain] gateway ${aiResp.status}: ${bodyText.slice(0, 300)} — falling back to heuristic`);
    return await persist(heuristicDecision(), "heuristic");
  }

  const aiJson = await aiResp.json();
  const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) {
    const msg = aiJson.choices?.[0]?.message;
    console.warn(`[aion-brain] no tool_call returned, message=${JSON.stringify(msg)?.slice(0, 300)} — falling back to heuristic`);
    return await persist(heuristicDecision(), "heuristic");
  }
  let decision: any;
  try {
    decision = JSON.parse(toolCall.function.arguments);
  } catch (e) {
    console.warn(`[aion-brain] tool_call args parse failed — falling back to heuristic`, e);
    return await persist(heuristicDecision(), "heuristic");
  }
  return await persist(decision, "llm");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    const body = await req.json().catch(() => ({}));
    const force = !!body.force;

    // Cron mode: { batch: true, minutes?: number }
    if (body.batch === true) {
      const minutes = body.minutes ?? 30;
      const { data: users } = await admin.rpc("aion_recent_active_users", {
        p_minutes: minutes,
      });
      const ids: string[] = (users ?? []).map((u: any) => u.user_id);
      const results = await Promise.allSettled(
        ids.map((id) => decideForUser(admin, id, true)),
      );
      return new Response(
        JSON.stringify({
          processed: results.length,
          ok: results.filter((r) => r.status === "fulfilled").length,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // User-mode: requires JWT
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const decision = await decideForUser(admin, userData.user.id, force);
    return new Response(JSON.stringify({ decision }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("aion-brain error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});