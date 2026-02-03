import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';
import { NotificationBell } from '@/components/admin/NotificationBell';

const AdminPanel = () => {
  const { isRTL } = useTranslation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background">
          <div className="grid grid-cols-3 h-14 items-center px-4">
            {/* Left: Menu Button */}
            <div className="flex justify-start">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSidebarOpen(prev => !prev)}
                aria-label="Menu"
                className="h-9 w-9"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Center: Logo */}
            <div className="flex justify-center">
              <Link to="/panel" className="flex items-center hover:opacity-80 transition-opacity">
                <AuroraOrbIcon className="w-10 h-10 text-primary" size={40} />
              </Link>
            </div>
            
            {/* Right: Notification Icon */}
            <div className="flex justify-end items-center">
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Sheet */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side={isRTL ? "right" : "left"} className="w-80 p-0 bg-background border-border" hideClose>
            <AdminSidebar isMobile onNavigate={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main content */}
        <main className="flex-1 p-3 sm:p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-background text-foreground flex" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Desktop sidebar */}
      <AdminSidebar />
      {/* Main content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminPanel;
