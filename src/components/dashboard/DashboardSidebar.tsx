import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NavLink, useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Calendar, 
  Users, 
  Trophy, 
  BookOpen, 
  Headphones,
  Crown,
  TrendingUp,
  LogOut,
  Settings
} from 'lucide-react';
import OnlineMembers from '@/components/community/OnlineMembers';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface DashboardSidebarProps {
  onNavigate?: () => void;
}

const DashboardSidebar = ({ onNavigate }: DashboardSidebarProps) => {
  const { t, isRTL, language } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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

  const { data: member } = useQuery({
    queryKey: ['community-member', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('community_members')
        .select(`
          *,
          current_level:community_levels(name, name_en, min_points, badge_color)
        `)
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: nextLevel } = useQuery({
    queryKey: ['next-level', member?.total_points],
    queryFn: async () => {
      if (!member?.total_points) return null;
      const { data } = await supabase
        .from('community_levels')
        .select('*')
        .gt('min_points', member.total_points)
        .order('min_points', { ascending: true })
        .limit(1)
        .single();
      return data;
    },
    enabled: !!member?.total_points,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success(t('messages.logoutSuccess'));
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: Home, label: t('community.feed'), exact: true },
    { to: '/community/events', icon: Calendar, label: t('community.events') },
    { to: '/community/members', icon: Users, label: t('community.members') },
    { to: '/community/leaderboard', icon: Trophy, label: t('community.leaderboard') },
  ];

  const contentItems = [
    { to: '/courses', icon: BookOpen, label: t('common.courses') },
    { to: '/subscriptions', icon: Crown, label: t('common.subscriptions') },
  ];

  const progressToNext = nextLevel && member?.current_level
    ? ((member.total_points || 0) - (member.current_level.min_points || 0)) / 
      (nextLevel.min_points - (member.current_level.min_points || 0)) * 100
    : 0;

  const levelName = member?.current_level 
    ? (language === 'he' ? member.current_level.name : member.current_level.name_en)
    : null;

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      {/* Profile Card */}
      <div className="bg-card rounded-xl p-4 border shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-12 w-12 ring-2 ring-primary/20">
            <AvatarImage src={member?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">
              {profile?.full_name || user?.email?.split('@')[0]}
            </p>
            {levelName && (
              <Badge 
                variant="secondary" 
                className="text-xs"
                style={{ backgroundColor: member?.current_level?.badge_color || undefined }}
              >
                {levelName}
              </Badge>
            )}
          </div>
        </div>

        {/* Level Progress */}
        {nextLevel && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{member?.total_points || 0} {t('community.points')}</span>
              <span>{nextLevel.min_points} {t('community.toNextLevel')}</span>
            </div>
            <Progress value={progressToNext} className="h-2" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground px-3 mb-2">
          {t('community.title')}
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            onClick={onNavigate}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Content Section */}
      <nav className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground px-3 mb-2">
          {t('dashboard.yourContent')}
        </p>
        {contentItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Online Members */}
      <div className="flex-1" />
      <OnlineMembers />

      {/* Logout */}
      <Button 
        variant="ghost" 
        className="w-full justify-start text-muted-foreground hover:text-destructive"
        onClick={handleLogout}
      >
        <LogOut className={cn("h-4 w-4", isRTL ? "ml-3" : "mr-3")} />
        {t('common.logout')}
      </Button>
    </div>
  );
};

export default DashboardSidebar;
