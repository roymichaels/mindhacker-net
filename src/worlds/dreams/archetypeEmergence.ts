/**
 * Archetype emergence — slow EMA of long-term behavioural patterns
 * across all worlds, mapped onto 6 archetypal axes. Affinities are
 * never shown as labels; they bias motif selection and atmospheric
 * tint inside the dream layer.
 */
import type { CognitiveWorldId } from '../types';
import type { ArchetypeId } from './types';
import type { WorldClimate } from '@/worlds/runtime/types';
import type { WorldHistorySummary } from '@/worlds/resonance/types';

interface PerWorld {
  climate: WorldClimate;
  history: WorldHistorySummary;
  residue: number;
  reinforcement: number;
}

/**
 * Compute fresh archetype affinity targets from the full ecosystem
 * snapshot. The dream engine smooths these into the persisted store.
 */
export function computeArchetypeTargets(
  fields: Partial<Record<CognitiveWorldId, PerWorld>>,
): Record<ArchetypeId, number> {
  const sum: Record<ArchetypeId, number> = {
    protector: 0,
    explorer: 0,
    creator: 0,
    shadow: 0,
    sage: 0,
    rebel: 0,
  };

  let counted = 0;

  for (const [, f] of Object.entries(fields)) {
    if (!f) continue;
    counted++;
    const { climate, history, residue, reinforcement } = f;

    // Protector — high stability, low residue, steady momentum.
    sum.protector +=
      0.5 * climate.harmonicStability +
      0.3 * history.stabilityTrend +
      0.2 * (1 - residue);

    // Explorer — high motion, positive emotional drift, low long-term inertia.
    sum.explorer +=
      0.45 * climate.motionIntensity +
      0.3 * Math.max(0, history.emotionalDrift) +
      0.25 * Math.max(0, history.momentumTrend - 0.3);

    // Creator — luminous + reinforcement + resonance.
    sum.creator +=
      0.4 * climate.luminosity +
      0.35 * reinforcement +
      0.25 * climate.resonance;

    // Shadow — residue + negative drift + low stability.
    sum.shadow +=
      0.5 * residue +
      0.3 * Math.max(0, -history.longTermDrift) +
      0.2 * (1 - climate.harmonicStability);

    // Sage — temporal coherence + low motion + dense atmosphere.
    sum.sage +=
      0.5 * climate.temporalCoherence +
      0.3 * (1 - climate.motionIntensity) +
      0.2 * climate.atmosphericDensity;

    // Rebel — instability spikes + warm-cool oscillation.
    sum.rebel +=
      0.4 * Math.min(1, history.recentSpikes / 4) +
      0.3 * Math.abs(history.emotionalDrift) +
      0.3 * (1 - history.stabilityTrend);
  }

  if (counted === 0) return sum;
  const out = {} as Record<ArchetypeId, number>;
  for (const k of Object.keys(sum) as ArchetypeId[]) {
    out[k] = Math.max(0, Math.min(1, sum[k] / counted));
  }
  return out;
}

/**
 * Pick the archetype most resonant with the given world right now,
 * combining ecosystem affinities with the world's local climate.
 */
export function dominantArchetypeFor(
  worldId: CognitiveWorldId,
  affinities: Record<ArchetypeId, number>,
  climate: WorldClimate,
  residue: number,
): ArchetypeId | null {
  // World-bias weights — each world leans toward archetypes that match
  // its native register.
  const bias: Record<CognitiveWorldId, Partial<Record<ArchetypeId, number>>> = {
    self:          { sage: 0.2, protector: 0.15 },
    habits:        { protector: 0.25, sage: 0.15 },
    emotions:      { shadow: 0.2, rebel: 0.15 },
    beliefs:       { sage: 0.2, protector: 0.1 },
    memory:        { sage: 0.25, shadow: 0.1 },
    relationships: { protector: 0.2, creator: 0.15 },
    archetypes:    { sage: 0.15, creator: 0.15 },
    creative:      { creator: 0.3, rebel: 0.15 },
    higher:        { sage: 0.3, creator: 0.1 },
  };

  let best: ArchetypeId | null = null;
  let bestScore = -Infinity;
  for (const [id, base] of Object.entries(affinities) as [ArchetypeId, number][]) {
    const b = bias[worldId][id] ?? 0;
    let score = base + b;
    if (id === 'shadow') score += residue * 0.3;
    if (id === 'creator') score += climate.luminosity * 0.15;
    if (id === 'sage') score += climate.temporalCoherence * 0.15;
    if (score > bestScore) {
      bestScore = score;
      best = id;
    }
  }
  // Floor — don't claim an archetype if everything is low.
  return bestScore > 0.25 ? best : null;
}