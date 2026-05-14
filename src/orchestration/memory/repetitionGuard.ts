/**
 * Repetition + cooldown guard — Phase F · Step 5.
 *
 * Tracks short-lived state in sessionStorage:
 *   - assistant message hashes (to detect repetition / canned responses)
 *   - last probe timestamp + turn counter
 *   - last contradiction timestamp + ids
 *   - artifact-kind cooldown clock
 *
 * All API is sync, swallow-safe, and degrades to no-op without `window`.
 */
const KEY = 'aion.memguard.v1';

type GuardState = {
  turns: number;                          // total turns observed
  lastProbeAt: number | null;
  lastProbeTurn: number;                  // turn index at last probe
  lastContradictionAt: number | null;
  recentContradictionIds: string[];       // last 5 surfaced ids
  recentArtifactKinds: Record<string, number>;  // kind → ts
  recentAssistantHashes: { h: string; at: number }[]; // last 8
  recentProbeHashes: { h: string; at: number }[];     // last 8
};

const PROBE_TURN_GAP = 3;                  // max 1 probe / 3 turns
const CONTRADICTION_COOLDOWN_MS = 1000 * 60 * 60 * 6; // 6h per pair
const ARTIFACT_COOLDOWN_MS = 1000 * 60 * 5;           // 5min per kind

function load(): GuardState {
  if (typeof window === 'undefined') {
    return defaultState();
  }
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<GuardState>;
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

function save(s: GuardState): void {
  if (typeof window === 'undefined') return;
  try { window.sessionStorage.setItem(KEY, JSON.stringify(s)); } catch { /* swallow */ }
}

function defaultState(): GuardState {
  return {
    turns: 0,
    lastProbeAt: null,
    lastProbeTurn: -999,
    lastContradictionAt: null,
    recentContradictionIds: [],
    recentArtifactKinds: {},
    recentAssistantHashes: [],
    recentProbeHashes: [],
  };
}

/* ─────────── hashing ─────────── */
function normalize(s: string): string {
  return s.replace(/\s+/g, ' ').replace(/[\d.,;:!?"'״׳`]/g, '').trim().toLowerCase();
}
function hash(s: string): string {
  const n = normalize(s);
  let h = 5381;
  for (let i = 0; i < n.length; i++) h = ((h * 33) ^ n.charCodeAt(i)) >>> 0;
  return h.toString(36) + ':' + n.length;
}

/* ─────────── public API ─────────── */

export function bumpTurn(): number {
  const s = load();
  s.turns += 1;
  save(s);
  return s.turns;
}

export function canProbe(now = Date.now()): { ok: boolean; reason?: string } {
  const s = load();
  const turnsSince = s.turns - s.lastProbeTurn;
  if (turnsSince < PROBE_TURN_GAP) {
    return { ok: false, reason: `cooldown:turn-gap(${turnsSince}/${PROBE_TURN_GAP})` };
  }
  if (s.lastProbeAt && now - s.lastProbeAt < 1000 * 60 * 4) {
    return { ok: false, reason: 'cooldown:time' };
  }
  return { ok: true };
}

export function rememberProbe(text: string, now = Date.now()): void {
  const s = load();
  s.lastProbeAt = now;
  s.lastProbeTurn = s.turns;
  s.recentProbeHashes = [{ h: hash(text), at: now }, ...s.recentProbeHashes].slice(0, 8);
  save(s);
}

export function isRepeatProbe(text: string): boolean {
  const s = load();
  const h = hash(text);
  return s.recentProbeHashes.some((x) => x.h === h);
}

export function canSurfaceContradiction(pairKey: string, now = Date.now()): { ok: boolean; reason?: string } {
  const s = load();
  if (s.recentContradictionIds.includes(pairKey)) {
    return { ok: false, reason: 'cooldown:recent-pair' };
  }
  if (s.lastContradictionAt && now - s.lastContradictionAt < CONTRADICTION_COOLDOWN_MS) {
    return { ok: false, reason: 'cooldown:global' };
  }
  return { ok: true };
}

export function rememberContradiction(pairKey: string, now = Date.now()): void {
  const s = load();
  s.lastContradictionAt = now;
  s.recentContradictionIds = [pairKey, ...s.recentContradictionIds.filter((x) => x !== pairKey)].slice(0, 5);
  save(s);
}

export function canShowArtifactKind(kind: string, now = Date.now()): { ok: boolean; reason?: string } {
  const s = load();
  const last = s.recentArtifactKinds[kind];
  if (last && now - last < ARTIFACT_COOLDOWN_MS) {
    return { ok: false, reason: `cooldown:${kind}` };
  }
  return { ok: true };
}

export function rememberArtifactKind(kind: string, now = Date.now()): void {
  const s = load();
  s.recentArtifactKinds[kind] = now;
  save(s);
}

export function rememberAssistantText(text: string, now = Date.now()): void {
  const s = load();
  s.recentAssistantHashes = [{ h: hash(text), at: now }, ...s.recentAssistantHashes].slice(0, 8);
  save(s);
}

export function detectAssistantRepetition(text: string): { repeated: boolean; matchedAt?: number } {
  const s = load();
  const h = hash(text);
  const hit = s.recentAssistantHashes.find((x) => x.h === h);
  return hit ? { repeated: true, matchedAt: hit.at } : { repeated: false };
}

export function getGuardSnapshot(): GuardState {
  return load();
}