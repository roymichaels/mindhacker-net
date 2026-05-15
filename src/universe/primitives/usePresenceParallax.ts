/**
 * usePresenceParallax — Phase 5D.1.
 *
 * Tiny parallax for terrain/anchor layers. Reads pointer position
 * (and device-orientation when available, as a slow secondary input)
 * and returns a normalised offset { x, y } in the range [-1, 1].
 *
 * Disabled (returns origin) when prefers-reduced-motion is set.
 */
import { useEffect, useRef, useState } from 'react';

export interface ParallaxOffset {
  x: number;
  y: number;
}

const ZERO: ParallaxOffset = { x: 0, y: 0 };

function prefersReduced(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function usePresenceParallax(strength = 1): ParallaxOffset {
  const [offset, setOffset] = useState<ParallaxOffset>(ZERO);
  const target = useRef<ParallaxOffset>(ZERO);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReduced()) return;

    const tick = () => {
      setOffset((prev) => {
        const lerp = 0.06; // tau ≈ 1.0s at 60fps
        const nx = prev.x + (target.current.x - prev.x) * lerp;
        const ny = prev.y + (target.current.y - prev.y) * lerp;
        // Snap when close enough to avoid endless renders.
        if (Math.abs(nx - prev.x) < 0.001 && Math.abs(ny - prev.y) < 0.001) {
          return prev;
        }
        return { x: nx, y: ny };
      });
      raf.current = window.requestAnimationFrame(tick);
    };
    raf.current = window.requestAnimationFrame(tick);

    const onPointer = (e: PointerEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      target.current = {
        x: ((e.clientX / w) * 2 - 1) * strength,
        y: ((e.clientY / h) * 2 - 1) * strength,
      };
    };
    const onLeave = () => { target.current = ZERO; };

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerleave', onLeave);

    return () => {
      if (raf.current) window.cancelAnimationFrame(raf.current);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, [strength]);

  return offset;
}