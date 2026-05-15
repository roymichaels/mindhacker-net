/**
 * @deprecated Phase 5F.4 — orb canonicalization.
 * Thin wrapper around `OrbView`. Cycles preset profiles via
 * `useOrbPresetMorph` and renders through the single shared canvas.
 */
import OrbView from './v2/OrbView';
import { useOrbPresetMorph } from '@/hooks/useOrbPresetMorph';

interface PresetOrbProps {
  startIndex?: number;
  size?: number;
  className?: string;
}

export function PresetOrb({ startIndex = 0, size = 180, className }: PresetOrbProps) {
  const profile = useOrbPresetMorph({ startIndex });
  return <OrbView size={size} profile={profile} className={className} />;
}

export default PresetOrb;
