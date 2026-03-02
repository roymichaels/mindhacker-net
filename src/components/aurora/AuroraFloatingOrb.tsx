/**
 * AuroraFloatingOrb — Now lives inside the AuroraDock input bar.
 * When dock is closed, only the orb is visible (fixed bottom-right).
 * Clicking it opens the dock; clicking again closes it back to orb.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AuroraHoloOrb } from '@/components/aurora/AuroraHoloOrb';
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const ORB_SIZE = 48;

export function AuroraFloatingOrb() {
  const ctx = useAuroraChatContextSafe();
  const isMobile = useIsMobile();

  // Organic breathing animation
  const [breathPhase, setBreathPhase] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    let t = 0;
    const tick = () => {
      t += 0.018;
      setBreathPhase(t);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const breathScale = 1 + Math.sin(breathPhase * 0.8) * 0.05;
  const glowPulse = 0.2 + Math.sin(breathPhase * 1.2) * 0.1;

  // Drag state
  const defaultPos = useRef({ x: 0, y: 0 });
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragging = useRef(false);
  const dragStart = useRef({ px: 0, py: 0, ox: 0, oy: 0 });
  const didDrag = useRef(false);

  const getDefaultRight = () => isMobile ? 16 : 24;
  const getDefaultBottom = () => isMobile ? 80 : 24;

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    didDrag.current = false;
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);

    const rect = el.getBoundingClientRect();
    dragStart.current = {
      px: e.clientX,
      py: e.clientY,
      ox: rect.left,
      oy: rect.top,
    };
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current.px;
    const dy = e.clientY - dragStart.current.py;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDrag.current = true;
    if (!didDrag.current) return;

    const newLeft = dragStart.current.ox + dx;
    const newTop = dragStart.current.oy + dy;

    // Clamp inside viewport
    const maxX = window.innerWidth - ORB_SIZE;
    const maxY = window.innerHeight - ORB_SIZE;
    setPos({
      x: Math.max(0, Math.min(newLeft, maxX)),
      y: Math.max(0, Math.min(newTop, maxY)),
    });
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
    if (!didDrag.current && ctx) {
      ctx.setIsDockVisible(true);
    }
  }, [ctx]);

  if (!ctx) return null;
  if (ctx.isDockVisible) return null;

  const positionStyle = pos
    ? { left: pos.x, top: pos.y, right: 'auto' as const, bottom: 'auto' as const }
    : { right: getDefaultRight(), bottom: getDefaultBottom() };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        "fixed z-50 rounded-full cursor-grab active:cursor-grabbing",
        "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40",
        "ring-2 ring-primary/20 hover:ring-primary/40 transition-shadow",
        "select-none touch-none",
        "bg-background/60 backdrop-blur-md p-1"
      )}
      style={{
        ...positionStyle,
        width: ORB_SIZE,
        height: ORB_SIZE,
        transform: `scale(${breathScale})`,
        boxShadow: `0 0 ${16 + glowPulse * 20}px ${4 + glowPulse * 8}px hsl(var(--primary) / ${glowPulse})`,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      aria-label="Open Aurora"
      role="button"
      tabIndex={0}
    >
      <AuroraHoloOrb size={ORB_SIZE - 8} glow="full" />
    </motion.div>
  );
}

/** Inline orb for use inside the dock input bar */
export function AuroraDockOrb({ onClick }: { onClick: () => void }) {
  const [breathPhase, setBreathPhase] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    let t = 0;
    const tick = () => {
      t += 0.018;
      setBreathPhase(t);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const breathScale = 1 + Math.sin(breathPhase * 0.8) * 0.04;

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "rounded-full cursor-pointer shrink-0",
        "shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30",
        "ring-1 ring-primary/20 hover:ring-primary/40 transition-all",
        "bg-background/60 backdrop-blur-md p-0.5"
      )}
      style={{
        width: 44,
        height: 44,
        transform: `scale(${breathScale})`,
      }}
      onClick={onClick}
      aria-label="Close Aurora dock"
    >
      <AuroraHoloOrb size={36} glow="full" />
    </motion.button>
  );
}