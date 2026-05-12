import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { Loader2 } from 'lucide-react';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import AuroraChatArea from './AuroraChatArea';
import { useSidebars } from '@/hooks/useSidebars';
import { usePromoPopup } from '@/hooks/usePromoPopup';
import PromoUpgradeModal from '@/components/subscription/PromoUpgradeModal';
import GlobalChatInput from '@/components/dashboard/GlobalChatInput';

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
      <div className="flex-1 min-h-0 w-full h-full flex flex-col overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex-1 min-h-0 overflow-hidden">
          <AuroraChatArea conversationId={activeConversationId} />
        </div>
        <div className="shrink-0 px-3 pb-safe pt-2 border-t border-white/[0.05] bg-background/85 backdrop-blur-xl">
          <div className="mx-auto w-full max-w-3xl">
            <GlobalChatInput />
          </div>
        </div>
      </div>
      <PromoUpgradeModal open={shouldShowPromo} onDismiss={dismissPromo} />
    </>
  );
};

export default AuroraLayout;
