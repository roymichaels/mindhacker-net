/**
 * Onboarding — Route page for /onboarding
 * Uses the full OnboardingFlow (Neural Intake) for first-time users.
 * Redirects to MindOS if user already has an active plan.
 */
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsMobile } from '@/hooks/use-mobile';
import { TopNavBar } from '@/components/navigation/TopNavBar';
import { HeaderActions } from '@/components/navigation/HeaderActions';
import { AppNameDropdown } from '@/components/navigation/AppNameDropdown';
import { SettingsModal } from '@/components/settings';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const Onboarding = () => {
  const { isRTL } = useTranslation();
  const isMobile = useIsMobile();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  // Guard: redirect if user already has an active plan
  const { data: hasActivePlan, isLoading: checkingPlan } = useQuery({
    queryKey: ['onboarding-plan-guard', user?.id],
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
  });

  if (checkingPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (hasActivePlan && !isAdmin) {
    return <Navigate to="/mindos/tactics" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <OnboardingFlow />
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default Onboarding;
