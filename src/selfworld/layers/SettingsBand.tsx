/**
 * SettingsBand — quietest band at the bottom of SelfWorld. Hosts the
 * existing Self sections (what AION knows, corrections, privacy &
 * settings, advanced).
 */
import WhatAionKnowsSection from '@/components/self/sections/WhatAionKnowsSection';
import CorrectionsSection from '@/components/self/sections/CorrectionsSection';
import PrivacySettingsSection from '@/components/self/sections/PrivacySettingsSection';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  onOpenAdvanced?: () => void;
}

export default function SettingsBand({ onOpenAdvanced }: Props) {
  const { language } = useTranslation();
  const isHe = language === 'he';

  return (
    <section className="space-y-4 px-1 opacity-90">
      <h3 className="text-[10px] tracking-[0.32em] uppercase text-foreground/40">
        {isHe ? 'הגדרות וחשבון' : 'Settings & Account'}
      </h3>
      <WhatAionKnowsSection />
      <div className="h-px bg-white/[0.04]" />
      <CorrectionsSection />
      <div className="h-px bg-white/[0.04]" />
      <PrivacySettingsSection onOpenAdvanced={onOpenAdvanced} />
    </section>
  );
}
