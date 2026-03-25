/**
 * AIONFloatingWidget - Floating organic sphere that drifts autonomously.
 * It keeps clear of the header and bottom nav, and stays visible with a living glow shell.
 */
import { useState, useCallback, useEffect, useRef, memo } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { OrganicOrbCanvas } from './OrganicOrbCanvas';
import { AIONChatPanel } from './AIONChatPanel';

const HIDDEN_ROUTES = ['/avatar', '/onboarding', '/ceremony', '/founding', '/docs', '/go'];
const ORB_SIZE = 72;
const EDGE_PADDING = 56;
const TOP_CLEARANCE = 110;
const BOTTOM_CLEARANCE = 150;

function AIONFloatingWidgetInner() {
  const { user } = useAuth();
  const { profile } = useOrbProfile();
  const location = useLocation();
  const [chatOpen, setChatOpen] = useState(false);

  const baseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth - 112 : 320);
  const baseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight - 220 : 320);
  const springX = useSpring(baseX, { stiffness: 22, damping: 16, mass: 1.35 });
  const springY = useSpring(baseY, { stiffness: 22, damping: 16, mass: 1.35 });

  const driftRef = useRef({
    angle: Math.random() * Math.PI * 2,
    targetAngle: Math.random() * Math.PI * 2,
    speed: 16 + Math.random() * 10,
    turnTimer: 0,
    turnInterval: 3 + Math.random() * 4,
  });
  const rafRef = useRef<number>(0);

  const shouldHide = !user || HIDDEN_ROUTES.some((r) => location.pathname.startsWith(r));

  useEffect(() => {
    const handleToggle = () => setChatOpen((prev) => !prev);
    window.addEventListener('aion:toggle-chat', handleToggle);
    return () => window.removeEventListener('aion:toggle-chat', handleToggle);
  }, []);

  useEffect(() => {
    if (shouldHide || chatOpen) return undefined;

    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const drift = driftRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const minX = EDGE_PADDING;
      const maxX = w - EDGE_PADDING;
      const minY = TOP_CLEARANCE;
      const maxY = h - BOTTOM_CLEARANCE;

      drift.turnTimer += dt;
      if (drift.turnTimer >= drift.turnInterval) {
        drift.turnTimer = 0;
        drift.turnInterval = 2.5 + Math.random() * 5;
        drift.targetAngle += (Math.random() - 0.5) * Math.PI * 1.2;
        drift.speed = 14 + Math.random() * 18;
      }

      let angleDiff = drift.targetAngle - drift.angle;
      angleDiff = ((angleDiff + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      drift.angle += angleDiff * dt * 1.45;

      const wobbleX = Math.sin(now * 0.0013) * 5 + Math.cos(now * 0.0021) * 3;
      const wobbleY = Math.cos(now * 0.0017) * 5 + Math.sin(now * 0.0011) * 3;

      let curX = baseX.get();
      let curY = baseY.get();

      curX += Math.cos(drift.angle) * drift.speed * dt + wobbleX * dt;
      curY += Math.sin(drift.angle) * drift.speed * dt + wobbleY * dt;

      if (curX < minX) {
        drift.targetAngle = Math.random() * Math.PI * 0.5 - Math.PI * 0.25;
        curX = minX;
      }
      if (curX > maxX) {
        drift.targetAngle = Math.PI + (Math.random() - 0.5) * Math.PI * 0.5;
        curX = maxX;
      }
      if (curY < minY) {
        drift.targetAngle = Math.PI * 0.5 + (Math.random() - 0.5) * Math.PI * 0.5;
        curY = minY;
      }
      if (curY > maxY) {
        drift.targetAngle = -Math.PI * 0.5 + (Math.random() - 0.5) * Math.PI * 0.5;
        curY = maxY;
      }

      baseX.set(curX);
      baseY.set(curY);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [shouldHide, chatOpen, baseX, baseY]);

  const handleClick = useCallback(() => {
    setChatOpen((prev) => !prev);
  }, []);

  if (shouldHide) return null;

  return (
    <>
      <AnimatePresence>
        {!chatOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.3 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed z-[78] cursor-pointer pointer-events-auto bg-transparent border-0 p-0"
            style={{
              x: springX,
              y: springY,
              width: ORB_SIZE,
              height: ORB_SIZE,
              translateX: '-50%',
              translateY: '-50%',
            }}
            onClick={handleClick}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.94 }}
            aria-label="Open AION chat"
          >
            <motion.div
              className="absolute inset-[-22px] rounded-full bg-cyan-400/18 blur-2xl"
              animate={{ scale: [1, 1.1, 0.98, 1], opacity: [0.55, 0.8, 0.6, 0.55] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute inset-[-10px] rounded-full border border-cyan-300/25 bg-[radial-gradient(circle,rgba(34,211,238,0.14),transparent_68%)]"
              animate={{ rotate: [0, 360], scale: [1, 1.04, 1] }}
              transition={{ rotate: { duration: 18, repeat: Infinity, ease: 'linear' }, scale: { duration: 6, repeat: Infinity, ease: 'easeInOut' } }}
            />
            <motion.div
              className="relative w-full h-full rounded-full border border-cyan-200/35 bg-slate-950/75 shadow-[0_0_40px_rgba(34,211,238,0.35)] overflow-hidden"
              animate={{ y: [0, -5, 1, 0], rotate: [0, 2, -1.5, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <OrganicOrbCanvas profile={profile} size={ORB_SIZE} />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      <AIONChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}

export const AIONFloatingWidget = memo(AIONFloatingWidgetInner);
export default AIONFloatingWidget;
