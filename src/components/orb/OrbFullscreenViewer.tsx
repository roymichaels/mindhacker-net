import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PersonalizedOrb from './PersonalizedOrb';
import type { OrbProfile } from './types';
import { StandaloneMorphOrb } from './GalleryMorphOrb';

interface OrbFullscreenViewerProps {
  open: boolean;
  onClose: () => void;
  profile?: OrbProfile;
  geometryFamily?: string;
  level?: number;
}

export function OrbFullscreenViewer({ open, onClose, profile, geometryFamily, level = 100 }: OrbFullscreenViewerProps) {
  const [orbSize, setOrbSize] = useState(280);

  useEffect(() => {
    if (!open) return;
    const updateSize = () => {
      const min = Math.min(window.innerWidth, window.innerHeight);
      setOrbSize(Math.min(Math.floor(min * 0.55), 600));
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

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
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          {/* Exit button */}
          <button
            className="absolute top-5 right-5 z-20 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all backdrop-blur-md border border-white/15 shadow-lg"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            aria-label="Close fullscreen"
          >
            <X className="w-5 h-5" />
            <span className="text-sm font-medium tracking-wide">Exit</span>
          </button>

          {/* Centered orb */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: orbSize, height: orbSize }}
          >
            {profile ? (
              <StandaloneMorphOrb
                size={orbSize}
                profile={profile}
                geometryFamily={geometryFamily || profile.geometryFamily || 'sphere'}
                level={level}
              />
            ) : (
              <PersonalizedOrb
                size={orbSize}
                state="idle"
                showGlow
                renderer="css"
              />
            )}
          </div>

          <motion.p
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/25 text-xs tracking-widest uppercase pointer-events-none whitespace-nowrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Click anywhere or press ESC to close
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
