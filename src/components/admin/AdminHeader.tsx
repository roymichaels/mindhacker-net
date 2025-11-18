import { useState } from "react";
import { Brain, Menu, Home } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

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
          {/* Home Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">דף הבית</span>
          </Button>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 p-0" dir="rtl">
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
