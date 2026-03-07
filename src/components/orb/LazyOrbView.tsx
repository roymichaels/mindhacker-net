/**
 * LazyOrbView — Only renders a WebGL Canvas when the element is in viewport.
 * Prevents WebGL context exhaustion from too many simultaneous canvases.
 */
import { useRef, useState, useEffect } from 'react';
import { GalleryOrbView } from './GalleryMorphOrb';
import type { OrbProfile } from './types';

interface LazyOrbViewProps {
  profile: OrbProfile;
  geometryFamily: string;
  size: number;
  level?: number;
  randomShapeCount?: boolean;
  className?: string;
}

export function LazyOrbView({ profile, geometryFamily, size, level = 100, randomShapeCount = false, className }: LazyOrbViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={{ width: size, height: size, margin: '0 auto' }}>
      {isVisible ? (
        <GalleryOrbView
          profile={profile}
          geometryFamily={geometryFamily}
          size={size}
          level={level}
          randomShapeCount={randomShapeCount}
        />
      ) : (
        /* Placeholder glow while off-screen */
        <div
          className="w-full h-full rounded-full"
          style={{
            background: `radial-gradient(circle, hsl(${profile.primaryColor || '200 50% 50%'} / 0.3), transparent 70%)`,
          }}
        />
      )}
    </div>
  );
}
