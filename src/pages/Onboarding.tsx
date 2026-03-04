/**
 * Onboarding — Route page for /onboarding
 * Uses the full OnboardingFlow (Neural Intake) for first-time users.
 */
import Header from '@/components/Header';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

const Onboarding = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <OnboardingFlow />
    </div>
  );
};

export default Onboarding;
