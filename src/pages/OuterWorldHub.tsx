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
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import AlignedRealities from '@/components/outer/AlignedRealities';
import CanonicalAionModel from '@/components/orb/CanonicalAionModel';
import { ViewIdentityScope } from '@/viewIdentity';
import WorldTerrainScene from '@/world/terrain/WorldTerrainScene';

export default function OuterWorldHub() {
  const [params] = useSearchParams();
  const legacy = params.get('legacy') === '1';
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';

  if (legacy) {
    return (
      <main
        dir={isRTL ? 'rtl' : 'ltr'}
        className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain touch-pan-y"
        data-shellv2-layer="chat"
        data-shellv2-route="outer-world"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 4.5rem)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8rem)',
        }}
      >
        <ViewIdentityScope id="world" />
        <div className="mx-auto flex w-full max-w-md flex-col items-center px-5">
          <CanonicalAionModel size={160} ariaLabel="AION" />
          <div className="mt-3 aion-text-hero text-[12px] tracking-[0.32em] uppercase text-foreground/55">
            {isHe ? 'העולם החיצוני' : 'Outer World'}
          </div>
          <div className="mt-10 w-full">
            <AlignedRealities />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative flex min-h-0 flex-1"
      data-shellv2-layer="chat"
      data-shellv2-route="outer-world"
    >
      <ViewIdentityScope id="world" />
      <WorldTerrainScene />
    </main>
  );
}