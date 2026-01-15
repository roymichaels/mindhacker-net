import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  Settings, HelpCircle, Quote, ShoppingBag, LogOut, Users, Library, 
  BarChart3, Bell, Mail, Headphones, FileEdit, Layout, 
  Newspaper, ChevronDown, ChevronRight, LayoutDashboard, Target, UserPlus,
  FileVideo, Globe, Plus, Bot
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AdminSidebarProps {
  isMobile?: boolean;
  onNavigate?: () => void;
}

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
}

interface NavGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
  colorClass?: string;
}

const AdminSidebar = ({ isMobile = false, onNavigate }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t, isRTL } = useTranslation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Fetch unread notifications count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['admin-unread-notifications'],
    queryFn: async () => {
      const { count } = await supabase
        .from('admin_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);
      return count || 0;
    },
  });

  // Fetch new leads count
  const { data: newLeadsCount = 0 } = useQuery({
    queryKey: ['admin-new-leads'],
    queryFn: async () => {
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');
      return count || 0;
    },
  });

  // Fetch draft campaigns count
  const { data: draftCampaignsCount = 0 } = useQuery({
    queryKey: ['admin-draft-campaigns'],
    queryFn: async () => {
      const { count } = await supabase
        .from('newsletter_campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft');
      return count || 0;
    },
  });

  const navGroups: NavGroup[] = [
    {
      id: 'command-center',
      label: t('admin.groups.commandCenter'),
      icon: LayoutDashboard,
      colorClass: 'text-cyan-400',
      items: [
        { to: "/admin/analytics", icon: BarChart3, label: t('admin.analytics') },
        { to: "/admin/notifications", icon: Bell, label: t('admin.notifications'), badge: unreadCount },
      ]
    },
    {
      id: 'campaigns',
      label: t('admin.groups.campaigns'),
      icon: Target,
      colorClass: 'text-orange-400',
      items: [
        { to: "/admin/newsletter", icon: Newspaper, label: t('admin.newsletter'), badge: draftCampaignsCount },
        { to: "/admin/leads", icon: Mail, label: t('admin.leads'), badge: newLeadsCount },
        { to: "/admin/products", icon: ShoppingBag, label: t('admin.products') },
        { to: "/admin/purchases", icon: ShoppingBag, label: t('admin.purchases') },
        { to: "/admin/affiliates", icon: UserPlus, label: t('admin.affiliates') },
      ]
    },
    {
      id: 'content',
      label: t('admin.groups.content'),
      icon: FileVideo,
      colorClass: 'text-purple-400',
      items: [
        { to: "/admin/content", icon: Library, label: t('admin.content') },
        { to: "/admin/videos", icon: FileVideo, label: t('admin.videos') },
        { to: "/admin/recordings", icon: Headphones, label: t('admin.recordings') },
        { to: "/admin/forms", icon: FileEdit, label: t('admin.forms') },
      ]
    },
    {
      id: 'site',
      label: t('admin.groups.site'),
      icon: Globe,
      colorClass: 'text-green-400',
      items: [
        { to: "/admin/homepage", icon: Layout, label: t('admin.homepage') },
        { to: "/admin/faqs", icon: HelpCircle, label: t('admin.faqs') },
        { to: "/admin/testimonials", icon: Quote, label: t('admin.testimonials') },
      ]
    },
    {
      id: 'system',
      label: t('admin.groups.system'),
      icon: Settings,
      colorClass: 'text-gray-400',
      items: [
        { to: "/admin/users", icon: Users, label: t('admin.users') },
        { to: "/admin/chat-assistant", icon: Bot, label: t('admin.chatAssistant.title') },
        { to: "/admin/settings", icon: Settings, label: t('admin.settings') },
      ]
    },
  ];

  // Auto-expand group containing current route
  useEffect(() => {
    const currentPath = location.pathname;
    const activeGroup = navGroups.find(group => 
      group.items.some(item => currentPath.startsWith(item.to))
    );
    if (activeGroup) {
      setOpenGroups(prev => ({ ...prev, [activeGroup.id]: true }));
    }
  }, [location.pathname]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: t('messages.logoutSuccess'),
      description: t('messages.goodbye'),
    });
    navigate("/admin/login");
    onNavigate?.();
  };

  const isItemActive = (path: string) => location.pathname === path;
  const isGroupActive = (group: NavGroup) => 
    group.items.some(item => location.pathname.startsWith(item.to));

  const getGroupBadgeCount = (group: NavGroup) => 
    group.items.reduce((sum, item) => sum + (item.badge || 0), 0);

  return (
    <aside className={cn(
      "w-72 glass-panel flex flex-col",
      isMobile 
        ? "h-full border-l rtl:border-l-0 rtl:border-r border-primary/20" 
        : "h-screen border-r rtl:border-r-0 rtl:border-l border-primary/20"
    )} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="p-4 border-b border-primary/20 flex-shrink-0">
        <h2 className="text-xl font-black cyber-glow text-center">{t('admin.panelTitle')}</h2>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-primary/20 flex-shrink-0">
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 text-xs gap-1 h-8"
            onClick={() => { navigate('/admin/newsletter'); onNavigate?.(); }}
          >
            <Plus className="w-3 h-3" />
            {t('admin.quickActions.newCampaign')}
          </Button>
          <Button 
            size="sm" 
            variant={newLeadsCount > 0 ? "default" : "ghost"} 
            className="relative h-8 px-3"
            onClick={() => { navigate('/admin/leads'); onNavigate?.(); }}
          >
            <Mail className="w-4 h-4" />
            {newLeadsCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 rtl:-left-1 rtl:right-auto h-4 w-4 p-0 flex items-center justify-center text-[10px]"
              >
                {newLeadsCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
        {navGroups.map((group) => {
          const isOpen = openGroups[group.id] ?? false;
          const groupBadgeCount = getGroupBadgeCount(group);
          const groupIsActive = isGroupActive(group);

          return (
            <Collapsible
              key={group.id}
              open={isOpen}
              onOpenChange={() => toggleGroup(group.id)}
            >
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all",
                    "hover:bg-primary/10 group",
                    groupIsActive && "bg-primary/5"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <group.icon className={cn("w-4 h-4", group.colorClass)} />
                    <span className={cn(
                      "text-sm font-semibold uppercase tracking-wider",
                      groupIsActive ? "text-primary" : "text-muted-foreground"
                    )}>
                      {group.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isOpen && groupBadgeCount > 0 && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                        {groupBadgeCount}
                      </Badge>
                    )}
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform rtl:rotate-180" />
                    )}
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-0.5 mt-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => onNavigate?.()}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center justify-between gap-3 px-3 py-2 rounded-md transition-all",
                        "hover:bg-primary/10 ms-6",
                        isActive && "bg-primary/20 cyber-glow"
                      )
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="h-5 px-1.5 text-[10px]"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </NavLink>
                ))}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-primary/20 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg transition-all hover:bg-destructive/10 text-destructive"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{t('common.logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
