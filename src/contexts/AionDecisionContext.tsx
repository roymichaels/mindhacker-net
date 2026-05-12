import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { recordSignal, type AionSignalKind } from "@/services/aionSignals";
import { diagnosticsBus } from "@/diagnostics/diagnosticsBus";

export interface AionDecision {
  user_id: string;
  mode: "flow" | "focus" | "recovery" | "overwhelmed" | "hypnosis" | "calm" | "neutral";
  tone: "grounded" | "energizing" | "gentle" | "direct";
  density: "minimal" | "standard" | "rich";
  focus_target: Record<string, unknown>;
  suggestion: Record<string, unknown>;
  reasoning: string | null;
  expires_at: string | null;
  updated_at: string;
}

interface AionDecisionCtx {
  decision: AionDecision | null;
  /** Wall-clock ms when brain finished its last run (success or error). null = never run this session. */
  lastBrainRunAt: number | null;
  /** True when the brain has no live decision and we're operating on fast-tier rules. */
  isFallback: boolean;
  refresh: () => Promise<void>;
  signal: (kind: AionSignalKind, payload?: Record<string, unknown>) => Promise<void>;
  /** Activity heartbeat — call on user interaction. Triggers a refresh if the brain is stale. */
  pulse: (kind?: AionSignalKind) => void;
}

const Ctx = createContext<AionDecisionCtx>({
  decision: null,
  lastBrainRunAt: null,
  isFallback: true,
  refresh: async () => {},
  signal: async () => {},
  pulse: () => {},
});

export function AionDecisionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [decision, setDecision] = useState<AionDecision | null>(null);
  const [lastBrainRunAt, setLastBrainRunAt] = useState<number | null>(null);
  const debounceRef = useRef<number | null>(null);
  const inFlightRef = useRef<boolean>(false);
  const lastPulseAtRef = useRef<number>(0);

  // Initial fetch
  useEffect(() => {
    if (!user?.id) {
      setDecision(null);
      return;
    }
    let cancelled = false;
    supabase
      .from("aion_decisions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) setDecision(data as unknown as AionDecision);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`aion_decisions:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "aion_decisions", filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.new) setDecision(payload.new as unknown as AionDecision);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const runBrain = useCallback(async (trigger: string, body: Record<string, unknown> = {}) => {
    if (!user?.id) return;
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    const startedAt = Date.now();
    try {
      diagnosticsBus.emit("brain-run", { at: startedAt, trigger, status: "started" });
    } catch { /* never block */ }
    try {
      const { error } = await supabase.functions.invoke("aion-brain", { body });
      const finishedAt = Date.now();
      setLastBrainRunAt(finishedAt);
      try {
        diagnosticsBus.emit("brain-run", {
          at: finishedAt,
          trigger,
          status: error ? "error" : "ok",
          durationMs: finishedAt - startedAt,
          error: error ? String((error as any)?.message ?? error) : undefined,
        });
      } catch { /* never block */ }
      if (error) console.warn("[aion] brain refresh error", error);
    } catch (e) {
      const finishedAt = Date.now();
      setLastBrainRunAt(finishedAt);
      try {
        diagnosticsBus.emit("brain-run", {
          at: finishedAt,
          trigger,
          status: "error",
          durationMs: finishedAt - startedAt,
          error: String((e as any)?.message ?? e),
        });
      } catch { /* never block */ }
      console.warn("[aion] refresh failed", e);
    } finally {
      inFlightRef.current = false;
    }
  }, [user?.id]);

  const refresh = useCallback(async () => {
    await runBrain("manual", { force: true });
  }, [runBrain]);

  const signal = useCallback(
    async (kind: AionSignalKind, payload: Record<string, unknown> = {}) => {
      await recordSignal(kind, payload);
      // Debounced brain refresh after each signal burst
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        void runBrain(kind, { trigger: kind });
      }, 4000);
    },
    [runBrain],
  );

  // ── Heartbeat: auto-refresh expired/missing decision while user is active ──
  const isExpired = useMemo(() => {
    if (!decision) return true;
    if (!decision.expires_at) return false;
    return Date.parse(decision.expires_at) <= Date.now();
  }, [decision]);

  const isFallback = !decision || isExpired;

  // Periodic check: every 60s, if expired/missing, auto-refresh.
  useEffect(() => {
    if (!user?.id) return;
    const tick = () => {
      const now = Date.now();
      const stale = !decision || (decision.expires_at && Date.parse(decision.expires_at) <= now);
      const since = lastBrainRunAt ? now - lastBrainRunAt : Infinity;
      // Throttle: at most one auto-refresh per 60s.
      if (stale && since > 60_000) {
        void runBrain("auto.expired", { trigger: "auto.expired" });
      }
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [user?.id, decision, lastBrainRunAt, runBrain]);

  // Activity heartbeat: callable from chat send / route change. Coalesced to 30s.
  const pulse = useCallback((kind: AionSignalKind = "route_change") => {
    if (!user?.id) return;
    const now = Date.now();
    if (now - lastPulseAtRef.current < 30_000) return;
    lastPulseAtRef.current = now;
    const since = lastBrainRunAt ? now - lastBrainRunAt : Infinity;
    const stale = !decision || (decision.expires_at && Date.parse(decision.expires_at) <= now);
    // Only fire the brain when actually needed; otherwise the pulse just resets the clock.
    if (stale || since > 5 * 60_000) {
      void runBrain(`pulse.${kind}`, { trigger: `pulse.${kind}` });
    }
  }, [user?.id, decision, lastBrainRunAt, runBrain]);

  const value = useMemo(
    () => ({ decision, lastBrainRunAt, isFallback, refresh, signal, pulse }),
    [decision, lastBrainRunAt, isFallback, refresh, signal, pulse],
  );

  // Dev-only visibility into the live decision (Phase A validation hook).
  // Surfaces mode/tone/density/focus/suggestion in the console whenever the
  // brain pushes a new row. No UI side-effects.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (!decision) {
      // eslint-disable-next-line no-console
      console.log("[aion.decision] (none) — fast-tier rules in control");
      return;
    }
    // eslint-disable-next-line no-console
    console.log("[aion.decision]", {
      mode: decision.mode,
      tone: decision.tone,
      density: decision.density,
      focus_target: decision.focus_target,
      suggestion: decision.suggestion,
      reasoning: decision.reasoning,
      expires_at: decision.expires_at,
    });
  }, [decision]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAionDecision() {
  return useContext(Ctx);
}