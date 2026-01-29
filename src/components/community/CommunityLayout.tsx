import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  MessageSquare, 
  Users, 
  Calendar, 
  Trophy
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
    <div className={cn("min-h-screen bg-background pb-20", isRTL && "rtl")}>
      {/* Top Navigation Bar - Bookmark Style */}
      <div className="sticky top-16 z-40 bg-card border-b">
        <div className="flex overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative flex-1 justify-center",
                  "hover:bg-muted/50",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 max-w-2xl">
        {children}
      </main>
    </div>
  );
};

export default CommunityLayout;
