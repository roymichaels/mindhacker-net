import { useState } from 'react';
import { ChevronUp, Settings, LogOut, Globe, Sun, Moon, Shield, UserCog, Link2, LayoutDashboard } from 'lucide-react';
import { Flame, Gem, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { ProfileModal } from '@/components/dashboard/ProfileModal';

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
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isAdmin = hasRole('admin');
  const isPractitioner = hasRole('practitioner');
  const isAffiliate = hasRole('affiliate');
  
  const isInPanel = location.pathname.startsWith('/panel') || 
                    location.pathname.startsWith('/coach') || 
                    location.pathname.startsWith('/affiliate');

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

  const fullName = profile?.full_name;
  const isNameEmail = fullName && fullName.includes('@');
  const displayName = isNameEmail 
    ? fullName.split('@')[0] 
    : (fullName || user?.email?.split('@')[0] || 'User');

  const handleLanguageToggle = () => {
    setLanguage(language === 'he' ? 'en' : 'he');
  };

  const handleThemeToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      window.location.href = '/';
    }
  };

  const handleSettingsClick = () => {
    setDropdownOpen(false);
    if (onOpenSettings) {
      onOpenSettings();
    }
  };

  return (
    <>
      <ProfileModal open={profileModalOpen} onOpenChange={setProfileModalOpen} />
      
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
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
            {/* Glow overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 dark:from-primary/20 via-transparent to-accent/10 dark:to-accent/20 pointer-events-none rounded-xl" />
            
            {/* Avatar */}
            <div className={cn(
              "shrink-0 relative flex items-center justify-center z-10",
              isCollapsed ? "h-10 w-10" : "h-11 w-11"
            )}>
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
          className="w-72 bg-popover border border-border shadow-xl z-[100]"
        >
          {/* Unified Orb + HUD as one gamified unit */}
          <div 
            className="relative overflow-hidden rounded-lg m-2 cursor-pointer group"
            onClick={() => {
              setDropdownOpen(false);
              setProfileModalOpen(true);
            }}
          >
            {/* Gamified background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-muted to-accent/10 dark:from-primary/20 dark:via-card dark:to-accent/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/60 dark:from-black/40 to-transparent" />
            
            {/* Content */}
            <div className="relative z-10 p-4 flex flex-col items-center text-center">
              {/* Orb with glow */}
              <div className="relative mb-3 group-hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-[-40%] rounded-full bg-gradient-radial from-primary/40 via-primary/20 to-transparent blur-xl pointer-events-none" />
                <div className="relative z-10">
                  <PersonalizedOrb size={80} state="idle" />
                </div>
              </div>

              {/* Identity Title */}
              {dashboard.identityTitle && (
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-base">{dashboard.identityTitle.icon}</span>
                  <span className="text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {dashboard.identityTitle.title}
                  </span>
                </div>
              )}
              
              {/* XP Bar */}
              {!dashboard.isLoading && (
                <div className="w-full space-y-1 mb-3">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>XP</span>
                    <span>{dashboard.xpProgress.current}/{dashboard.xpProgress.required}</span>
                  </div>
                  <Progress 
                    value={dashboard.xpProgress.percentage} 
                    className="h-2 bg-muted/50"
                  />
                </div>
              )}
              
              {/* Stats Row */}
              {!dashboard.isLoading && (
                <div className="flex items-center justify-center gap-3 w-full">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs">
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
              )}
            </div>
            
            {/* Hover hint */}
            <div className="absolute bottom-1 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] text-muted-foreground">
                {language === 'he' ? 'לחץ לפרופיל מלא' : 'Click for full profile'}
              </span>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Back to Aurora */}
          {(showBackToAurora || isInPanel) && (
            <>
              <DropdownMenuItem onClick={() => navigate('/aurora')}>
                <LayoutDashboard className="h-4 w-4 me-2" />
                {language === 'he' ? 'חזרה לאורורה' : 'Back to Aurora'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Panel Links */}
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
          
          {/* Settings */}
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
    </>
  );
};

export default AuroraAccountDropdown;
