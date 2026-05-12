/**
 * AION Orchestrator — single dispatch endpoint for AION's AI micro-skills.
 *
 * POST { kind, payload } -> { ok, result, duration_ms, model }
 * Each call is a small typed JSON tool-call (see _shared/skillRegistry.ts).
 * Result is also written into aion_signals so the brain can see it.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callSkill } from "../_shared/aiSkill.ts";
import { SKILLS } from "../_shared/skillRegistry.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// In-memory per-user rate limit (best-effort; resets on cold start).
const RATE: Map<string, number[]> = new Map();
const LIMIT_PER_MIN = 30;

function rateLimit(userId: string): boolean {
  const now = Date.now();
  const arr = (RATE.get(userId) ?? []).filter((t) => now - t < 60_000);
  arr.push(now);
  RATE.set(userId, arr);
  return arr.length <= LIMIT_PER_MIN;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    if (!rateLimit(userId)) {
      return new Response(JSON.stringify({ ok: false, error: "rate_limited" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const kind: string = body?.kind;
    const payload = body?.payload ?? {};
    const skill = SKILLS[kind];
    if (!skill) {
      return new Response(JSON.stringify({ ok: false, error: `unknown_kind:${kind}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const out = await callSkill({
      system: skill.system,
      user: skill.buildUser(payload),
      schema: skill.schema,
    });

    // Fire-and-forget: write the skill outcome into aion_signals so the brain sees it.
    admin
      .from("aion_signals")
      .insert({
        user_id: userId,
        kind: skill.signalKind,
        payload: {
          ok: out.ok,
          result: out.result ?? null,
          error: out.error ?? null,
          duration_ms: out.duration_ms,
          model: out.model,
          input_summary: typeof payload === "object" ? Object.keys(payload).slice(0, 6) : null,
        } as never,
        client_at: new Date().toISOString(),
      })
      .then(({ error }) => {
        if (error) console.warn("[orchestrator] signal insert failed", error.message);
      });

    console.log(
      `[orchestrator] kind=${kind} ok=${out.ok} duration_ms=${out.duration_ms} model=${out.model}`,
    );

    return new Response(JSON.stringify(out), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[orchestrator] error", e);
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});