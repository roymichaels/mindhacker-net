import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PersonalizedOrb from './PersonalizedOrb';
import { Orb } from './Orb';
import type { OrbProfile } from './types';

interface OrbFullscreenViewerProps {
  open: boolean;
  onClose: () => void;
  profile?: OrbProfile;
}

export function OrbFullscreenViewer({ open, onClose, profile }: OrbFullscreenViewerProps) {
  const [orbSize, setOrbSize] = useState(280);

  useEffect(() => {
    if (!open) return;
    const updateSize = () => {
      const min = Math.min(window.innerWidth, window.innerHeight);
      setOrbSize(Math.min(Math.floor(min * 0.55), 400));
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [open]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          {/* Close button */}
          <button
            className="absolute top-6 right-6 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Orb container — stop click propagation so clicking orb doesn't close */}
          <motion.div
            className="relative"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            style={{ width: orbSize, height: orbSize }}
          >
            {profile ? (
              <Orb
                size={orbSize}
                state="breathing"
                profile={profile}
                showGlow
                renderer="webgl"
              />
            ) : (
              <PersonalizedOrb
                size={orbSize}
                state="idle"
                showGlow
                renderer="css"
              />
            )}
          </motion.div>

          {/* Hint */}
          <motion.p
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/25 text-xs tracking-widest uppercase pointer-events-none whitespace-nowrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Click anywhere to close
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
