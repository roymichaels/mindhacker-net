/**
 * UnifiedOverlayHost — the SSOT mount point for ShellV2 overlays.
 *
 * Phase 1 leaves this empty. From Phase 3 onward, every fullscreen artifact,
 * settings sheet, profile sheet, and AION panel renders here, driven by
 * `useOverlay()` from `src/shell/overlay/OverlayController`. No hand-rolled
 * `fixed inset-0` portals are allowed inside `src/shellv2/`.
 */
import ShellV2Menu from './ShellV2Menu';
import ChatHistorySheet from '@/components/aion/ChatHistorySheet';

/**
 * UnifiedOverlayHost — SSOT mount point for ShellV2 sheets.
 *
 * Each child binds to its own OverlayKind via OverlayController. The
 * controller enforces "one overlay at a time" — opening one closes the
 * others. No hand-rolled `fixed inset-0` portals belong here.
 */
export default function UnifiedOverlayHost() {
  return (
    <>
      <ShellV2Menu />
      <ChatHistorySheet />
    </>
  );
}