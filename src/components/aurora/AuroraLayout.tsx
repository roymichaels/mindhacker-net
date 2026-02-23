import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { Loader2 } from 'lucide-react';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import AuroraChatArea from './AuroraChatArea';
import { useSidebars } from '@/hooks/useSidebars';
import { usePromoPopup } from '@/hooks/usePromoPopup';
import PromoUpgradeModal from '@/components/subscription/PromoUpgradeModal';

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

  const { shouldShowPromo, dismissPromo } = usePromoPopup();

  // Aurora uses default sidebars
  useSidebars(undefined, undefined);

  if (isLoading || launchpadLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 min-h-0 w-full h-full overflow-hidden pb-28" dir={isRTL ? 'rtl' : 'ltr'}>
        <AuroraChatArea conversationId={activeConversationId} />
      </div>
      <PromoUpgradeModal open={shouldShowPromo} onDismiss={dismissPromo} />
    </>
  );
};

export default AuroraLayout;
