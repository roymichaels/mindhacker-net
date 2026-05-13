/**
 * ShellV2Header — the single fixed top chrome for ShellV2 routes.
 *
 * Contract:
 *  - left:   history icon → opens ChatHistorySheet (overlay 'aion')
 *  - center: MIND OS / current surface label
 *  - right:  menu icon → opens ShellV2Menu (overlay 'drawer')
 *
 * No back button, no breadcrumbs, no legacy chrome. Mounted from inside
 * `ChromeLayer` so it lives at the ShellV2 chrome z-tier.
 */
import { useLocation } from 'react-router-dom';
import { History, Menu } from 'lucide-react';
import { useOverlay } from '@/shell/overlay/OverlayController';
import { zStyle } from '../zindex';
import { cn } from '@/lib/utils';

function surfaceLabel(pathname: string): string {
  if (pathname.startsWith('/aurora')) return 'AION';
  if (pathname.startsWith('/brain')) return 'BRAIN';
  if (pathname.startsWith('/outer-world')) return 'OUTER WORLD';
  return 'HOME';
}

export default function ShellV2Header() {
  const overlay = useOverlay();
  const { pathname } = useLocation();
  const surface = surfaceLabel(pathname);

  return (
    <header
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0',
        'pt-[max(env(safe-area-inset-top),0.25rem)]',
      )}
      style={zStyle('chrome')}
      data-shellv2-layer="chrome"
      data-shellv2-header
    >
      <div className="pointer-events-auto mx-auto flex h-12 w-full max-w-screen-md items-center justify-between gap-2 px-3">
        <button
          type="button"
          aria-label="History"
          onClick={() => overlay.open('aion')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-foreground/80 backdrop-blur-md transition-colors hover:bg-white/[0.08]"
        >
          <History className="h-4 w-4" />
        </button>

        <div className="flex min-w-0 flex-1 items-baseline justify-center gap-1.5 select-none">
          <span className="text-[11px] font-semibold tracking-[0.18em] text-foreground/85">
            MIND OS
          </span>
          <span className="text-[11px] tracking-[0.14em] text-foreground/40">/</span>
          <span className="truncate text-[11px] tracking-[0.14em] text-foreground/55">
            {surface}
          </span>
        </div>

        <button
          type="button"
          aria-label="Menu"
          onClick={() => overlay.open('drawer')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-foreground/80 backdrop-blur-md transition-colors hover:bg-white/[0.08]"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
