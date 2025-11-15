import { NavLink } from "react-router-dom";
import { Settings, HelpCircle, Quote, ShoppingBag, LogOut, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "התנתקת בהצלחה",
      description: "להתראות!",
    });
    navigate("/admin/login");
  };

  const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/admin/settings", icon: Settings, label: "הגדרות" },
    { to: "/admin/faqs", icon: HelpCircle, label: "שאלות נפוצות" },
    { to: "/admin/testimonials", icon: Quote, label: "המלצות" },
    { to: "/admin/reviews", icon: ShoppingBag, label: "רכישות דמו" },
  ];

  return (
    <aside className="w-64 h-screen glass-panel border-l border-primary/20 flex flex-col">
      <div className="p-6 border-b border-primary/20">
        <h2 className="text-2xl font-black cyber-glow">פאנל ניהול</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
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
