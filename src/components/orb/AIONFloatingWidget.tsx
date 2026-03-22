/**
 * AIONFloatingWidget — Floating organic sphere that follows the mouse/touch
 * with organic, alive movement. No circle stroke — renders raw.
 * Clicking toggles the AION chat panel.
 */
import { useState, useCallback, useEffect, useRef, memo } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { OrganicOrbCanvas } from './OrganicOrbCanvas';
import { AIONChatPanel } from './AIONChatPanel';

const HIDDEN_ROUTES = ['/avatar', '/onboarding', '/ceremony', '/founding', '/docs', '/go'];
const ORB_SIZE = 52;
const OFFSET = 60;

function AIONFloatingWidgetInner() {
  const { user } = useAuth();
  const { profile } = useOrbProfile();
  const location = useLocation();
  const [chatOpen, setChatOpen] = useState(false);

  // Position motion values
  const baseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth - 80 : 300);
  const baseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight - 120 : 300);
  const springX = useSpring(baseX, { stiffness: 40, damping: 12, mass: 0.8 });
  const springY = useSpring(baseY, { stiffness: 40, damping: 12, mass: 0.8 });

  // Organic drift
  const driftRef = useRef({ angle: Math.random() * Math.PI * 2, radius: 0 });
  const mousePos = useRef({ x: baseX.get(), y: baseY.get(), active: false });
  const rafRef = useRef<number>(0);

  const shouldHide = !user
    || HIDDEN_ROUTES.some(r => location.pathname.startsWith(r));

  // If on /aurora route, auto-open chat panel
  useEffect(() => {
    if (location.pathname === '/aurora') {
      setChatOpen(true);
    }
  }, [location.pathname]);

  // Track mouse/touch
  useEffect(() => {
    if (shouldHide || chatOpen) return;

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
  }, [shouldHide, chatOpen]);

  // Animation loop — organic movement + mouse follow
  useEffect(() => {
    if (shouldHide || chatOpen) return;

    let lastTime = performance.now();
    const homeX = window.innerWidth - 80;
    const homeY = window.innerHeight - 120;

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const drift = driftRef.current;
      drift.angle += (Math.random() - 0.5) * 2 * dt;
      drift.radius = Math.sin(now * 0.001) * 8 + Math.cos(now * 0.0007) * 5;

      let targetX: number, targetY: number;

      if (mousePos.current.active) {
        const dx = mousePos.current.x - baseX.get();
        const dy = mousePos.current.y - baseY.get();
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < OFFSET * 2) {
          const angle = Math.atan2(dy, dx);
          targetX = mousePos.current.x - Math.cos(angle) * OFFSET * 1.5;
          targetY = mousePos.current.y - Math.sin(angle) * OFFSET * 1.5;
        } else {
          const angle = Math.atan2(dy, dx);
          targetX = mousePos.current.x - Math.cos(angle) * OFFSET;
          targetY = mousePos.current.y - Math.sin(angle) * OFFSET;
        }
      } else {
        targetX = homeX;
        targetY = homeY;
      }

      targetX += Math.cos(drift.angle) * drift.radius;
      targetY += Math.sin(drift.angle) * drift.radius;

      targetX = Math.max(ORB_SIZE / 2, Math.min(window.innerWidth - ORB_SIZE / 2, targetX));
      targetY = Math.max(ORB_SIZE / 2, Math.min(window.innerHeight - ORB_SIZE / 2, targetY));

      baseX.set(targetX);
      baseY.set(targetY);

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [shouldHide, chatOpen, baseX, baseY]);

  const handleClick = useCallback(() => {
    setChatOpen(prev => !prev);
  }, []);

  if (shouldHide) return null;

  return (
    <>
      {/* Floating Orb — hidden when chat is open */}
      <AnimatePresence>
        {!chatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.3 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
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
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AIONChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}

export const AIONFloatingWidget = memo(AIONFloatingWidgetInner);
export default AIONFloatingWidget;
