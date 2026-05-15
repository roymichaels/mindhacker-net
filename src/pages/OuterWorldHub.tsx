/**
 * OuterWorldHub — Outer World realm.
 *
 * The marketplace grid is gone. The realm is now a small portal layer
 * where AION (eventually) curates aligned realities. Routes preserved.
 */
import { useTranslation } from '@/hooks/useTranslation';
import AlignedRealities from '@/components/outer/AlignedRealities';
import CanonicalAionModel from '@/components/orb/CanonicalAionModel';
import { ViewIdentityScope } from '@/viewIdentity';

export default function OuterWorldHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
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