/**
 * ChatLayer — placeholder for Phase 1.
 *
 * Phase 2 will mount `AuroraChatBubbles` + `ArtifactLayer` here. Keeping the
 * placeholder explicit so the skeleton renders something visible at
 * `/__shellv2`.
 */
import { zStyle } from '../zindex';

export default function ChatLayer() {
  return (
    <main
      className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 pb-32 pt-20 text-center"
      style={zStyle('chat')}
    >
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/60">
        ShellV2 · ChatLayer
      </p>
      <p className="mt-3 max-w-sm text-sm text-foreground/70">
        Phase 1 skeleton. Conversation mounts here in Phase 2.
      </p>
    </main>
  );
}