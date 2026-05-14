/**
 * Pattern detectors. Pure functions that read recent history
 * summaries + climates and decide whether a symbolic motif has
 * "earned" the right to emerge.
 *
 * Detectors return at most one candidate motif per world per call,
 * with a weight 0..1. The dream engine multiplies by a low base
 * probability before scheduling — emergence remains rare.
 */
import type { CognitiveWorldId } from '../types';
import type { WorldClimate } from '@/worlds/runtime/types';
import type { WorldHistorySummary } from '@/worlds/resonance/types';
import type { MotifKind, SymbolicMotif } from './types';

interface DetectInput {
  worldId: CognitiveWorldId;
  climate: WorldClimate;
  history: WorldHistorySummary;
  /** Cumulative emotional residue for this world. */
  residue: number;
  /** Cumulative luminous reinforcement for this world. */
  reinforcement: number;
}

interface Candidate {
  kind: MotifKind;
  weight: number;
}

const mk = (kind: MotifKind, weight: number): Candidate => ({
  kind,
  weight: Math.max(0, Math.min(1, weight)),
});

export function detectMotif(input: DetectInput): Candidate | null {
  const { worldId, climate, history, residue, reinforcement } = input;
  const candidates: Candidate[] = [];

  // --- Cross-cutting shadow patterns -------------------------------------
  // Heavy emotional residue + low stability → collapsing structures.
  if (residue > 0.45 && climate.harmonicStability < 0.4) {
    candidates.push(mk('collapsing-structure', residue * 0.7));
  }
  // Long-term unresolved drift → glitch silhouettes (rare).
  if (history.longTermDrift < -0.25 && history.recentSpikes >= 2) {
    candidates.push(mk('glitch-silhouette', Math.abs(history.longTermDrift)));
  }

  // --- World-flavoured patterns ------------------------------------------
  switch (worldId) {
    case 'memory': {
      if (climate.particleActivity > 0.6 && history.momentumTrend > 0.4)
        candidates.push(mk('recursive-constellation', climate.particleActivity));
      if (history.recentSpikes >= 2 && climate.temporalCoherence > 0.55)
        candidates.push(mk('distant-echo', 0.5 + history.recentSpikes * 0.05));
      if (history.longTermDrift > 0.2 && reinforcement > 0.3)
        candidates.push(mk('impossible-timeline', reinforcement));
      break;
    }
    case 'emotions': {
      if (climate.atmosphericDensity > 0.55 && history.stabilityTrend < 0.4)
        candidates.push(mk('symbolic-storm', climate.atmosphericDensity));
      if (Math.abs(history.emotionalDrift) > 0.35)
        candidates.push(mk('pressure-wave', Math.abs(history.emotionalDrift)));
      if (history.stabilityTrend < 0.35 && residue > 0.3)
        candidates.push(mk('atmospheric-mirror', residue * 0.8));
      break;
    }
    case 'relationships': {
      if (history.momentumTrend < 0.25 && residue > 0.25)
        candidates.push(mk('fading-bridge', 0.5 + residue * 0.4));
      if (climate.resonance > 0.55 && history.emotionalDrift > 0.1)
        candidates.push(mk('harmonic-pairing', climate.resonance));
      if (residue > 0.4 && climate.luminosity < 0.4)
        candidates.push(mk('resonance-shadow', residue));
      break;
    }
    case 'creative': {
      if (climate.resonance > 0.5 && reinforcement > 0.25)
        candidates.push(mk('spontaneous-geometry', climate.resonance));
      if (history.momentumTrend < 0.2 && history.stabilityTrend < 0.45)
        candidates.push(mk('unfinished-structure', 1 - history.momentumTrend));
      break;
    }
    case 'higher': {
      if (climate.motionIntensity < 0.3 && climate.temporalCoherence > 0.6)
        candidates.push(mk('sacred-stillness', climate.temporalCoherence));
      if (climate.temporalCoherence > 0.7 && reinforcement > 0.3)
        candidates.push(mk('luminous-alignment', reinforcement));
      if (climate.atmosphericDensity > 0.5 && climate.motionIntensity < 0.35)
        candidates.push(mk('impossible-depth', climate.atmosphericDensity));
      break;
    }
    case 'habits': {
      if (climate.harmonicStability > 0.7 && history.momentumTrend > 0.5)
        candidates.push(mk('sacred-orbit', climate.harmonicStability));
      break;
    }
    default: {
      // self / beliefs / archetypes — only the cross-cutting ones above.
      if (residue > 0.5)
        candidates.push(mk('dream-corridor', residue * 0.6));
      break;
    }
  }

  if (!candidates.length) return null;
  // Pick the strongest.
  candidates.sort((a, b) => b.weight - a.weight);
  return candidates[0];
}

/** Build the persisted motif id for dedupe / reinforcement. */
export function motifIdFor(worldId: CognitiveWorldId, kind: MotifKind): string {
  return `${worldId}:${kind}`;
}

/** Convert a detected candidate into a SymbolicMotif object. */
export function buildMotif(
  worldId: CognitiveWorldId,
  candidate: Candidate,
  archetype: SymbolicMotif['archetype'],
  now: number,
): SymbolicMotif {
  return {
    id: motifIdFor(worldId, candidate.kind),
    worldId,
    kind: candidate.kind,
    weight: candidate.weight,
    occurrences: 1,
    firstSeen: now,
    lastSeen: now,
    archetype,
  };
}