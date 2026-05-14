import { useEffect, useRef, useState } from "react";

/**
 * Shared pinch / drag / wheel-zoom gesture hook for SVG graph surfaces.
 * Returns a transform `{ tx, ty, k }` and pointer handlers to spread on the
 * container element. Same behaviour as the inline gestures inside
 * `BrainGraphForce`, extracted so the atlas can reuse it without duplication.
 */
export interface GraphTransform { tx: number; ty: number; k: number }

export function useGraphGestures(initial: { tx: number; ty: number; k?: number }) {
  const [t, setT] = useState<GraphTransform>({ tx: initial.tx, ty: initial.ty, k: initial.k ?? 1 });
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number; pid: number } | null>(null);
  const pinchRef = useRef<{ d: number; k: number } | null>(null);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());

  // Re-center when the container resizes (caller may pass new initial).
  useEffect(() => {
    setT((p) => ({ ...p, tx: initial.tx, ty: initial.ty }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.tx, initial.ty]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      dragRef.current = { x: e.clientX, y: e.clientY, tx: t.tx, ty: t.ty, pid: e.pointerId };
    } else if (pointers.current.size === 2) {
      const pts = Array.from(pointers.current.values());
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchRef.current = { d, k: t.k };
      dragRef.current = null;
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinchRef.current && pointers.current.size >= 2) {
      const pts = Array.from(pointers.current.values());
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const k = Math.max(0.4, Math.min(3, pinchRef.current.k * (d / pinchRef.current.d)));
      setT((p) => ({ ...p, k }));
    } else {
      const drag = dragRef.current;
      if (drag && drag.pid === e.pointerId) {
        const dx = e.clientX - drag.x;
        const dy = e.clientY - drag.y;
        setT((p) => ({ ...p, tx: drag.tx + dx, ty: drag.ty + dy }));
      }
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchRef.current = null;
    if (pointers.current.size === 0) dragRef.current = null;
  };
  const onWheel = (e: React.WheelEvent) => {
    const factor = Math.exp(-e.deltaY * 0.0015);
    setT((p) => ({ ...p, k: Math.max(0.4, Math.min(3, p.k * factor)) }));
  };

  return {
    transform: t,
    setTransform: setT,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onWheel,
    },
  };
}