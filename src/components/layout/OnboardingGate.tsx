/**
 * OnboardingGate — Redirects users to /onboarding if they haven't completed the launchpad
 * AND don't have an active plan. After onboarding, requires username setup before granting app access.
 * Admins see a dismissible banner instead of being blocked.
 */
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useCommunityUsername } from '@/hooks/useCommunityUsername';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Rocket, X } from 'lucide-react';
import { UsernameSetupScreen } from '@/components/onboarding/UsernameSetupScreen';
import { Button } from '@/components/ui/button';

interface OnboardingGateProps {
  children: React.ReactNode;
}

// Routes that are allowed even without completing onboarding
const BYPASS_ROUTES = [
  '/launchpad/complete',
  '/success',
  '/personal-hypnosis/success',
  '/personal-hypnosis/pending',
  '/ceremony',
  '/onboarding',
];

const ADMIN_BANNER_DISMISSED_KEY = 'admin-onboarding-banner-dismissed';

export function OnboardingGate({ children }: OnboardingGateProps) {
  const { isLaunchpadComplete, isLoading } = useLaunchpadProgress();
  const { username, isLoading: usernameLoading } = useCommunityUsername();
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [bannerDismissed, setBannerDismissed] = useState(
    () => sessionStorage.getItem(ADMIN_BANNER_DISMISSED_KEY) === 'true'
  );

  // If user just finished onboarding ceremony, never redirect back
  const justCompleted = sessionStorage.getItem('just_completed_onboarding') === '1';

  // Always check if user has an active plan
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
    enabled: !!user?.id,
    staleTime: justCompleted ? 0 : 5 * 60_000, // bust cache if just completed
  });

  // Admins: never block, but show optional banner if onboarding incomplete
  if (isAdmin) {
    const { isRTL } = useTranslation();
    const showBanner = !bannerDismissed && !isLoading && !checkingPlan && !isLaunchpadComplete && !hasActivePlan
      && !BYPASS_ROUTES.some(r => location.pathname.startsWith(r));

    const handleDismiss = () => {
      setBannerDismissed(true);
      sessionStorage.setItem(ADMIN_BANNER_DISMISSED_KEY, 'true');
    };

    return (
      <>
        {showBanner && (
          <div className="sticky top-0 z-[60] flex items-center justify-between gap-3 bg-primary/10 border-b border-primary/20 px-4 py-2">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Rocket className="h-4 w-4 text-primary shrink-0" />
              <span>{isRTL ? 'עדיין לא השלמת את תהליך ההצטרפות.' : 'You haven\'t completed onboarding yet.'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="default"
                className="h-7 text-xs"
                onClick={() => navigate('/onboarding')}
              >
                Start Onboarding
              </Button>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-md hover:bg-muted transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}
        {children}
      </>
    );
  }

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

  // Redirect to onboarding only if launchpad not complete AND no active plan AND not just finished ceremony
  if (!isLaunchpadComplete && !hasActivePlan && !justCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  // Require username setup after onboarding
  if (!username) {
    return <UsernameSetupScreen />;
  }

  return <>{children}</>;
}
