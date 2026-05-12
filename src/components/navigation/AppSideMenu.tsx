/**
 * AppSideMenu — Lovable-style left side menu.
 * Triggered from the header "MindOS" button. Full-screen on mobile.
 * Hosts the avatar/account section at the top + hub navigation below.
 */
import { useState, type ReactNode, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  LogOut,
  Globe,
  Sun,
  Moon,
  Shield,
  UserCog,
  CreditCard,
  BookOpen,
  Bug,
  Home,
  Star,
  Flame,
  Gem,
  Bell,
  Search,
  Download,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { UserNotificationPanel } from '@/components/UserNotificationPanel';
import { useUserNotifications } from '@/hooks/useUserNotifications';
import { AuroraSearchBar } from '@/components/aurora/AuroraSearchBar';
import { PWAInstallModal } from '@/components/PWAInstallModal';
import { usePWA } from '@/hooks/usePWA';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useSubscriptionsModal } from '@/contexts/SubscriptionsModalContext';
import { useProfileModal } from '@/contexts/ProfileModalContext';
import { AvatarMiniPreview } from '@/components/avatar/AvatarMiniPreview';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { getVisibleTabs } from '@/navigation/osNav';
import { UserDocsModal } from '@/components/modals/UserDocsModal';
import { BugReportDialog } from '@/components/aurora/BugReportDialog';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface AppSideMenuProps {
  onOpenSettings?: () => void;
}

