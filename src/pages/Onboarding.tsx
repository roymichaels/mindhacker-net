/**
 * Onboarding — Route page for /onboarding
 * Aurora-powered conversational calibration flow.
 */
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const OnboardingChat = lazy(() => import('@/components/launchpad/OnboardingChat'));

const Onboarding = () => {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <OnboardingChat />
      </Suspense>
    </div>
  );
};

export default Onboarding;
