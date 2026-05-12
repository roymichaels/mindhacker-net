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
import { useCallback, useEffect, useRef, useState } from 'react';
import { Menu, Mic, MicOff } from 'lucide-react';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { useAIONState } from '@/contexts/AIONStateContext';
import { useOverlay } from '@/shell/overlay/OverlayController';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { useAuroraVoiceMode } from '@/hooks/aurora/useAuroraVoiceMode';
import GlobalChatInput from '@/components/dashboard/GlobalChatInput';
import { cn } from '@/lib/utils';
import ArtifactLayer from './artifacts/ArtifactLayer';
import { emitArtifact } from './artifacts/artifactBus';

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
  const { state, setState } = useAIONState();
  const overlay = useOverlay();
  const { sendMessageRef } = useAuroraChatContext();
  const [chromeVisible, setChromeVisible] = useState(true);
  const hideTimerRef = useRef<number | null>(null);
  const [orbSize, setOrbSize] = useState(320);

  // Voice loop — re-uses existing transcribe + TTS pipeline.
  const voice = useAuroraVoiceMode({
    useGlobalResponseEvent: true,
    onSend: useCallback((text: string) => {
      sendMessageRef.current?.(text);
    }, [sendMessageRef]),
  });

  // Mirror voice state → AION live state so the orb reacts.
  useEffect(() => {
    if (!voice.isActive) return;
    if (voice.state === 'listening') setState('listening');
    else if (voice.state === 'processing') setState('thinking');
    else if (voice.state === 'speaking') setState('speaking');
    else setState('idle');
  }, [voice.isActive, voice.state, setState]);

  // Listen for assistant responses and surface a "next action" artifact when
  // the response contains an actionable instruction (numbered list / imperative).
  useEffect(() => {
    let lastEmittedAt = 0;
    function handler(e: Event) {
      const text = (e as CustomEvent<{ text?: string }>).detail?.text;
      if (!text) return;
      // Debounce: don't emit more than once per 12s
      if (Date.now() - lastEmittedAt < 12_000) return;
      const action = extractFirstActionLine(text);
      if (!action) return;
      lastEmittedAt = Date.now();
      emitArtifact({
        kind: 'next_action',
        title: action.length > 80 ? action.slice(0, 78) + '…' : action,
        cta: { label: 'פתח Play', href: '/play' },
        ttl: 12_000,
      });
    }
    window.addEventListener('aurora:response', handler);
    return () => window.removeEventListener('aurora:response', handler);
  }, []);

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

  const toggleVoice = useCallback(() => {
    if (voice.isActive) voice.close();
    else voice.open();
  }, [voice]);

  // Live caption — prefers user's live transcript, then assistant response.
  const caption =
    voice.isActive && voice.state === 'listening' && voice.userTranscript
      ? voice.userTranscript
      : voice.auroraResponse || (
        state === 'listening' ? 'מקשיב...' :
        state === 'thinking' ? 'חושב...' :
        state === 'speaking' ? '...' :
        'דבר אליי, או הקלד למטה.'
      );

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

      {/* Orb stage — tap toggles voice. */}
      <button
        type="button"
        aria-label={voice.isActive ? 'Stop voice' : 'Start voice'}
        onClick={toggleVoice}
        className="absolute inset-x-0 top-[14%] flex justify-center bg-transparent border-0 outline-none"
      >
        <PersonalizedOrb
          size={orbSize}
          state={mapToOrbState(state)}
          showGlow
        />
      </button>

      {/* Live caption */}
      <div className="absolute inset-x-6 bottom-[160px] text-center text-foreground/80 text-base leading-relaxed min-h-[3em]">
        <span className="opacity-90">{caption}</span>
      </div>

      {/* Floating artifacts (next actions, journal captures, plans) */}
      <ArtifactLayer bottomOffset={220} />

      {/* Voice toggle pill */}
      <div className="absolute inset-x-0 bottom-[112px] flex justify-center">
        <button
          type="button"
          onClick={toggleVoice}
          className={cn(
            'h-10 px-4 rounded-full backdrop-blur-md border text-xs font-medium flex items-center gap-2 transition-colors',
            voice.isActive
              ? 'bg-primary/20 border-primary/40 text-primary-foreground'
              : 'bg-card/40 border-white/10 text-foreground/80'
          )}
        >
          {voice.isActive ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
          {voice.isActive ? 'מצב קולי פעיל' : 'מצב קולי'}
        </button>
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