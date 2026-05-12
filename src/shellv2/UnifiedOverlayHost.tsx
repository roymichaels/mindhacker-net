/**
 * UnifiedOverlayHost — the SSOT mount point for ShellV2 overlays.
 *
 * Phase 1 leaves this empty. From Phase 3 onward, every fullscreen artifact,
 * settings sheet, profile sheet, and AION panel renders here, driven by
 * `useOverlay()` from `src/shell/overlay/OverlayController`. No hand-rolled
 * `fixed inset-0` portals are allowed inside `src/shellv2/`.
 */
import { useOverlay } from '@/shell/overlay/OverlayController';

export default function UnifiedOverlayHost() {
  const { active } = useOverlay();
  // Nothing to render in Phase 1 — primitives below the overlay layer
  // (Radix dialogs/sheets/drawers) keep portalling to body and continue
  // to work as before.
  void active;
  return null;
}