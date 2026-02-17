import { ReactNode, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsMobile } from '@/hooks/use-mobile';

import { TopNavBar } from '@/components/navigation/TopNavBar';
import { HeaderActions } from '@/components/navigation/HeaderActions';
import { AppNameDropdown } from '@/components/navigation/AppNameDropdown';
import { AuroraDock } from '@/components/aurora/AuroraDock';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { SettingsModal } from '@/components/settings';

import { SidebarProvider } from '@/components/ui/sidebar';
import { AuroraActionsProvider } from '@/contexts/AuroraActionsContext';

interface DashboardLayoutProps {
  children: ReactNode;
  currentConversationId?: string | null;
  onNewChat?: () => void | Promise<boolean>;
  onSelectConversation?: (id: string) => void;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isRTL } = useTranslation();
  const isMobile = useIsMobile();
  const [settingsOpen, setSettingsOpen] = useState(false);
  

  if (isMobile) {
    return (
      <AuroraActionsProvider>
        <SidebarProvider>
          <div className="min-h-screen flex flex-col bg-background w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-lg">
              <div className="flex h-12 items-center justify-between px-3">
                <AppNameDropdown compact onOpenSettings={() => setSettingsOpen(true)} />
                <HeaderActions compact />
              </div>
            </header>

            <main className="flex-1 min-h-0 overflow-y-auto px-3 pt-2 pb-36">
              {children}
            </main>

            <AuroraDock />
            <BottomTabBar />
            <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
          </div>
        </SidebarProvider>
      </AuroraActionsProvider>
    );
  }

  return (
    <AuroraActionsProvider>
      <SidebarProvider>
        <div className="min-h-screen flex flex-col bg-background w-full" dir={isRTL ? 'rtl' : 'ltr'}>
          <TopNavBar
            onOpenSettings={() => setSettingsOpen(true)}
          />

          <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 pb-36 max-w-screen-xl mx-auto w-full">
            {children}
          </main>

          <AuroraDock />

          <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
          
        </div>
      </SidebarProvider>
    </AuroraActionsProvider>
  );
};

export default DashboardLayout;
