/**
 * ComposerLayer — Phase 3 mount.
 *
 * Mounts the SSOT composer (`GlobalChatInput`) inside ShellV2. The composer
 * binds to `AuroraChatContext` via `sendMessageRef`, so it works as soon as
 * the same providers wrapping ShellV2 are in place (already true in App.tsx).
 *
 * No legacy dock chrome, no second composer surface. Safe-area padding is
 * delegated to `GlobalChatInput` itself.
 */
import GlobalChatInput from '@/components/dashboard/GlobalChatInput';
import { AionComposerDock } from '@/components/aion/ui';
import { zStyle } from '../zindex';

export default function ComposerLayer() {
  return (
    <AionComposerDock style={zStyle('composer')}>
      <div data-shellv2-layer="composer">
        <GlobalChatInput />
      </div>
    </AionComposerDock>
  );
}