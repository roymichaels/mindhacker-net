/**
 * AION Phase 1 — server-side turn tracer.
 *
 * Observation-only. Used by aurora-chat, memory-writer, aion-capabilities,
 * aion-brain. Reads `traceId` from `X-Aion-Trace-Id` request header (or any
 * value the caller passes). Inserts into `aion_turn_traces` (header) and
 * `aion_turn_trace_events` (timeline). Never throws, never blocks, fully
 * fire-and-forget. No-op when both `traceId` and `AION_TRACE` env are absent.
 */
// deno-lint-ignore-file no-explicit-any
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

let _admin: SupabaseClient | null = null;
function admin(): SupabaseClient {
  if (_admin) return _admin;
  _admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
  return _admin;
}

export interface TurnTracer {
  enabled: boolean;
  traceId: string | null;
  event: (stage: string, data?: Record<string, unknown>) => void;
  upsertHeader: (patch: Record<string, unknown>) => void;
  end: (patch?: Record<string, unknown>) => void;
}

const NOOP: TurnTracer = {
  enabled: false,
  traceId: null,
  event: () => {},
  upsertHeader: () => {},
  end: () => {},
};

export function getTraceIdFromRequest(req: Request): string | null {
  return req.headers.get("x-aion-trace-id") ?? req.headers.get("X-Aion-Trace-Id") ?? null;
}

export function startServerTrace(opts: {
  traceId: string | null;
  userId: string | null;
  source: string;
}): TurnTracer {
  const envOn = (Deno.env.get("AION_TRACE") || "").trim() === "1";
  if (!opts.traceId || !opts.userId) return NOOP;
  if (!envOn) return NOOP; // explicit env gate

  const sb = admin();
  const traceId = opts.traceId;
  const userId = opts.userId;
  const source = opts.source;

  return {
    enabled: true,
    traceId,
    event(stage, data) {
      void (async () => {
        try {
          await sb.from("aion_turn_trace_events").insert({
            trace_id: traceId,
            user_id: userId,
            source,
            stage,
            data: (data ?? {}) as never,
          });
        } catch { /* swallow */ }
      })();
    },
    upsertHeader(patch) {
      void (async () => {
        try {
          // Upsert by trace_id; add user_id on first insert.
          await sb.from("aion_turn_traces").upsert(
            { trace_id: traceId, user_id: userId, ...patch } as never,
            { onConflict: "trace_id" },
          );
        } catch { /* swallow */ }
      })();
    },
    end(patch) {
      void (async () => {
        try {
          await sb.from("aion_turn_traces").update({
            ended_at: new Date().toISOString(),
            status: "ok",
            ...(patch ?? {}),
          } as never).eq("trace_id", traceId);
        } catch { /* swallow */ }
      })();
    },
  };
}
