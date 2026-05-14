/**
 * BandStackScene — SelfWorld scene. Mounts the existing band-stack body
 * extracted from SelfWorldShell, so SelfWorld becomes the reference
 * implementation of the Cognitive Worlds contract without rebuilding.
 */
import PresenceBand from '@/selfworld/layers/PresenceBand';
import IdentityCoreBand from '@/selfworld/layers/IdentityCoreBand';
import InnerSystemsBand from '@/selfworld/layers/InnerSystemsBand';
import BrainGraphBand from '@/selfworld/layers/BrainGraphBand';
import SettingsBand from '@/selfworld/layers/SettingsBand';

interface Props {
  onOpenAdvanced?: () => void;
}

export default function BandStackScene({ onOpenAdvanced }: Props) {
  return (
    <div className="space-y-7">
      <PresenceBand />
      <div className="h-px bg-white/[0.04]" />
      <IdentityCoreBand />
      <div className="h-px bg-white/[0.04]" />
      <InnerSystemsBand />
      <div className="h-px bg-white/[0.04]" />
      <BrainGraphBand />
      <div className="h-px bg-white/[0.04]" />
      <SettingsBand onOpenAdvanced={onOpenAdvanced} />
    </div>
  );
}
