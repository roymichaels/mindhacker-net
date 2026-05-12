/**
 * OSDrawer — single-source left navigation drawer.
 * Replaces the old AppNameMenu popover. Lovable-style: nav up top, identity at the bottom.
 */
import { useState } from 'react';
import { Menu, Home, LogOut, Settings as SettingsIcon, User } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTranslation } from '@/hooks/useTranslation';
import { OS_TABS } from '@/navigation/osNav';
import { useHubModal, type HubId } from '@/contexts/HubModalContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileModal } from '@/contexts/ProfileModalContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface OSDrawerProps {
  onOpenSettings: () => void;
}

export function OSDrawer({ onOpenSettings }: OSDrawerProps) {
  const { language, isRTL } = useTranslation();
  const [open, setOpen] = useState(false);
  const { openHub } = useHubModal();
  const { user } = useAuth();
  const { openProfile } = useProfileModal();

  const items: { id: HubId; icon: typeof Home; labelEn: string; labelHe: string }[] = [
    { id: 'home' as HubId, icon: Home, labelEn: 'Home', labelHe: 'בית' },
    ...OS_TABS.map((t) => ({
      id: t.id as HubId,
      icon: t.icon,
      labelEn: t.labelEn,
      labelHe: t.labelHe,
    })),
  ];

  const go = (id: HubId) => {
    setOpen(false);
    openHub(id);
  };

  const handleLogout = async () => {
    setOpen(false);
    await supabase.auth.signOut();
  };

  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ||
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split('@')[0] ||
    (language === 'he' ? 'אורח' : 'Guest');

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={language === 'he' ? 'תפריט' : 'Menu'}
          className="h-9 w-9 inline-flex items-center justify-center rounded-xl text-foreground/85 hover:bg-white/[0.06] transition-colors focus:outline-none"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>

      <SheetContent
        side={isRTL ? 'right' : 'left'}
        className="w-[300px] sm:w-[320px] p-0 bg-card backdrop-blur-2xl border-0 ring-1 ring-white/[0.08] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.55)]"
      >
        <div className="flex h-full flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Brand row */}
          <div className="px-4 pt-5 pb-3">
            <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground/70">
              MindOS
            </div>
          </div>

          {/* Nav list */}
          <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => go(item.id)}
                  className={cn(
                    'w-full h-11 flex items-center gap-3 px-3 rounded-xl text-[14px] font-medium',
                    'text-foreground/90 hover:bg-white/[0.06] active:bg-white/[0.09] transition-colors text-start',
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0 opacity-80" />
                  <span className="flex-1 truncate">
                    {language === 'he' ? item.labelHe : item.labelEn}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Identity / footer */}
          <div className="border-t border-white/[0.06] p-3 space-y-1">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openProfile();
              }}
              className="w-full h-12 flex items-center gap-3 px-2 rounded-xl hover:bg-white/[0.05] transition-colors text-start"
            >
              <div className="h-9 w-9 shrink-0 rounded-full bg-primary/15 ring-1 ring-primary/30 inline-flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-foreground truncate">
                  {displayName}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {language === 'he' ? 'פרופיל' : 'Profile'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenSettings();
              }}
              className="w-full h-10 flex items-center gap-3 px-3 rounded-xl text-[13px] text-foreground/85 hover:bg-white/[0.05] transition-colors text-start"
            >
              <SettingsIcon className="h-[16px] w-[16px] opacity-80" />
              {language === 'he' ? 'הגדרות' : 'Settings'}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full h-10 flex items-center gap-3 px-3 rounded-xl text-[13px] text-foreground/70 hover:bg-white/[0.05] transition-colors text-start"
            >
              <LogOut className="h-[16px] w-[16px] opacity-80" />
              {language === 'he' ? 'התנתקות' : 'Logout'}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default OSDrawer;
