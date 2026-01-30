import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  BookOpen, 
  Crown,
  Headphones,
  TrendingUp,
  LogOut,
  LayoutDashboard,
  MessageSquare,
  Users,
  Sparkles,
  Compass,
  Menu,
  UserCog
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

interface DashboardSidebarProps {
  onNavigate?: () => void;
}

const DashboardSidebar = ({ onNavigate }: DashboardSidebarProps) => {
  const { t, language, isRTL } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebar = useSidebar();
  const isCollapsed = sidebar?.state === 'collapsed';

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success(t('messages.logoutSuccess'));
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  // Main navigation items (matches Aurora sidebar)
  const mainNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: language === 'he' ? 'דאשבורד' : 'Dashboard' },
    { path: '/messages', icon: MessageSquare, label: language === 'he' ? 'צ\'אט' : 'Messages' },
    { path: '/aurora', icon: Sparkles, label: language === 'he' ? 'אורורה' : 'Aurora' },
    { path: '/courses', icon: BookOpen, label: language === 'he' ? 'קטלוג' : 'Catalog' },
    { path: '/community', icon: Users, label: language === 'he' ? 'קהילה' : 'Community' },
  ];

  // Content section items
  const contentItems = [
    { path: '/launchpad/settings', icon: UserCog, label: language === 'he' ? 'הפרופיל שלי' : 'My Profile' },
    { path: '/courses', icon: BookOpen, label: language === 'he' ? 'מוצרים דיגיטליים' : 'Digital Products' },
    { path: '/subscriptions', icon: Crown, label: language === 'he' ? 'מנויים' : 'Subscriptions' },
    { path: '/hypnosis', icon: Compass, label: language === 'he' ? 'ההקלטות שלי' : 'My Recordings' },
    { path: '/affiliate-dashboard', icon: TrendingUp, label: language === 'he' ? 'שותפים' : 'Affiliates' },
  ];

  return (
    <Sidebar 
      className={cn(
        "border-border bg-background !z-50",
        isRTL && "order-last"
      )}
      collapsible="offcanvas"
      side={isRTL ? "right" : "left"}
    >
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center gap-3", isCollapsed && "hidden")}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">
              {language === 'he' ? 'מיינד האקר' : 'MindHacker'}
            </span>
          </div>
          <SidebarTrigger className="shrink-0">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <ScrollArea className="flex-1">
          {/* Profile Card */}
          {!isCollapsed && (
            <div className="bg-card rounded-xl p-4 border shadow-sm mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {profile?.full_name || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Navigation */}
          <div className="space-y-1 mb-4">
            {mainNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground",
                    isCollapsed && "justify-center px-2"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>

          {/* Content Section */}
          {!isCollapsed && (
            <>
              <p className="text-xs font-medium text-muted-foreground px-3 mb-2 uppercase tracking-wider">
                {language === 'he' ? 'התוכן שלך' : 'Your Content'}
              </p>
              <div className="space-y-1">
                {contentItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path + item.label}
                      onClick={() => handleNavigation(item.path)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive 
                          ? "bg-primary/10 text-primary" 
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-border">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full text-muted-foreground hover:text-destructive",
            isCollapsed ? "justify-center px-2" : "justify-start"
          )}
          onClick={handleLogout}
        >
          <LogOut className={cn("h-4 w-4", !isCollapsed && (isRTL ? "ml-3" : "mr-3"))} />
          {!isCollapsed && (language === 'he' ? 'התנתקות' : 'Logout')}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
