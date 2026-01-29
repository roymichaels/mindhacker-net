import { ReactNode, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsMobile } from '@/hooks/use-mobile';
import DashboardSidebar from './DashboardSidebar';
import DashboardRightPanel from './DashboardRightPanel';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, PanelRightOpen } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isRTL } = useTranslation();
  const isMobile = useIsMobile();
  const [leftSheetOpen, setLeftSheetOpen] = useState(false);
  const [rightSheetOpen, setRightSheetOpen] = useState(false);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-16" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Mobile Header with Menu Buttons */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-2 flex items-center justify-between">
          <Sheet open={leftSheetOpen} onOpenChange={setLeftSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? "right" : "left"} className="w-80 p-0">
              <DashboardSidebar onNavigate={() => setLeftSheetOpen(false)} />
            </SheetContent>
          </Sheet>

          <Sheet open={rightSheetOpen} onOpenChange={setRightSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <PanelRightOpen className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? "left" : "right"} className="w-80 p-0 overflow-y-auto">
              <DashboardRightPanel />
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content - add padding for bottom nav */}
        <main className="p-4 pb-20">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex max-w-[1800px] mx-auto">
        {/* Left Sidebar */}
        <aside className="w-72 shrink-0 sticky top-0 h-screen overflow-y-auto border-e hidden lg:block">
          <DashboardSidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 lg:p-6">
          {children}
        </main>

        {/* Right Panel */}
        <aside className="w-80 shrink-0 sticky top-0 h-screen overflow-y-auto border-s hidden xl:block">
          <DashboardRightPanel />
        </aside>
      </div>
    </div>
  );
};

export default DashboardLayout;
