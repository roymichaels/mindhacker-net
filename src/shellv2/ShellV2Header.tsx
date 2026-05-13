/**
 * ShellV2Header — fixed top chrome for ShellV2 routes.
 *
 * Visual source: header block of `src/components/dashboard/DashboardLayout.tsx`
 * (orb-left brand badge, centered "מיינד OS" title, hamburger right).
 * Architecture: zero legacy deps — no AppNameDropdown, no MindOSSheet, no
 * dashboard logic. Hamburger and orb both open ShellV2Drawer via
 * OverlayController.
 */
import { useState } from 'react';
import { Menu, Sparkles, Info, Play } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useOverlay } from '@/shell/overlay/OverlayController';
import { OrbView } from '@/components/orb/v2/OrbView';
import { zStyle } from './zindex';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { MissionControlTab } from '@/components/play/MissionControlTab';
import { openInteractiveAION } from '@/components/aion/InteractiveAIONHost';

export default function ShellV2Header() {
  const overlay = useOverlay();
  const { language, isRTL } = useTranslation();
  const [brandOpen, setBrandOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const brand = 'MindOS';
  const isHe = language === 'he';

  return (
    <>
    <header
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0',
        'bg-background/55 backdrop-blur-2xl backdrop-saturate-150',
        'border-b border-white/[0.06]',
        'pb-1',
      )}
      style={zStyle('chrome')}
      data-shellv2-layer="chrome"
      data-shellv2-header
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="pointer-events-auto mx-auto flex h-11 w-full max-w-screen-md items-center justify-between gap-2 px-3">
        {/* Left: orb badge */}
        <button
          type="button"
          aria-label={isHe ? 'מצב אינטראקטיבי' : 'Interactive mode'}
          onClick={() => openInteractiveAION()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] backdrop-blur-md transition-colors hover:bg-white/[0.08]"
        >
          <OrbView size={28} neutral tintHue="hsl(0 0% 100%)" tier="presence" ariaLabel={isHe ? 'תפריט' : 'Menu'} />
        </button>

        {/* Center: brand (tap to open about sheet) */}
        <button
          type="button"
          onClick={() => setBrandOpen(true)}
          className="flex min-w-0 flex-1 items-center justify-center gap-1.5 select-none rounded-full px-3 py-1 active:scale-[0.97] transition"
          aria-label={isHe ? 'אודות' : 'About'}
        >
          <span className="truncate text-[15px] font-bold tracking-wide text-foreground/90">
            {brand}
          </span>
          <Sparkles className="h-3 w-3 text-foreground/40" />
        </button>

        {/* Right: hamburger */}
        <button
          type="button"
          aria-label={isHe ? 'נגן' : 'Player'}
          onClick={() => setPlayerOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-foreground/85 backdrop-blur-md transition-colors hover:bg-white/[0.08]"
        >
          <Play className="h-4 w-4" />
        </button>
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

    <Sheet open={brandOpen} onOpenChange={setBrandOpen}>
      <SheetContent
        side="bottom"
        dir={isRTL ? 'rtl' : 'ltr'}
        className="rounded-t-3xl border-white/10 bg-background/85 backdrop-blur-2xl pb-[max(env(safe-area-inset-bottom),1rem)]"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15" />
        <SheetHeader className={isRTL ? 'text-right' : 'text-left'}>
          <div className="flex items-center gap-2">
            <OrbView size={32} neutral tintHue="hsl(0 0% 100%)" tier="presence" />
            <SheetTitle className="text-lg">{brand}</SheetTitle>
          </div>
          <SheetDescription className="text-foreground/70">
            {isHe
              ? 'מערכת ההפעלה של החיים שלך — משחק, מסע ותרגול יומי.'
              : 'The operating system for your life — game, journey, and daily practice.'}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/[0.04] px-3 py-2.5 text-xs text-foreground/60">
          <Info className="h-4 w-4 shrink-0" />
          <span>{isHe ? 'גרסה 2 · ShellV2' : 'Version 2 · ShellV2'}</span>
        </div>
      </SheetContent>
    </Sheet>

    <Sheet open={playerOpen} onOpenChange={setPlayerOpen}>
      <SheetContent
        side="bottom"
        dir={isRTL ? 'rtl' : 'ltr'}
        className="rounded-t-3xl border-white/10 bg-background/95 backdrop-blur-2xl pb-[max(env(safe-area-inset-bottom),1rem)] max-h-[90vh] overflow-y-auto"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15" />
        <SheetHeader className="sr-only">
          <SheetTitle>{isHe ? 'בקרת משימות' : 'Mission Control'}</SheetTitle>
          <SheetDescription>{isHe ? 'נגן המשימות מהאסטרטגיה' : 'Strategy mission player'}</SheetDescription>
        </SheetHeader>
        <MissionControlTab />
      </SheetContent>
    </Sheet>
    </>
  );
}
