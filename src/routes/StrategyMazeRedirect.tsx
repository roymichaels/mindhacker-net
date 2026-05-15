/**
 * Phase 5G — Strategy Maze Collapse.
 *
 * The legacy `/strategy/:pillar/...` family (50+ routes: home / assess /
 * intake / chat-results / results / history per pillar) is collapsed into
 * a single conversational surface — `/journey`. Pillars are now internal
 * cognition architecture, not user-facing destinations.
 *
 * This component is the only remaining mount point for that path family.
 * It captures the requested pillar + step in `sessionStorage` so Journey
 * (and the AION orchestrator) can summon the right reflection artifact,
 * then navigates the user to `/journey`. Deep links keep working — they
 * just resolve into the living surface instead of a maze of pages.
 */
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const STRATEGY_CONTEXT_KEY = 'aion.strategyContext';

export interface StrategyContext {
  pillar?: string;
  step?: string; // assess | results | history | intake | chat-results | scan | analyzing
  search?: string;
  origin: string;
  capturedAt: number;
}

export function readStrategyContext(): StrategyContext | null {
  try {
    const raw = sessionStorage.getItem(STRATEGY_CONTEXT_KEY);
    return raw ? (JSON.parse(raw) as StrategyContext) : null;
  } catch {
    return null;
  }
}

export function clearStrategyContext() {
  try { sessionStorage.removeItem(STRATEGY_CONTEXT_KEY); } catch { /* ignore */ }
}

export default function StrategyMazeRedirect() {
  const loc = useLocation();
  // Path is `/strategy/<pillar>/<step?>` — strip the prefix and split.
  const [, , pillar, step] = loc.pathname.split('/');
  useEffect(() => {
    if (!pillar) return;
    const ctx: StrategyContext = {
      pillar,
      step,
      search: loc.search || undefined,
      origin: loc.pathname + loc.search,
      capturedAt: Date.now(),
    };
    try {
      sessionStorage.setItem(STRATEGY_CONTEXT_KEY, JSON.stringify(ctx));
    } catch { /* ignore */ }
  }, [pillar, step, loc.pathname, loc.search]);
  return <Navigate to="/journey" replace />;
}
