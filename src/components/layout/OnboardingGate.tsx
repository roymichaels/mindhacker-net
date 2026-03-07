/**
 * OnboardingGate — Redirects users to /onboarding if they haven't completed the launchpad
 * AND don't have an active plan. After onboarding, requires username setup before granting app access.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useCommunityUsername } from '@/hooks/useCommunityUsername';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  const { user } = useAuth();
  const location = useLocation();

  // Also check if user already has an active plan (prevents re-onboarding)
  const { data: hasActivePlan, isLoading: checkingPlan } = useQuery({
    queryKey: ['onboarding-gate-plan-check', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase
        .from('life_plans')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      return !!data;
    },
    enabled: !!user?.id && !isLaunchpadComplete,
    staleTime: 5 * 60_000,
  });

  // Don't gate while loading
  if (isLoading || usernameLoading || checkingPlan) {
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

  // Redirect to onboarding only if launchpad not complete AND no active plan
  if (!isLaunchpadComplete && !hasActivePlan) {
    return <Navigate to="/onboarding" replace />;
  }

  // Require username setup after onboarding
  if (!username) {
    return <UsernameSetupScreen />;
  }

  return <>{children}</>;
}
