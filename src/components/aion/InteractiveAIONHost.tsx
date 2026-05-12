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
import { useEffect, useState, useRef, Suspense, Component, ReactNode } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { lazyWithRetry } from '@/lib/lazyWithRetry';

const InteractiveAION = lazyWithRetry(
  () => import('./InteractiveAION'),
  'InteractiveAION'
);

/** Tiny inline error boundary so a chunk-load failure doesn't kill the host. */
class InteractiveErrorBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.hasError ? null : this.props.children; }
}

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

  return (
    <>
      {/* Backdrop — fades, dismisses on tap */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={
          'fixed inset-0 z-[75] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ' +
          (open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')
        }
      />
      {/* Slide-in panel from the LEFT edge */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Interactive AION"
        className={
          'fixed top-0 bottom-0 left-0 z-[80] w-full sm:w-[440px] md:w-[480px] ' +
          'bg-background shadow-[0_0_60px_rgba(0,0,0,0.5)] ' +
          'transform-gpu transition-transform duration-[360ms] ease-[cubic-bezier(.22,.61,.36,1)] will-change-transform ' +
          (open ? 'translate-x-0' : '-translate-x-full')
        }
      >
        {open && (
          <InteractiveErrorBoundary
            onError={() => {
              toast.error('מצב AION לא זמין כרגע — נסה שוב');
              setOpen(false);
            }}
          >
            <Suspense
              fallback={
                <div className="absolute inset-0 bg-background/95 backdrop-blur-md flex items-center justify-center text-foreground/60 text-sm">
                  טוען…
                </div>
              }
            >
              <InteractiveAION />
            </Suspense>
          </InteractiveErrorBoundary>
        )}
        {/* Close affordance — pinned to the panel's right edge */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="סגור מצב AION"
          className="absolute z-[90] top-[calc(env(safe-area-inset-top)+12px)] right-3 h-11 w-11 rounded-full bg-card/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-foreground/80 hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </aside>
    </>
  );
}

/** Imperative helper for callers. */
export function openInteractiveAION() {
  window.dispatchEvent(new CustomEvent('aion:open-interactive', { detail: { open: true } }));
}

export function closeInteractiveAION() {
  window.dispatchEvent(new CustomEvent('aion:open-interactive', { detail: { open: false } }));
}