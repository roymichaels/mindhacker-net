import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Users, Sparkles, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsMobile } from '@/hooks/use-mobile';

const GlobalBottomNav = () => {
  const { user } = useAuth();
  const { t, isRTL, language } = useTranslation();
  const isMobile = useIsMobile();
  const location = useLocation();

  // Only show for authenticated users on mobile
  if (!user || !isMobile) return null;

  // Don't show on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: language === 'he' ? 'דאשבורד' : 'Dashboard' },
    { path: '/messages', icon: MessageSquare, label: language === 'he' ? 'הודעות' : 'Messages' },
    { path: '/aurora', icon: Sparkles, label: language === 'he' ? 'אורורה' : 'Aurora', isCenter: true },
    { path: '/community', icon: Users, label: language === 'he' ? 'קהילה' : 'Community' },
    { path: '/hypnosis', icon: Compass, label: language === 'he' ? 'היפנוזה' : 'Hypnosis' },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t safe-area-inset-bottom"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={() => cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-xs transition-colors",
                isActive
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              {item.isCenter ? (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center -mt-4 border-2 border-background shadow-lg">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
              ) : (
                <item.icon className="h-5 w-5" />
              )}
              <span className={item.isCenter ? "-mt-1" : ""}>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default GlobalBottomNav;
