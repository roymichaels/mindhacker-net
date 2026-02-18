/**
 * Deterministic per-user seed for orb visual differentiation.
 * Uses FNV-1a hash to produce a stable 32-bit integer from user_id.
 */

export function hashUserId(userId: string): number {
  let hash = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < userId.length; i++) {
    hash ^= userId.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0; // FNV prime, keep unsigned
  }
  return hash;
}

/** Deterministic float 0..1 from seed + channel */
export function seedFloat(seed: number, channel: number): number {
  const mixed = ((seed ^ (channel * 2654435761)) >>> 0) % 10000;
  return mixed / 10000;
}

/** Deterministic int from seed within range */
export function seedInt(seed: number, channel: number, min: number, max: number): number {
  return min + Math.floor(seedFloat(seed, channel) * (max - min + 1));
}

export type GeometryFamily = 'sphere' | 'torus' | 'dodeca' | 'icosa' | 'octa' | 'spiky';

const ALL_GEOMETRY_FAMILIES: GeometryFamily[] = ['sphere', 'torus', 'dodeca', 'icosa', 'octa', 'spiky'];

/** Archetype-allowed geometry families (2-3 options each) */
const ARCHETYPE_GEOMETRIES: Record<string, GeometryFamily[]> = {
  warrior: ['octa', 'spiky', 'icosa'],
  mystic: ['dodeca', 'torus', 'sphere'],
  creator: ['torus', 'dodeca', 'spiky'],
  sage: ['icosa', 'octa', 'sphere'],
  healer: ['sphere', 'dodeca', 'torus'],
  explorer: ['icosa', 'spiky', 'octa'],
};

/** Pick geometry family based on archetype + seed */
export function pickGeometryFamily(archetype: string, seed: number): GeometryFamily {
  const options = ARCHETYPE_GEOMETRIES[archetype] || ALL_GEOMETRY_FAMILIES;
  return options[seed % options.length];
}

/** Seed-based hue offset (-15 to +15 degrees) */
export function seedHueOffset(seed: number): number {
  return (seed % 31) - 15;
}

/** Seed-based initial morph phase (0..1) */
export function seedMorphPhase(seed: number): number {
  return (seed % 1000) / 1000;
}

/** Seed-based particle drift angle (radians) */
export function seedParticleDrift(seed: number): number {
  return ((seed % 628) / 100);
}
