import { ChevronUp, Settings, LogOut, Globe, Sun, Moon, Shield, UserCog, Link2, LayoutDashboard } from 'lucide-react';
 import { Flame, Gem, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
 import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
   DropdownMenuLabel,
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
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useNavigate, useLocation } from 'react-router-dom';
 import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';

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
   const dashboard = useUnifiedDashboard();

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
    try {
      await supabase.auth.signOut();
      // Force a full page reload to clear all state and redirect
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback: force reload anyway
      window.location.href = '/';
    }
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
            "w-full justify-start gap-3 h-auto py-3 px-3 relative overflow-hidden",
            "backdrop-blur-xl bg-gradient-to-br from-muted via-background to-muted dark:from-gray-950 dark:via-gray-900 dark:to-gray-950",
            "border border-border dark:border-primary/30 rounded-xl shadow-lg dark:shadow-xl",
            "hover:border-primary/40 dark:hover:border-primary/50 hover:shadow-primary/10 dark:hover:shadow-primary/20 transition-all duration-300",
            isCollapsed && "justify-center px-2"
          )}
        >
          {/* Glow overlay - same as Identity Card */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 dark:from-primary/20 via-transparent to-accent/10 dark:to-accent/20 pointer-events-none rounded-xl" />
          
          {/* Avatar - MultiThreadOrb matching Dashboard HUD */}
          <div className={cn(
            "shrink-0 relative flex items-center justify-center z-10",
            isCollapsed ? "h-10 w-10" : "h-11 w-11"
          )}>
            {/* Radial gradient glow backdrop */}
            <div className="absolute inset-[-30%] rounded-full bg-gradient-radial from-primary/40 via-primary/20 to-transparent blur-md pointer-events-none" />
            <div className="relative z-10">
              <PersonalizedOrb 
                size={isCollapsed ? 38 : 44}
                state="idle"
              />
            </div>
          </div>
          
          {!isCollapsed && (
            <>
              <div className="flex-1 text-start min-w-0 z-10">
                <p className="text-sm font-medium truncate text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 z-10" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent
        align={isRTL ? "end" : "start"}
        side="top"
         className="w-64 bg-popover border border-border shadow-xl z-[100]"
      >
           {/* Character Stats HUD - at top of dropdown */}
           {!dashboard.isLoading && (
             <>
               <DropdownMenuLabel className="pb-2">
                 <div className="space-y-2">
                   {/* Identity Title */}
                   {dashboard.identityTitle && (
                     <div className="flex items-center gap-1.5">
                       <span className="text-sm">{dashboard.identityTitle.icon}</span>
                       <span className="text-xs font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                         {dashboard.identityTitle.title}
                       </span>
                     </div>
                   )}
                   
                   {/* XP Bar */}
                   <div className="space-y-1">
                     <div className="flex justify-between text-[10px] text-muted-foreground">
                       <span>XP</span>
                       <span>{dashboard.xpProgress.current}/{dashboard.xpProgress.required}</span>
                     </div>
                     <Progress 
                       value={dashboard.xpProgress.percentage} 
                       className="h-1.5 bg-muted/50"
                     />
                   </div>
                   
                   {/* Stats Row */}
                   <div className="flex items-center justify-between pt-1">
                     <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs">
                       <Star className="h-3 w-3" />
                       <span className="font-bold">Lv.{dashboard.level}</span>
                     </div>
                     <div className="flex items-center gap-1 text-yellow-500 text-xs">
                       <Gem className="h-3 w-3" />
                       <span className="font-semibold">{dashboard.tokens}</span>
                     </div>
                     <div className="flex items-center gap-1 text-orange-500 text-xs">
                       <Flame className="h-3 w-3" />
                       <span className="font-semibold">{dashboard.streak}</span>
                     </div>
                   </div>
                 </div>
               </DropdownMenuLabel>
               <DropdownMenuSeparator />
             </>
           )}
 
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
