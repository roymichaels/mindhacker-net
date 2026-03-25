/**
 * OrganicOrbCanvas — Standalone canvas wrapper for the OrganicSphere.
 * Used by PersonalizedOrb (large sizes) and the floating AION widget.
 */
import { Suspense, memo, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrganicSphere } from './OrganicSphere';
import type { OrbProfile } from './types';
import { cn } from '@/lib/utils';

interface OrganicOrbCanvasProps {
  profile: OrbProfile;
  size?: number;
  audioLevel?: number;
  className?: string;
}

export const OrganicOrbCanvas = memo(function OrganicOrbCanvas({
  profile,
  size = 120,
  audioLevel = 0,
  className,
}: OrganicOrbCanvasProps) {
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateViewportMode = () => setIsMobileViewport(mediaQuery.matches);

    updateViewportMode();
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateViewportMode);
      return () => mediaQuery.removeEventListener('change', updateViewportMode);
    }

    mediaQuery.addListener(updateViewportMode);

    return () => mediaQuery.removeListener(updateViewportMode);
  }, []);

  return (
    <div className={cn('pointer-events-auto', className)} style={{ width: size, height: size }}>
      <Canvas
        dpr={isMobileViewport ? [1, 1.25] : [1.25, 2]}
        camera={{ position: [0, 0, 3.2], fov: 45, near: 0.1, far: 100 }}
        gl={{
          alpha: true,
          antialias: !isMobileViewport,
          preserveDrawingBuffer: false,
          powerPreference: isMobileViewport ? 'low-power' : 'high-performance',
        }}
        style={{ background: 'transparent' }}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <OrganicSphere profile={profile} audioLevel={audioLevel} />
        </Suspense>
      </Canvas>
    </div>
  );
});

export default OrganicOrbCanvas;
