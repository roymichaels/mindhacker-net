/**
 * Onboarding — Route page for /onboarding
 * Uses the full OnboardingFlow (Neural Intake) for first-time users.
 */
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

const Onboarding = () => {
  return (
    <div className="min-h-screen bg-background">
      <OnboardingFlow />
    </div>
  );
};

export default Onboarding;
