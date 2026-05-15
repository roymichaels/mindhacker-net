/**
 * NavLayer — ghost dock for the 5 canonical surfaces.
 *
 * Hidden by default. Reveals on scroll-up, idle tap, or the small grabber
 * chevron above the composer. Hidden again on streaming, composer focus,
 * scroll-down, or message send.
 *
 * No new routes. No new capabilities. Pure UX behavior.
 */
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';
import { AionNavDock, type AionNavTab } from '@/components/aion/ui';
import { CANONICAL_SURFACES } from '@/navigation/canonicalSurfaces';
import { useTranslation } from '@/hooks/useTranslation';
import { useChamberIdle } from '../hooks/useChamberIdle';
import { zStyle } from '../zindex';
import { cn } from '@/lib/utils';
import { useChromeDeemphasis } from '@/hooks/useChromeDeemphasis';

export default function NavLayer() {
  const { language } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { navVisible, toggleNav, hideNav } = useChamberIdle();
  const isHe = language === 'he';
  const { weight: chromeWeight } = useChromeDeemphasis();

  const tabs: AionNavTab[] = CANONICAL_SURFACES.map((s) => {
    const Icon = s.icon;
    return {
      key: s.id,
      label: isHe ? s.labelHe : s.labelEn,
      icon: <Icon className="h-5 w-5" strokeWidth={1.5} />,
      active: s.path === location.pathname,
      onClick: () => {
        hideNav();
        navigate(s.path);
      },
    };
  });

  return (
    <>
      {/* Grabber chevron — small affordance to reveal nav */}
      <button
        type="button"
        aria-label={isHe ? (navVisible ? 'הסתר ניווט' : 'הצג ניווט') : navVisible ? 'Hide nav' : 'Show nav'}
        onClick={toggleNav}
        className={cn(
          'fixed left-1/2 -translate-x-1/2 flex items-center justify-center',
          'h-5 w-10 rounded-full text-foreground/25 hover:text-foreground/60 transition-all',
          'pointer-events-auto',
        )}
        style={{
          ...zStyle('nav'),
          // Sit just above the live composer (height tracked in --composer-h).
          bottom:
            'calc(env(safe-area-inset-bottom, 0px) + var(--composer-h, 64px) + 8px)',
          transition: 'bottom 320ms ease, color 200ms ease, opacity 1400ms ease',
          opacity: Math.max(0.35, chromeWeight),
        }}
      >
        <ChevronUp
          className={cn('h-3.5 w-3.5 transition-transform', navVisible && 'rotate-180')}
          strokeWidth={1.5}
        />
      </button>

      <AionNavDock
        tabs={tabs}
        visible={navVisible}
        style={{
          ...zStyle('nav'),
          // Float ABOVE the composer dock so icons are never covered.
          bottom:
            'calc(env(safe-area-inset-bottom, 0px) + var(--composer-h, 64px) + 18px)',
          opacity: chromeWeight,
          transition: 'opacity 1400ms ease',
        }}
      />
    </>
  );
}