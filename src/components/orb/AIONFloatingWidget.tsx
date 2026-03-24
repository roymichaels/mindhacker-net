/**
 * AIONFloatingWidget — Floating organic sphere that drifts autonomously
 * across the screen like a living entity. Ignores mouse/touch input.
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

function AIONFloatingWidgetInner() {
  const { user } = useAuth();
  const { profile } = useOrbProfile();
  const location = useLocation();
  const [chatOpen, setChatOpen] = useState(false);

  // Position motion values
  const baseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth - 80 : 300);
  const baseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight - 120 : 300);
  const springX = useSpring(baseX, { stiffness: 25, damping: 15, mass: 1.2 });
  const springY = useSpring(baseY, { stiffness: 25, damping: 15, mass: 1.2 });

  // Autonomous drift state
  const driftRef = useRef({
    angle: Math.random() * Math.PI * 2,
    targetAngle: Math.random() * Math.PI * 2,
    speed: 18 + Math.random() * 12, // px/s
    turnTimer: 0,
    turnInterval: 3 + Math.random() * 4, // seconds between direction changes
  });
  const rafRef = useRef<number>(0);

  const shouldHide = !user
    || HIDDEN_ROUTES.some(r => location.pathname.startsWith(r));

  // Listen for global toggle event from nav buttons
  useEffect(() => {
    const handleToggle = () => setChatOpen(prev => !prev);
    window.addEventListener('aion:toggle-chat', handleToggle);
    return () => window.removeEventListener('aion:toggle-chat', handleToggle);
  }, []);

  // Autonomous organic drift — no mouse/touch tracking
  useEffect(() => {
    if (shouldHide || chatOpen) return;

    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const drift = driftRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const pad = ORB_SIZE;

      // Periodically pick a new wander direction
      drift.turnTimer += dt;
      if (drift.turnTimer >= drift.turnInterval) {
        drift.turnTimer = 0;
        drift.turnInterval = 2.5 + Math.random() * 5;
        drift.targetAngle += (Math.random() - 0.5) * Math.PI * 1.2;
        drift.speed = 15 + Math.random() * 20;
      }

      // Smoothly steer toward target angle
      let angleDiff = drift.targetAngle - drift.angle;
      // Normalize to [-PI, PI]
      angleDiff = ((angleDiff + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      drift.angle += angleDiff * dt * 1.5;

      // Add subtle wobble
      const wobbleX = Math.sin(now * 0.0013) * 3 + Math.cos(now * 0.0021) * 2;
      const wobbleY = Math.cos(now * 0.0017) * 3 + Math.sin(now * 0.0011) * 2;

      let curX = baseX.get();
      let curY = baseY.get();

      // Move
      curX += Math.cos(drift.angle) * drift.speed * dt + wobbleX * dt;
      curY += Math.sin(drift.angle) * drift.speed * dt + wobbleY * dt;

      // Bounce off edges softly by steering away
      if (curX < pad) { drift.targetAngle = Math.random() * Math.PI * 0.5 - Math.PI * 0.25; curX = pad; }
      if (curX > w - pad) { drift.targetAngle = Math.PI + (Math.random() - 0.5) * Math.PI * 0.5; curX = w - pad; }
      if (curY < pad) { drift.targetAngle = Math.PI * 0.5 + (Math.random() - 0.5) * Math.PI * 0.5; curY = pad; }
      if (curY > h - pad) { drift.targetAngle = -Math.PI * 0.5 + (Math.random() - 0.5) * Math.PI * 0.5; curY = h - pad; }

      baseX.set(curX);
      baseY.set(curY);

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
