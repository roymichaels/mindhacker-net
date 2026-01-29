import { NavLink, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsMobile } from '@/hooks/use-mobile';

const GlobalBottomNav = () => {
  const { user } = useAuth();
  const { t, isRTL } = useTranslation();
  const isMobile = useIsMobile();
  const location = useLocation();

  // Only show for authenticated users on mobile
  if (!user || !isMobile) return null;

  // Don't show on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  const isOnCommunity = location.pathname.startsWith('/community');
  const isOnMessages = location.pathname.startsWith('/messages');
  const isOnDashboard = location.pathname === '/dashboard' || 
    location.pathname.startsWith('/courses') || 
    location.pathname.startsWith('/affiliate');

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t safe-area-inset-bottom"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-around h-14">
        {/* Dashboard Tab */}
        <NavLink
          to="/dashboard"
          className={() => cn(
            "flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-xs transition-colors",
            isOnDashboard
              ? "text-primary" 
              : "text-muted-foreground"
          )}
        >
          <Home className="h-5 w-5" />
          <span>{t('common.dashboard')}</span>
        </NavLink>

        {/* Community Tab */}
        <NavLink
          to="/community"
          className={() => cn(
            "flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-xs transition-colors",
            isOnCommunity
              ? "text-primary" 
              : "text-muted-foreground"
          )}
        >
          <Users className="h-5 w-5" />
          <span>{t('community.title')}</span>
        </NavLink>

        {/* Messages Tab */}
        <NavLink
          to="/messages"
          className={() => cn(
            "flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-xs transition-colors",
            isOnMessages
              ? "text-primary" 
              : "text-muted-foreground"
          )}
        >
          <MessageCircle className="h-5 w-5" />
          <span>{t('messages.title')}</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default GlobalBottomNav;
