/**
 * AIONStateContext — volatile presence state for AION (the orb).
 *
 * Distinct from `useEnvironment` (which derives the *environment mode*
 * from time/intent/overrides). This context tracks the orb's *live*
 * conversational state: idle / listening / thinking / speaking / guiding
 * / immersive. Other components can subscribe to drive aura, dim layers,
 * composer styling, etc.
 *
 * Phase 1 of the AION Orchestration Redesign — see .lovable/plan.md.
 */
import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';

export type AIONLiveState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'guiding'
  | 'immersive';

interface AIONStateContextValue {
  state: AIONLiveState;
  setState: (next: AIONLiveState) => void;
}

const AIONStateContext = createContext<AIONStateContextValue | null>(null);

export function AIONStateProvider({ children }: { children: ReactNode }) {
  const [state, setStateInternal] = useState<AIONLiveState>('idle');

  const setState = useCallback((next: AIONLiveState) => {
    setStateInternal((prev) => (prev === next ? prev : next));
  }, []);

  const value = useMemo(() => ({ state, setState }), [state, setState]);

  return <AIONStateContext.Provider value={value}>{children}</AIONStateContext.Provider>;
}

export function useAIONState(): AIONStateContextValue {
  const ctx = useContext(AIONStateContext);
  if (!ctx) {
    return { state: 'idle', setState: () => {} };
  }
  return ctx;
}