export function AppSideMenu({ onOpenSettings }: AppSideMenuProps) {
  const [open, setOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [bugOpen, setBugOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const { user } = useAuth();
  const { language, isRTL } = useTranslation();
  const { setLanguage } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const { hasRole, loading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();
  const { openSubscriptions } = useSubscriptionsModal();
  const { openProfile } = useProfileModal();
  const dashboard = useUnifiedDashboard();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useUserNotifications();
  const { isInstalled, canPromptInstall, promptInstall } = usePWA();

  const handleInstallClick = async () => {
    close();
    if (canPromptInstall) {
      const accepted = await promptInstall();
      if (!accepted) setInstallOpen(true);
    } else {
      setInstallOpen(true);
    }
  };

  const isAdmin = hasRole('admin');
  const isPractitioner = hasRole('practitioner');
  const isAffiliate = hasRole('affiliate');

  const { data: profile } = useQuery({
    queryKey: ['side-menu-profile', user?.id],
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

  const tabs = rolesLoading ? [] : getVisibleTabs({ hasRole });

  const close = () => setOpen(false);

  const go = (path: string) => {
    close();
    navigate(path);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (e) {
      window.location.href = '/';
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label="Open account"
            className="relative inline-flex items-center justify-center h-9 w-9 rounded-full ring-1 ring-border hover:ring-primary/40 transition-all overflow-hidden"
          >
            <span className="absolute inset-[-30%] rounded-full bg-primary/20 blur-md pointer-events-none" />
            <span className="relative z-10 flex items-center justify-center">
              <AvatarMiniPreview size={32} />
            </span>
          </button>
        </SheetTrigger>

        <SheetContent
          side={isRTL ? 'right' : 'left'}
          className="p-0 w-[88vw] max-w-[360px] bg-transparent border-0 shadow-none"
        >
          <div
            className="flex flex-col m-2 rounded-3xl border border-white/10 bg-card/95 backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.55)] overflow-hidden"
            style={{ height: 'calc(100dvh - 1rem)' }}
          >
            {/* Identity Card */}
            <div className="p-3 pb-1">
              <button
                type="button"
                onClick={() => { close(); openProfile(); }}
                className="relative w-full rounded-2xl border border-primary/15 bg-gradient-to-b from-primary/10 to-transparent p-5 text-center transition-transform active:scale-[0.99] hover:border-primary/30"
              >
                <div className="relative mx-auto mb-3 h-[104px] w-[104px] flex items-center justify-center">
                  <span className="absolute inset-[-30%] rounded-full bg-primary/20 blur-2xl pointer-events-none" />
                  <span className="relative z-10 inline-flex h-[104px] w-[104px] rounded-full ring-2 ring-primary/30 overflow-hidden items-center justify-center">
                    <AvatarMiniPreview size={96} />
                  </span>
                </div>
                <div className="text-base font-semibold truncate text-foreground">{displayName}</div>
                <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                {dashboard.identityTitle && (
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                    <span>{dashboard.identityTitle.icon}</span>
                    <span className="truncate">{dashboard.identityTitle.title}</span>
                  </div>
                )}
                {!dashboard.isLoading && (
                  <div className="mt-3 space-y-1.5">
                    <Progress value={dashboard.xpProgress.percentage} className="h-1" />
                    <div className="flex items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20 text-[10px] font-bold">
                        <Star className="h-2.5 w-2.5" /> Lv.{dashboard.level}
                      </span>
                      <span className="inline-flex items-center gap-1 text-yellow-500 text-[10px] font-semibold">
                        <Gem className="h-2.5 w-2.5" /> {dashboard.tokens}
                      </span>
                      <span className="inline-flex items-center gap-1 text-orange-500 text-[10px] font-semibold">
                        <Flame className="h-2.5 w-2.5" /> {dashboard.streak}
                      </span>
                    </div>
                  </div>
                )}
              </button>
            </div>

            {/* Scrollable sections */}
            <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-2">
              <Section label={language === 'he' ? 'סביבות' : 'Environments'}>
                <MenuItem icon={Home} label={language === 'he' ? 'בית' : 'Home'} onClick={() => go('/aurora')} />
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const label = language === 'he' ? tab.labelHe : tab.labelEn;
                  return (
                    <MenuItem key={tab.id} icon={Icon} label={label} onClick={() => go(tab.path)} />
                  );
                })}
              </Section>

              <Section label={language === 'he' ? 'פעולות' : 'Quick Actions'}>
                <MenuItem
                  icon={Search}
                  label={language === 'he' ? 'חיפוש בשיחות' : 'Search chats'}
                  onClick={() => { close(); setSearchOpen(true); }}
                />
                <MenuItem
                  icon={Bell}
                  label={language === 'he' ? 'התראות' : 'Notifications'}
                  onClick={() => { close(); setNotifOpen(true); if (unreadCount > 0) markAllAsRead(); }}
                  trailing={unreadCount > 0 ? (
                    <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-[10px] rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  ) : null}
                />
                <MenuItem icon={Settings} label={language === 'he' ? 'הגדרות' : 'Settings'} onClick={() => { close(); onOpenSettings?.(); }} />
                <MenuItem icon={CreditCard} label={language === 'he' ? 'מנויים' : 'Subscriptions'} onClick={() => { close(); openSubscriptions(); }} />
              </Section>

              <Section label={language === 'he' ? 'העדפות' : 'Preferences'}>
                <MenuItem
                  icon={isDark ? Sun : Moon}
                  label={isDark ? (language === 'he' ? 'מצב בהיר' : 'Light mode') : (language === 'he' ? 'מצב כהה' : 'Dark mode')}
                  onClick={() => setTheme(isDark ? 'light' : 'dark')}
                />
                <MenuItem
                  icon={Globe}
                  label={language === 'he' ? 'English' : 'עברית'}
                  onClick={() => setLanguage(language === 'he' ? 'en' : 'he')}
                />
                <MenuItem icon={BookOpen} label={language === 'he' ? 'מסמכים' : 'Docs'} onClick={() => { close(); setDocsOpen(true); }} />
              </Section>

              {(isAdmin || isPractitioner || isAffiliate) && (
                <Section label={language === 'he' ? 'ניהול' : 'Workspaces'}>
                  {isAdmin && <MenuItem icon={Shield} label="Admin Panel" onClick={() => go('/panel')} />}
                  {isPractitioner && <MenuItem icon={UserCog} label="Coach Panel" onClick={() => go('/coach')} />}
                  {isAffiliate && <MenuItem icon={UserCog} label="Affiliate Panel" onClick={() => go('/affiliate')} />}
                </Section>
              )}
            </div>

            <div className="px-3 py-2 border-t border-white/5">
              {!isInstalled && (
                <MenuItem
                  icon={Download}
                  label={language === 'he' ? 'התקן כאפליקציה' : 'Install app'}
                  onClick={handleInstallClick}
                />
              )}
              <MenuItem icon={Bug} label={language === 'he' ? 'דווח על באג' : 'Report a bug'} onClick={() => { close(); setBugOpen(true); }} />
              <MenuItem icon={LogOut} label={language === 'he' ? 'התנתק' : 'Sign out'} onClick={handleSignOut} destructive />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <UserDocsModal open={docsOpen} onOpenChange={setDocsOpen} />
      <BugReportDialog open={bugOpen} onOpenChange={setBugOpen} />
      <PWAInstallModal open={installOpen} onOpenChange={setInstallOpen} />

      <Sheet open={notifOpen} onOpenChange={setNotifOpen}>
        <SheetContent
          side={isRTL ? 'left' : 'right'}
          className="p-0 w-[92vw] max-w-[400px] bg-transparent border-0 shadow-none"
        >
          <div className="m-2 rounded-3xl border border-white/10 bg-card/95 backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.55)] overflow-hidden">
            <UserNotificationPanel
              notifications={notifications.slice(0, 10)}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onClose={() => setNotifOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
        <SheetContent
          side="top"
          className="p-0 h-[92dvh] w-full bg-background border-0"
        >
          <div className="relative h-full w-full">
            <AuroraSearchBarAutoOpen onClose={() => setSearchOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

interface MenuItemProps {
  icon: ComponentType<{ className?: string }>;
  label: ReactNode;
  onClick: () => void;
  destructive?: boolean;
  trailing?: ReactNode;
}

function MenuItem({ icon: Icon, label, onClick, destructive, trailing }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-2 py-2.5 rounded-xl text-[15px] font-medium transition-colors text-start',
        destructive
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-foreground hover:bg-white/5'
      )}
    >
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-white/5 shrink-0">
        <Icon className="h-4 w-4 opacity-90" />
      </span>
      <span className="flex-1 truncate">{label}</span>
      {trailing}
    </button>
  );
}

function AuroraSearchBarAutoOpen({ onClose }: { onClose: () => void }) {
  // AuroraSearchBar starts collapsed; we render it always-open by remounting in expanded state.
  // Easiest approach: render the component and trigger a click to expand on mount.
  return (
    <div className="absolute inset-0">
      <AuroraSearchBar />
      {/* Auto-expand: simulate click on mount */}
      <AutoExpand />
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 z-[60] p-2 rounded-md text-muted-foreground hover:text-foreground"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}

function AutoExpand() {
  // On mount, click the collapsed search trigger button rendered by AuroraSearchBar.
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      const btn = document.querySelector<HTMLButtonElement>('[title="Search chats"], [title="חיפוש בשיחות"]');
      btn?.click();
    }, 0);
  }
  return null;
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="pt-3">
      <div className="px-2 pt-2 pb-1.5 text-[10px] tracking-[0.18em] uppercase text-muted-foreground/70">
        {label}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export default AppSideMenu;