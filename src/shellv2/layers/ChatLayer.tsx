/**
 * ChatLayer — Phase 2 mount.
 *
 * The single conversation surface for ShellV2. Hosts:
 *  - `AuroraChatBubbles`  — message stream (SSOT chat surface)
 *  - `ArtifactLayer`      — inline summon-able artifacts (artifactBus)
 *
 * No composer here (Phase 3). No legacy chrome, no DashboardLayout, no
 * HubModalHost, no MindOSSheet. Providers (AuroraChat, AION, Environment,
 * AionDecision) are mounted in `App.tsx` and reach this layer through the
 * normal React tree.
 */
import AuroraChatBubbles from '@/components/aurora/AuroraChatBubbles';
import ArtifactLayer from '@/components/artifacts/ArtifactLayer';
import { zStyle } from '../zindex';

export default function ChatLayer() {
  return (
    <main
      className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain touch-pan-y px-1"
      style={zStyle('chat')}
      data-shellv2-layer="chat"
      // Native-app safe areas: top = header (3rem) + status bar; bottom = composer (~5rem) + home indicator
      // Tailwind cannot interpolate env() so this lives inline.
      // eslint-disable-next-line react/no-unknown-property
    >
      <div
        className="flex flex-1 flex-col"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 3.25rem)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6.5rem)',
        }}
      >
        <AuroraChatBubbles showOrbAboveMessages={false} />
        <ArtifactLayer />
      </div>
    </main>
  );
}