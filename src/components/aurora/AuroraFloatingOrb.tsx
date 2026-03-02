/**
 * AuroraFloatingOrb — A floating widget that follows the mouse and toggles the Aurora dock.
 * Always visible. Follows cursor with a smooth spring effect.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { AuroraHoloOrb } from '@/components/aurora/AuroraHoloOrb';
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const ORB_SIZE = 56;

export function AuroraFloatingOrb() {
  const ctx = useAuroraChatContextSafe();
  const isMobile = useIsMobile();

  // Raw mouse position
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth - 80 : 300);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight - 80 : 300);

  // Smooth spring follow
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20, mass: 0.5 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20, mass: 0.5 });

  const isIdle = useRef(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (isMobile) return; // On mobile, don't follow mouse

    const handleMouseMove = (e: MouseEvent) => {
      // Offset so orb sits beside cursor, not on top
      mouseX.set(e.clientX - ORB_SIZE / 2);
      mouseY.set(e.clientY - ORB_SIZE / 2);

      isIdle.current = false;
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        isIdle.current = true;
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(idleTimer.current);
    };
  }, [isMobile, mouseX, mouseY]);

  const handleClick = useCallback(() => {
    if (!ctx) return;
    ctx.setIsDockVisible(!ctx.isDockVisible);
  }, [ctx]);

  if (!ctx) return null;

  // On mobile, use a fixed position instead of mouse follow
  if (isMobile) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(
          "fixed z-50 rounded-full cursor-pointer",
          "shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30",
          "ring-2 ring-primary/20 hover:ring-primary/40 transition-shadow",
          "touch-none select-none",
          "bg-background/80 backdrop-blur-sm p-1.5"
        )}
        style={{
          right: 16,
          bottom: 80,
          width: ORB_SIZE,
          height: ORB_SIZE,
        }}
        onClick={handleClick}
        aria-label="Toggle Aurora"
      >
        <AuroraHoloOrb size={ORB_SIZE - 12} glow="full" />
      </motion.button>
    );
  }

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        "fixed z-50 rounded-full cursor-pointer pointer-events-auto",
        "shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30",
        "ring-2 ring-primary/20 hover:ring-primary/40 transition-shadow",
        "select-none",
        "bg-background/80 backdrop-blur-sm p-1.5"
      )}
      style={{
        left: springX,
        top: springY,
        width: ORB_SIZE,
        height: ORB_SIZE,
      }}
      onClick={handleClick}
      aria-label="Toggle Aurora"
    >
      <AuroraHoloOrb size={ORB_SIZE - 12} glow="full" />
    </motion.button>
  );
}
