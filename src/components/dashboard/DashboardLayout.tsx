import { ReactNode, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsMobile } from '@/hooks/use-mobile';
import DashboardSidebar from './DashboardSidebar';
import DashboardRightPanel from './DashboardRightPanel';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, PanelRightOpen } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Header from '@/components/Header';

interface DashboardLayoutProps {
  children: ReactNode;
  // Aurora-specific props for sidebar integration
  currentConversationId?: string | null;
  onNewChat?: () => void;
  onSelectConversation?: (id: string) => void;
  hideRightPanel?: boolean;
}

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

  if (isMobile) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex flex-col bg-background w-full" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Global Header with menu callback */}
          <Header onMenuClick={() => setLeftSheetOpen(true)} />
          
          {/* Left Sidebar (hidden on mobile, shown via Sheet) */}
          <Sheet open={leftSheetOpen} onOpenChange={setLeftSheetOpen}>
            <SheetContent side={isRTL ? "right" : "left"} className="w-80 p-0">
              <SidebarProvider>
                <DashboardSidebar 
                  onNavigate={() => setLeftSheetOpen(false)}
                  currentConversationId={currentConversationId}
                  onNewChat={onNewChat}
                  onSelectConversation={onSelectConversation}
                />
              </SidebarProvider>
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

          {/* Main Content - flex-1 to fill remaining height */}
          <main className="flex-1 flex flex-col p-4 pb-20 min-h-0">
            {children}
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-background w-full" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Global Header */}
        <Header />
        
        <div className="flex-1 flex min-h-0">
          {/* Left Sidebar - Aurora style */}
          <DashboardSidebar 
            currentConversationId={currentConversationId}
            onNewChat={onNewChat}
            onSelectConversation={onSelectConversation}
          />

          {/* Main Content */}
          <main className="flex-1 min-w-0 p-4 lg:p-6 flex flex-col">
            {children}
          </main>

          {/* Right Panel */}
          {!hideRightPanel && (
            <aside className="w-80 shrink-0 sticky top-0 h-[calc(100vh-4rem)] overflow-y-auto border-s hidden xl:block">
              <DashboardRightPanel />
            </aside>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
