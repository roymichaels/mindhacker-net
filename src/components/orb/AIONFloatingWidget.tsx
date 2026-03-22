/**
 * AIONFloatingWidget — Floating organic sphere that follows the user
 * across the app. Shown for logged-in users post-onboarding.
 * Clicking opens the AION chat (/aurora).
 */
import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { useAION } from '@/identity';
import { OrganicOrbCanvas } from './OrganicOrbCanvas';
import { cn } from '@/lib/utils';

const HIDDEN_ROUTES = ['/aurora', '/avatar', '/onboarding', '/ceremony', '/founding', '/docs', '/go'];

function AIONFloatingWidgetInner() {
  const { user } = useAuth();
  const { isLaunchpadComplete } = useLaunchpadProgress();
  const { profile } = useOrbProfile();
  const { isActivated } = useAION();
  const navigate = useNavigate();
  const location = useLocation();
  const [hovered, setHovered] = useState(false);

  // Hide on certain routes
  const shouldHide = !user || !isLaunchpadComplete || !isActivated
    || HIDDEN_ROUTES.some(r => location.pathname.startsWith(r));

  const handleClick = useCallback(() => {
    navigate('/aurora');
  }, [navigate]);

  if (shouldHide) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 1 }}
        className={cn(
          'fixed z-[60] cursor-pointer',
          'bottom-20 end-4 md:bottom-6 md:end-6'
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleClick}
      >
        {/* Glow behind */}
        <motion.div
          className="absolute -inset-2 rounded-full blur-xl pointer-events-none"
          style={{ background: `hsl(${profile.primaryColor} / 0.25)` }}
          animate={{
            scale: hovered ? 1.4 : [1, 1.15, 1],
            opacity: hovered ? 0.5 : [0.2, 0.35, 0.2],
          }}
          transition={hovered ? { duration: 0.3 } : { duration: 4, repeat: Infinity }}
        />

        {/* Breathing ring */}
        <motion.div
          className="absolute -inset-1 rounded-full border pointer-events-none"
          style={{ borderColor: `hsl(${profile.primaryColor} / 0.3)` }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* The Orb */}
        <motion.div
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.92 }}
          className="relative rounded-full overflow-hidden"
        >
          <OrganicOrbCanvas
            profile={profile}
            size={56}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export const AIONFloatingWidget = memo(AIONFloatingWidgetInner);
export default AIONFloatingWidget;