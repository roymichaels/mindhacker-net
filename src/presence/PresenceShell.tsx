/**
 * PresenceShell — the state-space root for MindOS.
 *
 * Phase 3.2 of the world-first rebuild. The user does NOT pick a room.
 * AION (or passive signals) move them through states. The hallway *is* the
 * indicator of where you are. There is no list of rooms, no dot pager, no
 * swipe-to-cycle. The only deliberate gestures are vertical zoom (↑ inner
 * map, ↓ artifacts) and "speak to AION".
 *
 * Composition contract:
 *  - The orb is NOT mounted here. The canonical AION presence is the global
 *    SharedOrbStage + AIONPresenceButton already living at the app root.
 *  - This shell subscribes to `useActiveState` — the SSOT for the current
 *    state. Mutations only happen through `setActiveState` (AION runtime,
 *    `presenceSignals`, or the global transition bridge).
 *  - All graph mutations happen through `memory-writer` (Phase 3.2), not here.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getRoomBySlug } from '@/hallway/rooms';
import { openInteractiveAION } from '@/components/aion/InteractiveAIONHost';
import GraphCanvas from './GraphCanvas';
import ArtifactsDock from './ArtifactsDock';
import StateTransition from './StateTransition';
import {
  installGlobalTransitionBridge,
  setActiveState,
  useActiveRoom,
  useActiveState,
} from './useActiveState';
import { evaluateSignals } from './presenceSignals';

const SWIPE_THRESHOLD = 48;
const SIGNAL_POLL_MS = 5 * 60_000;

type Drawer = 'graph' | 'artifacts' | null;

export default function PresenceShell({ initialRoomSlug }: { initialRoomSlug?: string }) {
  const { language, isRTL } = useLanguage();
  const lang = language === 'he' ? 'he' : 'en';

  // Install the global transition bridge once. Lets non-React surfaces
  // (chat handlers, AION runtime callbacks) move the user without prop
  // drilling. Never expose a UI to call this.
  useEffect(() => {
    installGlobalTransitionBridge();
  }, []);

  // Honour an initial slug exactly once on mount (deep link from auth flow,
  // notification, etc.). This is *not* a router — it's a one-shot seed.
  useEffect(() => {
    if (!initialRoomSlug) return;
    const r = getRoomBySlug(initialRoomSlug);
    if (r) setActiveState(r.id, 'manual', 'Resumed where you left off.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Passive signal evaluator. Suggests transitions; never forces a modal.
  useEffect(() => {
    const tick = () => {
      const suggestion = evaluateSignals();
      if (suggestion) setActiveState(suggestion.roomId, 'signal', suggestion.reason);
    };
    tick();
    const id = window.setInterval(tick, SIGNAL_POLL_MS);
    const onFocus = () => tick();
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const room = useActiveRoom();
  const activeState = useActiveState();
  const [drawer, setDrawer] = useState<Drawer>(null);

  // Vertical-only gesture handling. Horizontal swipes are intentionally
  // ignored — the user does not "page through" rooms.
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const start = touchStart.current;
      touchStart.current = null;
      if (!start) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      if (Math.max(ax, ay) < SWIPE_THRESHOLD) return;
      if (ay <= ax) return; // ignore horizontal swipes — no room paging
      if (dy < 0) setDrawer('graph');
      else setDrawer('artifacts');
    },
    [],
  );

  // Keyboard fallback — vertical only. Arrow ←/→ no longer cycles rooms.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (drawer) {
        if (e.key === 'Escape') setDrawer(null);
        return;
      }
      if (e.key === 'ArrowUp') setDrawer('graph');
      else if (e.key === 'ArrowDown') setDrawer('artifacts');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawer]);

  const { hue, saturation, lightness } = room.ambience;
  const ambient: React.CSSProperties = {
    background: `radial-gradient(80% 60% at 50% 30%, hsl(${hue} ${saturation}% ${lightness}% / 0.55) 0%, hsl(${hue} ${Math.max(20, saturation - 30)}% ${Math.max(6, lightness - 10)}% / 0.25) 55%, transparent 100%)`,
    transition: 'background 700ms ease',
  };

  // The whisper line: prefer an AION/signal-supplied reason if one exists,
  // otherwise fall back to the room's own entry whisper. This is the *only*
  // surface that reveals "you just moved" — no breadcrumbs, no toasts.
  const whisper =
    activeState.reason && activeState.source !== 'boot'
      ? activeState.reason
      : room.copy.entryWhisper[lang];

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      data-presence-shell
      data-room-id={room.id}
      data-aion-mode={room.aion}
      data-state-source={activeState.source}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={ambient} />
      <StateTransition />

      {/* Top: ambient state name. Not a "lens chooser" — just where you are. */}
      <header className="pointer-events-none flex flex-col items-center pt-10 text-center">
        <h1 className="text-base font-light tracking-wide text-foreground/70">
          {room.copy.label[lang]}
        </h1>
      </header>

      {/* Middle: reserved space for the global orb (mounted at app root). */}
      <div className="flex-1" />

      {/* AION whisper — the only "you moved" indicator */}
      <section
        aria-label={lang === 'he' ? 'אַיון לוחש' : 'AION whispers'}
        className="pointer-events-none mx-auto max-w-md px-6 pb-2 text-center"
      >
        <p key={activeState.changedAt} className="animate-in fade-in text-sm italic text-foreground/85 duration-700">
          “{whisper}”
        </p>
      </section>

      {/* Talk-to-AION dock — primary action, always present */}
      <div className="mx-auto w-full max-w-md px-6 pb-3">
        <button
          type="button"
          onClick={() => openInteractiveAION()}
          className="w-full rounded-full border border-border/60 bg-card/40 px-5 py-3 text-sm text-muted-foreground backdrop-blur-md transition-colors hover:bg-card/60 hover:text-foreground"
        >
          {lang === 'he' ? 'דבר עם אַיון…' : 'Speak to AION…'}
        </button>
      </div>

      {/* Vertical gesture affordances only. No room list. */}
      <div className="pointer-events-none flex items-center justify-between px-4 pb-6 pt-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60">
        <span>↑ {lang === 'he' ? 'מפה פנימית' : 'inner map'}</span>
        <span>↓ {lang === 'he' ? 'חפצים' : 'artifacts'}</span>
      </div>

      {/* Drawers */}
      {drawer === 'graph' && (
        <Drawer onClose={() => setDrawer(null)} from="top" lang={lang}>
          <GraphCanvas />
        </Drawer>
      )}
      {drawer === 'artifacts' && (
        <Drawer onClose={() => setDrawer(null)} from="bottom" lang={lang}>
          <ArtifactsDock roomId={room.id} />
        </Drawer>
      )}
    </div>
  );
}

function Drawer({
  children,
  onClose,
  from,
  lang,
}: {
  children: React.ReactNode;
  onClose: () => void;
  from: 'top' | 'bottom';
  lang: 'en' | 'he';
}) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background/85 backdrop-blur-xl">
      <button
        type="button"
        onClick={onClose}
        aria-label={lang === 'he' ? 'סגור' : 'Close'}
        className={`absolute ${from === 'top' ? 'bottom-6' : 'top-6'} left-1/2 -translate-x-1/2 rounded-full border border-border/60 bg-card/40 px-4 py-2 text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground`}
      >
        {lang === 'he' ? 'סגור' : 'close'}
      </button>
      <div className="flex-1 overflow-auto p-6">{children}</div>
    </div>
  );
}

export { getRoomBySlug };