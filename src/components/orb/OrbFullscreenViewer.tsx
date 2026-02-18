import { useEffect, useRef, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PersonalizedOrb from './PersonalizedOrb';

interface OrbFullscreenViewerProps {
  open: boolean;
  onClose: () => void;
}

export function OrbFullscreenViewer({ open, onClose }: OrbFullscreenViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [orbSize, setOrbSize] = useState(300);

  // Calculate orb size based on viewport
  useEffect(() => {
    if (!open) return;
    const updateSize = () => {
      const min = Math.min(window.innerWidth, window.innerHeight);
      setOrbSize(Math.min(min * 0.55, 500));
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [open]);

  // Track mouse for interactive rotation feel
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Compute subtle 3D tilt from mouse
  const tiltX = (mousePos.y - 0.5) * 20; // degrees
  const tiltY = (mousePos.x - 0.5) * -20;
  const glowX = mousePos.x * 100;
  const glowY = mousePos.y * 100;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={containerRef}
          className="fixed inset-0 z-[200] flex items-center justify-center cursor-crosshair"
          onMouseMove={handleMouseMove}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Dark overlay with subtle radial glow following mouse */}
          <div
            className="absolute inset-0 bg-black/90"
            style={{
              background: `radial-gradient(circle at ${glowX}% ${glowY}%, hsl(var(--primary) / 0.08) 0%, rgba(0,0,0,0.92) 50%)`,
            }}
          />

          {/* Close button */}
          <motion.button
            className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors backdrop-blur-sm"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.2 }}
          >
            <X className="h-6 w-6" />
          </motion.button>

          {/* Orb container with 3D tilt */}
          <motion.div
            className="relative z-10"
            style={{
              perspective: '1000px',
            }}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              animate={{
                rotateX: tiltX,
                rotateY: tiltY,
              }}
              transition={{ type: 'spring', damping: 30, stiffness: 150 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Ambient glow ring */}
              <div
                className="absolute inset-[-30%] rounded-full blur-3xl opacity-30 pointer-events-none"
                style={{
                  background: `radial-gradient(circle, hsl(var(--primary) / 0.5) 0%, transparent 70%)`,
                }}
              />
              <PersonalizedOrb
                size={orbSize}
                state="idle"
                showGlow
                showLoadingSkeleton
              />
            </motion.div>
          </motion.div>

          {/* Hint text */}
          <motion.p
            className="absolute bottom-8 text-white/30 text-xs tracking-widest uppercase pointer-events-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Move mouse to interact • Click anywhere to close
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
