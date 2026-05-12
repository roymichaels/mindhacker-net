/**
 * OnboardingGate — Redirects users to /onboarding if they haven't completed the launchpad
 * AND don't have an active plan. After onboarding, requires username setup before granting app access.
 * Admins see a dismissible banner instead of being blocked.
 */
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Rocket, X } from 'lucide-react';
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
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isRTL } = useTranslation();
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
    const showBanner = !bannerDismissed && !isLoading && !checkingPlan && !isLaunchpadComplete && !hasActivePlan
      && !BYPASS_ROUTES.some(r => location.pathname.startsWith(r));

    const handleDismiss = () => {
      setBannerDismissed(true);
      sessionStorage.setItem(ADMIN_BANNER_DISMISSED_KEY, 'true');
    };

    return (
      <>
        {children}
        {showBanner && (
          <div
            className="fixed inset-x-0 z-[60] flex justify-center px-3 pointer-events-none"
            style={{ bottom: 'calc(var(--bottom-tab-h, 72px) + env(safe-area-inset-bottom) + 8px)' }}
          >
            <div className="pointer-events-auto flex items-center gap-2 max-w-[92%] rounded-full bg-background/85 backdrop-blur-md border border-primary/30 shadow-lg pl-2 pr-1 py-1">
              <Rocket className="h-3.5 w-3.5 text-primary shrink-0 mx-1" />
              <span className="truncate text-xs text-foreground min-w-0">
                {isRTL ? 'עדיין לא השלמת הצטרפות' : "You haven't completed onboarding"}
              </span>
              <Button
                size="sm"
                variant="default"
                className="h-6 px-2.5 text-[11px] rounded-full shrink-0"
                onClick={() => navigate('/onboarding')}
              >
                {isRTL ? 'התחל' : 'Start'}
              </Button>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-full hover:bg-muted transition-colors shrink-0"
                aria-label="Dismiss"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Don't gate while loading
  if (isLoading || checkingPlan) {
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

  return <>{children}</>;
}
