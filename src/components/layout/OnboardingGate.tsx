/**
 * OnboardingGate — Redirects users to /onboarding if they haven't completed the launchpad.
 * After onboarding, requires username setup before granting app access.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useCommunityUsername } from '@/hooks/useCommunityUsername';
import { Loader2 } from 'lucide-react';
import { UsernameSetupScreen } from '@/components/onboarding/UsernameSetupScreen';

interface OnboardingGateProps {
  children: React.ReactNode;
}

// Routes that are allowed even without completing onboarding
const BYPASS_ROUTES = [
  '/launchpad/complete',
  '/success',
  '/personal-hypnosis/success',
  '/personal-hypnosis/pending',
];

export function OnboardingGate({ children }: OnboardingGateProps) {
  const { isLaunchpadComplete, isLoading } = useLaunchpadProgress();
  const { username, isLoading: usernameLoading } = useCommunityUsername();
  const location = useLocation();

  // Don't gate while loading
  if (isLoading || usernameLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Allow bypass routes
  if (BYPASS_ROUTES.some(r => location.pathname.startsWith(r))) {
    return <>{children}</>;
  }

  // Redirect to onboarding if not complete
  if (!isLaunchpadComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  // Require username setup after onboarding
  if (!username) {
    return <UsernameSetupScreen />;
  }

  return <>{children}</>;
}
