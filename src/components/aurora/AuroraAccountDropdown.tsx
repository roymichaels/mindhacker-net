import { ChevronUp, Settings, LogOut, Globe, Sun, Moon, Shield, UserCog, Link2, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { PersonalizedOrb } from '@/components/orb';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuroraAccountDropdownProps {
  isCollapsed?: boolean;
  onOpenSettings?: () => void;
  showBackToAurora?: boolean;
}

const AuroraAccountDropdown = ({
  isCollapsed = false,
  onOpenSettings,
  showBackToAurora = false,
}: AuroraAccountDropdownProps) => {
  const { t, language, isRTL } = useTranslation();
  const { user } = useAuth();
  const { setLanguage } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const { hasRole } = useUserRoles();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = hasRole('admin');
  const isPractitioner = hasRole('practitioner');
  const isAffiliate = hasRole('affiliate');
  
  // Check if we're in the panel area
  const isInPanel = location.pathname.startsWith('/panel') || 
                    location.pathname.startsWith('/coach') || 
                    location.pathname.startsWith('/affiliate');

  // Fetch profile data
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

  // If full_name is just the email, show the username part instead
  const fullName = profile?.full_name;
  const isNameEmail = fullName && fullName.includes('@');
  const displayName = isNameEmail 
    ? fullName.split('@')[0] 
    : (fullName || user?.email?.split('@')[0] || 'User');
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleLanguageToggle = () => {
    setLanguage(language === 'he' ? 'en' : 'he');
  };

  const handleThemeToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleSettingsClick = () => {
    if (onOpenSettings) {
      onOpenSettings();
    }
    // If no callback provided, do nothing (avoid navigation crash)
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 h-auto py-2",
            isCollapsed && "justify-center px-2"
          )}
        >
          {/* Avatar - PersonalizedOrb matching Dashboard HUD */}
          <div className={cn(
            "shrink-0 relative flex items-center justify-center",
            isCollapsed ? "h-10 w-10" : "h-11 w-11"
          )}>
            {/* Radial gradient glow backdrop */}
            <div className="absolute inset-[-30%] rounded-full bg-gradient-radial from-primary/40 via-primary/20 to-transparent blur-md pointer-events-none" />
            <div className="relative z-10">
              <PersonalizedOrb 
                size={isCollapsed ? 38 : 44}
                showGlow={true}
                state="idle"
              />
            </div>
          </div>
          
          {!isCollapsed && (
            <>
              <div className="flex-1 text-start min-w-0">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent
        align={isRTL ? "end" : "start"}
        side="top"
        className="w-56 bg-card border border-border shadow-xl z-[100]"
      >
        {/* Back to Aurora - shown when in panel areas */}
        {(showBackToAurora || isInPanel) && (
          <>
            <DropdownMenuItem onClick={() => navigate('/aurora')}>
              <LayoutDashboard className="h-4 w-4 me-2" />
              {language === 'he' ? 'חזרה לאורורה' : 'Back to Aurora'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Panel Links - Role-based (only show when NOT in panel) */}
        {!isInPanel && (
          <>
            {isAdmin && (
              <DropdownMenuItem onClick={() => navigate('/panel')}>
                <Shield className="h-4 w-4 me-2" />
                {language === 'he' ? 'פאנל ניהול' : 'Admin Panel'}
              </DropdownMenuItem>
            )}
            
            {isPractitioner && (
              <DropdownMenuItem onClick={() => navigate('/coach')}>
                <UserCog className="h-4 w-4 me-2" />
                {language === 'he' ? 'פאנל מאמן' : 'Coach Panel'}
              </DropdownMenuItem>
            )}
            
            {isAffiliate && (
              <DropdownMenuItem onClick={() => navigate('/affiliate')}>
                <Link2 className="h-4 w-4 me-2" />
                {language === 'he' ? 'פאנל שותפים' : 'Affiliate Panel'}
              </DropdownMenuItem>
            )}
            
            {(isAdmin || isPractitioner || isAffiliate) && <DropdownMenuSeparator />}
          </>
        )}
        
        {/* Settings - only show if callback provided */}
        {onOpenSettings && (
          <>
            <DropdownMenuItem onClick={handleSettingsClick}>
              <Settings className="h-4 w-4 me-2" />
              {t('aurora.account.settings')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Language Toggle */}
        <DropdownMenuItem onClick={handleLanguageToggle}>
          <Globe className="h-4 w-4 me-2" />
          {language === 'he' ? 'English' : 'עברית'}
        </DropdownMenuItem>
        
        {/* Theme Toggle */}
        <DropdownMenuItem onClick={handleThemeToggle}>
          {isDark ? (
            <Sun className="h-4 w-4 me-2" />
          ) : (
            <Moon className="h-4 w-4 me-2" />
          )}
          {isDark 
            ? (language === 'he' ? 'מצב בהיר' : 'Light Mode')
            : (language === 'he' ? 'מצב כהה' : 'Dark Mode')
          }
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4 me-2" />
          {t('aurora.account.signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AuroraAccountDropdown;
