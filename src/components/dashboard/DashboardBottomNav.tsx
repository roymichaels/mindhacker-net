import { NavLink } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { Home, Calendar, Users, Trophy, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const DashboardBottomNav = () => {
  const { t } = useTranslation();

  const navItems = [
    { to: '/dashboard', icon: Home, label: t('community.feed'), exact: true },
    { to: '/community/events', icon: Calendar, label: t('community.events') },
    { to: '/community/members', icon: Users, label: t('community.members') },
    { to: '/community/leaderboard', icon: Trophy, label: t('community.leaderboard') },
    { to: '/courses', icon: BookOpen, label: t('common.courses') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t safe-area-inset-bottom">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-xs transition-colors",
              isActive 
                ? "text-primary" 
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="truncate max-w-[60px]">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default DashboardBottomNav;
