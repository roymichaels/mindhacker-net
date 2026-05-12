/**
 * InteractiveAION — Phase 1 skeleton of the immersive AION mode.
 *
 * See `.lovable/plan.md` (section "Interactive AION Mode").
 *
 * This phase wires only:
 *   - Full-bleed dark backdrop
 *   - Centered orb (PersonalizedOrb), bound to AIONStateContext
 *   - Auto-hiding top chrome (drawer + env pill slots)
 *   - Static placeholder for live caption + composer
 *
 * Voice loop, artifacts, hypnosis layer, focus modifier, and pull-up
 * chat history sheet are NOT in this phase.
 */
import { useEffect, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { useAIONState } from '@/contexts/AIONStateContext';
import { useOverlay } from '@/shell/overlay/OverlayController';
import GlobalChatInput from '@/components/dashboard/GlobalChatInput';
import { cn } from '@/lib/utils';

const CHROME_HIDE_MS = 3000;

/** Maps live AION state → orb visual state (the orb supports a smaller set). */
function mapToOrbState(s: ReturnType<typeof useAIONState>['state']) {
  switch (s) {
    case 'listening': return 'listening' as const;
    case 'thinking': return 'thinking' as const;
    case 'speaking': return 'speaking' as const;
    case 'guiding': return 'thinking' as const;
    case 'immersive': return 'session' as const;
    case 'idle':
    default: return 'idle' as const;
  }
}

export default function InteractiveAION() {
  const { state } = useAIONState();
  const overlay = useOverlay();
  const [chromeVisible, setChromeVisible] = useState(true);
  const hideTimerRef = useRef<number | null>(null);
  const [orbSize, setOrbSize] = useState(320);

  // Scale orb to viewport so it dominates the upper half on phones.
  useEffect(() => {
    function compute() {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      // ~52% viewport height, capped by width
      const target = Math.min(Math.round(vh * 0.52), Math.round(vw * 0.85), 520);
      setOrbSize(target);
    }
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  // Auto-hide chrome after idle. Any tap reveals it for CHROME_HIDE_MS.
  useEffect(() => {
    function bump() {
      setChromeVisible(true);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = window.setTimeout(() => setChromeVisible(false), CHROME_HIDE_MS);
    }
    bump();
    window.addEventListener('pointerdown', bump);
    return () => {
      window.removeEventListener('pointerdown', bump);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  // Subtle radial backdrop tint based on state.
  const backdropTint =
    state === 'speaking' ? 'from-primary/20'
    : state === 'listening' ? 'from-primary/15'
    : state === 'immersive' ? 'from-primary/30'
    : 'from-primary/10';

  return (
    <div className="fixed inset-0 z-30 bg-background overflow-hidden touch-none select-none">
      {/* Radial mood backdrop, centered on the orb. */}
      <div
        aria-hidden
        className={cn(
          'absolute inset-0 bg-gradient-radial to-background transition-colors duration-700',
          backdropTint,
        )}
        style={{
          backgroundImage: `radial-gradient(60% 50% at 50% 38%, hsl(var(--primary) / 0.18), transparent 70%)`,
        }}
      />

      {/* Top chrome — auto-hides */}
      <div
        className={cn(
          'absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+10px)] transition-opacity duration-300',
          chromeVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
      >
        <button
          aria-label="Open menu"
          onClick={() => overlay.open('drawer')}
          className="h-11 w-11 rounded-full bg-card/40 backdrop-blur-md border border-white/5 flex items-center justify-center text-foreground/80 hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          onClick={() => overlay.open('env')}
          className="h-11 px-4 rounded-full bg-card/40 backdrop-blur-md border border-white/5 text-sm font-medium text-foreground/90"
        >
          AION ▾
        </button>

        <div className="h-11 w-11" aria-hidden />
      </div>

      {/* Orb stage — the anchor */}
      <div className="absolute inset-x-0 top-[14%] flex justify-center pointer-events-none">
        <PersonalizedOrb
          size={orbSize}
          state={mapToOrbState(state)}
          showGlow
        />
      </div>

      {/* Live caption placeholder (Phase 3 wires real content). */}
      <div className="absolute inset-x-0 top-[calc(14%+var(--orb-h,0px))]" />
      <div className="absolute inset-x-6 bottom-[148px] text-center text-foreground/70 text-base leading-relaxed">
        {state === 'listening' && 'מקשיב...'}
        {state === 'thinking' && 'חושב...'}
        {state === 'speaking' && '...'}
        {(state === 'idle' || state === 'guiding' || state === 'immersive') && (
          <span className="opacity-70">דבר אליי, או הקלד למטה.</span>
        )}
      </div>

      {/* Composer — secondary, minimal */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <div className="mx-auto w-full max-w-screen-md">
          <div className="rounded-3xl border border-white/10 bg-card/70 backdrop-blur-xl px-2 py-2">
            <GlobalChatInput />
          </div>
        </div>
      </div>
    </div>
  );
}