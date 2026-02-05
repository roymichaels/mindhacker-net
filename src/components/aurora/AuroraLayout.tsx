import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { AuroraActionsProvider } from '@/contexts/AuroraActionsContext';
import { Loader2 } from 'lucide-react';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { LaunchpadFlow, LaunchpadIntro } from '@/components/launchpad';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AuroraChatArea from './AuroraChatArea';
import { useState } from 'react';

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
  
  const [showLaunchpad, setShowLaunchpad] = useState(true);
  const [showLaunchpadIntro, setShowLaunchpadIntro] = useState(true);

  if (isLoading || launchpadLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Show Launchpad intro first if not complete
  if (!isLaunchpadComplete && showLaunchpad && showLaunchpadIntro) {
    return (
      <LaunchpadIntro 
        onStart={() => setShowLaunchpadIntro(false)}
        onSkip={() => setShowLaunchpad(false)}
      />
    );
  }

  // Show Launchpad flow if not complete
  if (!isLaunchpadComplete && showLaunchpad) {
    return (
      <LaunchpadFlow 
        onComplete={() => setShowLaunchpad(false)}
        onClose={() => setShowLaunchpad(false)}
      />
    );
  }

  return (
    <AuroraActionsProvider>
      <DashboardLayout
        currentConversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
      >
        {/* Chat Area - takes full width and height */}
        <div className="flex-1 min-h-0 w-full h-full overflow-hidden pb-28" dir={isRTL ? 'rtl' : 'ltr'}>
          <AuroraChatArea conversationId={activeConversationId} />
        </div>
      </DashboardLayout>
    </AuroraActionsProvider>
  );
};

export default AuroraLayout;
