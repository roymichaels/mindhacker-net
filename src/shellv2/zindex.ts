/**
 * ShellV2 — single z-index scale.
 *
 * Every layer in the app must pick a value from here. New `z-[…]` arbitrary
 * Tailwind classes are forbidden inside `src/shellv2/` and are being phased
 * out elsewhere (Phase 7). Use these tokens both in inline styles and as
 * the basis for Tailwind classes (`z-[var(--z-overlay)]` is fine via the
 * helper below).
 */
export const Z = {
  base: 0,
  background: 10, // SharedOrbStage canvas
  chat: 20,
  composer: 30,
  chrome: 40, // minimal top bar
  scrim: 55,
  overlay: 60, // Radix dialog/sheet/drawer
  aionPanel: 70,
  toast: 80,
  blocking: 90, // naming gate, theme flash, avatar required, network reconnect
} as const;

export type ZLayer = keyof typeof Z;

/** Convenience for inline styles: `style={zStyle('overlay')}` */
export function zStyle(layer: ZLayer): { zIndex: number } {
  return { zIndex: Z[layer] };
}