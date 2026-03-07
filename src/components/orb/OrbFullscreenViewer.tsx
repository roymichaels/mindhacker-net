import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
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
      setOrbSize(Math.min(Math.floor(min * 0.65), 700));
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

  const content = (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            width: '100vw', height: '100vh', zIndex: 99999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.95)' }}
            onClick={onClose}
          />

          {/* Exit button */}
          <button
            className="absolute top-5 right-5 z-20 flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all backdrop-blur-md border border-white/20 shadow-lg"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            aria-label="Close fullscreen"
            style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}
          >
            <X className="w-5 h-5" />
            <span className="text-sm font-medium tracking-wide">Exit</span>
          </button>

          {/* Centered orb */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative', zIndex: 5, width: orbSize, height: orbSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.2, opacity: 0 }}
            transition={{ type: 'spring', damping: 18, stiffness: 180 }}
          >
            {/* Ambient glow */}
            <div
              style={{
                position: 'absolute', inset: '-40%', borderRadius: '50%',
                filter: 'blur(80px)', opacity: 0.25, pointerEvents: 'none',
                background: 'radial-gradient(circle, hsl(var(--primary) / 0.6) 0%, transparent 70%)',
              }}
            />
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
              />
            )}
          </motion.div>

          <motion.p
            style={{
              position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
              color: 'rgba(255,255,255,0.25)', fontSize: 11,
              letterSpacing: '0.15em', textTransform: 'uppercase' as const,
              pointerEvents: 'none', whiteSpace: 'nowrap',
            }}
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

  return createPortal(content, document.body);
}
