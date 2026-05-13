/**
 * ShellV2Header — fixed top chrome for ShellV2 routes.
 *
 * Visual source: header block of `src/components/dashboard/DashboardLayout.tsx`
 * (orb-left brand badge, centered "מיינד OS" title, hamburger right).
 * Architecture: zero legacy deps — no AppNameDropdown, no MindOSSheet, no
 * dashboard logic. Hamburger and orb both open ShellV2Drawer via
 * OverlayController.
 */
import { Menu } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useOverlay } from '@/shell/overlay/OverlayController';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';
import { zStyle } from './zindex';
import { cn } from '@/lib/utils';

export default function ShellV2Header() {
  const overlay = useOverlay();
  const { language, isRTL } = useTranslation();
  const brand = language === 'he' ? 'מיינד OS' : 'Mind OS';

  return (
    <header
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0',
        'pt-[max(env(safe-area-inset-top),0.25rem)]',
      )}
      style={zStyle('chrome')}
      data-shellv2-layer="chrome"
      data-shellv2-header
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="pointer-events-auto mx-auto flex h-12 w-full max-w-screen-md items-center justify-between gap-2 px-3">
        {/* Left: orb badge */}
        <button
          type="button"
          aria-label={language === 'he' ? 'תפריט' : 'Menu'}
          onClick={() => overlay.open('drawer')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] backdrop-blur-md transition-colors hover:bg-white/[0.08]"
        >
          <AuroraOrbIcon size={22} />
        </button>

        {/* Center: brand */}
        <div className="flex min-w-0 flex-1 items-center justify-center select-none">
          <span className="truncate text-[15px] font-bold tracking-wide text-foreground/90">
            {brand}
          </span>
        </div>

        {/* Right: hamburger */}
        <button
          type="button"
          aria-label={language === 'he' ? 'תפריט' : 'Menu'}
          onClick={() => overlay.open('drawer')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-foreground/85 backdrop-blur-md transition-colors hover:bg-white/[0.08]"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
