/**
 * Universe depth z-index — Phase 5D.1.
 *
 * Extends `shellv2/zindex.ts` with the 5-layer cinematic depth stack.
 * Pulled from a single token table so every cognitive surface composes
 * the same depth grammar:
 *
 *   cosmos     — far stars, deep nebula
 *   haze       — environmental fog / atmospheric perspective
 *   energy     — drifting glow fields, light bridges (existing AtmosphereLayer)
 *   structure  — per-route terrain / sacred geometry / river
 *   anchor     — interactive cognitive nodes (pins, milestones)
 *
 * Numeric values intentionally sit BELOW shellv2 chat (z=20) so all
 * scene depth stays beneath the conversation surface.
 */
export const UZ = {
  cosmos: 8,
  haze: 11,
  energy: 12, // shellv2 AtmosphereLayer already lives here
  structure: 14,
  anchor: 16,
} as const;

export type UZLayer = keyof typeof UZ;

export function uzStyle(layer: UZLayer): { zIndex: number } {
  return { zIndex: UZ[layer] };
}