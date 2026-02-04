import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Home } from 'lucide-react';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';
import { NotificationBell } from '@/components/admin/NotificationBell';

const AdminPanel = () => {
  const { isRTL } = useTranslation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Mobile Header - Fixed at top */}
        <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border/50 bg-background/95 backdrop-blur-sm">
          <div className="grid grid-cols-3 h-full items-center px-4">
            {/* Left: Menu Button */}
            <div className="flex justify-start">
              <button 
                type="button"
                onClick={() => setSidebarOpen(prev => !prev)}
                aria-label="Menu"
                className="h-11 w-11 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
            
            {/* Center: Logo */}
            <div className="flex justify-center">
              <Link to="/panel" className="flex items-center hover:opacity-80 transition-opacity">
                <AuroraOrbIcon className="w-10 h-10 text-primary" size={40} />
              </Link>
            </div>
            
            {/* Right: Home + Notification Icons */}
            <div className="flex justify-end items-center gap-1">
              <Link 
                to="/dashboard" 
                className="h-11 w-11 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                aria-label="Home"
              >
                <Home className="h-5 w-5" />
              </Link>
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Spacer for fixed header */}
        <div className="h-14 flex-shrink-0" />

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
