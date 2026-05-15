/**
 * @deprecated Phase 5F.4 — orb canonicalization.
 * GalleryMorphOrb / GalleryOrbView / StandaloneMorphOrb are now thin
 * compatibility wrappers around `OrbView`. The legacy per-orb WebGL Canvas
 * has been removed; every orb tunnels into the single shared Canvas.
 * `geometryFamily`, `level`, `randomShapeCount` are accepted but ignored.
 */
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

export default GalleryOrbView;
