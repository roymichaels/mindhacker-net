import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { Loader2 } from 'lucide-react';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AuroraChatArea from './AuroraChatArea';
import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { usePromoPopup } from '@/hooks/usePromoPopup';
import PromoUpgradeModal from '@/components/subscription/PromoUpgradeModal';

const OnboardingChat = lazy(() => import('@/components/launchpad/OnboardingChat'));

const AuroraLayout = () => {
  const { user } = useAuth();
  const { isRTL } = useTranslation();
  const { isLaunchpadComplete, isLoading: launchpadLoading } = useLaunchpadProgress();
  
  const {
    activeConversationId,
    isLoading,
    handleNewChat,
    handleSelectConversation,
  } = useAuroraChatContext();
  
  const [showOnboarding, setShowOnboarding] = useState(true);
  const { shouldShowPromo, dismissPromo, triggerPromo } = usePromoPopup();
  const launchpadWasIncomplete = useRef(!isLaunchpadComplete);

  // Trigger promo after launchpad completion
  useEffect(() => {
    if (isLaunchpadComplete && launchpadWasIncomplete.current) {
      launchpadWasIncomplete.current = false;
      const t = setTimeout(() => triggerPromo(), 1500);
      return () => clearTimeout(t);
    }
  }, [isLaunchpadComplete, triggerPromo]);

  if (isLoading || launchpadLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Show Aurora onboarding chat instead of old step-by-step flow
  if (!isLaunchpadComplete && showOnboarding) {
    return (
      <DashboardLayout>
        <Suspense fallback={
          <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <OnboardingChat
            onComplete={() => setShowOnboarding(false)}
            onClose={() => setShowOnboarding(false)}
          />
        </Suspense>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      currentConversationId={activeConversationId}
      onNewChat={handleNewChat}
      onSelectConversation={handleSelectConversation}
    >
      <div className="flex-1 min-h-0 w-full h-full overflow-hidden pb-28" dir={isRTL ? 'rtl' : 'ltr'}>
        <AuroraChatArea conversationId={activeConversationId} />
      </div>
      <PromoUpgradeModal open={shouldShowPromo} onDismiss={dismissPromo} />
    </DashboardLayout>
  );
};

export default AuroraLayout;
