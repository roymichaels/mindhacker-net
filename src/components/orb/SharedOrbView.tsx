/**
 * SharedOrbView — Drop-in replacement for CSSGalleryOrb / LazyOrbView.
 * Registers itself with SharedOrbCanvas and only activates when visible.
 * Renders real 3D WebGL content via the shared single Canvas.
 */
import { useRef, useEffect, useId, useMemo } from 'react';
import { PerspectiveCamera, Environment } from '@react-three/drei';
import { useSharedOrb } from './SharedOrbCanvas';
import { MorphOrbMesh } from './GalleryMorphOrb';
import { CSSGalleryOrb } from './CSSGalleryOrb';
import type { OrbProfile } from './types';

interface SharedOrbViewProps {
  profile: OrbProfile;
  geometryFamily?: string;
  size: number;
  level?: number;
  randomShapeCount?: boolean;
  className?: string;
}

function OrbScene({ profile, geometryFamily = 'sphere', level = 100, randomShapeCount = false }: {
  profile: OrbProfile;
  geometryFamily: string;
  level: number;
  randomShapeCount: boolean;
}) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 2.8]} fov={40} />
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 5, 8]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-3, 2, -4]} intensity={0.4} color="#8888ff" />
      <directionalLight position={[0, -3, 2]} intensity={0.2} color="#ff88cc" />
      <pointLight position={[2, 3, 4]} intensity={0.5} color="#ffffff" distance={15} />
      <Environment preset="city" background={false} />
      <MorphOrbMesh
        profile={profile}
        geometryFamily={geometryFamily}
        level={level}
        randomShapeCount={randomShapeCount}
      />
    </>
  );
}

export function SharedOrbView({
  profile,
  geometryFamily = 'sphere',
  size,
  level = 100,
  randomShapeCount = false,
  className,
}: SharedOrbViewProps) {
  const ctx = useSharedOrb();
  const trackRef = useRef<HTMLDivElement>(null!);
  const stableId = useId();

  // Memoize the 3D scene so it doesn't recreate on every render
  const scene = useMemo(
    () => (
      <OrbScene
        profile={profile}
        geometryFamily={geometryFamily}
        level={level}
        randomShapeCount={randomShapeCount}
      />
    ),
    [profile, geometryFamily, level, randomShapeCount]
  );

  // Register with shared canvas
  useEffect(() => {
    if (!ctx) return;
    ctx.register(stableId, trackRef, scene);
    return () => ctx.unregister(stableId);
  }, [ctx, stableId, scene]);

  // IntersectionObserver for viewport activation
  useEffect(() => {
    if (!ctx) return;
    const el = trackRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => ctx.setVisible(stableId, entry.isIntersecting),
      { rootMargin: '100px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ctx, stableId]);

  // Fallback: if no shared canvas context, render CSS orb
  if (!ctx) {
    return (
      <CSSGalleryOrb
        profile={profile}
        geometryFamily={geometryFamily}
        size={size}
        level={level}
        className={className}
      />
    );
  }

  return (
    <div
      ref={trackRef}
      className={className}
      style={{ width: size, height: size, margin: '0 auto', position: 'relative' }}
    />
  );
}
