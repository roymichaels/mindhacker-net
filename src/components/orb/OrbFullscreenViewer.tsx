import { useEffect, useRef, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PersonalizedOrb from './PersonalizedOrb';

interface OrbFullscreenViewerProps {
  open: boolean;
  onClose: () => void;
}

export function OrbFullscreenViewer({ open, onClose }: OrbFullscreenViewerProps) {
  const [orbSize, setOrbSize] = useState(300);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animFrame = useRef<number>(0);

  // Calculate orb size based on viewport
  useEffect(() => {
    if (!open) return;
    const updateSize = () => {
      const min = Math.min(window.innerWidth, window.innerHeight);
      setOrbSize(Math.min(min * 0.5, 450));
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [open]);

  // Inertia spin loop
  useEffect(() => {
    if (!open) return;
    const spin = () => {
      if (!isDragging.current) {
        // Apply friction
        velocity.current.x *= 0.97;
        velocity.current.y *= 0.97;
        setRotation(prev => ({
          x: prev.x + velocity.current.x,
          y: prev.y + velocity.current.y,
        }));
      }
      animFrame.current = requestAnimationFrame(spin);
    };
    animFrame.current = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(animFrame.current);
  }, [open]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    velocity.current = { x: 0, y: 0 };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    velocity.current = { x: dy * 0.3, y: dx * 0.3 };
    setRotation(prev => ({
      x: prev.x + dy * 0.3,
      y: prev.y + dx * 0.3,
    }));
  }, []);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Dark overlay */}
          <div
            className="absolute inset-0 bg-black/92"
            onClick={onClose}
          />

          {/* Close button */}
          <motion.button
            className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.2 }}
          >
            <X className="h-6 w-6" />
          </motion.button>

          {/* Orb container - centered and draggable */}
          <motion.div
            className="relative z-10 select-none touch-none"
            style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          >
            <div
              style={{
                transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Ambient glow */}
              <div
                className="absolute inset-[-30%] rounded-full blur-3xl opacity-25 pointer-events-none"
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
            </div>
          </motion.div>

          {/* Hint text */}
          <motion.p
            className="absolute bottom-8 text-white/30 text-xs tracking-widest uppercase pointer-events-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Click & drag to spin • Click outside to close
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
