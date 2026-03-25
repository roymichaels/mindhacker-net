/**
 * AIONFloatingWidget - Persistent visible AION launcher.
 * Anchored above the navigation so it is always visible, with organic motion.
 */
import { useState, useCallback, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { OrganicOrbCanvas } from './OrganicOrbCanvas';
import { AIONChatPanel } from './AIONChatPanel';

const HIDDEN_ROUTES = ['/avatar', '/onboarding', '/ceremony', '/founding', '/docs', '/go'];
const ORB_SIZE = 72;

function AIONFloatingWidgetInner() {
  const { user } = useAuth();
  const { profile } = useOrbProfile();
  const location = useLocation();
  const [chatOpen, setChatOpen] = useState(false);

  const shouldHide = !user || HIDDEN_ROUTES.some((routePrefix) => location.pathname.startsWith(routePrefix));

  useEffect(() => {
    const handleToggle = () => setChatOpen((prev) => !prev);
    window.addEventListener('aion:toggle-chat', handleToggle);
    return () => window.removeEventListener('aion:toggle-chat', handleToggle);
  }, []);

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
            initial={{ opacity: 0, scale: 0.4, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.4, y: 24 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18 }}
            onClick={handleClick}
            aria-label="Open AION chat"
            className="fixed z-[88] right-4 md:right-6 bottom-[96px] md:bottom-6 flex items-center gap-3 bg-transparent border-0 p-0"
          >
            <motion.div
              className="hidden md:flex items-center rounded-full border border-cyan-300/20 bg-slate-950/70 backdrop-blur-xl px-3 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-cyan-100 shadow-[0_10px_35px_rgba(0,0,0,0.35)]"
              animate={{ opacity: [0.7, 1, 0.82, 0.7], x: [0, -2, 1, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              AION
            </motion.div>

            <motion.div
              className="relative"
              animate={{
                x: [0, -8, 4, 0],
                y: [0, -10, 2, 0],
                rotate: [0, 3, -2, 0],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.94 }}
            >
              <motion.div
                className="absolute inset-[-22px] rounded-full bg-cyan-400/20 blur-2xl"
                animate={{ scale: [1, 1.08, 0.96, 1], opacity: [0.55, 0.82, 0.62, 0.55] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-[-10px] rounded-full border border-cyan-300/25 bg-[radial-gradient(circle,rgba(34,211,238,0.16),transparent_68%)]"
                animate={{ rotate: [0, 360], scale: [1, 1.03, 1] }}
                transition={{
                  rotate: { duration: 18, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
                }}
              />
              <div className="relative rounded-full border border-cyan-200/35 bg-slate-950/80 shadow-[0_0_40px_rgba(34,211,238,0.4)] overflow-hidden">
                <OrganicOrbCanvas profile={profile} size={ORB_SIZE} />
              </div>
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
