import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { MessageSquare, Users, Calendar, Trophy } from 'lucide-react';

const CommunityNavTabs = () => {
  const { t, isRTL } = useTranslation();
  const location = useLocation();

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
    <div className={cn(
      "w-full border-b border-border/50",
      isRTL && "rtl"
    )}>
      <div className="flex">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all relative",
                "hover:bg-muted/50",
                active 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CommunityNavTabs;
