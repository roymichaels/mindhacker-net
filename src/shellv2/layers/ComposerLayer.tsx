/**
 * ComposerLayer — placeholder for Phase 1.
 *
 * Phase 3 will mount `GlobalChatInput` + `ComposerActions` here. The bar is
 * fixed to the bottom with safe-area padding so the placeholder visually
 * matches the final layout.
 */
import { zStyle } from '../zindex';

export default function ComposerLayer() {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+12px)]"
      style={zStyle('composer')}
    >
      <div className="pointer-events-auto mx-auto w-full max-w-screen-md">
        <div className="flex h-12 items-center justify-center rounded-3xl border border-white/10 bg-card/60 px-4 text-xs uppercase tracking-[0.25em] text-muted-foreground/60 backdrop-blur-xl">
          composer · phase 3
        </div>
      </div>
    </div>
  );
}