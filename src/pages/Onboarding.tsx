/**
 * Onboarding — Route page for /onboarding
 * Uses the full OnboardingFlow (Neural Intake) for first-time users.
 * Shows the same header as the main app (TopNavBar / mobile header).
 */
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsMobile } from '@/hooks/use-mobile';
import { TopNavBar } from '@/components/navigation/TopNavBar';
import { HeaderActions } from '@/components/navigation/HeaderActions';
import { AppNameDropdown } from '@/components/navigation/AppNameDropdown';
import { SettingsModal } from '@/components/settings';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

const Onboarding = () => {
  const { isRTL } = useTranslation();
  const isMobile = useIsMobile();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      {isMobile ? (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-lg">
          <div className="flex h-14 items-center justify-between px-3">
            <AppNameDropdown compact onOpenSettings={() => setSettingsOpen(true)} />
            <HeaderActions compact />
          </div>
        </header>
      ) : (
        <TopNavBar onOpenSettings={() => setSettingsOpen(true)} />
      )}

      <div className="flex-1 min-h-0 overflow-y-auto">
        <OnboardingFlow />
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default Onboarding;
