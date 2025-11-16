import { NavLink } from "react-router-dom";
import { Settings, HelpCircle, Quote, ShoppingBag, LogOut, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  isMobile?: boolean;
  onNavigate?: () => void;
}

const AdminSidebar = ({ isMobile = false, onNavigate }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "התנתקת בהצלחה",
      description: "להתראות!",
    });
    navigate("/admin/login");
    onNavigate?.();
  };

  const navItems = [
    { to: "/admin/settings", icon: Settings, label: "הגדרות" },
    { to: "/admin/faqs", icon: HelpCircle, label: "שאלות נפוצות" },
    { to: "/admin/testimonials", icon: Quote, label: "המלצות" },
    { to: "/admin/purchases", icon: ShoppingBag, label: "רכישות" },
    { to: "/admin/users", icon: Users, label: "משתמשים" },
  ];

  return (
    <aside className={cn(
      "w-64 glass-panel border-l border-primary/20 flex flex-col",
      !isMobile && "h-screen"
    )}>
      <div className="p-6 border-b border-primary/20">
        <h2 className="text-2xl font-black cyber-glow">פאנל ניהול</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => onNavigate?.()}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                "hover:bg-primary/10",
                isActive && "bg-primary/20 cyber-glow"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-primary/20">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-all hover:bg-destructive/10 text-destructive"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">התנתק</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
