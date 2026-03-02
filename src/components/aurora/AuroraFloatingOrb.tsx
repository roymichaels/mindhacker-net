/**
 * AuroraFloatingOrb — A draggable floating widget that toggles the Aurora dock.
 * Persists position across renders. Shows only when dock is hidden.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AuroraHoloOrb } from '@/components/aurora/AuroraHoloOrb';
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'aurora-orb-pos';
const ORB_SIZE = 56;

function getDefaultPos(isMobile: boolean) {
  return {
    x: isMobile ? window.innerWidth - ORB_SIZE - 16 : window.innerWidth - ORB_SIZE - 24,
    y: isMobile ? window.innerHeight - ORB_SIZE - 80 : window.innerHeight - ORB_SIZE - 24,
  };
}

function clampPos(x: number, y: number) {
  return {
    x: Math.max(8, Math.min(window.innerWidth - ORB_SIZE - 8, x)),
    y: Math.max(8, Math.min(window.innerHeight - ORB_SIZE - 8, y)),
  };
}

export function AuroraFloatingOrb() {
  const ctx = useAuroraChatContextSafe();
  const isMobile = useIsMobile();
  const [pos, setPos] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return clampPos(parsed.x, parsed.y);
      }
    } catch {}
    return getDefaultPos(isMobile);
  });

  const isDragging = useRef(false);
  const hasMoved = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  // Re-clamp on resize
  useEffect(() => {
    const handler = () => setPos(p => clampPos(p.x, p.y));
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Save position
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  }, [pos]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    hasMoved.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY, posX: pos.x, posY: pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasMoved.current = true;
    setPos(clampPos(dragStart.current.posX + dx, dragStart.current.posY + dy));
  }, []);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
    if (!hasMoved.current && ctx) {
      // Click — show dock (collapsed)
      ctx.setIsDockVisible(true);
    }
  }, [ctx]);

  if (!ctx || ctx.isDockVisible) return null;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        "fixed z-50 rounded-full cursor-grab active:cursor-grabbing",
        "shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30",
        "ring-2 ring-primary/20 hover:ring-primary/40 transition-shadow",
        "touch-none select-none",
        "bg-background/80 backdrop-blur-sm p-1.5"
      )}
      style={{
        left: pos.x,
        top: pos.y,
        width: ORB_SIZE,
        height: ORB_SIZE,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      aria-label="Open Aurora"
    >
      <AuroraHoloOrb size={ORB_SIZE - 12} glow="full" />
    </motion.button>
  );
}
