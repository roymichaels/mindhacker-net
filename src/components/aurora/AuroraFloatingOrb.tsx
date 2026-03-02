/**
 * AuroraFloatingOrb — Follows the mouse with organic, living motion.
 * Always visible. Clicking toggles the bottom chat dock.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { AuroraHoloOrb } from '@/components/aurora/AuroraHoloOrb';
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const ORB_SIZE = 52;
const HALF = ORB_SIZE / 2;

export function AuroraFloatingOrb() {
  const ctx = useAuroraChatContextSafe();
  const isMobile = useIsMobile();

  // Raw mouse coords (center of orb)
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth - 80 : 300);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight - 80 : 300);

  // Smooth spring — soft, organic lag with loose follow (doesn't reach cursor fully)
  const springConfig = { stiffness: 40, damping: 12, mass: 1.2 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Organic breathing / idle animation
  const [breathPhase, setBreathPhase] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    let t = 0;
    const tick = () => {
      t += 0.02;
      setBreathPhase(t);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Organic offset that makes it feel alive
  const breathOffsetX = Math.sin(breathPhase * 1.3) * 3 + Math.sin(breathPhase * 2.7) * 1.5;
  const breathOffsetY = Math.cos(breathPhase * 1.1) * 4 + Math.cos(breathPhase * 3.1) * 1.2;
  const breathScale = 1 + Math.sin(breathPhase * 0.8) * 0.04;

  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Center the orb on the cursor
      mouseX.set(e.clientX - HALF);
      mouseY.set(e.clientY - HALF);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile, mouseX, mouseY]);

  const handleClick = useCallback(() => {
    if (!ctx) return;
    ctx.setIsDockVisible(!ctx.isDockVisible);
  }, [ctx]);

  if (!ctx) return null;

  // Mobile: fixed position, no mouse follow
  if (isMobile) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(
          "fixed z-50 rounded-full cursor-pointer",
          "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40",
          "ring-2 ring-primary/20 hover:ring-primary/40 transition-shadow",
          "touch-none select-none",
          "bg-background/60 backdrop-blur-md p-1"
        )}
        style={{ right: 16, bottom: 80, width: ORB_SIZE, height: ORB_SIZE }}
        onClick={handleClick}
        aria-label="Toggle Aurora"
      >
        <AuroraHoloOrb size={ORB_SIZE - 8} glow="full" />
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
        "shadow-[0_0_20px_4px_hsl(var(--primary)/0.25)] hover:shadow-[0_0_30px_8px_hsl(var(--primary)/0.4)]",
        "ring-1 ring-primary/15 hover:ring-primary/30 transition-shadow duration-300",
        "select-none",
        "bg-background/40 backdrop-blur-sm p-0.5"
      )}
      style={{
        left: springX,
        top: springY,
        width: ORB_SIZE,
        height: ORB_SIZE,
        transform: `translate(${breathOffsetX}px, ${breathOffsetY}px) scale(${breathScale})`,
      }}
      onClick={handleClick}
      aria-label="Toggle Aurora"
    >
      <AuroraHoloOrb size={ORB_SIZE - 4} glow="full" />
    </motion.button>
  );
}
