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

interface Props { onOpenAdvanced?: () => void; }

export default function SelfPanel({ onOpenAdvanced }: Props) {
  return (
    <div className="mx-auto w-full max-w-md space-y-6 px-4 py-6">
      <IdentitySection />
      <div className="h-px bg-white/[0.05]" />
      <WhatAionKnowsSection />
      <div className="h-px bg-white/[0.05]" />
      <CorrectionsSection />
      <div className="h-px bg-white/[0.05]" />
      <PrivacySettingsSection onOpenAdvanced={onOpenAdvanced} />
    </div>
  );
}
