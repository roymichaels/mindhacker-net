import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate, useLocation } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard,
  MessageSquare,
  Users,
  Sparkles,
  Compass,
  Menu
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import AuroraAccountDropdown from '@/components/aurora/AuroraAccountDropdown';

interface DashboardSidebarProps {
  onNavigate?: () => void;
}

const DashboardSidebar = ({ onNavigate }: DashboardSidebarProps) => {
  const { language, isRTL } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebar = useSidebar();
  const isCollapsed = sidebar?.state === 'collapsed';

  const handleNavigation = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  // Navigation items - cleaned up, removed Catalog
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: language === 'he' ? 'דאשבורד' : 'Dashboard' },
    { path: '/messages', icon: MessageSquare, label: language === 'he' ? 'הודעות' : 'Messages' },
    { path: '/aurora', icon: Sparkles, label: language === 'he' ? 'אורורה' : 'Aurora' },
    { path: '/community', icon: Users, label: language === 'he' ? 'קהילה' : 'Community' },
    { path: '/hypnosis', icon: Compass, label: language === 'he' ? 'היפנוזה' : 'Hypnosis' },
  ];

  return (
    <Sidebar 
      className={cn(
        "border-border bg-background !z-50 pt-16",
        isRTL && "order-last"
      )}
      collapsible="offcanvas"
      side={isRTL ? "right" : "left"}
    >
      <SidebarContent className="p-2">
        {/* Hamburger toggle at top */}
        <div className="flex justify-end mb-2">
          <SidebarTrigger className="shrink-0 p-2 hover:bg-muted rounded-lg">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
        </div>

        <ScrollArea className="flex-1">
          {/* Navigation Section */}
          {!isCollapsed && (
            <p className="text-xs text-muted-foreground px-3 mb-2 uppercase tracking-wider">
              {language === 'he' ? 'ניווט' : 'Navigate'}
            </p>
          )}
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
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
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-border">
        <AuroraAccountDropdown
          isCollapsed={isCollapsed}
          onOpenDashboard={() => handleNavigation('/dashboard')}
          onOpenSettings={() => handleNavigation('/launchpad/settings')}
          onOpenChecklists={() => handleNavigation('/aurora')}
        />
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
