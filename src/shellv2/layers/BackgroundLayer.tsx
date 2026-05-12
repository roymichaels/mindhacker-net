/**
 * BackgroundLayer — paints the persistent background and hosts the global
 * orb canvas. Lives at z=10. Pointer-events are off so the layer never
 * intercepts clicks meant for chat/composer/overlays above it.
 *
 * Note: `SharedOrbStage` already mounts a `fixed inset-0` canvas with its
 * own z-index. ShellV2 owns that mount via this layer; legacy code that
 * also mounts SharedOrbStage at the App root will be removed in Phase 6.
 */
import SharedOrbStage from '@/components/orb/v2/SharedOrbStage';
import { zStyle } from '../zindex';

export default function BackgroundLayer() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 bg-background"
      style={zStyle('background')}
    >
      <SharedOrbStage />
    </div>
  );
}