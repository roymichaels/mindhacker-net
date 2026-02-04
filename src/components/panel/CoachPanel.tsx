import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import CoachSidebar from './CoachSidebar';
import { useTranslation } from '@/hooks/useTranslation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';

const CoachPanel = () => {
  const { isRTL, language } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHebrew = language === 'he';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Mobile Header - visible only on mobile */}
      <header className="lg:hidden sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent 
              side={isRTL ? "right" : "left"} 
              className="w-[85vw] max-w-sm p-0 border-border"
              hideClose
            >
              <CoachSidebar onNavigate={() => setMobileMenuOpen(false)} isMobileSheet />
            </SheetContent>
          </Sheet>
          
          {/* Center: Brand */}
          <Link to="/coach" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <AuroraOrbIcon size={28} className="text-primary" />
            <span className="font-bold text-sm">
              {isHebrew ? 'מרכז שליטה' : 'Control Center'}
            </span>
          </Link>
          
          {/* Spacer for balance */}
          <div className="w-9" />
        </div>
      </header>

      {/* Desktop sidebar - hidden on mobile, full height */}
      <div className="hidden lg:block">
        <CoachSidebar />
      </div>

      {/* Main content - add padding-bottom on mobile for safe area */}
      <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-auto pb-20 lg:pb-8">
        <Outlet />
      </main>
    </div>
  );
};

export default CoachPanel;