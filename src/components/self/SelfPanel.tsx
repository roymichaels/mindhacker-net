/**
 * SelfPanel — identity-first replacement for the stat-heavy Profile body.
 *
 * Sections:
 *  1. Identity
 *  2. What AION knows
 *  3. Corrections
 *  4. Privacy & settings (collapsed) + Advanced (opens legacy stats)
 */
import IdentitySection from './sections/IdentitySection';
import WhatAionKnowsSection from './sections/WhatAionKnowsSection';
import CorrectionsSection from './sections/CorrectionsSection';
import PrivacySettingsSection from './sections/PrivacySettingsSection';
import { artifactBus } from '@/lib/aion/artifactBus';

interface Props {
  /** Optional override. If omitted, "Advanced" summons the profile-stats artifact. */
  onOpenAdvanced?: () => void;
}

export default function SelfPanel({ onOpenAdvanced }: Props) {
  const handleAdvanced = onOpenAdvanced ?? (() => {
    artifactBus.summon('profile-stats', {}, { fullscreen: true, replaceKind: true });
  });
  return (
    <div className="mx-auto w-full max-w-md space-y-6 px-4 py-6">
      <IdentitySection />
      <div className="h-px bg-white/[0.05]" />
      <WhatAionKnowsSection />
      <div className="h-px bg-white/[0.05]" />
      <CorrectionsSection />
      <div className="h-px bg-white/[0.05]" />
      <PrivacySettingsSection onOpenAdvanced={handleAdvanced} />
    </div>
  );
}
