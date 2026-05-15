/**
 * NavLayer — constellation realm anchors (Phase 5M).
 *
 * Hidden by default. Reveals on idle tap, scroll-up, or the small
 * constellation hint above the composer. When revealed, AION notices
 * the active realm; hovering an anchor pulls attention there.
 *
 * No new routes. No new capabilities. Pure UX behavior.
 */
import { useNavigate, useLocation } from 'react-router-dom';
import { AionNavDock, type AionNavTab } from '@/components/aion/ui';
import { CANONICAL_SURFACES } from '@/navigation/canonicalSurfaces';
import { useTranslation } from '@/hooks/useTranslation';
import { useChamberIdle } from '../hooks/useChamberIdle';
import { zStyle } from '../zindex';
import { cn } from '@/lib/utils';
import { useChromeDeemphasis } from '@/hooks/useChromeDeemphasis';
import { getResidue, worldResidueBus } from '@/worlds/resonance/worldResidue';
import { attentionBus } from '@/aion/presence/attentionBus';
import { realmIntentBus } from '@/aion/presence/realmIntentBus';
import { useEffect, useRef, useState } from 'react';

export default function NavLayer() {
  const { language } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { navVisible, toggleNav, hideNav } = useChamberIdle();
  const isHe = language === 'he';
  const { weight: chromeWeight } = useChromeDeemphasis();

  const [, bump] = useState(0);
  useEffect(() => worldResidueBus.subscribe(() => bump((n) => n + 1)), []);

  const previousPathRef = useRef<string>(location.pathname);

  // 5M.3 — when nav blooms open, AION notices the active realm.
  useEffect(() => {
    if (!navVisible) return;
    const active = CANONICAL_SURFACES.find((s) => s.path === location.pathname);
    if (!active) return;
    // No precise focal yet (anchors haven't laid out) — symbolic notice only.
    attentionBus.notice('self', { x: 0.5, y: 0.85 }, 1200);
  }, [navVisible, location.pathname]);

  const tabs: AionNavTab[] = CANONICAL_SURFACES.map((s) => {
    const Icon = s.icon;
    const r = getResidue(s.id);
    const energy = Math.max(0, Math.min(1, 0.55 + r.engagement * 0.45 - r.avoidance * 0.35));
    const isActive = s.path === location.pathname;
    return {
      key: s.id,
      label: isHe ? s.labelHe : s.labelEn,
      icon: <Icon className="h-5 w-5" strokeWidth={1.5} />,
      active: isActive,
      energy,
      onHoverFocal: (focal) => {
        // 5M.3 — pull AION's attention toward this anchor.
        attentionBus.notice('self', focal, 700);
      },
      onClick: () => {
        // 5M.5 — emit realm intent BEFORE navigation completes.
        realmIntentBus.emit({
          target: s.id,
          previous:
            CANONICAL_SURFACES.find((c) => c.path === previousPathRef.current)?.id ?? null,
          timestamp: Date.now(),
          energy,
        });
        previousPathRef.current = s.path;
        hideNav();
        if (!isActive) navigate(s.path);
      },
    };
  });

  return (
    <>
      {/* Constellation hint — three tiny dots above the composer.
          Tapping it blooms the anchors upward. */}
      <button
        type="button"
        aria-label={
          isHe
            ? navVisible ? 'הסתר עוגני עולמות' : 'הצג עוגני עולמות'
            : navVisible ? 'Hide realm anchors' : 'Show realm anchors'
        }
        aria-expanded={navVisible}
        onClick={toggleNav}
        className={cn(
          'fixed left-1/2 -translate-x-1/2 flex items-center justify-center gap-1',
          'h-5 px-2 rounded-full text-foreground/30 hover:text-foreground/70',
          'pointer-events-auto focus:outline-none focus-visible:ring-1 focus-visible:ring-foreground/40',
        )}
        style={{
          ...zStyle('nav'),
          bottom:
            'calc(env(safe-area-inset-bottom, 0px) + var(--composer-h, 64px) + 10px)',
          transition: 'bottom 320ms ease, color 200ms ease, opacity 1400ms ease',
          opacity: Math.max(0.3, chromeWeight),
        }}
      >
        <span aria-hidden className={cn('h-[3px] w-[3px] rounded-full bg-current transition-transform', navVisible && 'scale-125')} />
        <span aria-hidden className={cn('h-[3px] w-[3px] rounded-full bg-current transition-transform', navVisible && 'scale-150')} />
        <span aria-hidden className={cn('h-[3px] w-[3px] rounded-full bg-current transition-transform', navVisible && 'scale-125')} />
      </button>

      <AionNavDock
        tabs={tabs}
        visible={navVisible}
        style={{
          ...zStyle('nav'),
          // Anchors bloom ABOVE the composer; safe area respected.
          bottom:
            'calc(env(safe-area-inset-bottom, 0px) + var(--composer-h, 64px) + 32px)',
          opacity: chromeWeight,
          transition: 'opacity 1400ms ease',
        }}
      />
    </>
  );
}
