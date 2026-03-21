/**
 * mapDNAtoVisual — The ONLY bridge between DNA (identity) and Orb (visual).
 *
 * RULE: Orb is a VISUAL RENDERER. It must NOT compute identity.
 * DNA is the SINGLE SOURCE OF TRUTH for identity.
 * This module maps DNA-derived identity → visual parameters for the Orb.
 *
 * Data flow:
 *   User → signals → DNA (computeDNA) → mapDNAtoVisual → Orb (render only)
 */

import type { DNAProfile } from '@/identity/types';
import type { ArchetypeId } from '@/lib/archetypes';

/**
 * Maps a DNA dominantArchetype string to a typed ArchetypeId.
 * DNA owns the archetype — this is a safe type-cast, not identity computation.
 */
export function dnaArchetypeToVisual(dominantArchetype: string): ArchetypeId {
  const valid: ArchetypeId[] = ['warrior', 'mystic', 'creator', 'sage', 'healer', 'explorer'];
  const lower = dominantArchetype.toLowerCase();

  // Direct match
  if (valid.includes(lower as ArchetypeId)) return lower as ArchetypeId;

  // Legacy ego-state mapping (for backward compat only — DNA should already have proper archetypes)
  const legacyMap: Record<string, ArchetypeId> = {
    guardian: 'healer', visionary: 'creator', rebel: 'warrior',
    ruler: 'warrior', innocent: 'explorer', everyman: 'healer',
    hero: 'warrior', outlaw: 'warrior', jester: 'creator',
    caregiver: 'healer', magician: 'mystic', lover: 'healer',
  };

  return legacyMap[lower] || 'explorer';
}

/**
 * Extracts visual-relevant parameters from DNAProfile.
 * These are passed to the Orb generator — the Orb never reads DNA directly.
 */
export function mapDNAtoVisual(dna: DNAProfile) {
  const archetype = dnaArchetypeToVisual(dna.dominantArchetype);
  const secondaryArchetype = dna.secondaryArchetype
    ? dnaArchetypeToVisual(dna.secondaryArchetype)
    : null;

  // Extract top traits sorted by weight (for visual influence)
  const sortedTraits = Object.entries(dna.dnaTraits)
    .filter(([, w]) => w > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name]) => name);

  // Ego state for animation/state selection
  const egoState = dna.dominantArchetype || 'guardian';

  return {
    /** Typed archetype for visual mapping */
    dominantArchetype: archetype,
    /** Secondary archetype (nullable) */
    secondaryArchetype,
    /** Top trait names (for visual influence, NOT identity computation) */
    topTraits: sortedTraits,
    /** Ego state for animation selection */
    egoState,
  };
}
