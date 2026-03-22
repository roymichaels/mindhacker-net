import { useState } from 'react';
import { ChevronDown, Settings, LogOut, Globe, Sun, Moon, Shield, UserCog, Link2, LayoutDashboard, CreditCard, FileText, BookOpen, User, HelpCircle, Bug } from 'lucide-react';
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
import { AvatarMiniPreview } from '@/components/avatar/AvatarMiniPreview';
import { useUserAvatarData } from '@/hooks/useUserAvatarData';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { useXpProgress } from '@/hooks/useGameState';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useSubscriptionsModal } from '@/contexts/SubscriptionsModalContext';
import { useProfileModal } from '@/contexts/ProfileModalContext';
import { UserDocsModal } from '@/components/modals/UserDocsModal';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { OrbFullscreenViewer } from '@/components/orb/OrbFullscreenViewer';
import { useUserJob } from '@/hooks/useUserJob';
import { BugReportDialog } from '@/components/aurora/BugReportDialog';

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
  const { openProfile } = useProfileModal();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [orbViewerOpen, setOrbViewerOpen] = useState(false);
  const [bugReportOpen, setBugReportOpen] = useState(false);
  const { theme: brandTheme } = useThemeSettings();
  const { currentJob } = useUserJob();
  const { profile: userOrbProfile } = useOrbProfile();
  const xp = useXpProgress();

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
      <OrbFullscreenViewer open={orbViewerOpen} onClose={() => setOrbViewerOpen(false)} />

      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0 focus:outline-none",
              compact ? "gap-1.5" : "gap-2"
            )}
          >
            {user ? (
              <>
                <div className={cn(compact ? "w-7 h-7" : "w-9 h-9", "rounded-full overflow-hidden shrink-0")}>
                  <StandaloneMorphOrb
                    size={compact ? 28 : 36}
                    profile={userOrbProfile}
                    geometryFamily={userOrbProfile.geometryFamily || 'sphere'}
                    level={xp.level}
                  />
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className={cn(
                    "font-bold text-foreground truncate max-w-[120px]",
                    compact ? "text-xs" : "text-sm"
                  )}>
                    {displayName}
                  </span>
                  {dashboard.identityTitle && (
                    <span className={cn(
                      "text-muted-foreground truncate max-w-[120px]",
                      compact ? "text-[10px]" : "text-xs"
                    )}>
                      {dashboard.identityTitle.title}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <AuroraOrbIcon className={cn(compact ? "w-7 h-7" : "w-10 h-10", "text-foreground")} size={compact ? 28 : 40} />
                <span className={cn(
                  "font-bold text-foreground",
                  compact ? "text-sm" : "text-base"
                )}>
                  {language === 'he' ? brandTheme.brand_name : brandTheme.brand_name_en}
                </span>
              </>
            )}
            <ChevronDown className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4", "text-muted-foreground")} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align={isRTL ? "end" : "start"}
          side="bottom"
          className="w-72 bg-popover shadow-xl z-[100]"
          style={{ border: '1px solid hsl(var(--gold-border) / 0.25)' }}
        >
          {/* Compact gamified profile card */}
          <div
            className="relative overflow-hidden rounded-lg mx-1.5 mt-1.5 cursor-pointer group border border-amber-500/15"
            onClick={() => {
              setDropdownOpen(false);
              openProfile();
            }}
          >
            <div className="absolute inset-0 bg-muted/80 dark:bg-card/80" />

            <div className="relative z-10 px-3 pt-3 pb-2 flex flex-col items-center text-center space-y-1">
              {/* Orb */}
              <div
                className="relative group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(false);
                  setOrbViewerOpen(true);
                }}
              >
                <div className="absolute inset-[-30%] rounded-full bg-amber-500/10 blur-lg pointer-events-none" />
                <div className="relative z-10">
                  <PersonalizedOrb size={80} state="idle" />
                </div>
              </div>

              {/* Name */}
              <p className="text-sm font-bold truncate text-foreground leading-tight max-w-full">{displayName}</p>

              {/* Archetype */}
              {dashboard.identityTitle && (
                <div className="flex items-center gap-1">
                  <span className="text-xs">{dashboard.identityTitle.icon}</span>
                  <span className="text-xs font-bold text-amber-400 truncate">
                    {dashboard.identityTitle.title}
                  </span>
                </div>
              )}

              {/* Row 3: XP + Stats */}
              {!dashboard.isLoading && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[9px] text-muted-foreground leading-none">
                    <span>XP</span>
                    <span>{dashboard.xpProgress.current}/{dashboard.xpProgress.required}</span>
                  </div>
                  <Progress value={dashboard.xpProgress.percentage} className="h-1.5 bg-amber-500/10 [&>div]:bg-amber-500" />
                  <div className="flex items-center gap-2 pt-0.5">
                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 text-[10px]">
                      <Star className="h-2.5 w-2.5" />
                      <span className="font-bold">Lv.{dashboard.level}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-yellow-500 text-[10px]">
                      <Gem className="h-2.5 w-2.5" />
                      <span className="font-semibold">{dashboard.tokens}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-orange-500 text-[10px]">
                      <Flame className="h-2.5 w-2.5" />
                      <span className="font-semibold">{dashboard.streak}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Profile Button — FM tab style */}
          <div className="mx-1.5 mt-1.5 mb-1">
            <button
              onClick={() => {
                setDropdownOpen(false);
                openProfile();
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all bg-amber-500/10 text-amber-400 border border-amber-500/25 hover:bg-amber-500/15 hover:border-amber-500/35 active:scale-[0.98]"
            >
              <User className="h-4 w-4" />
              {language === 'he' ? 'פרופיל' : 'Profile'}
            </button>
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


          {/* Blog */}
          <DropdownMenuItem onClick={() => { setDropdownOpen(false); navigate('/blog'); }}>
            <BookOpen className="h-4 w-4 me-2" />
            {language === 'he' ? 'בלוג' : 'Blog'}
          </DropdownMenuItem>

          {/* User Guide */}
          <DropdownMenuItem onClick={() => { setDropdownOpen(false); setDocsOpen(true); }}>
            <HelpCircle className="h-4 w-4 me-2" />
            {language === 'he' ? 'מדריך למשתמש' : 'User Guide'}
          </DropdownMenuItem>

          {/* Documentation */}
          <DropdownMenuItem onClick={() => { setDropdownOpen(false); navigate('/docs'); }}>
            <FileText className="h-4 w-4 me-2" />
            {language === 'he' ? 'ספר לבן' : 'White Paper'}
          </DropdownMenuItem>

          {/* Join Founding Members */}
          <DropdownMenuItem onClick={() => { setDropdownOpen(false); navigate('/founding'); }}>
            <Star className="h-4 w-4 me-2" />
            {language === 'he' ? 'הצטרף למייסדים' : 'Join Founding Members'}
          </DropdownMenuItem>

          {/* Report Bug */}
          <DropdownMenuItem onClick={() => { setDropdownOpen(false); setBugReportOpen(true); }}>
            <Bug className="h-4 w-4 me-2" />
            {language === 'he' ? 'דווח על באג' : 'Report Bug'}
          </DropdownMenuItem>

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
      <UserDocsModal open={docsOpen} onOpenChange={setDocsOpen} />
      <BugReportDialog open={bugReportOpen} onOpenChange={setBugReportOpen} />
    </>
  );
}
