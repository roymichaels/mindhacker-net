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
import { zStyle } from '../zindex';

export default function ComposerLayer() {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 px-3"
      style={zStyle('composer')}
      data-shellv2-layer="composer"
    >
      <div
        className="pointer-events-auto mx-auto w-full max-w-screen-md rounded-2xl bg-background/70 backdrop-blur-xl border border-border/40 px-2 py-2"
        style={{ position: 'fixed', left: 0, right: 0, bottom: 'max(env(safe-area-inset-bottom), 12px)', marginLeft: 'auto', marginRight: 'auto', maxWidth: '48rem' }}
      >
        <GlobalChatInput />
      </div>
    </div>
  );
}