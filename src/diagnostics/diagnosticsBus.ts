/**
 * In-memory event bus for the Dev Diagnostics Panel.
 *
 * Producers (chat hook, memory-writer caller) push status snapshots here.
 * Consumers (sections inside <DiagnosticsHost />) subscribe with `on()`.
 *
 * Synchronous, non-throwing, no-op when nothing subscribes — safe to call
 * from production code paths.
 */

export type MemoryWriterEvent = {
  source: 'chat' | 'journal' | 'hypnosis' | 'mission';
  status: 'pending' | 'ok' | 'error';
  startedAt: number;
  durationMs?: number;
  inserted?: number;
  reinforced?: number;
  skipped?: number;
  error?: string;
  raw?: unknown;
};

export type LeakGuardEvent = {
  at: number;
  rawLen: number;
  cleanLen: number;
  status: 'clean' | 'sanitized' | 'rejected';
  matched: string[];
  preview?: string;
};

export type ResponseSourceEvent = {
  at: number;
  source: 'live' | 'fallback' | 'unknown';
  mode: string;
  greeting: boolean;
  degraded: boolean;
  duplicateOfPrevious: boolean;
  historyCount?: number;
  assistantHistoryCount?: number;
  historyFilteredCount?: number;
  taskSource?: string;
  currentTime?: string;
  dailyBriefingSource?: string;
  proactiveUsed?: boolean;
  cachedResponse?: boolean;
  intent?: string;
  lanes?: string;
  preview?: string;
};

export type BrainRunEvent = {
  at: number;
  trigger: string;
  status: 'started' | 'ok' | 'error';
  durationMs?: number;
  error?: string;
};

type EventMap = {
  'memory-writer': MemoryWriterEvent;
  'leak-guard': LeakGuardEvent;
  'response-source': ResponseSourceEvent;
  'brain-run': BrainRunEvent;
};

type Listener<K extends keyof EventMap> = (payload: EventMap[K]) => void;

const listeners: { [K in keyof EventMap]: Set<Listener<K>> } = {
  'memory-writer': new Set(),
  'leak-guard': new Set(),
  'response-source': new Set(),
  'brain-run': new Set(),
};

const STORAGE_KEY = 'mindos.diag.last';

function loadInitial(): Partial<{ [K in keyof EventMap]: EventMap[K] }> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

const last: Partial<{ [K in keyof EventMap]: EventMap[K] }> = loadInitial();

function persist(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(last));
  } catch {
    /* quota / disabled — ignore */
  }
}

export const diagnosticsBus = {
  emit<K extends keyof EventMap>(kind: K, payload: EventMap[K]): void {
    try {
      last[kind] = payload;
      persist();
      for (const l of listeners[kind]) {
        try {
          l(payload);
        } catch {
          // Listener errors must never bubble into producers.
        }
      }
    } catch {
      /* swallow */
    }
  },
  on<K extends keyof EventMap>(kind: K, listener: Listener<K>): () => void {
    listeners[kind].add(listener as Listener<K>);
    return () => listeners[kind].delete(listener as Listener<K>);
  },
  last<K extends keyof EventMap>(kind: K): EventMap[K] | undefined {
    return last[kind] as EventMap[K] | undefined;
  },
};

/** Light pattern detector — mirrors stripReasoning but reports rather than mutates. */
const LEAK_PATTERNS: Array<[string, RegExp]> = [
  ['<think> block', /<\s*(think|reasoning|analysis|internal|scratchpad)\b/i],
  ['[reasoning] meta', /^\s*\[(reasoning|plan|analysis|internal|debug|scratch)\b/im],
  ['"I should"', /\bi should (respond|answer|reply|now)\b/i],
  ['"Looking at"', /\blooking at the (conversation|history|log|context|system)\b/i],
  ['"As Aurora/AION"', /\bas (aurora|aion)\b/i],
  ['"chain of thought"', /\bchain of thought\b/i],
  ['HE: כאורורה', /\bכאורורה\b/],
  ['HE: בואו לחשוב', /\bבואו? (לחשוב|לבדוק|נחשוב|נבדוק)\b/],
];

export function detectLeaks(raw: string): string[] {
  const out: string[] = [];
  for (const [label, re] of LEAK_PATTERNS) if (re.test(raw)) out.push(label);
  return out;
}