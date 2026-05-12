/**
 * OverlayLayer — wraps children in `OverlayProvider` (already mounted at the
 * App root in legacy, but ShellV2 also exposes it here so the new shell can
 * be embedded standalone in dev/QA) and renders the unified overlay host.
 *
 * IMPORTANT: do not nest a second `OverlayProvider` if one is already
 * present higher in the tree. The provider in `src/shell/overlay` is
 * idempotent in behaviour (each instance has its own state), so rendering
 * the host alone is enough when used inside the App root.
 */
import UnifiedOverlayHost from '../UnifiedOverlayHost';

export default function OverlayLayer() {
  return <UnifiedOverlayHost />;
}