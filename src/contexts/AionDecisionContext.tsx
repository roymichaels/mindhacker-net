import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { recordSignal, type AionSignalKind } from "@/services/aionSignals";

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
  refresh: () => Promise<void>;
  signal: (kind: AionSignalKind, payload?: Record<string, unknown>) => Promise<void>;
}

const Ctx = createContext<AionDecisionCtx>({
  decision: null,
  refresh: async () => {},
  signal: async () => {},
});

export function AionDecisionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [decision, setDecision] = useState<AionDecision | null>(null);
  const debounceRef = useRef<number | null>(null);

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

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    try {
      await supabase.functions.invoke("aion-brain", { body: { force: true } });
    } catch (e) {
      console.warn("[aion] refresh failed", e);
    }
  }, [user?.id]);

  const signal = useCallback(
    async (kind: AionSignalKind, payload: Record<string, unknown> = {}) => {
      await recordSignal(kind, payload);
      // Debounced brain refresh after each signal burst
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        supabase.functions.invoke("aion-brain", { body: { trigger: kind } }).catch(() => {});
      }, 4000);
    },
    [],
  );

  const value = useMemo(() => ({ decision, refresh, signal }), [decision, refresh, signal]);

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