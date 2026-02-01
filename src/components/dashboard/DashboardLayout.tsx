import { ReactNode, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsMobile } from '@/hooks/use-mobile';
import DashboardSidebar from './DashboardSidebar';
import DashboardRightPanel from './DashboardRightPanel';
import GlobalChatInput from './GlobalChatInput';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import Header from '@/components/Header';
import { ProfileDrawer } from './ProfileDrawer';

interface DashboardLayoutProps {
  children: ReactNode;
  // Aurora-specific props for sidebar integration
  currentConversationId?: string | null;
  onNewChat?: () => void;
  onSelectConversation?: (id: string) => void;
  hideRightPanel?: boolean;
}

// Separate component for desktop layout to access sidebar context
interface DesktopLayoutContentProps {
  children: ReactNode;
  isRTL: boolean;
  currentConversationId?: string | null;
  onNewChat?: () => void;
  onSelectConversation?: (id: string) => void;
  hideRightPanel: boolean;
  profileOpen: boolean;
  setProfileOpen: (open: boolean) => void;
  handleOpenSettings: () => void;
}

const DesktopLayoutContent = ({
  children,
  isRTL,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  hideRightPanel,
  profileOpen,
  setProfileOpen,
  handleOpenSettings,
}: DesktopLayoutContentProps) => {
  const sidebar = useSidebar();
  const isExpanded = sidebar?.state === 'expanded';
  
  // Sidebar width: expanded = 16rem (w-64), collapsed = 3rem (w-12 for icons)
  const sidebarWidth = isExpanded ? '16rem' : '3rem';

  return (
    <div className="min-h-screen flex flex-col bg-background w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Global Header */}
      <Header />
      
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar - Aurora style */}
        <DashboardSidebar 
          currentConversationId={currentConversationId}
          onNewChat={onNewChat}
          onSelectConversation={onSelectConversation}
          onOpenSettings={handleOpenSettings}
        />

        {/* Main Content */}
        <main className="flex-1 min-w-0 min-h-0 overflow-hidden p-4 lg:p-6 pb-32 flex flex-col bg-card/60 backdrop-blur-sm">
          {children}
        </main>

        {/* Right Panel */}
        {!hideRightPanel && (
          <aside className="w-80 shrink-0 sticky top-0 h-[calc(100vh-4rem)] overflow-y-auto border-s hidden xl:block">
            <DashboardRightPanel />
          </aside>
        )}
      </div>

      {/* Global Chat Input - fixed at bottom, adjusts for sidebar */}
      <div 
        className="fixed bottom-0 right-0 z-40 transition-all duration-200"
        style={{ 
          [isRTL ? 'right' : 'left']: sidebarWidth,
          [isRTL ? 'left' : 'right']: 0 
        }}
      >
        <GlobalChatInput />
      </div>

      {/* Profile/Settings Drawer */}
      <ProfileDrawer open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
};

const DashboardLayout = ({ 
  children,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  hideRightPanel = false,
}: DashboardLayoutProps) => {
  const { isRTL } = useTranslation();
  const isMobile = useIsMobile();
  const [leftSheetOpen, setLeftSheetOpen] = useState(false);
  const [rightSheetOpen, setRightSheetOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleOpenSettings = () => {
    setLeftSheetOpen(false); // Close sidebar sheet on mobile
    setProfileOpen(true);
  };

  if (isMobile) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex flex-col bg-background w-full" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Global Header with menu callback */}
          <Header onMenuClick={() => setLeftSheetOpen(true)} />
          
          {/* Left Sidebar Sheet - render content directly without nested Sidebar */}
          <Sheet open={leftSheetOpen} onOpenChange={setLeftSheetOpen}>
            <SheetContent side={isRTL ? "right" : "left"} className="w-80 p-0">
              <DashboardSidebar 
                isMobileSheet={true}
                onNavigate={() => setLeftSheetOpen(false)}
                currentConversationId={currentConversationId}
                onNewChat={onNewChat}
                onSelectConversation={onSelectConversation}
                onOpenSettings={handleOpenSettings}
              />
            </SheetContent>
          </Sheet>

          {/* Right Panel Sheet */}
          {!hideRightPanel && (
            <Sheet open={rightSheetOpen} onOpenChange={setRightSheetOpen}>
              <SheetContent side={isRTL ? "left" : "right"} className="w-80 p-0 overflow-y-auto">
                <DashboardRightPanel />
              </SheetContent>
            </Sheet>
          )}

          {/* Profile/Settings Drawer */}
          <ProfileDrawer open={profileOpen} onOpenChange={setProfileOpen} />

          {/* Main Content - edge-to-edge on mobile for stretched feel */}
          <main className="flex-1 flex flex-col px-0 min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col px-3 pt-3 bg-card/80 backdrop-blur-sm rounded-t-2xl mt-2 mx-1">
              {children}
            </div>
          </main>

          {/* Global Chat Input - fixed at bottom */}
          <div className="fixed bottom-16 left-0 right-0 z-40">
            <GlobalChatInput />
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <DesktopLayoutContent
        isRTL={isRTL}
        currentConversationId={currentConversationId}
        onNewChat={onNewChat}
        onSelectConversation={onSelectConversation}
        hideRightPanel={hideRightPanel}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
        handleOpenSettings={handleOpenSettings}
      >
        {children}
      </DesktopLayoutContent>
    </SidebarProvider>
  );
};

export default DashboardLayout;
