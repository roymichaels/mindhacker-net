import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NavLink } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { 
  BookOpen, 
  Crown,
  Headphones,
  TrendingUp,
  LogOut,
  Home,
  MessageCircle,
  ShoppingBag,
  Users,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface DashboardSidebarProps {
  onNavigate?: () => void;
}

const DashboardSidebar = ({ onNavigate }: DashboardSidebarProps) => {
  const { t, isRTL } = useTranslation();
  const { user } = useAuth();
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success(t('messages.logoutSuccess'));
    navigate('/');
  };

  // Main navigation items (same as bottom nav on mobile)
  const mainNavItems = [
    { to: '/dashboard', icon: Home, label: t('common.dashboard'), exact: true },
    { to: '/messages', icon: MessageCircle, label: t('messages.title') },
    { to: '/aurora', icon: Sparkles, label: t('aurora.name') },
    { to: '/courses', icon: ShoppingBag, label: t('community.catalog') },
    { to: '/community', icon: Users, label: t('community.title') },
  ];

  const contentItems = [
    { to: '/courses', icon: BookOpen, label: t('common.courses') },
    { to: '/subscriptions', icon: Crown, label: t('common.subscriptions') },
    { to: '/dashboard/recordings', icon: Headphones, label: t('dashboard.myRecordings') },
    { to: '/affiliate', icon: TrendingUp, label: t('affiliate.title') },
  ];

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      {/* Profile Card */}
      <div className="bg-card rounded-xl p-4 border shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 ring-2 ring-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
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

      {/* Main Navigation */}
      <nav className="space-y-1">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={'exact' in item && item.exact}
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

      {/* Spacer */}
      <div className="flex-1" />

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
