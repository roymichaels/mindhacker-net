import { ReactNode, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocation } from 'react-router-dom';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { TopNavBar } from '@/components/navigation/TopNavBar';
import GlobalChatInput from './GlobalChatInput';
import AuroraChatBubbles from '@/components/aurora/AuroraChatBubbles';
import { SettingsModal } from '@/components/settings';
import { HypnosisModal } from './HypnosisModal';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TasksPopover } from './TasksPopover';
import { GoalsPopover } from './GoalsPopover';
import { UserNotificationBell } from '@/components/UserNotificationBell';
import { usePractitionersModal } from '@/contexts/PractitionersModalContext';
import { Compass, Users } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  currentConversationId?: string | null;
  onNewChat?: () => void | Promise<boolean>;
  onSelectConversation?: (id: string) => void;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { language, isRTL } = useTranslation();
  const isMobile = useIsMobile();
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hypnosisOpen, setHypnosisOpen] = useState(false);
  const { openPractitioners } = usePractitionersModal();

  const isAuroraTab = location.pathname === '/aurora';

  if (isMobile) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex flex-col bg-background w-full" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Mobile header - slim, action icons only */}
          <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-lg">
            <div className="flex h-12 items-center justify-end px-3 gap-1">
              <TasksPopover />
              <GoalsPopover />
              <button
                className="h-9 w-9 rounded-full bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center"
                onClick={() => openPractitioners()}
              >
                <Users className="h-4 w-4 text-pink-600 dark:text-pink-400" />
              </button>
              <button
                className="h-9 w-9 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center"
                onClick={() => setHypnosisOpen(true)}
              >
                <Compass className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </button>
              <UserNotificationBell />
            </div>
          </header>

          <main className="flex-1 min-h-0 overflow-y-auto px-3 pt-2 pb-20">
            {children}
          </main>

          {/* Global chat input - show on all tabs except Aurora (which has its own) */}
          {!isAuroraTab && (
            <div className="fixed bottom-14 left-0 right-0 z-40 flex flex-col items-center px-3 pb-[env(safe-area-inset-bottom)]">
              <AuroraChatBubbles />
              <GlobalChatInput />
            </div>
          )}

          <BottomTabBar />
          <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
          <HypnosisModal open={hypnosisOpen} onOpenChange={setHypnosisOpen} />
        </div>
      </SidebarProvider>
    );
  }

  // Desktop
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-background w-full" dir={isRTL ? 'rtl' : 'ltr'}>
        <TopNavBar
          onOpenHypnosis={() => setHypnosisOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 pb-32 max-w-screen-xl mx-auto w-full">
          {children}
        </main>

        {!isAuroraTab && (
          <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center">
            <AuroraChatBubbles />
            <GlobalChatInput />
          </div>
        )}

        <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
        <HypnosisModal open={hypnosisOpen} onOpenChange={setHypnosisOpen} />
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
