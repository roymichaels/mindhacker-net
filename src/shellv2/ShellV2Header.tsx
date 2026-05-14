/**
 * ShellV2Header — fixed top chrome for ShellV2 routes.
 *
 * Visual source: header block of `src/components/dashboard/DashboardLayout.tsx`
 * (orb-left brand badge, centered "AION" title, hamburger right).
 * Architecture: zero legacy deps — no AppNameDropdown, no AIONSheet, no
 * dashboard logic. Hamburger and orb both open ShellV2Drawer via
 * OverlayController.
 */
import { useState } from 'react';
import { Info } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useOverlay } from '@/shell/overlay/OverlayController';
import aionOrb from '@/assets/aion-ring.png';
import { zStyle } from './zindex';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { openInteractiveAION } from '@/components/aion/InteractiveAIONHost';
import { AionHeader } from '@/components/aion/ui';

export default function ShellV2Header() {
  const overlay = useOverlay();
  const { language, isRTL } = useTranslation();
  const [brandOpen, setBrandOpen] = useState(false);
  const brand = 'AION';
  const isHe = language === 'he';

  return (
    <>
    <div
      style={zStyle('chrome')}
      data-shellv2-layer="chrome"
      data-shellv2-header
      className="contents"
    >
      <AionHeader
        brand={brand}
        onMenuClick={() => overlay.open('drawer')}
        onBrandClick={() => setBrandOpen(true)}
        onOrbClick={() => openInteractiveAION()}
      />
    </div>

    <Sheet open={brandOpen} onOpenChange={setBrandOpen}>
      <SheetContent
        side="bottom"
        dir={isRTL ? 'rtl' : 'ltr'}
        className="rounded-t-3xl border-white/10 bg-background/85 backdrop-blur-2xl pb-[max(env(safe-area-inset-bottom),1rem)]"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15" />
        <SheetHeader className={isRTL ? 'text-right' : 'text-left'}>
          <div className="flex items-center gap-2">
            <img src={aionOrb} alt="" width={32} height={32} className="block h-8 w-8 object-contain" />
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

    </>
  );
}
