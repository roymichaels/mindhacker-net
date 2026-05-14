/**
 * ChatLayer — Phase 2 mount.
 *
 * The single conversation surface for ShellV2. Hosts:
 *  - `AuroraChatBubbles`  — message stream (SSOT chat surface)
 *  - `ArtifactLayer`      — inline summon-able artifacts (artifactBus)
 *
 * No composer here (Phase 3). No legacy chrome, no DashboardLayout, no
 * HubModalHost, no AIONSheet. Providers (AuroraChat, AION, Environment,
 * AionDecision) are mounted in `App.tsx` and reach this layer through the
 * normal React tree.
 */
import AuroraChatBubbles from '@/components/aurora/AuroraChatBubbles';
import ArtifactLayer from '@/components/artifacts/ArtifactLayer';
import { zStyle } from '../zindex';
import { useChamberIdle } from '../hooks/useChamberIdle';
import { useRef } from 'react';

export default function ChatLayer() {
  const { notifyScroll } = useChamberIdle();
  const lastY = useRef(0);

  return (
    <main
      className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain touch-pan-y px-1"
      style={zStyle('chat')}
      data-shellv2-layer="chat"
      // Native-app safe areas: top = header (3rem) + status bar; bottom = composer (~5rem) + home indicator
      // Tailwind cannot interpolate env() so this lives inline.
      // eslint-disable-next-line react/no-unknown-property
      onScroll={(e) => {
        const y = (e.target as HTMLElement).scrollTop;
        const delta = y - lastY.current;
        lastY.current = y;
        notifyScroll(delta);
      }}
    >
      <div
        className="flex flex-1 flex-col"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 5rem)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 7.5rem)',
          // Soft fade so messages emerge from / dissolve into darkness rather
          // than hitting hard chrome edges.
          maskImage:
            'linear-gradient(180deg, transparent 0px, black 56px, black calc(100% - 80px), transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(180deg, transparent 0px, black 56px, black calc(100% - 80px), transparent 100%)',
        }}
      >
        <AuroraChatBubbles showOrbAboveMessages={false} />
        <ArtifactLayer />
      </div>
    </main>
  );
}