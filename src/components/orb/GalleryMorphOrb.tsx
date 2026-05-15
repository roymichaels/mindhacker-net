/**
 * @deprecated Phase 5F.4 — orb canonicalization.
 * GalleryMorphOrb / GalleryOrbView / StandaloneMorphOrb / GalleryCanvas
 * are now thin compatibility wrappers around `OrbView`. The legacy per-orb
 * WebGL Canvas has been removed; every orb tunnels into the single shared
 * SharedOrbStage Canvas. `geometryFamily`, `level`, `randomShapeCount` are
 * accepted but ignored.
 */
import type { ReactNode, RefObject } from 'react';
import OrbView from './v2/OrbView';
import type { OrbProfile } from './types';

interface GalleryOrbViewProps {
  profile: OrbProfile;
  geometryFamily?: string;
  size: number;
  level?: number;
  randomShapeCount?: boolean;
  className?: string;
}

export function GalleryOrbView({ profile, size, className }: GalleryOrbViewProps) {
  return <OrbView size={size} profile={profile} className={className} />;
}

interface StandaloneMorphOrbProps {
  profile: OrbProfile;
  geometryFamily?: string;
  size: number;
  level?: number;
  className?: string;
}

export function StandaloneMorphOrb({ profile, size, className }: StandaloneMorphOrbProps) {
  return <OrbView size={size} profile={profile} className={className} />;
}

/**
 * @deprecated Was the legacy per-gallery WebGL provider. Now a passthrough
 * Fragment — the real Canvas lives in SharedOrbStage.
 */
interface GalleryCanvasProps {
  children: ReactNode;
  containerRef?: RefObject<HTMLElement>;
}
export function GalleryCanvas({ children }: GalleryCanvasProps) {
  return <>{children}</>;
}

export default GalleryOrbView;

/** @deprecated stub — used to compute shape count from XP level. */
export function getShapeCountForLevel(level: number): number {
  if (level >= 100) return 6;
  if (level >= 75) return 5;
  if (level >= 50) return 4;
  if (level >= 25) return 3;
  return 2;
}
