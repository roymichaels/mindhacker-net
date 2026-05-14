/**
 * ShellV2Drawer — the only top-level drawer in ShellV2.
 *
 * Visual source: copied from `src/components/shell/OSDrawer.tsx` (right-side
 * Sheet, MINDOS brand row, button list, profile + settings + sign-out
 * footer). Architecture: zero legacy deps — no HubModalContext, no OS_TABS,
 * no ProfileModalContext. Wired to OverlayController via `kind: 'drawer'`
 * so the "one overlay at a time" rule from the shell spec holds.
 */
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  User,
  LogOut,
  Shield,
} from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useOverlay, useOverlayBinding } from '@/shell/overlay/OverlayController';
import { supabase } from '@/integrations/supabase/client';
import { useProfileModal } from '@/contexts/ProfileModalContext';
import { cn } from '@/lib/utils';
import { CANONICAL_SURFACES } from '@/navigation/canonicalSurfaces';
import { AionOrb } from '@/components/aion/ui';

import type { LucideIcon } from 'lucide-react';
interface DrawerItem {
  id: string;
  icon: LucideIcon;
  labelEn: string;
  labelHe: string;
  onSelect: () => void | Promise<void>;
}

interface DrawerSection {
  id: string;
  titleEn?: string;
  titleHe?: string;
  items: DrawerItem[];
}

export default function ShellV2Drawer() {
  const { language, isRTL } = useTranslation();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const overlay = useOverlay();
  const binding = useOverlayBinding('drawer');
  const { openProfile } = useProfileModal();

  const go = (path: string) => {
    overlay.close();
    navigate(path);
  };

  const goProfile = () => {
    overlay.close();
    openProfile();
  };

  const sections: DrawerSection[] = [
    {
      // Phase C — only the 5 canonical surfaces remain in user-facing nav.
      // Everything else is summoned by AION as artifact / overlay / room.
      id: 'surfaces',
      items: CANONICAL_SURFACES.map((s) => ({
        id: s.id,
        icon: s.icon,
        labelEn: s.labelEn,
        labelHe: s.labelHe,
        onSelect: s.id === 'profile' ? goProfile : () => go(s.path),
      })),
    },
    {
      id: 'account',
      titleEn: 'Account',
      titleHe: 'חשבון',
      items: [
        { id: 'settings', icon: SettingsIcon, labelEn: 'Settings', labelHe: 'הגדרות', onSelect: () => go('/subscriptions') },
        ...(isAdmin
          ? [{ id: 'admin', icon: Shield, labelEn: 'Admin', labelHe: 'ניהול', onSelect: () => go('/admin') }]
          : []),
      ],
    },
  ];

  const handleLogout = async () => {
    overlay.close();
    await supabase.auth.signOut();
    navigate('/', { replace: true });
  };

  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ||
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split('@')[0] ||
    (language === 'he' ? 'אורח' : 'Guest');

  return (
    <Sheet open={binding.open} onOpenChange={binding.onOpenChange}>
      <SheetContent
        side={isRTL ? 'right' : 'left'}
        className="w-[300px] sm:w-[320px] p-0 bg-background/70 backdrop-blur-2xl border-0 ring-1 ring-white/[0.05] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.55)] overflow-hidden"
      >
        {/* Portal bloom — soft violet→cyan radial in the top corner */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 h-56 w-56"
          style={{
            [isRTL ? 'right' : 'left']: '-3rem' as unknown as string,
            background:
              'radial-gradient(closest-side, hsl(var(--aion-violet) / 0.22) 0%, hsl(var(--aion-cyan) / 0.08) 45%, transparent 75%)',
            filter: 'blur(6px)',
          }}
        />
        <div className="relative flex h-full flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Identity row */}
          <div className="flex items-center gap-3 px-4 pt-6 pb-4">
            <AionOrb size="xs" />
            <div
              className="aion-text-hero text-[15px] font-semibold tracking-[0.32em] leading-none"
              style={{
                textShadow:
                  '0 0 14px hsl(var(--aion-violet) / 0.35), 0 0 32px hsl(var(--aion-cyan) / 0.12)',
              }}
            >
              AION
            </div>
          </div>

          {/* Nav list */}
          <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
            {sections.map((section) => (
              <div key={section.id}>
                {(section.titleEn || section.titleHe) && (
                  <div className="px-3 pt-1 pb-1.5 text-[9px] tracking-[0.22em] uppercase text-foreground/35">
                    {language === 'he' ? section.titleHe : section.titleEn}
                  </div>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={item.onSelect}
                        className={cn(
                          'w-full h-11 flex items-center gap-3 px-3 rounded-2xl text-[14px]',
                          'text-foreground/85 hover:bg-foreground/[0.04] active:bg-foreground/[0.07] transition-colors text-start',
                        )}
                      >
                        <Icon className="h-[17px] w-[17px] shrink-0 opacity-70" strokeWidth={1.5} />
                        <span className="flex-1 truncate">
                          {language === 'he' ? item.labelHe : item.labelEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Identity / footer */}
          <div className="relative p-3 space-y-1">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 -top-6 h-6"
              style={{
                background:
                  'linear-gradient(180deg, transparent 0%, hsl(var(--background) / 0.6) 100%)',
              }}
            />
            <button
              type="button"
              onClick={goProfile}
              className="w-full h-12 flex items-center gap-3 px-2 rounded-2xl hover:bg-foreground/[0.04] transition-colors text-start"
            >
              <div className="h-9 w-9 shrink-0 rounded-full bg-foreground/[0.06] ring-1 ring-white/10 inline-flex items-center justify-center">
                <User className="h-4 w-4 text-foreground/70" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-foreground truncate">
                  {displayName}
                </div>
                <div className="text-[11px] text-foreground/45 truncate">
                  {language === 'he' ? 'פרופיל' : 'Profile'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full h-10 flex items-center gap-3 px-3 rounded-full text-[13px] text-foreground/60 hover:text-foreground/90 hover:bg-foreground/[0.04] transition-colors text-start"
            >
              <LogOut className="h-[15px] w-[15px] opacity-70" strokeWidth={1.5} />
              {language === 'he' ? 'התנתקות' : 'Sign out'}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
