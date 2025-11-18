import { useState } from "react";
import { Brain, Menu, Home } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { NotificationBell } from "./NotificationBell";

const AdminHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 glass-panel" dir="rtl">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Logo/Title */}
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary cyber-glow" />
          <h1 className="text-xl font-black cyber-glow">פאנל ניהול</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <NotificationBell />

          {/* Home Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-1 sm:gap-2 h-9 px-2 sm:px-4"
          >
            <Home className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline text-xs sm:text-sm">דף הבית</span>
          </Button>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0" dir="rtl">
              <AdminSidebar 
                isMobile={true} 
                onNavigate={() => setMobileMenuOpen(false)} 
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
