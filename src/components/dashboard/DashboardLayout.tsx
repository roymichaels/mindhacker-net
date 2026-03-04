import { ReactNode, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLearnPillarAction } from '@/hooks/useLearnPillarAction';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebarContext } from '@/contexts/SidebarContext';

import { TopNavBar } from '@/components/navigation/TopNavBar';
import { HeaderActions } from '@/components/navigation/HeaderActions';
import { AppNameDropdown } from '@/components/navigation/AppNameDropdown';
import { AuroraDock } from '@/components/aurora/AuroraDock';
import { AuroraFloatingOrb } from '@/components/aurora/AuroraFloatingOrb';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { SettingsModal } from '@/components/settings';
import { HudSidebar } from '@/components/dashboard/HudSidebar';
import { RoadmapSidebar } from '@/components/dashboard/RoadmapSidebar';

import { SidebarProvider } from '@/components/ui/sidebar';
import { AuroraActionsProvider } from '@/contexts/AuroraActionsContext';

interface DashboardLayoutProps {
  children: ReactNode;
  leftSidebar?: ReactNode;
  rightSidebar?: ReactNode;
  currentConversationId?: string | null;
  onNewChat?: () => void | Promise<boolean>;
  onSelectConversation?: (id: string) => void;
}

const DashboardLayout = ({ children, leftSidebar: propLeft, rightSidebar: propRight }: DashboardLayoutProps) => {
  const { isRTL } = useTranslation();
  const isMobile = useIsMobile();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Read from SidebarContext (set by hub pages via useSidebars hook)
  // Props take priority > context > defaults
  const ctx = useSidebarContext();
  const leftSidebar = propLeft !== undefined ? propLeft : ctx.leftSidebar;
  const rightSidebar = propRight !== undefined ? propRight : ctx.rightSidebar;

  return (
    <AuroraActionsProvider>
      <SidebarProvider>
        <div className="h-screen flex flex-col bg-background w-full overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
          {isMobile ? (
            <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-lg">
              <div className="flex h-14 items-center justify-between px-3">
                <AppNameDropdown compact onOpenSettings={() => setSettingsOpen(true)} />
                <HeaderActions compact />
              </div>
            </header>
          ) : (
            <TopNavBar onOpenSettings={() => setSettingsOpen(true)} />
          )}

          <div className="flex-1 min-h-0 flex [&>aside]:pb-16 lg:[&>aside]:pb-14 [&>aside]:flex-shrink-0 [&>aside]:transition-all [&>aside]:duration-300">
            {leftSidebar !== null ? (leftSidebar || <HudSidebar />) : null}

            <main className="flex-1 min-h-0 min-w-0 overflow-y-auto scrollbar-hide px-2 lg:px-3 pt-0 pb-28 md:pb-14 flex flex-col transition-all duration-300">
              {children}
            </main>

            {rightSidebar !== null ? (rightSidebar || <RoadmapSidebar />) : null}
          </div>

          <AuroraFloatingOrb />
          <AuroraDock />
          {isMobile && <BottomTabBar />}
          <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
        </div>
      </SidebarProvider>
    </AuroraActionsProvider>
  );
};

export default DashboardLayout;
