/**
 * SharedOrbView — Registers orb DATA with SharedOrbCanvas.
 * No React nodes stored in parent state = no infinite loops.
 * Falls back to OrganicOrbCanvas when outside a SharedOrbCanvas.
 */
import { useRef, useEffect, useId, useMemo } from 'react';
import { useSharedOrb } from './SharedOrbCanvas';
import { OrganicOrbCanvas } from './OrganicOrbCanvas';
import type { OrbProfile } from './types';

interface SharedOrbViewProps {
  profile: OrbProfile;
  geometryFamily?: string;
  size: number;
  level?: number;
  randomShapeCount?: boolean;
  className?: string;
}

/** Stable serialization key for an OrbProfile to detect real changes */
function profileKey(p: OrbProfile): string {
  return `${p.primaryColor}|${p.accentColor}|${(p.secondaryColors || []).join(',')}|${p.morphIntensity}|${p.morphSpeed}|${p.coreIntensity}|${p.layerCount}|${p.particleEnabled}|${p.particleCount}|${p.geometryDetail}|${p.materialType}|${p.geometryFamily}`;
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

  const key = useMemo(() => profileKey(profile), [profile]);

  // Register data with shared store (no React nodes, no state loops)
  useEffect(() => {
    if (!ctx) return;
    ctx.store.register({
      id: stableId,
      ref: trackRef,
      profile,
      geometryFamily,
      level,
      randomShapeCount,
      visible: false,
      profileKey: key,
    });
    return () => ctx.store.unregister(stableId);
  }, [ctx, stableId, key, geometryFamily, level, randomShapeCount]);

  // Update profile without full unregister/register cycle
  useEffect(() => {
    if (!ctx) return;
    ctx.store.register({
      id: stableId,
      ref: trackRef,
      profile,
      geometryFamily,
      level,
      randomShapeCount,
      visible: false, // visibility is managed separately
      profileKey: key,
    });
  }, [ctx, stableId, profile, geometryFamily, level, randomShapeCount, key]);

  // IntersectionObserver for viewport activation
  useEffect(() => {
    if (!ctx) return;
    const el = trackRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => ctx.store.setVisible(stableId, entry.isIntersecting),
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
