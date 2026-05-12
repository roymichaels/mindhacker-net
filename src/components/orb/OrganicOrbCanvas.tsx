/**
 * OrganicOrbCanvas — back-compat shim.
 *
 * Now delegates to the unified OrbView, which tunnels into the global
 * SharedOrbStage Canvas. One WebGL context for the entire app, retina DPR,
 * antialias, and global bloom post-processing.
 */
import { memo } from 'react';
import { cn } from '@/lib/utils';
import OrbView from './v2/OrbView';
import type { OrbProfile } from './types';

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
  return (
    <div className={cn('pointer-events-auto', className)} style={{ width: size, height: size }}>
      <OrbView size={size} profile={profile} audioLevel={audioLevel} state="idle" />
    </div>
  );
});

export default OrganicOrbCanvas;
