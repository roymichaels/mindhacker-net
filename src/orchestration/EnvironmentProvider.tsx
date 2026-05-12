import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { EnvironmentState, EnvironmentMode, SignalSnapshot } from './types';
import { DEFAULT_ENVIRONMENT } from './types';
import { evaluateFastTier } from './rules/fastTier';
import { buildSignalSnapshot } from './SignalAggregator';

interface EnvironmentContextValue {
  state: EnvironmentState;
  signals: SignalSnapshot;
  /** Push an explicit user intent string into the engine (e.g. "I'm overwhelmed"). */
  reportIntent: (text: string) => void;
  /** Force a specific mode (user override). Pass null to release the override. */
  setUserMode: (mode: EnvironmentMode | null) => void;
  /** Patch additional signals (open loops, sentiment, etc.). */
  updateSignals: (patch: Partial<SignalSnapshot>) => void;
  /** Whether the orchestration layer is active (vs. legacy default). */
  enabled: boolean;
}

const EnvironmentContext = createContext<EnvironmentContextValue | null>(null);

const FEATURE_FLAG_KEY = 'mindos.aol.enabled';

function readFlag(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(FEATURE_FLAG_KEY) === '1';
  } catch {
    return false;
  }
}

export function EnvironmentProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState<boolean>(readFlag);
  const [signals, setSignals] = useState<SignalSnapshot>(() => buildSignalSnapshot());
  const [state, setState] = useState<EnvironmentState>(DEFAULT_ENVIRONMENT);
  const overrideRef = useRef<EnvironmentMode | null>(null);

  // Recompute state from signals (fast tier).
  const recompute = useCallback((next: SignalSnapshot) => {
    if (!enabled) {
      setState(DEFAULT_ENVIRONMENT);
      return;
    }
    const evaluated = evaluateFastTier({ ...next, userOverrideMode: overrideRef.current ?? undefined });
    setState(evaluated);
  }, [enabled]);

  // Reactive flag: listen for storage + custom toggle event so the provider
  // can flip on/off without a reload.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const refresh = () => setEnabled(readFlag());
    window.addEventListener('storage', refresh);
    window.addEventListener('mindos:aol:toggle', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('mindos:aol:toggle', refresh);
    };
  }, []);

  // Re-evaluate whenever flag flips.
  useEffect(() => { recompute(signals); }, [enabled, recompute, signals]);

  // Periodic re-evaluation for time-of-day drift (cheap, fast tier only).
  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => {
      setSignals((prev) => buildSignalSnapshot(prev));
    }, 5 * 60 * 1000);
    return () => window.clearInterval(id);
  }, [enabled]);

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
    state, signals, reportIntent, setUserMode, updateSignals, enabled,
  }), [state, signals, reportIntent, setUserMode, updateSignals, enabled]);

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

/** Helper for app-level toggles (e.g. settings panel). */
export function setAolEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FEATURE_FLAG_KEY, enabled ? '1' : '0');
    window.dispatchEvent(new Event('mindos:aol:toggle'));
  } catch {
    /* ignore */
  }
}