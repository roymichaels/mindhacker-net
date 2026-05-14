/**
 * ManifestationProvider — visual lifecycle around AION artifacts.
 *
 * Subscribes to both artifact buses and tracks each artifact through:
 *   pending → manifesting → stable → dissolving → gone
 *
 * Pure presentation: no backend, no orchestration changes. Cards opt in
 * via `useAionManifestation(id, kind)` or `<ManifestedArtifactShell>`.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { onArtifact } from '@/components/aion/artifacts/artifactBus';
import { artifactBus } from '@/lib/aion/artifactBus';
import {
  moodForKind,
  isStickyKind,
  type AnyManifestationKind,
  type ManifestationMood,
} from './moods';

export type ManifestationPhase =
  | 'pending'
  | 'manifesting'
  | 'stable'
  | 'dissolving';

interface LifecycleEntry {
  id: string;
  kind: AnyManifestationKind;
  mood: ManifestationMood;
  phase: ManifestationPhase;
  startedAt: number;
  isPrimary: boolean;
}

interface ManifestationContextValue {
  /** Map of artifactId → entry. */
  entries: Map<string, LifecycleEntry>;
  /** Currently focused (primary) artifact id. */
  primaryId: string | null;
  /** Mood of the primary artifact (drives ambient aura). */
  primaryMood: ManifestationMood | null;
  /** Whether the user prefers reduced motion. */
  reducedMotion: boolean;
  register: (id: string, kind: AnyManifestationKind) => void;
  dissolve: (id: string) => void;
  unregister: (id: string) => void;
}

const Ctx = createContext<ManifestationContextValue | null>(null);

const MANIFEST_MS = 260;
const DISSOLVE_MS = 220;

function devLog(event: string, payload: Record<string, unknown>) {
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    // eslint-disable-next-line no-console
    console.debug(`[manifestation] ${event}`, payload);
  }
}

export function ManifestationProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Map<string, LifecycleEntry>>(
    () => new Map(),
  );
  const [primaryId, setPrimaryId] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timers = useRef<Map<string, number>>(new Map());
  const entriesRef = useRef<Map<string, LifecycleEntry>>(entries);
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  // Track reduced-motion preference.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  const clearTimer = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t !== undefined) {
      window.clearTimeout(t);
      timers.current.delete(id);
    }
  }, []);

  const register = useCallback(
    (id: string, kind: AnyManifestationKind) => {
      const mood = moodForKind(kind);
      setEntries((prev) => {
        if (prev.has(id)) return prev;
        const next = new Map(prev);
        // Demote previous primary silently to stable.
        for (const [pid, p] of next) {
          if (p.isPrimary) next.set(pid, { ...p, isPrimary: false });
        }
        next.set(id, {
          id,
          kind,
          mood,
          phase: 'manifesting',
          startedAt: Date.now(),
          isPrimary: true,
        });
        return next;
      });
      setPrimaryId(id);
      devLog('started', { id, kind, mood });

      const settle = window.setTimeout(() => {
        setEntries((prev) => {
          const cur = prev.get(id);
          if (!cur) return prev;
          const next = new Map(prev);
          next.set(id, { ...cur, phase: 'stable' });
          return next;
        });
        devLog('stable', { id });
        timers.current.delete(id);
      }, reducedMotion ? 60 : MANIFEST_MS);
      timers.current.set(id, settle);
    },
    [reducedMotion],
  );

  const dissolve = useCallback(
    (id: string) => {
      setEntries((prev) => {
        const cur = prev.get(id);
        if (!cur || cur.phase === 'dissolving') return prev;
        const next = new Map(prev);
        next.set(id, { ...cur, phase: 'dissolving' });
        return next;
      });
      clearTimer(id);
      const t = window.setTimeout(() => {
        setEntries((prev) => {
          if (!prev.has(id)) return prev;
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
        setPrimaryId((cur) => (cur === id ? null : cur));
        devLog('dismissed', { id });
        timers.current.delete(id);
      }, reducedMotion ? 60 : DISSOLVE_MS);
      timers.current.set(id, t);
    },
    [clearTimer, reducedMotion],
  );

  const unregister = useCallback(
    (id: string) => {
      clearTimer(id);
      setEntries((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
      setPrimaryId((cur) => (cur === id ? null : cur));
    },
    [clearTimer],
  );

  // Bridge: AION artifact bus (floating cards)
  useEffect(() => {
    return onArtifact((art) => {
      if (!entriesRef.current.has(art.id)) {
        register(art.id, art.kind);
      }
      // Sticky kinds ignore ttl entirely.
      if (isStickyKind(art.kind)) return;
      if (art.ttl && art.ttl > 0) {
        window.setTimeout(() => dissolve(art.id), art.ttl);
      }
    });
  }, [register, dissolve]);

  // Bridge: summon stack
  useEffect(() => {
    return artifactBus.subscribe((stack) => {
      const ids = new Set(stack.map((a) => a.id));
      // Register newcomers.
      stack.forEach((inst) => {
        if (!entriesRef.current.has(inst.id)) register(inst.id, inst.kind);
      });
      // Dissolve any tracked summon-bus ids that disappeared.
      entriesRef.current.forEach((entry) => {
        if (entry.kind in SUMMON_KEYS && !ids.has(entry.id)) {
          dissolve(entry.id);
        }
      });
    });
  }, [register, dissolve]);

  // Cleanup timers on unmount.
  useEffect(() => {
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current.clear();
    };
  }, []);

  const value = useMemo<ManifestationContextValue>(() => {
    const primary = primaryId ? entries.get(primaryId) ?? null : null;
    return {
      entries,
      primaryId,
      primaryMood: primary?.mood ?? null,
      reducedMotion,
      register,
      dissolve,
      unregister,
    };
  }, [entries, primaryId, reducedMotion, register, dissolve, unregister]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Internal: rough lookup so we can detect summon-bus kinds. */
const SUMMON_KEYS: Record<string, true> = {
  assessment: true,
  'today-list': true,
  plan: true,
  journey: true,
  'landing-builder': true,
  'business-canvas': true,
  'job-mode': true,
};

export function useManifestationContext(): ManifestationContextValue | null {
  return useContext(Ctx);
}