/**
 * SmartOnboardingContext — Provides smartNavigate() to the entire app.
 * Completed users get missing quest modals instead of being sent back to /onboarding.
 */
import { createContext, useContext, type ReactNode } from 'react';
import { useSmartOnboardingRedirect, type MissingQuest } from '@/hooks/useSmartOnboardingRedirect';
import { MissingQuestModal } from '@/components/modals/MissingQuestModal';

interface SmartOnboardingContextValue {
  /** Use instead of navigate('/onboarding') — redirects completed users to /now + pops missing quests */
  smartNavigate: () => void;
  hasActivePlan: boolean;
}

const SmartOnboardingContext = createContext<SmartOnboardingContextValue>({
  smartNavigate: () => {},
  hasActivePlan: false,
});

export function useSmartOnboarding() {
  return useContext(SmartOnboardingContext);
}

export function SmartOnboardingProvider({ children }: { children: ReactNode }) {
  const {
    smartNavigate,
    hasActivePlan,
    missingQuestModal,
    missingQuestQueue,
    handleQuestModalClose,
    dismissAllQuests,
  } = useSmartOnboardingRedirect();

  return (
    <SmartOnboardingContext.Provider value={{ smartNavigate, hasActivePlan }}>
      {children}
      {missingQuestModal && (
        <MissingQuestModal
          quest={missingQuestModal}
          onClose={handleQuestModalClose}
          onDismissAll={dismissAllQuests}
          remainingCount={missingQuestQueue.length}
        />
      )}
    </SmartOnboardingContext.Provider>
  );
}
