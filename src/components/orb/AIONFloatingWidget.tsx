/**
 * AIONFloatingWidget — Floating organic sphere that follows the mouse/touch
 * with organic, alive movement. No circle stroke — renders raw.
 * Clicking opens the AION chat (/aurora).
 */
import { useState, useCallback, useEffect, useRef, memo } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { useAION } from '@/identity';
import { OrganicOrbCanvas } from './OrganicOrbCanvas';

const HIDDEN_ROUTES = ['/aurora', '/avatar', '/onboarding', '/ceremony', '/founding', '/docs', '/go'];
const ORB_SIZE = 52;
const OFFSET = 60; // how far from cursor the orb stays

function AIONFloatingWidgetInner() {
  const { user } = useAuth();
  const { isLaunchpadComplete } = useLaunchpadProgress();
  const { profile } = useOrbProfile();
  const { isActivated } = useAION();
  const navigate = useNavigate();
  const location = useLocation();

  // Position motion values
  const baseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth - 80 : 300);
  const baseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight - 120 : 300);
  const springX = useSpring(baseX, { stiffness: 40, damping: 12, mass: 0.8 });
  const springY = useSpring(baseY, { stiffness: 40, damping: 12, mass: 0.8 });

  // Organic drift
  const driftRef = useRef({ angle: Math.random() * Math.PI * 2, radius: 0 });
  const mousePos = useRef({ x: baseX.get(), y: baseY.get(), active: false });
  const rafRef = useRef<number>(0);

  const shouldHide = !user || !isLaunchpadComplete || !isActivated
    || HIDDEN_ROUTES.some(r => location.pathname.startsWith(r));

  // Track mouse/touch
  useEffect(() => {
    if (shouldHide) return;

    const onMove = (cx: number, cy: number) => {
      mousePos.current = { x: cx, y: cy, active: true };
    };
    const onMouse = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onLeave = () => { mousePos.current.active = false; };

    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, [shouldHide]);

  // Animation loop — organic movement + mouse follow
  useEffect(() => {
    if (shouldHide) return;

    let lastTime = performance.now();
    const homeX = window.innerWidth - 80;
    const homeY = window.innerHeight - 120;

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const drift = driftRef.current;
      // Organic wandering
      drift.angle += (Math.random() - 0.5) * 2 * dt;
      drift.radius = Math.sin(now * 0.001) * 8 + Math.cos(now * 0.0007) * 5;

      let targetX: number, targetY: number;

      if (mousePos.current.active) {
        // Stay OFFSET pixels away from cursor, on the opposite side
        const dx = mousePos.current.x - baseX.get();
        const dy = mousePos.current.y - baseY.get();
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < OFFSET * 2) {
          // Too close — move away
          const angle = Math.atan2(dy, dx);
          targetX = mousePos.current.x - Math.cos(angle) * OFFSET * 1.5;
          targetY = mousePos.current.y - Math.sin(angle) * OFFSET * 1.5;
        } else {
          // Follow at a distance
          const angle = Math.atan2(dy, dx);
          targetX = mousePos.current.x - Math.cos(angle) * OFFSET;
          targetY = mousePos.current.y - Math.sin(angle) * OFFSET;
        }
      } else {
        // Idle — float near home position
        targetX = homeX;
        targetY = homeY;
      }

      // Add organic drift
      targetX += Math.cos(drift.angle) * drift.radius;
      targetY += Math.sin(drift.angle) * drift.radius;

      // Clamp to viewport
      targetX = Math.max(ORB_SIZE / 2, Math.min(window.innerWidth - ORB_SIZE / 2, targetX));
      targetY = Math.max(ORB_SIZE / 2, Math.min(window.innerHeight - ORB_SIZE / 2, targetY));

      baseX.set(targetX);
      baseY.set(targetY);

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [shouldHide, baseX, baseY]);

  const handleClick = useCallback(() => {
    navigate('/aurora');
  }, [navigate]);

  if (shouldHide) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.3 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 1 }}
        className="fixed z-[60] cursor-pointer pointer-events-auto"
        style={{
          x: springX,
          y: springY,
          width: ORB_SIZE,
          height: ORB_SIZE,
          translateX: '-50%',
          translateY: '-50%',
        }}
        onClick={handleClick}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
      >
        <OrganicOrbCanvas
          profile={profile}
          size={ORB_SIZE}
        />
      </motion.div>
    </AnimatePresence>
  );
}

export const AIONFloatingWidget = memo(AIONFloatingWidgetInner);
export default AIONFloatingWidget;
