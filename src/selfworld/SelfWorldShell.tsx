/**
 * SelfWorldShell — Phase 5B.4 reframing of Profile/Self.
 *
 * Top-down hierarchy:
 *   1. PresenceBand        — canonical AION (intelligence layer, guide)
 *   2. IdentityCoreBand    — AION · Avatar · DNA triad (three entities)
 *   3. InnerSystemsBand    — explorable consciousness layers (registry)
 *   4. BrainGraphBand      — cognitive map peer band
 *   5. SettingsBand        — quietest band, account & corrections
 *
 * No 3D world / route changes here — the band-stack is the v1 spatial
 * metaphor. See mem://architecture/identity-triad-and-selfworld.
 */
import PresenceBand from './layers/PresenceBand';
import IdentityCoreBand from './layers/IdentityCoreBand';
import InnerSystemsBand from './layers/InnerSystemsBand';
import BrainGraphBand from './layers/BrainGraphBand';
import SettingsBand from './layers/SettingsBand';

interface Props {
  onOpenAdvanced?: () => void;
}

export default function SelfWorldShell({ onOpenAdvanced }: Props) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-4 space-y-7">
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
