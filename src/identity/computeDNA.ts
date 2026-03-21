/**
 * computeDNA — Consolidates ALL identity signal sources into a single DNAProfile.
 *
 * This is the SINGLE SOURCE OF TRUTH for identity computation.
 * It aggregates real user data from:
 *   1. Orb profile (egoState, archetype, traits)
 *   2. Onboarding / launchpad summary (identity_profile)
 *   3. Game state (level, XP, streak)
 *   4. Pillar assessments (domain scores)
 *   5. Skill distribution (user_skill_progress)
 *   6. Activity patterns (action_items habits)
 *   7. Energy patterns (aurora data)
 *   8. Community activity (posts/comments)
 *
 * NO fake traits. NO invented data. Only real signals.
 */

import type { DNAProfile, DNASignal } from './types';
import { DEFAULT_DNA_PROFILE } from './types';

export interface DNAInputSignals {
  /** From orb profile computedFrom */
  orbData?: {
    egoState?: string;
    dominantArchetype?: string;
    secondaryArchetype?: string | null;
    topTraitCategories?: string[];
    clarityScore?: number;
    seed?: number;
  };
  /** From launchpad summary identity_profile */
  identityProfile?: {
    dominant_traits?: string[];
    suggested_ego_state?: string;
    values_hierarchy?: string[];
  };
  /** From game state */
  gameState?: {
    level?: number;
    experience?: number;
    streak?: number;
  };
  /** Pillar assessment scores (pillar name → score 0-100) */
  pillarScores?: Record<string, number>;
  /** Skill XP distribution (skill name → xp total) */
  skillDistribution?: Record<string, number>;
  /** Habit completion rate (0-1) */
  habitCompletionRate?: number;
  /** Energy level from aurora */
  energyLevel?: string;
  /** Community engagement score */
  communityScore?: number;
}

/**
 * Normalize a trait weight to 0-1 range.
 */
function normalizeWeight(value: number, max: number): number {
  return Math.min(1, Math.max(0, value / max));
}

/**
 * Compute the unified DNA profile from all available signals.
 * This is a pure function — no side effects, no DB calls.
 */
export function computeDNA(input: DNAInputSignals): DNAProfile {
  const signals: DNASignal[] = [];
  const dnaTraits: Record<string, number> = {};

  // ── Signal 1: Ego State (from orb or identity profile) ──
  const egoState = input.orbData?.egoState
    || input.identityProfile?.suggested_ego_state
    || 'guardian';

  signals.push({
    source: 'ego_state',
    weight: 1.0,
    value: 1,
    lastUpdated: new Date().toISOString(),
  });

  // ── Signal 2: Dominant traits from identity profile ──
  const traits = input.identityProfile?.dominant_traits || input.orbData?.topTraitCategories || [];
  traits.forEach((trait, i) => {
    const weight = 1.0 - (i * 0.15); // first trait = 1.0, second = 0.85, etc.
    dnaTraits[trait] = Math.max(dnaTraits[trait] || 0, weight);
    signals.push({
      source: 'pillar_assessment',
      weight,
      value: weight,
      lastUpdated: new Date().toISOString(),
    });
  });

  // ── Signal 3: Game state → streak consistency ──
  if (input.gameState?.streak && input.gameState.streak > 0) {
    const streakWeight = normalizeWeight(input.gameState.streak, 100);
    dnaTraits['consistency'] = Math.max(dnaTraits['consistency'] || 0, streakWeight);
    signals.push({
      source: 'streak_consistency',
      weight: streakWeight,
      value: input.gameState.streak,
      lastUpdated: new Date().toISOString(),
    });
  }

  // ── Signal 4: Pillar assessment scores ──
  if (input.pillarScores) {
    for (const [pillar, score] of Object.entries(input.pillarScores)) {
      const weight = normalizeWeight(score, 100);
      dnaTraits[pillar] = weight;
      signals.push({
        source: 'pillar_assessment',
        pillar,
        weight,
        value: score,
        lastUpdated: new Date().toISOString(),
      });
    }
  }

  // ── Signal 5: Skill distribution ──
  if (input.skillDistribution) {
    const maxXp = Math.max(1, ...Object.values(input.skillDistribution));
    for (const [skill, xp] of Object.entries(input.skillDistribution)) {
      const weight = normalizeWeight(xp, maxXp);
      dnaTraits[`skill:${skill}`] = weight;
    }
    signals.push({
      source: 'skill_distribution',
      weight: 0.8,
      value: Object.keys(input.skillDistribution).length,
      lastUpdated: new Date().toISOString(),
    });
  }

  // ── Signal 6: Habit patterns ──
  if (input.habitCompletionRate !== undefined) {
    dnaTraits['discipline'] = input.habitCompletionRate;
    signals.push({
      source: 'habit_pattern',
      weight: input.habitCompletionRate,
      value: input.habitCompletionRate,
      lastUpdated: new Date().toISOString(),
    });
  }

  // ── Signal 7: Energy patterns ──
  if (input.energyLevel) {
    const energyMap: Record<string, number> = { high: 1.0, medium: 0.6, low: 0.3 };
    const energyVal = energyMap[input.energyLevel] ?? 0.5;
    dnaTraits['energy'] = energyVal;
    signals.push({
      source: 'energy_pattern',
      weight: energyVal,
      value: energyVal,
      lastUpdated: new Date().toISOString(),
    });
  }

  // ── Signal 8: Community activity ──
  if (input.communityScore && input.communityScore > 0) {
    const weight = normalizeWeight(input.communityScore, 100);
    dnaTraits['social'] = weight;
    signals.push({
      source: 'community_activity',
      weight,
      value: input.communityScore,
      lastUpdated: new Date().toISOString(),
    });
  }

  // ── Derive dominant archetype from traits (DNA computes this, NOT the Orb) ──
  // Priority: strongest trait archetype mapping → identity profile → egoState
  const archetypeFromTraits = deriveDominantArchetypeFromTraits(dnaTraits);
  const dominantArchetype = archetypeFromTraits
    || input.identityProfile?.suggested_ego_state
    || egoState;

  const secondaryArchetype = input.orbData?.secondaryArchetype || null;

  // ── Derive seed ──
  const dnaSeed = input.orbData?.seed
    ? String(input.orbData.seed)
    : '';

  // ── Values hierarchy as traits ──
  if (input.identityProfile?.values_hierarchy) {
    input.identityProfile.values_hierarchy.forEach((value, i) => {
      const w = 0.9 - (i * 0.1);
      dnaTraits[`value:${value}`] = Math.max(dnaTraits[`value:${value}`] || 0, w);
    });
  }

  return {
    dnaSeed,
    dnaTraits,
    dominantArchetype,
    secondaryArchetype,
    signals,
    lastComputedAt: new Date().toISOString(),
  };
}
