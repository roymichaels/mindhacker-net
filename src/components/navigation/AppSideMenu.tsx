/**
 * AppSideMenu — Lovable-style left side menu.
 * Triggered from the header "MindOS" button. Full-screen on mobile.
 * Hosts the avatar/account section at the top + hub navigation below.
 */
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  ChevronDown,
  Settings,
  LogOut,
  Globe,
  Sun,
  Moon,
  Shield,
  UserCog,
  CreditCard,
  BookOpen,
  User,
  Bug,
  ChevronRight,
  Home,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';

interface AppSideMenuProps {
  onOpenSettings?: () => void;
}

export function AppSideMenu({ onOpenSettings }: AppSideMenuProps) {
  const [open, setOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [bugOpen, setBugOpen] = useState(false);
  const { user } = useAuth();
  const { language, isRTL } = useTranslation();
  const { setLanguage } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const { hasRole, loading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();
  const { openSubscriptions } = useSubscriptionsModal();
  const { openProfile } = useProfileModal();

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
            aria-label="Open menu"
            className="inline-flex items-center gap-1.5 h-9 px-2 rounded-full hover:bg-muted/40 transition-colors text-foreground"
          >
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-muted/50">
              <Menu className="h-4 w-4" />
            </span>
            <span className="font-bold text-base tracking-tight">MindOS</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </button>
        </SheetTrigger>

        <SheetContent
          side={isRTL ? 'right' : 'left'}
          className="p-0 w-screen sm:max-w-sm bg-background border-border"
          style={{ backgroundColor: 'hsl(var(--background))' }}
        >
          <div className="flex flex-col h-full">
            {/* Account header */}
            <button
              type="button"
              onClick={() => {
                close();
                openProfile();
              }}
              className="flex items-center gap-3 p-4 border-b border-border hover:bg-muted/30 transition-colors text-start"
            >
              <div className="h-12 w-12 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
                <AvatarMiniPreview size={48} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{displayName}</div>
                <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
              </div>
              <ChevronRight className={cn('h-4 w-4 text-muted-foreground shrink-0', isRTL && 'rotate-180')} />
            </button>

            {/* Hubs */}
            <div className="px-2 pt-3 pb-1">
              <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {language === 'he' ? 'מרכזים' : 'Hubs'}
              </div>
              <MenuItem icon={Home} label={language === 'he' ? 'בית' : 'Home'} onClick={() => go('/aurora')} />
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const label = language === 'he' ? tab.labelHe : tab.labelEn;
                return (
                  <MenuItem
                    key={tab.id}
                    icon={Icon}
                    label={label}
                    onClick={() => go(tab.path)}
                  />
                );
              })}
            </div>

            {/* Account actions */}
            <div className="px-2 pt-3 pb-1 border-t border-border mt-2">
              <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {language === 'he' ? 'חשבון' : 'Account'}
              </div>
              <MenuItem icon={User} label={language === 'he' ? 'פרופיל' : 'Profile'} onClick={() => { close(); openProfile(); }} />
              <MenuItem icon={Settings} label={language === 'he' ? 'הגדרות' : 'Settings'} onClick={() => { close(); onOpenSettings?.(); }} />
              <MenuItem icon={CreditCard} label={language === 'he' ? 'מנויים' : 'Subscriptions'} onClick={() => { close(); openSubscriptions(); }} />
              <MenuItem icon={BookOpen} label={language === 'he' ? 'מסמכים' : 'Docs'} onClick={() => { close(); setDocsOpen(true); }} />
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
            </div>

            {(isAdmin || isPractitioner || isAffiliate) && (
              <div className="px-2 pt-3 pb-1 border-t border-border mt-2">
                <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {language === 'he' ? 'ניהול' : 'Workspaces'}
                </div>
                {isAdmin && <MenuItem icon={Shield} label="Admin Panel" onClick={() => go('/panel')} />}
                {isPractitioner && <MenuItem icon={UserCog} label="Coach Panel" onClick={() => go('/coach')} />}
                {isAffiliate && <MenuItem icon={UserCog} label="Affiliate Panel" onClick={() => go('/affiliate')} />}
              </div>
            )}

            <div className="mt-auto px-2 py-3 border-t border-border">
              <MenuItem icon={Bug} label={language === 'he' ? 'דווח על באג' : 'Report a bug'} onClick={() => { close(); setBugOpen(true); }} />
              <MenuItem icon={LogOut} label={language === 'he' ? 'התנתק' : 'Sign out'} onClick={handleSignOut} destructive />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <UserDocsModal open={docsOpen} onOpenChange={setDocsOpen} />
      <BugReportDialog open={bugOpen} onOpenChange={setBugOpen} />
    </>
  );
}

interface MenuItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: ReactNode;
  onClick: () => void;
  destructive?: boolean;
}

function MenuItem({ icon: Icon, label, onClick, destructive }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-start',
        destructive
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-foreground hover:bg-muted/40'
      )}
    >
      <Icon className="h-4 w-4 opacity-80 shrink-0" />
      <span className="flex-1 truncate">{label}</span>
    </button>
  );
}

export default AppSideMenu;