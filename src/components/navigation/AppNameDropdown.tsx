import { useState } from 'react';
import { ChevronDown, Settings, LogOut, Globe, Sun, Moon, Shield, UserCog, Link2, LayoutDashboard, CreditCard } from 'lucide-react';
import { Flame, Gem, Star } from 'lucide-react';
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
import { useSubscriptionsModal } from '@/contexts/SubscriptionsModalContext';
import { ProfileModal } from '@/components/dashboard/ProfileModal';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { OrbFullscreenViewer } from '@/components/orb/OrbFullscreenViewer';

interface AppNameDropdownProps {
  onOpenSettings?: () => void;
  compact?: boolean;
}

export function AppNameDropdown({ onOpenSettings, compact = false }: AppNameDropdownProps) {
  const { t, language, isRTL } = useTranslation();
  const { user } = useAuth();
  const { setLanguage } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const { hasRole } = useUserRoles();
  const navigate = useNavigate();
  const location = useLocation();
  const dashboard = useUnifiedDashboard();
  const { openSubscriptions } = useSubscriptionsModal();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [orbViewerOpen, setOrbViewerOpen] = useState(false);
  const { theme: brandTheme } = useThemeSettings();

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
      <OrbFullscreenViewer open={orbViewerOpen} onClose={() => setOrbViewerOpen(false)} />

      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0 focus:outline-none",
              compact ? "gap-1.5" : "gap-2"
            )}
          >
            <AuroraOrbIcon className={cn(compact ? "w-7 h-7" : "w-10 h-10", "text-foreground")} size={compact ? 28 : 40} />
            <span className={cn(
              "font-bold text-foreground",
              compact ? "text-sm" : "text-base"
            )}>
              {language === 'he' ? brandTheme.brand_name : brandTheme.brand_name_en}
            </span>
            <ChevronDown className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4", "text-muted-foreground")} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align={isRTL ? "end" : "start"}
          side="bottom"
          className="w-72 bg-popover border border-border shadow-xl z-[100]"
        >
          {/* Gamified profile card */}
          <div
            className="relative overflow-hidden rounded-lg m-2 cursor-pointer group"
            onClick={() => {
              setDropdownOpen(false);
              setProfileModalOpen(true);
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-muted to-accent/10 dark:from-primary/20 dark:via-card dark:to-accent/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/60 dark:from-black/40 to-transparent" />

            <div className="relative z-10 p-4 flex flex-col items-center text-center">
              <div
                className="relative mb-3 group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(false);
                  setOrbViewerOpen(true);
                }}
              >
                <div className="absolute inset-[-40%] rounded-full bg-gradient-radial from-primary/40 via-primary/20 to-transparent blur-xl pointer-events-none" />
                <div className="relative z-10">
                  <PersonalizedOrb size={80} state="idle" />
                </div>
              </div>

              <p className="text-sm font-medium text-foreground mb-0.5">{displayName}</p>
              <p className="text-xs text-muted-foreground mb-2">{user?.email}</p>

              {dashboard.identityTitle && (
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-base">{dashboard.identityTitle.icon}</span>
                  <span className="text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {dashboard.identityTitle.title}
                  </span>
                </div>
              )}

              {!dashboard.isLoading && (
                <div className="w-full space-y-1 mb-3">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>XP</span>
                    <span>{dashboard.xpProgress.current}/{dashboard.xpProgress.required}</span>
                  </div>
                  <Progress value={dashboard.xpProgress.percentage} className="h-2 bg-muted/50" />
                </div>
              )}

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

            <div className="absolute bottom-1 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] text-muted-foreground">
                {language === 'he' ? 'לחץ לפרופיל מלא' : 'Click for full profile'}
              </span>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Back to Dashboard */}
          {isInPanel && (
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

          {/* Subscription */}
          <DropdownMenuItem onClick={() => { setDropdownOpen(false); openSubscriptions(); }}>
            <CreditCard className="h-4 w-4 me-2" />
            {language === 'he' ? 'מנויים' : 'Subscription'}
          </DropdownMenuItem>

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
            {isDark ? <Sun className="h-4 w-4 me-2" /> : <Moon className="h-4 w-4 me-2" />}
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
}
