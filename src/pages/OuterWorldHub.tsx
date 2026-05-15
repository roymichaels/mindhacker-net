/**
 * OuterWorldHub — Outer World realm.
 *
 * The marketplace grid is gone. The realm is now a small portal layer
 * where AION (eventually) curates aligned realities. Routes preserved.
 */
/**
 * OuterWorldHub — Phase 5D.1 flagship.
 *
 * The route is no longer a page with cards. It mounts the
 * `WorldTerrainScene` as a full-bleed living terrain. Legacy
 * `AlignedRealities` is preserved behind `?legacy=1` for diagnostics.
 */
/**
 * OuterWorldHub — Phase 5D.1B.
 *
 * The route ALWAYS opens as the living terrain (`WorldTerrainScene`).
 * The legacy `AlignedRealities` feed is reachable only via a quiet
 * chevron at the bottom edge that slides it up as a Sheet overlay —
 * never the primary surface.
 */
import { useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import AlignedRealities from '@/components/outer/AlignedRealities';
import { ViewIdentityScope } from '@/viewIdentity';
import WorldTerrainScene from '@/world/terrain/WorldTerrainScene';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export default function OuterWorldHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const [legacyOpen, setLegacyOpen] = useState(false);

  return (
    <main
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative flex min-h-0 flex-1"
      data-shellv2-layer="chat"
      data-shellv2-route="outer-world"
    >
      <ViewIdentityScope id="world" />
      <WorldTerrainScene
        footer={
          <button
            type="button"
            onClick={() => setLegacyOpen(true)}
            aria-label={isHe ? 'מבט מצטבר' : 'Aggregate view'}
            className="flex items-center justify-center h-7 w-12 rounded-full text-foreground/25 hover:text-foreground/55 transition-colors"
          >
            <ChevronUp className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        }
      />

      <Sheet open={legacyOpen} onOpenChange={setLegacyOpen}>
        <SheetContent
          side="bottom"
          className="h-[80vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-t border-border/40"
        >
          <SheetHeader>
            <SheetTitle className="text-[13px] tracking-[0.28em] uppercase text-foreground/60 text-start">
              {isHe ? 'מבט מצטבר' : 'Aggregate view'}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 pb-10">
            <AlignedRealities />
          </div>
        </SheetContent>
      </Sheet>
    </main>
  );
}