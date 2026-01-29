import { NavLink, useLocation } from 'react-router-dom';
import { Home, MessageCircle } from 'lucide-react';
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

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t safe-area-inset-bottom"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-around h-14">
        {/* Dashboard Tab */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-xs transition-colors",
            isActive && !location.pathname.startsWith('/messages')
              ? "text-primary" 
              : "text-muted-foreground"
          )}
        >
          <Home className="h-5 w-5" />
          <span>{t('common.dashboard')}</span>
        </NavLink>

        {/* Messages Tab */}
        <NavLink
          to="/messages"
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-xs transition-colors",
            isActive || location.pathname.startsWith('/messages')
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
