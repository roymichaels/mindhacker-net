/**
 * AuroraFloatingOrb — Now lives inside the AuroraDock input bar.
 * When dock is closed, only the orb is visible (fixed bottom-right).
 * Clicking it opens the dock; clicking again closes it back to orb.
 */
import { useEffect, useRef, useState } from 'react';
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

  if (!ctx) return null;

  // Only show the standalone orb when dock is NOT visible
  if (ctx.isDockVisible) return null;

  const handleClick = () => {
    ctx.setIsDockVisible(true);
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        "fixed z-50 rounded-full cursor-pointer",
        "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40",
        "ring-2 ring-primary/20 hover:ring-primary/40 transition-shadow",
        "select-none",
        "bg-background/60 backdrop-blur-md p-1"
      )}
      style={{
        right: isMobile ? 16 : 24,
        bottom: isMobile ? 80 : 24,
        width: ORB_SIZE,
        height: ORB_SIZE,
        transform: `scale(${breathScale})`,
        boxShadow: `0 0 ${16 + glowPulse * 20}px ${4 + glowPulse * 8}px hsl(var(--primary) / ${glowPulse})`,
      }}
      onClick={handleClick}
      aria-label="Open Aurora"
    >
      <AuroraHoloOrb size={ORB_SIZE - 8} glow="full" />
    </motion.button>
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