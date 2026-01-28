import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  MessageSquare, 
  Users, 
  Calendar, 
  Trophy, 
  User,
  TrendingUp
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import OnlineMembers from './OnlineMembers';
import LevelProgress from './LevelProgress';

interface CommunityLayoutProps {
  children: ReactNode;
}

const CommunityLayout = ({ children }: CommunityLayoutProps) => {
  const { t, isRTL } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

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

  return (
    <div className={cn("min-h-screen bg-background", isRTL && "rtl")}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar */}
          <aside className="w-full lg:w-64 space-y-4">
            {/* User Profile Card */}
            {user && (
              <div className="bg-card rounded-lg p-4 border">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={memberData?.avatar_url || ''} />
                    <AvatarFallback>
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
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
            <nav className="bg-card rounded-lg border overflow-hidden">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent",
                    isActive(item.path) && "bg-primary/10 text-primary border-s-2 border-primary"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Online Members */}
            <OnlineMembers />
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>

          {/* Right Sidebar - Hidden on mobile */}
          <aside className="hidden xl:block w-72 space-y-4">
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

            {/* Top Contributors - Could be added */}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CommunityLayout;
