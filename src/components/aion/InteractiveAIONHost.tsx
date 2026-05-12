/**
 * InteractiveAIONHost — global mount point for Interactive AION Mode.
 *
 * Lets any UI open the immersive AION surface as a full-screen overlay,
 * independently of the `?ff_interactive_mode=1` flag on /aurora.
 *
 * Trigger sources:
 *   1. Header orb tap → dispatches `aion:open-interactive`
 *   2. Edge swipe from the screen's left edge (>80px right delta)
 *   3. Programmatic: window.dispatchEvent(new CustomEvent('aion:open-interactive', { detail: { open: true } }))
 *
 * Close: top-right X button, Escape, or `aion:open-interactive` with `open: false`.
 */
import { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { X } from 'lucide-react';

const InteractiveAION = lazy(() => import('./InteractiveAION'));

const EDGE_THRESHOLD_PX = 24;
const SWIPE_TRIGGER_PX = 80;

export default function InteractiveAIONHost() {
  const [open, setOpen] = useState(false);
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null);

  // Global open/close event
  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent<{ open?: boolean } | undefined>).detail;
      if (detail && typeof detail.open === 'boolean') setOpen(detail.open);
      else setOpen((v) => !v);
    }
    window.addEventListener('aion:open-interactive', handler);
    return () => window.removeEventListener('aion:open-interactive', handler);
  }, []);

  // Escape closes
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Edge swipe from left → right opens.
  useEffect(() => {
    if (open) return;
    function onStart(e: TouchEvent) {
      const t = e.touches[0];
      if (!t) return;
      if (t.clientX <= EDGE_THRESHOLD_PX) {
        startRef.current = { x: t.clientX, y: t.clientY, t: Date.now() };
      } else {
        startRef.current = null;
      }
    }
    function onMove(e: TouchEvent) {
      const start = startRef.current;
      if (!start) return;
      const t = e.touches[0];
      if (!t) return;
      const dx = t.clientX - start.x;
      const dy = Math.abs(t.clientY - start.y);
      if (dx > SWIPE_TRIGGER_PX && dy < 60 && Date.now() - start.t < 600) {
        startRef.current = null;
        setOpen(true);
      }
    }
    function onEnd() { startRef.current = null; }
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    window.addEventListener('touchcancel', onEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] animate-fade-in">
      <Suspense fallback={<div className="fixed inset-0 bg-background z-[80]" />}>
        <InteractiveAION />
      </Suspense>
      {/* Close affordance */}
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="סגור מצב AION"
        className="fixed z-[90] top-[calc(env(safe-area-inset-top)+12px)] end-3 h-11 w-11 rounded-full bg-card/40 backdrop-blur-md border border-white/5 flex items-center justify-center text-foreground/80 hover:text-foreground"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

/** Imperative helper for callers. */
export function openInteractiveAION() {
  window.dispatchEvent(new CustomEvent('aion:open-interactive', { detail: { open: true } }));
}

export function closeInteractiveAION() {
  window.dispatchEvent(new CustomEvent('aion:open-interactive', { detail: { open: false } }));
}