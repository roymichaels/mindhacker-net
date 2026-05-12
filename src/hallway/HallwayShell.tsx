/**
 * HallwayShell — preview of the consciousness-OS world layer.
 *
 * Persistent OrbView at center, swipe-able rooms, no tab bar, no dashboard
 * chrome. Mounted at /hallway as an opt-in preview while we validate the
 * direction. The orb is never unmounted across room transitions.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { OrbView } from '@/components/orb/v2/OrbView';
import { ROOMS, getRoom, type RoomDef } from './rooms';
import { ChevronLeft, ChevronRight, Mic, Keyboard, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

function RoomAmbient({ room }: { room: RoomDef }) {
  // Soft radial wash whose color follows the active room's hue.
  // No gradients/shadows on UI surfaces — this is environmental, not chrome.
  const bg = `radial-gradient(circle at 50% 45%, hsl(${room.hue} 70% 18% / 0.55), hsl(${room.hue} 60% 6% / 0.95) 70%)`;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 transition-[background] duration-[1200ms] ease-out"
      style={{ background: bg }}
    />
  );
}

export default function HallwayShell() {
  const { language, isRTL } = useTranslation();
  const [index, setIndex] = useState(0);
  const room = ROOMS[index];

  const go = useCallback((dir: -1 | 1) => {
    setIndex((i) => (i + dir + ROOMS.length) % ROOMS.length);
  }, []);

  // Keyboard navigation between rooms (preview affordance)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(isRTL ? -1 : 1);
      if (e.key === 'ArrowLeft') go(isRTL ? 1 : -1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, isRTL]);

  // Touch swipe
  const [touchX, setTouchX] = useState<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => setTouchX(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 48) go(dx < 0 ? (isRTL ? -1 : 1) : (isRTL ? 1 : -1));
    setTouchX(null);
  };

  const tint = `hsl(${room.hue} 90% 65%)`;
  const invite = language === 'he' ? room.inviteHe : room.inviteEn;
  const name = language === 'he' ? room.nameHe : room.nameEn;

  return (
    <div
      className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-background text-foreground"
      dir={isRTL ? 'rtl' : 'ltr'}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <RoomAmbient room={room} />

      {/* Minimal header — room name + overflow only */}
      <header className="flex items-center justify-between px-5 pt-[env(safe-area-inset-top)] h-14 shrink-0">
        <button
          onClick={() => go(isRTL ? 1 : -1)}
          className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.04] text-white/60 hover:text-white"
          aria-label="Previous room"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
            {language === 'he' ? 'מסדרון' : 'Hallway'}
          </span>
          <span className="text-sm font-medium text-white/90">{name}</span>
        </div>
        <button
          onClick={() => go(isRTL ? -1 : 1)}
          className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.04] text-white/60 hover:text-white"
          aria-label="Next room"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </header>

      {/* Center: persistent orb + room invitation */}
      <main className="relative flex flex-1 flex-col items-center justify-center gap-8 px-6">
        <div className="relative">
          <OrbView
            size={260}
            tier="cinematic"
            state="idle"
            tintHue={tint}
            ariaLabel={`AION presence — ${name}`}
          />
          {/* Room glyph — symbolic geometry placeholder */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 grid place-items-center text-[120px] font-thin text-white/[0.04]"
          >
            {room.glyph}
          </div>
        </div>

        <p
          className={cn(
            'max-w-xs text-center text-base font-light leading-relaxed text-white/70',
            'transition-opacity duration-700'
          )}
          key={room.id}
        >
          {invite}
        </p>

        {/* Room dots */}
        <div className="flex items-center gap-2">
          {ROOMS.map((r, i) => (
            <button
              key={r.id}
              onClick={() => setIndex(i)}
              aria-label={`Enter ${r.nameEn}`}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === index ? 'w-6 bg-white/80' : 'w-1.5 bg-white/20'
              )}
            />
          ))}
        </div>
      </main>

      {/* Bottom: voice-first dock */}
      <footer className="shrink-0 px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
        <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-white/[0.04] backdrop-blur-xl px-4 py-3">
          <button
            className="grid h-12 w-12 place-items-center rounded-full text-white"
            style={{ background: `hsl(${room.hue} 70% 50%)` }}
            aria-label="Hold to speak"
          >
            <Mic className="h-5 w-5" />
          </button>
          <span className="flex-1 text-sm text-white/50">
            {language === 'he' ? 'לחץ כדי לדבר עם AION' : 'Hold to speak with AION'}
          </span>
          <button
            className="grid h-9 w-9 place-items-center rounded-full text-white/60 hover:text-white"
            aria-label="Type"
          >
            <Keyboard className="h-4 w-4" />
          </button>
          <button
            className="grid h-9 w-9 place-items-center rounded-full text-white/60 hover:text-white"
            aria-label="More"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}