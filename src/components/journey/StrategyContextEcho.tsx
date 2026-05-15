/**
 * StrategyContextEcho — Phase 5G.1
 *
 * Consumes a captured legacy `aion.strategyContext` (set by
 * `StrategyMazeRedirect` when the user lands from an old `/strategy/...`
 * deep link) and manifests it as a subtle Journey observation —
 * never as a pillar/assessment surface.
 *
 * Behavior:
 *  - Reads the context once on mount, then clears it.
 *  - Ignores stale (>10 min) or malformed contexts.
 *  - Maps legacy steps (assess / results / history / intake / base) to
 *    AION-language ("reflection", "what AION noticed", ...).
 *  - Tries to summon `continue-journey` artifact via the artifact bus.
 *  - Renders an ambient observation card with two CTAs:
 *      • "Ask AION about this"  → /aurora (carries context in session)
 *      • "Continue through AION" → /
 *
 * Does not navigate, does not redesign Journey, does not expose pillar /
 * assessment / score / domain language.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import {
  readStrategyContext,
  clearStrategyContext,
  type StrategyContext,
} from '@/routes/StrategyMazeRedirect';
import { artifactBus } from '@/lib/aion/artifactBus';
import { cn } from '@/lib/utils';

const MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

type Aspect = 'reflection' | 'noticed' | 'past' | 'area';

function mapStep(step?: string): Aspect {
  switch ((step || '').toLowerCase()) {
    case 'assess':
    case 'intake':
    case 'scan':
    case 'analyzing':
      return 'reflection';
    case 'results':
    case 'chat-results':
      return 'noticed';
    case 'history':
      return 'past';
    default:
      return 'area';
  }
}

function aspectCopy(aspect: Aspect, isHe: boolean): string {
  if (isHe) {
    switch (aspect) {
      case 'reflection': return 'פתחת התבוננות ישנה. אני אחזיק אותה כחלק מהמסלול הנוכחי שלך.';
      case 'noticed':    return 'פתחת משהו שהבחנתי בו פעם. אני אחזיק את זה איתך עכשיו.';
      case 'past':       return 'פתחת תנועה מהעבר. היא חלק מהמסלול שלך — נמשיך מכאן.';
      case 'area':
      default:           return 'פתחת מסלול ישן. אני אחזיק אותו כחלק מהמסלול הנוכחי שלך.';
    }
  }
  switch (aspect) {
    case 'reflection': return 'You opened an old reflection. I’ll hold it as part of your current trajectory.';
    case 'noticed':    return 'You opened something I noticed before. I’ll hold it with you now.';
    case 'past':       return 'You opened a past movement. It’s part of your trajectory — we continue from here.';
    case 'area':
    default:           return 'You opened an old path. I’ll hold it as part of your current trajectory.';
  }
}

export default function StrategyContextEcho() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();
  const [ctx, setCtx] = useState<StrategyContext | null>(null);

  useEffect(() => {
    const raw = readStrategyContext();
    if (!raw) return;
    const fresh =
      typeof raw.capturedAt === 'number' &&
      Date.now() - raw.capturedAt < MAX_AGE_MS;
    if (!fresh) {
      clearStrategyContext();
      return;
    }
    setCtx(raw);
    clearStrategyContext();
    // Best-effort artifact summon — silent if intent unknown.
    try {
      artifactBus.summonFromIntent('continue-journey', {
        origin: raw.origin,
        pillar: raw.pillar,
        step: raw.step,
      });
    } catch {
      /* artifact system optional */
    }
  }, []);

  if (!ctx) return null;

  const aspect = mapStep(ctx.step);
  const message = aspectCopy(aspect, isHe);

  const askAion = () => {
    try {
      sessionStorage.setItem('aion.strategyContext', JSON.stringify(ctx));
    } catch { /* ignore */ }
    navigate('/aurora');
  };
  const continueWithAion = () => navigate('/');
  const dismiss = () => setCtx(null);

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="mx-auto w-full max-w-md mb-6"
    >
      <div
        className={cn(
          'rounded-3xl px-5 py-4 backdrop-blur-2xl',
          'bg-foreground/[0.035] border border-white/[0.05]',
        )}
      >
        <div className="aion-text-soft text-[10px] tracking-[0.28em] uppercase opacity-60 mb-2 text-center">
          {isHe ? 'AION מבחין' : 'AION notices'}
        </div>
        <p className="text-foreground/85 text-[14px] leading-relaxed text-center text-balance">
          {message}
        </p>
        <p className="mt-2 text-foreground/45 text-[12px] leading-relaxed text-center text-balance">
          {isHe ? 'התחום הזה עדיין מתגבש.' : 'This area is still forming.'}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={askAion}
            className={cn(
              'inline-flex items-center justify-center rounded-full px-4 py-2 text-[12px]',
              'bg-foreground/90 text-background hover:bg-foreground transition-colors',
            )}
          >
            {isHe ? 'שאל את AION על זה' : 'Ask AION about this'}
          </button>
          <button
            type="button"
            onClick={continueWithAion}
            className={cn(
              'inline-flex items-center justify-center rounded-full px-4 py-2 text-[12px]',
              'bg-foreground/[0.04] hover:bg-foreground/[0.08] text-foreground/80 transition-colors',
              'border border-white/[0.06]',
            )}
          >
            {isHe ? 'המשך דרך AION' : 'Continue through AION'}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex items-center justify-center rounded-full px-3 py-2 text-[11px] text-foreground/45 hover:text-foreground/70 transition-colors"
          >
            {isHe ? 'סגור' : 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  );
}