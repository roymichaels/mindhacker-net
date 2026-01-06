import { NavLink } from "react-router-dom";
import { Settings, HelpCircle, Quote, ShoppingBag, LogOut, Users, Library, BarChart3, Bell, Mail, Menu, Headphones, Sparkles, FileEdit, Layout } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface AdminSidebarProps {
  isMobile?: boolean;
  onNavigate?: () => void;
}

const AdminSidebar = ({ isMobile = false, onNavigate }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, isRTL } = useTranslation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: t('messages.logoutSuccess'),
      description: t('messages.goodbye'),
    });
    navigate("/admin/login");
    onNavigate?.();
  };

  const navItems = [
    { to: "/admin/analytics", icon: BarChart3, label: t('admin.analytics') },
    { to: "/admin/notifications", icon: Bell, label: t('admin.notifications') },
    { to: "/admin/content", icon: Library, label: t('admin.content') },
    { to: "/admin/recordings", icon: Headphones, label: t('admin.recordings') },
    { to: "/admin/forms", icon: FileEdit, label: t('admin.forms') },
    { to: "/admin/users", icon: Users, label: t('admin.users') },
    { to: "/admin/purchases", icon: ShoppingBag, label: t('admin.purchases') },
    { to: "/admin/leads", icon: Mail, label: t('admin.leads') },
    { to: "/admin/consciousness-leap", icon: Sparkles, label: t('admin.consciousnessLeap') },
    { to: "/admin/faqs", icon: HelpCircle, label: t('admin.faqs') },
    { to: "/admin/testimonials", icon: Quote, label: t('admin.testimonials') },
    { to: "/admin/menu", icon: Menu, label: t('admin.menu') },
    { to: "/admin/homepage", icon: Layout, label: t('admin.homepage') },
    { to: "/admin/settings", icon: Settings, label: t('admin.settings') },
  ];

  return (
    <aside className={cn(
      "w-64 glass-panel flex flex-col",
      isMobile ? "h-full border-r border-primary/20" : "h-screen border-l border-primary/20"
    )} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="p-6 border-b border-primary/20">
        <h2 className="text-2xl font-black cyber-glow">{t('admin.panelTitle')}</h2>
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
          <span className="font-medium">{t('common.logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
