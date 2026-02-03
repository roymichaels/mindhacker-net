import { ReactNode, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsMobile } from '@/hooks/use-mobile';
import DashboardSidebar from './DashboardSidebar';
import DashboardRightPanel from './DashboardRightPanel';
import GlobalChatInput from './GlobalChatInput';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { SettingsModal } from '@/components/settings';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';
import AuroraChatQuickActions from '@/components/aurora/AuroraChatQuickActions';
import { UserNotificationBell } from '@/components/UserNotificationBell';
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
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  handleOpenSettings: () => void;
}

const DesktopLayoutContent = ({
  children,
  isRTL,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  hideRightPanel,
  settingsOpen,
  setSettingsOpen,
  handleOpenSettings,
}: DesktopLayoutContentProps) => {
  const sidebar = useSidebar();
  const isExpanded = sidebar?.state === 'expanded';
  
  // Sidebar width: expanded = 16rem (w-64), collapsed = 3rem (w-12 for icons)
  const sidebarWidth = isExpanded ? '16rem' : '3rem';

  return (
    <div className="min-h-screen flex bg-background w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Fixed notification icons - always visible at top */}
      <div className={`fixed top-4 z-50 flex items-center gap-1 ${isRTL ? 'left-4' : 'right-4'}`}>
        <AuroraChatQuickActions />
        <UserNotificationBell />
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar - Aurora style */}
        <DashboardSidebar 
          currentConversationId={currentConversationId}
          onNewChat={onNewChat}
          onSelectConversation={onSelectConversation}
          onOpenSettings={handleOpenSettings}
        />

        {/* Main Content */}
        <main className="flex-1 min-w-0 min-h-0 overflow-hidden p-4 lg:p-6 pb-32 flex flex-col bg-sidebar backdrop-blur-sm">
          {children}
        </main>

        {/* Right Panel */}
        {!hideRightPanel && (
          <aside className="w-80 shrink-0 sticky top-0 h-screen overflow-y-auto border-s hidden xl:block">
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

      {/* Settings Modal */}
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
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
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleOpenSettings = () => {
    setLeftSheetOpen(false); // Close sidebar sheet on mobile
    setSettingsOpen(true);
  };

  const { theme: brandTheme } = useThemeSettings();
  const logoUrl = brandTheme.logo_url || "/logo.png?v=9";

  if (isMobile) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex flex-col bg-sidebar w-full" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Mobile Header with logo, menu and notification icons */}
          <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-sidebar">
            <div className="flex h-14 items-center justify-between px-4">
              {/* Left: Menu Button */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setLeftSheetOpen(prev => !prev)}
                aria-label="Menu"
                className="h-9 w-9"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Center: Brand */}
              <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <span className="font-bold text-sm text-foreground">
                  {isRTL ? brandTheme.brand_name : brandTheme.brand_name_en}
                </span>
                <AuroraOrbIcon className="w-10 h-10 text-black dark:text-white" size={40} />
              </Link>
              
              {/* Right: Notification Icons */}
              <div className="flex items-center gap-1">
                <AuroraChatQuickActions />
                <UserNotificationBell />
              </div>
            </div>
          </header>
          
          {/* Left Sidebar Sheet - render content directly without nested Sidebar */}
          <Sheet open={leftSheetOpen} onOpenChange={setLeftSheetOpen}>
            <SheetContent side={isRTL ? "right" : "left"} className="w-80 p-0 bg-background border-border" hideClose>
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

          {/* Settings Modal */}
          <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />

          {/* Main Content - edge-to-edge on mobile for stretched feel */}
          <main className="flex-1 flex flex-col px-0 min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col px-3 pt-3 bg-sidebar backdrop-blur-sm rounded-t-2xl mt-2 mx-1">
              {children}
            </div>
          </main>

          {/* Global Chat Input - fixed at bottom */}
          <div className="fixed bottom-0 left-0 right-0 z-40">
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
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        handleOpenSettings={handleOpenSettings}
      >
        {children}
      </DesktopLayoutContent>
    </SidebarProvider>
  );
};

export default DashboardLayout;
