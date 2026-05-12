/**
 * ChromeLayer — minimal top bar. The only persistent chrome.
 *
 * Holds three things and nothing else:
 *  - left: drawer trigger (history/account/nav). Wired in Phase 5.
 *  - center: ambient AION status (mood pulse / current room name).
 *  - right: history button (opens ChatHistorySheet). Wired in Phase 3.
 *
 * No dropdowns, no world-switcher, no breadcrumbs. If something feels like
 * it belongs here, it probably belongs in the composer plus-menu instead.
 */
import { Menu, History } from 'lucide-react';
import { useOverlay } from '@/shell/overlay/OverlayController';
import { zStyle } from '../zindex';

export default function ChromeLayer() {
  const overlay = useOverlay();
  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 pt-[env(safe-area-inset-top)]"
      style={zStyle('chrome')}
    >
      <div className="pointer-events-auto mx-auto flex h-12 max-w-screen-2xl items-center justify-between px-3">
        <button
          type="button"
          aria-label="Menu"
          onClick={() => overlay.toggle('drawer')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-foreground/80 transition-colors hover:bg-white/[0.06]"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div aria-hidden className="h-9 w-9" />

        <button
          type="button"
          aria-label="History"
          onClick={() => overlay.toggle('aion')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-foreground/80 transition-colors hover:bg-white/[0.06]"
        >
          <History className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}