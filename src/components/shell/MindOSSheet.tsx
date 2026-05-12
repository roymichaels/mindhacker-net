/**
 * MindOSSheet — primary "world switcher" / hubs menu opened from the
 * AppName brand button in the header. Replaces the old environment/mode
 * picker (Home/Focus/Recovery/Flow/Work/Night) — those are decided by
 * AION through EnvironmentProvider and are NOT user-facing menu choices.
 *
 * Lovable-style compact bottom sheet listing major destinations.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  Sparkles,
  Network,
  Target,
  Brain,
  BookOpen,
  Fingerprint,
  Coins,
  Users,
  GraduationCap,
  User,
  Settings,
  Shield,
  Bell,
  Clock,
  type LucideIcon,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTranslation } from '@/hooks/useTranslation';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useProfileModal } from '@/contexts/ProfileModalContext';
import { cn } from '@/lib/utils';

type HubAction = () => void;

interface Hub {
  id: string;
  icon: LucideIcon;
  labelEn: string;
  labelHe: string;
  action: HubAction;
}

interface MindOSSheetProps {
  compact?: boolean;
  onOpenSettings?: () => void;
}

export function MindOSSheet({ compact = false, onOpenSettings }: MindOSSheetProps) {
  const { language, isRTL } = useTranslation();
  const { theme: brandTheme } = useThemeSettings();
  const { hasRole } = useUserRoles();
  const { openProfile } = useProfileModal();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const isAdmin = hasRole('admin');

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const openProfileSheet = () => {
    setOpen(false);
    openProfile();
  };

  const primary: Hub[] = [
    { id: 'aion', icon: Sparkles, labelEn: 'AION', labelHe: 'AION', action: () => go('/aurora') },
    { id: 'brain', icon: Network, labelEn: 'Brain', labelHe: 'מוח', action: openProfileSheet },
    { id: 'memory', icon: Clock, labelEn: 'Memory', labelHe: 'זיכרון', action: () => go('/journal') },
    { id: 'notifications', icon: Bell, labelEn: 'Notifications', labelHe: 'התראות', action: () => go('/notifications') },
    ...(onOpenSettings
      ? [{
          id: 'settings-primary',
          icon: Settings,
          labelEn: 'Settings',
          labelHe: 'הגדרות',
          action: () => { setOpen(false); onOpenSettings(); },
        } as Hub]
      : [{ id: 'settings-primary', icon: Settings, labelEn: 'Settings', labelHe: 'הגדרות', action: () => go('/settings') } as Hub]),
  ];

  // Legacy capabilities kept reachable but moved out of primary nav.
  // AION should summon these via conversation; this is a transition shelf.
  const more: Hub[] = [
    { id: 'strategy', icon: Target, labelEn: 'Strategy', labelHe: 'אסטרטגיה', action: () => go('/strategy') },
    { id: 'hypnosis', icon: Brain, labelEn: 'Hypnosis', labelHe: 'היפנוזה', action: () => go('/hypnosis') },
    { id: 'identity', icon: Fingerprint, labelEn: 'Identity', labelHe: 'זהות', action: openProfileSheet },
    { id: 'fm', icon: Coins, labelEn: 'Free Market', labelHe: 'שוק חופשי', action: () => go('/fm') },
    { id: 'community', icon: Users, labelEn: 'Community', labelHe: 'קהילה', action: () => go('/community') },
    { id: 'learn', icon: GraduationCap, labelEn: 'Learn', labelHe: 'למידה', action: () => go('/learn') },
  ];

  const secondary: Hub[] = [
    { id: 'profile', icon: User, labelEn: 'Profile', labelHe: 'פרופיל', action: openProfileSheet },
    ...(isAdmin
      ? [{
          id: 'admin',
          icon: Shield,
          labelEn: 'Admin',
          labelHe: 'ניהול',
          action: () => go('/admin-hub'),
        } as Hub]
      : []),
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={language === 'he' ? 'פתח תפריט ניווט' : 'Open navigation menu'}
          className={cn(
            'inline-flex items-center rounded-xl px-3 py-1.5 hover:bg-white/[0.06] transition-colors focus:outline-none',
            compact ? 'gap-1' : 'gap-1.5',
          )}
        >
          <span className={cn('font-bold text-foreground tracking-tight', compact ? 'text-[14px]' : 'text-[15px]')}>
            {language === 'he' ? brandTheme.brand_name : brandTheme.brand_name_en}
          </span>
          <ChevronDown className={cn('text-muted-foreground/80', compact ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
        </button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="rounded-t-3xl border-0 bg-card backdrop-blur-2xl ring-1 ring-white/[0.08] p-0 max-h-[85vh]"
      >
        <div className="px-4 pt-3 pb-6" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="mx-auto h-1 w-10 rounded-full bg-white/15 mb-4" />

          <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground/70 mb-2 px-1">
            {language === 'he' ? 'עולמות' : 'Worlds'}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {primary.map((h) => {
              const Icon = h.icon;
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={h.action}
                  className={cn(
                    'group flex flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-3',
                    'ring-1 ring-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:ring-white/[0.12]',
                    'transition-all active:scale-[0.97]',
                  )}
                >
                  <div className="h-8 w-8 rounded-xl bg-white/[0.06] inline-flex items-center justify-center text-foreground/85 group-hover:bg-primary/15 group-hover:text-primary transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[11.5px] font-medium text-foreground text-center leading-tight">
                    {language === 'he' ? h.labelHe : h.labelEn}
                  </span>
                </button>
              );
            })}
          </div>

          {more.length > 0 && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                className="w-full flex items-center justify-between text-[11px] tracking-[0.2em] uppercase text-muted-foreground/70 mb-2 px-1 py-1 hover:text-foreground/80 transition-colors"
              >
                <span>{language === 'he' ? 'עוד יכולות' : 'More capabilities'}</span>
                <ChevronRight
                  className={cn(
                    'h-3.5 w-3.5 transition-transform',
                    moreOpen && 'rotate-90',
                  )}
                />
              </button>
              {moreOpen && (
                <div className="grid grid-cols-3 gap-2">
                  {more.map((h) => {
                    const Icon = h.icon;
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={h.action}
                        className={cn(
                          'group flex flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-3',
                          'ring-1 ring-white/[0.04] bg-white/[0.015] hover:bg-white/[0.05] hover:ring-white/[0.1]',
                          'transition-all active:scale-[0.97]',
                        )}
                      >
                        <div className="h-8 w-8 rounded-xl bg-white/[0.05] inline-flex items-center justify-center text-foreground/70 group-hover:bg-primary/15 group-hover:text-primary transition-colors">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-[11.5px] font-medium text-foreground/85 text-center leading-tight">
                          {language === 'he' ? h.labelHe : h.labelEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="text-[10.5px] text-muted-foreground/60 mt-2 px-1 leading-snug">
                {language === 'he'
                  ? 'אלו יכולות ש-AION יכול להפעיל בשבילך מתוך השיחה.'
                  : 'These are capabilities AION can summon for you from chat.'}
              </p>
            </div>
          )}

          {secondary.length > 0 && (
            <>
              <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground/70 mt-5 mb-2 px-1">
                {language === 'he' ? 'חשבון' : 'Account'}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {secondary.map((h) => {
                  const Icon = h.icon;
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={h.action}
                      className={cn(
                        'group flex flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-3',
                        'ring-1 ring-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:ring-white/[0.12]',
                        'transition-all active:scale-[0.97]',
                      )}
                    >
                      <div className="h-8 w-8 rounded-xl bg-white/[0.06] inline-flex items-center justify-center text-foreground/85 group-hover:bg-primary/15 group-hover:text-primary transition-colors">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-[11.5px] font-medium text-foreground text-center leading-tight">
                        {language === 'he' ? h.labelHe : h.labelEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MindOSSheet;
