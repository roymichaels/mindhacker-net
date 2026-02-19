/**
 * PresetOrb - Lightweight showcase orb that morphs through presets.
 * No auth dependency, no personalization — pure visual showcase.
 */
import { useOrbPresetMorph } from '@/hooks/useOrbPresetMorph';
import { Orb } from './Orb';

interface PresetOrbProps {
  startIndex?: number;
  size?: number;
  className?: string;
}

export function PresetOrb({ startIndex = 0, size = 180, className }: PresetOrbProps) {
  const currentProfile = useOrbPresetMorph({ startIndex });

  return (
    <Orb
      profile={currentProfile}
      size={size}
      state="breathing"
      className={className}
    />
  );
}

export default PresetOrb;
