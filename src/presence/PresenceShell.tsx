/**
 * PresenceShell — the state-space root for MindOS.
 *
 * Phase 3.1 of the world-first rebuild. Replaces the homepage / dashboard
 * mental model. There is no card grid, no menu, no list of features. The
 * authenticated user enters into AION's *presence*; rooms are lateral
 * ambient lenses; the graph (up) and artifacts (down) are drawers.
 *
 * Composition contract:
 *  - The orb is NOT mounted here. The canonical AION presence is the global
 *    SharedOrbStage + AIONPresenceButton already living at the app root.
 *  - This shell only provides: ambient room background, room label, AION
 *    entry whisper, and gesture affordances for traversal.
 *  - All graph mutations happen through `memory-writer` (Phase 3.2), not here.
 *
 * Gestures:
 *  - swipe ←/→  : switch active room (lens)
 *  - swipe ↑    : open Graph drawer (zoomable subconscious atlas)
 *  - swipe ↓    : open Artifacts drawer (today's mission, journal, hypnosis…)
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { listRooms, getRoomBySlug } from '@/hallway/rooms';
import type { RoomDefinition } from '@/hallway/types';
import { openInteractiveAION } from '@/components/aion/InteractiveAIONHost';
import GraphCanvas from './GraphCanvas';
import ArtifactsDock from './ArtifactsDock';

const SWIPE_THRESHOLD = 48;

type Drawer = 'graph' | 'artifacts' | null;

export default function PresenceShell({ initialRoomSlug }: { initialRoomSlug?: string }) {
  const { language, isRTL } = useLanguage();
  const lang = language === 'he' ? 'he' : 'en';
  const rooms = useMemo(() => listRooms(), []);

  const startingIndex = useMemo(() => {
    const found = initialRoomSlug ? rooms.findIndex((r) => r.slug === initialRoomSlug) : -1;
    return found >= 0 ? found : 0;
  }, [initialRoomSlug, rooms]);

  const [roomIndex, setRoomIndex] = useState(startingIndex);
  const [drawer, setDrawer] = useState<Drawer>(null);
  const room: RoomDefinition = rooms[roomIndex];

  // Touch gesture handling — single-pointer, threshold-based.
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }, []);

  const advance = useCallback(
    (dir: 1 | -1) => {
      // Mirror direction in RTL so swipe always feels physical.
      const effective = (isRTL ? (dir * -1) : dir) as 1 | -1;
      setRoomIndex((i) => (i + effective + rooms.length) % rooms.length);
    },
    [isRTL, rooms.length],
  );

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
      if (ax > ay) {
        advance(dx < 0 ? 1 : -1);
      } else if (dy < 0) {
        setDrawer('graph');
      } else {
        setDrawer('artifacts');
      }
    },
    [advance],
  );

  // Keyboard fallback for desktop preview / accessibility.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (drawer) {
        if (e.key === 'Escape') setDrawer(null);
        return;
      }
      if (e.key === 'ArrowRight') advance(1);
      else if (e.key === 'ArrowLeft') advance(-1);
      else if (e.key === 'ArrowUp') setDrawer('graph');
      else if (e.key === 'ArrowDown') setDrawer('artifacts');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, drawer]);

  const { hue, saturation, lightness } = room.ambience;
  const ambient: React.CSSProperties = {
    background: `radial-gradient(80% 60% at 50% 30%, hsl(${hue} ${saturation}% ${lightness}% / 0.55) 0%, hsl(${hue} ${Math.max(20, saturation - 30)}% ${Math.max(6, lightness - 10)}% / 0.25) 55%, transparent 100%)`,
    transition: 'background 700ms ease',
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      data-presence-shell
      data-room-id={room.id}
      data-aion-mode={room.aion}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={ambient} />

      {/* Top: ambient room label */}
      <header className="pointer-events-none flex flex-col items-center pt-10 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground/80">
          {lang === 'he' ? 'עדשה פעילה' : 'Active lens'}
        </p>
        <h1 className="mt-2 text-lg font-light text-foreground/90">
          {room.copy.label[lang]}
        </h1>
        <p className="mt-1 max-w-[280px] text-xs text-muted-foreground">
          {room.copy.tagline[lang]}
        </p>
      </header>

      {/* Middle: reserved space for the global orb (mounted at app root). */}
      <div className="flex-1" />

      {/* AION entry whisper — single-line state cue */}
      <section
        aria-label={lang === 'he' ? 'אַיון לוחש' : 'AION whispers'}
        className="pointer-events-none mx-auto max-w-md px-6 pb-2 text-center"
      >
        <p className="text-sm italic text-foreground/85">
          “{room.copy.entryWhisper[lang]}”
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

      {/* Room dots — minimal positional hint, not a tab bar */}
      <div className="flex items-center justify-center gap-2 pb-4">
        {rooms.map((r, i) => (
          <button
            key={r.id}
            type="button"
            aria-label={r.copy.label[lang]}
            onClick={() => setRoomIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === roomIndex ? 'w-6 bg-foreground/80' : 'w-1.5 bg-foreground/25'
            }`}
          />
        ))}
      </div>

      {/* Gesture affordances */}
      <div className="pointer-events-none flex items-center justify-between px-4 pb-6 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60">
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