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
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 h-auto py-3 px-3 relative overflow-hidden",
              "backdrop-blur-xl bg-muted/80 dark:bg-card",
              "border border-border dark:border-primary/30 rounded-xl shadow-lg dark:shadow-xl",
              "hover:border-primary/40 dark:hover:border-primary/50 hover:shadow-primary/10 dark:hover:shadow-primary/20 transition-all duration-300",
              isCollapsed && "justify-center px-2"
            )}
          >
            {/* Glow overlay */}
            <div className="absolute inset-0 bg-primary/5 pointer-events-none rounded-xl" />
            
            {/* Avatar */}
            <div className={cn(
              "shrink-0 relative flex items-center justify-center z-10",
              isCollapsed ? "h-10 w-10" : "h-11 w-11"
            )}>
              <div className="absolute inset-[-30%] rounded-full bg-primary/20 blur-md pointer-events-none" />
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
          {/* Compact Orb + HUD */}
          <div 
            className="relative overflow-hidden rounded-lg mx-1 mt-1 mb-0 cursor-pointer group"
            onClick={() => {
              setDropdownOpen(false);
              navigate('/profile');
            }}
          >
            <div className="absolute inset-0 bg-muted dark:bg-card" />
            
            <div className="relative z-10 px-2 py-2 space-y-1">
              {/* Row 1: Grid — orb right, name left */}
              <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate text-foreground leading-tight">{displayName}</p>
                  <p className="text-[10px] text-muted-foreground truncate leading-tight">{user?.email}</p>
                </div>
                <div className="relative shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-[-25%] rounded-full bg-gradient-radial from-primary/25 via-primary/10 to-transparent blur-md pointer-events-none" />
                  <div className="relative z-10">
                    <PersonalizedOrb size={80} state="idle" />
                  </div>
                </div>
              </div>

              {/* Row 2: Archetype */}
              {dashboard.identityTitle && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px]">{dashboard.identityTitle.icon}</span>
                  <span className="text-[10px] font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
                    {dashboard.identityTitle.title}
                  </span>
                </div>
              )}

              {/* Row 3: XP + Stats */}
              {!dashboard.isLoading && (
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between text-[8px] text-muted-foreground leading-none">
                    <span>XP</span>
                    <span>{dashboard.xpProgress.current}/{dashboard.xpProgress.required}</span>
                  </div>
                  <Progress value={dashboard.xpProgress.percentage} className="h-1.5" />
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="flex items-center gap-0.5 px-1 py-px rounded-full bg-primary/15 text-primary border border-primary/20 text-[8px]">
                      <Star className="h-2 w-2" />
                      <span className="font-bold">Lv.{dashboard.level}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-yellow-500 text-[8px]">
                      <Gem className="h-2 w-2" />
                      <span className="font-semibold">{dashboard.tokens}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-orange-500 text-[8px]">
                      <Flame className="h-2 w-2" />
                      <span className="font-semibold">{dashboard.streak}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Back to Dashboard */}
          {(showBackToAurora || isInPanel) && (
            <>
              <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                <LayoutDashboard className="h-4 w-4 me-2" />
                {language === 'he' ? 'חזרה לדשבורד' : 'Back to Dashboard'}
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
