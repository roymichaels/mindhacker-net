import { useEffect, useRef, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PersonalizedOrb from './PersonalizedOrb';
import { createPortal } from 'react-dom';

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

  useEffect(() => {
    if (!open) return;
    const updateSize = () => {
      const min = Math.min(window.innerWidth, window.innerHeight);
      setOrbSize(Math.min(min * 0.45, 400));
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [open]);

  // Inertia loop
  useEffect(() => {
    if (!open) return;
    const spin = () => {
      if (!isDragging.current) {
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

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    velocity.current = { x: 0, y: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
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

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const content = (
    <AnimatePresence>
      {open && (
        <motion.div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Full dark overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.95)',
            }}
            onClick={onClose}
          />

          {/* Close button */}
          <motion.button
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              zIndex: 10,
              padding: 10,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={onClose}
            whileHover={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.2 }}
          >
            <X style={{ width: 24, height: 24 }} />
          </motion.button>

          {/* Centered orb with drag-to-spin */}
          <motion.div
            style={{
              position: 'relative',
              zIndex: 5,
              cursor: isDragging.current ? 'grabbing' : 'grab',
              userSelect: 'none',
              touchAction: 'none',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.2, opacity: 0 }}
            transition={{ type: 'spring', damping: 18, stiffness: 180 }}
          >
            <div
              style={{
                transform: `perspective(800px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                transformStyle: 'preserve-3d',
                transition: isDragging.current ? 'none' : undefined,
              }}
            >
              {/* Glow behind orb */}
              <div
                style={{
                  position: 'absolute',
                  inset: '-40%',
                  borderRadius: '50%',
                  filter: 'blur(60px)',
                  opacity: 0.3,
                  pointerEvents: 'none',
                  background: 'radial-gradient(circle, hsl(340 82% 65% / 0.5) 0%, transparent 70%)',
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

          {/* Hint */}
          <motion.p
            style={{
              position: 'absolute',
              bottom: 32,
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'rgba(255,255,255,0.25)',
              fontSize: 11,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
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

  // Portal to document.body to escape any parent stacking contexts
  return createPortal(content, document.body);
}
