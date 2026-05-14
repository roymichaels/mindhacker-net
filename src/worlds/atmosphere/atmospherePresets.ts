/**
 * Per-world visual identity presets — the cinematic language each
 * cognitive world inherits. Inspired by the MindOS / AION concept-art
 * north star: every world owns a distinct palette, depth signature,
 * motion temperament and light quality, while AION (the orb) remains
 * the shared presence across all of them.
 *
 * No imagery, no decoration. These presets parameterise pure CSS
 * gradients + motion driven by `WorldAtmosphere`, so the environment
 * carries the emotional experience of the world.
 */
import type { CognitiveWorldId } from '../types';

export type MotionTemperament =
  | 'orbital'   // habits — circular, gravitational
  | 'weather'   // emotions — drift, swell
  | 'tectonic'  // beliefs — slow, structural
  | 'temporal'  // memory — sweeping, constellated
  | 'social'    // relationships — pulled, attractor fields
  | 'ritual'    // archetypes — circle, breath
  | 'generative'// creative — bloom, branching
  | 'transcendent' // higher — vertical, dissolving
  | 'inward';   // self — descent, layered

export type LightQuality =
  | 'soft-glow'
  | 'volumetric'
  | 'rim-light'
  | 'depth-fog'
  | 'particulate'
  | 'aurora';

export interface AtmospherePreset {
  /** Two HSL triplets — define the world's colour spine. */
  primaryHsl: string;
  secondaryHsl: string;
  /** Tertiary accent used sparingly for highlights / particle sparks. */
  accentHsl: string;
  /** Depth tier: shallow (1) → deep cosmic (5). Drives layer count + parallax. */
  depth: 1 | 2 | 3 | 4 | 5;
  motion: MotionTemperament;
  light: LightQuality;
  /** Particle density 0..1 — extracted from the concept art's "particulate light" axis. */
  particles: number;
  /** Base ambient opacity for the atmosphere relative to BG. */
  ambient: number;
  /**
   * Where AION's persistent orb rests inside this world. Normalised viewport
   * coordinates (0..1, top-left origin) plus a relative scale (1 = base).
   * The orb glides between these anchors as the user crosses worlds — it
   * never re-mounts, only the environment around it dissolves.
   */
  orbAnchor: { x: number; y: number; scale: number };
}

export const ATMOSPHERE_PRESETS: Record<CognitiveWorldId, AtmospherePreset> = {
  self: {
    primaryHsl: '265 85% 66%',
    secondaryHsl: '230 70% 40%',
    accentHsl: '290 80% 75%',
    depth: 5,
    motion: 'inward',
    light: 'volumetric',
    particles: 0.55,
    ambient: 0.85,
    orbAnchor: { x: 0.5, y: 0.42, scale: 1.0 },
  },
  habits: {
    primaryHsl: '188 95% 65%',
    secondaryHsl: '215 70% 35%',
    accentHsl: '40 90% 70%',
    depth: 3,
    motion: 'orbital',
    light: 'rim-light',
    particles: 0.45,
    ambient: 0.75,
    orbAnchor: { x: 0.5, y: 0.5, scale: 1.1 },
  },
  emotions: {
    primaryHsl: '210 80% 60%',
    secondaryHsl: '320 65% 55%',
    accentHsl: '180 70% 70%',
    depth: 4,
    motion: 'weather',
    light: 'aurora',
    particles: 0.4,
    ambient: 0.9,
    orbAnchor: { x: 0.62, y: 0.38, scale: 0.9 },
  },
  beliefs: {
    primaryHsl: '30 70% 55%',
    secondaryHsl: '15 50% 25%',
    accentHsl: '45 90% 65%',
    depth: 4,
    motion: 'tectonic',
    light: 'depth-fog',
    particles: 0.3,
    ambient: 0.7,
    orbAnchor: { x: 0.5, y: 0.62, scale: 1.05 },
  },
  memory: {
    primaryHsl: '280 70% 65%',
    secondaryHsl: '230 70% 40%',
    accentHsl: '210 90% 80%',
    depth: 5,
    motion: 'temporal',
    light: 'particulate',
    particles: 0.85,
    ambient: 0.85,
    orbAnchor: { x: 0.5, y: 0.7, scale: 0.85 },
  },
  relationships: {
    primaryHsl: '340 75% 65%',
    secondaryHsl: '20 80% 60%',
    accentHsl: '45 90% 70%',
    depth: 3,
    motion: 'social',
    light: 'soft-glow',
    particles: 0.55,
    ambient: 0.75,
    orbAnchor: { x: 0.38, y: 0.46, scale: 0.95 },
  },
  archetypes: {
    primaryHsl: '15 80% 60%',
    secondaryHsl: '350 60% 35%',
    accentHsl: '40 90% 65%',
    depth: 4,
    motion: 'ritual',
    light: 'rim-light',
    particles: 0.35,
    ambient: 0.8,
    orbAnchor: { x: 0.5, y: 0.48, scale: 1.0 },
  },
  creative: {
    primaryHsl: '160 70% 55%',
    secondaryHsl: '280 70% 60%',
    accentHsl: '200 90% 75%',
    depth: 3,
    motion: 'generative',
    light: 'aurora',
    particles: 0.6,
    ambient: 0.8,
    orbAnchor: { x: 0.66, y: 0.55, scale: 0.9 },
  },
  higher: {
    primaryHsl: '255 80% 70%',
    secondaryHsl: '210 70% 50%',
    accentHsl: '45 95% 80%',
    depth: 5,
    motion: 'transcendent',
    light: 'volumetric',
    particles: 0.5,
    ambient: 0.95,
    orbAnchor: { x: 0.5, y: 0.3, scale: 1.15 },
  },
};

export function getAtmospherePreset(id: CognitiveWorldId): AtmospherePreset {
  return ATMOSPHERE_PRESETS[id];
}
