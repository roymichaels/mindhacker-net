/**
 * OnboardingGate — Redirects users to /onboarding if they haven't completed the launchpad.
 * Wraps all protected routes inside ProtectedAppShell.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { Loader2 } from 'lucide-react';

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
  const location = useLocation();

  // Don't gate while loading
  if (isLoading) {
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

  return <>{children}</>;
}
