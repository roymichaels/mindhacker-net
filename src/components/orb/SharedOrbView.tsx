/**
 * @deprecated Phase 5F.4 — orb canonicalization.
 * Thin shim over `OrbView`. Legacy `SharedOrbCanvas` registry is gone;
 * every orb tunnels into the single global SharedOrbStage Canvas.
 */
import OrbView from './v2/OrbView';
import type { OrbProfile } from './types';

interface SharedOrbViewProps {
  profile: OrbProfile;
  geometryFamily?: string;
  size: number;
  level?: number;
  randomShapeCount?: boolean;
  className?: string;
}

export function SharedOrbView({ profile, size, className }: SharedOrbViewProps) {
  return <OrbView size={size} profile={profile} className={className} />;
}

export default SharedOrbView;
