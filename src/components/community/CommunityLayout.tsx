import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  MessageSquare, 
  Users, 
  Calendar, 
  Trophy, 
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import OnlineMembers from './OnlineMembers';
import LevelProgress from './LevelProgress';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface CommunityLayoutProps {
  children: ReactNode;
}

const CommunityLayout = ({ children }: CommunityLayoutProps) => {
  const { t, isRTL } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: memberData } = useQuery({
    queryKey: ['community-member', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('community_members')
        .select(`
          *,
          current_level:community_levels(*)
        `)
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id,
  });

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

  const navItems = [
    { path: '/community', label: t('community.feed'), icon: MessageSquare },
    { path: '/community/events', label: t('community.events'), icon: Calendar },
    { path: '/community/members', label: t('community.members'), icon: Users },
    { path: '/community/leaderboard', label: t('community.leaderboard'), icon: Trophy },
  ];

  const isActive = (path: string) => {
    if (path === '/community') {
      return location.pathname === '/community';
    }
    return location.pathname.startsWith(path);
  };

  // Sidebar Content Component
  const SidebarContent = ({ showLabels = true }: { showLabels?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* User Profile Card */}
      {user && showLabels && (
        <div className="p-4 border-b">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={memberData?.avatar_url || ''} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate text-sm">
                {profile?.full_name || t('community.member')}
              </p>
              {memberData?.current_level && (
                <Badge 
                  variant="secondary" 
                  className="text-xs"
                  style={{ backgroundColor: memberData.current_level.badge_color + '20', color: memberData.current_level.badge_color }}
                >
                  {isRTL ? memberData.current_level.name : memberData.current_level.name_en || memberData.current_level.name}
                </Badge>
              )}
            </div>
          </div>
          
          <LevelProgress 
            currentPoints={memberData?.total_points || 0}
            currentLevel={memberData?.current_level}
          />
          
          <div className="grid grid-cols-3 gap-2 mt-4 text-center text-sm">
            <div>
              <p className="font-bold">{memberData?.posts_count || 0}</p>
              <p className="text-muted-foreground text-xs">{t('community.posts')}</p>
            </div>
            <div>
              <p className="font-bold">{memberData?.comments_count || 0}</p>
              <p className="text-muted-foreground text-xs">{t('community.comments')}</p>
            </div>
            <div>
              <p className="font-bold">{memberData?.likes_received || 0}</p>
              <p className="text-muted-foreground text-xs">{t('community.likes')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent",
              isActive(item.path) && "bg-primary/10 text-primary border-s-2 border-primary",
              !showLabels && "justify-center px-2"
            )}
          >
            <item.icon className={cn("h-5 w-5 shrink-0", !showLabels && "h-6 w-6")} />
            {showLabels && <span className="truncate">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Online Members - only when expanded */}
      {showLabels && (
        <div className="p-4 border-t">
          <OnlineMembers />
        </div>
      )}
    </div>
  );

  // Mobile: Use Sheet for sidebar
  if (isMobile) {
    return (
      <div className={cn("min-h-screen bg-background pb-20", isRTL && "rtl")}>
        {/* Mobile Header with Menu Button */}
        <div className="sticky top-16 z-30 bg-background/95 backdrop-blur border-b px-4 py-2 flex items-center gap-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? "right" : "left"} className="w-72 p-0">
              <div className="h-full bg-card overflow-y-auto">
                <SidebarContent showLabels />
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="flex-1">
            <h2 className="font-semibold">
              {navItems.find(item => isActive(item.path))?.label || t('community.feed')}
            </h2>
          </div>
        </div>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-4">
          {children}
        </main>
      </div>
    );
  }

  // Desktop: Collapsible Sidebar
  return (
    <div className={cn("min-h-screen bg-background", isRTL && "rtl")}>
      <div className="flex min-h-[calc(100vh-5rem)]">
        {/* Sidebar */}
        <aside 
          className={cn(
            "sticky top-20 h-[calc(100vh-5rem)] bg-card border-e transition-all duration-300 flex flex-col",
            collapsed ? "w-16" : "w-64"
          )}
        >
          {/* Toggle Button */}
          <div className="p-2 flex justify-end border-b">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8"
            >
              {collapsed 
                ? (isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)
                : (isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />)
              }
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <SidebarContent showLabels={!collapsed} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            {children}
          </div>
        </main>

        {/* Right Sidebar - Hidden on smaller screens */}
        <aside className="hidden xl:block w-72 sticky top-20 h-[calc(100vh-5rem)] border-s overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Quick Stats */}
            <div className="bg-card rounded-lg p-4 border">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t('community.stats')}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('community.totalPoints')}</span>
                  <span className="font-semibold">{memberData?.total_points || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('community.memberSince')}</span>
                  <span className="font-semibold">
                    {memberData?.joined_at 
                      ? new Date(memberData.joined_at).toLocaleDateString(isRTL ? 'he-IL' : 'en-US', { month: 'short', year: 'numeric' })
                      : '-'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Online Members */}
            <OnlineMembers />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CommunityLayout;
