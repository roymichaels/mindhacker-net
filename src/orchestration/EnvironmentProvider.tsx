import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { EnvironmentState, EnvironmentMode, SignalSnapshot } from './types';
import { DEFAULT_ENVIRONMENT } from './types';
import { evaluateFastTier } from './rules/fastTier';
import { buildSignalSnapshot } from './SignalAggregator';
import { useAionDecision, type AionDecision } from '@/contexts/AionDecisionContext';

interface EnvironmentContextValue {
  state: EnvironmentState;
  signals: SignalSnapshot;
  /** Push an explicit user intent string into the engine (e.g. "I'm overwhelmed"). */
  reportIntent: (text: string) => void;
  /** Force a specific mode (user override). Pass null to release the override. */
  setUserMode: (mode: EnvironmentMode | null) => void;
  /** Patch additional signals (open loops, sentiment, etc.). */
  updateSignals: (patch: Partial<SignalSnapshot>) => void;
  /** Always true now — kept for backwards compatibility with callers. */
  enabled: boolean;
}

const EnvironmentContext = createContext<EnvironmentContextValue | null>(null);

/** Map AION decision modes onto the EnvironmentMode vocabulary. */
const MODE_MAP: Record<AionDecision['mode'], EnvironmentMode> = {
  flow: 'focus',
  focus: 'focus',
  recovery: 'recover',
  overwhelmed: 'calm',
  hypnosis: 'reflect',
  calm: 'calm',
  neutral: 'execute',
};

const DENSITY_TO_BUDGET = {
  minimal: 'minimal' as const,
  standard: 'normal' as const,
  rich: 'expanded' as const,
};

function isExpired(decision: AionDecision | null): boolean {
  if (!decision?.expires_at) return false;
  const t = Date.parse(decision.expires_at);
  return Number.isFinite(t) && t < Date.now();
}

export function EnvironmentProvider({ children }: { children: React.ReactNode }) {
  const [signals, setSignals] = useState<SignalSnapshot>(() => buildSignalSnapshot());
  const [state, setState] = useState<EnvironmentState>(DEFAULT_ENVIRONMENT);
  const overrideRef = useRef<EnvironmentMode | null>(null);
  const { decision } = useAionDecision();

  /**
   * Recompute state. AION decisions are authoritative: if a non-expired
   * decision exists and the user hasn't manually overridden, the decision's
   * mode/tone/density become the live environment. Fast-tier rules act as
   * the cold-start fallback and continue to drive chrome/orb hints.
   */
  const recompute = useCallback((next: SignalSnapshot, dec: AionDecision | null) => {
    const fast = evaluateFastTier({ ...next, userOverrideMode: overrideRef.current ?? undefined });
    const decisionLive = dec && !isExpired(dec);
    if (!decisionLive || overrideRef.current) {
      setState(fast);
      return;
    }
    const decMode = MODE_MAP[dec.mode] ?? fast.mode;
    const decBudget = DENSITY_TO_BUDGET[dec.density] ?? fast.cognitiveBudget;
    setState({
      ...fast,
      mode: decMode,
      cognitiveBudget: decBudget,
      reason: dec.reasoning ?? fast.reason,
      source: 'slow-tier',
      updatedAt: Date.now(),
      aionDecision: {
        mode: dec.mode,
        tone: dec.tone,
        density: dec.density,
        focusTarget: dec.focus_target ?? {},
        suggestion: dec.suggestion ?? {},
        reasoning: dec.reasoning,
      },
    });
  }, []);

  // Re-evaluate whenever signals or the live decision change.
  useEffect(() => { recompute(signals, decision); }, [signals, decision, recompute]);

  // Periodic re-evaluation for time-of-day drift (cheap, fast tier only).
  useEffect(() => {
    const id = window.setInterval(() => {
      setSignals((prev) => buildSignalSnapshot(prev));
    }, 5 * 60 * 1000);
    return () => window.clearInterval(id);
  }, []);

  const reportIntent = useCallback((text: string) => {
    setSignals((prev) => ({ ...prev, lastIntentText: text, lastIntentAt: Date.now() }));
  }, []);

  const setUserMode = useCallback((mode: EnvironmentMode | null) => {
    overrideRef.current = mode;
    setSignals((prev) => ({ ...prev, userOverrideMode: mode ?? undefined }));
  }, []);

  const updateSignals = useCallback((patch: Partial<SignalSnapshot>) => {
    setSignals((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo<EnvironmentContextValue>(() => ({
    state, signals, reportIntent, setUserMode, updateSignals, enabled: true,
  }), [state, signals, reportIntent, setUserMode, updateSignals]);

  return <EnvironmentContext.Provider value={value}>{children}</EnvironmentContext.Provider>;
}

export function useEnvironment(): EnvironmentContextValue {
  const ctx = useContext(EnvironmentContext);
  if (!ctx) {
    // Safe default — preserves legacy behavior if provider isn't mounted yet.
    return {
      state: DEFAULT_ENVIRONMENT,
      signals: buildSignalSnapshot(),
      reportIntent: () => {},
      setUserMode: () => {},
      updateSignals: () => {},
      enabled: false,
    };
  }
  return ctx;
}