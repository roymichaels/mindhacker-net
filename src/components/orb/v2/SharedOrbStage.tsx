/**
 * SharedOrbStage — single global WebGL Canvas that hosts every AION orb.
 *
 * Renders a fixed, full-viewport, pointer-events-none Canvas. Each visible orb
 * is mounted via <OrbView/> elsewhere and tunneled into this Canvas using
 * drei's <View.Port />. One WebGL context for the entire app.
 *
 * Why: previous design instantiated a separate Canvas per surface (header,
 * presence, fullscreen) which (a) burned through iOS WebGL context limit and
 * (b) made post-processing inconsistent. With one stage we get one DPR, one
 * antialias setting, one bloom pass, one place to tune quality.
 */
import { Canvas } from '@react-three/fiber';
import { View, Preload } from '@react-three/drei';
import { useEffect, useState, useMemo } from 'react';

function pickDpr(): [number, number] {
  if (typeof window === 'undefined') return [1.5, 2];
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const native = window.devicePixelRatio || 1;
  // Mobile: cap at 2.0, floor 1.5 (kills jaggies on DPR 3 phones at acceptable fill cost)
  // Desktop: native up to 2.5
  const max = isMobile ? Math.min(native, 2.0) : Math.min(native, 2.5);
  return [Math.min(1.5, max), max];
}

export function SharedOrbStage() {
  const [dpr, setDpr] = useState<[number, number]>(() => pickDpr());
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl2') || c.getContext('webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
    const onResize = () => setDpr(pickDpr());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!hasWebGL) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[60] pointer-events-none"
      style={{ contain: 'strict' }}
    >
      <Canvas
        dpr={dpr}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false,
          stencil: false,
          depth: true,
        }}
        style={{ background: 'transparent' }}
        eventSource={typeof document !== 'undefined' ? document.body : undefined}
        eventPrefix="client"
      >
        <View.Port />
        <Preload all />
      </Canvas>
    </div>
  );
}

export default SharedOrbStage;