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
  Home,
  Brain,
  Globe2,
  History,
  Store,
  Target,
  Sparkles,
  BookOpen,
  Users,
  GraduationCap,
  Settings as SettingsIcon,
  User,
  LogOut,
} from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useOverlay, useOverlayBinding } from '@/shell/overlay/OverlayController';
import { supabase } from '@/integrations/supabase/client';
import { useProfileModal } from '@/contexts/ProfileModalContext';
import { cn } from '@/lib/utils';

interface DrawerItem {
  id: string;
  icon: typeof Home;
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
  const { user } = useAuth();
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
      id: 'core',
      titleEn: 'Core',
      titleHe: 'ליבה',
      items: [
        { id: 'home', icon: Home, labelEn: 'Home', labelHe: 'בית', onSelect: () => go('/') },
        { id: 'brain', icon: Brain, labelEn: 'Brain', labelHe: 'מוח', onSelect: () => go('/brain') },
        { id: 'outer', icon: Globe2, labelEn: 'Outer World', labelHe: 'עולם חיצוני', onSelect: () => go('/outer-world') },
      ],
    },
    {
      id: 'practice',
      titleEn: 'Practice',
      titleHe: 'תרגול',
      items: [
        { id: 'strategy', icon: Target, labelEn: 'Strategy', labelHe: 'אסטרטגיה', onSelect: () => go('/strategy') },
        { id: 'hypnosis', icon: Sparkles, labelEn: 'Hypnosis', labelHe: 'היפנוזה', onSelect: () => go('/hypnosis') },
        { id: 'journal', icon: BookOpen, labelEn: 'Journal', labelHe: 'יומן', onSelect: () => go('/journal') },
        { id: 'fm', icon: Store, labelEn: 'Free Market', labelHe: 'שוק חופשי', onSelect: () => go('/fm') },
      ],
    },
    {
      id: 'world',
      titleEn: 'World',
      titleHe: 'עולם',
      items: [
        { id: 'community', icon: Users, labelEn: 'Community', labelHe: 'קהילה', onSelect: () => go('/community') },
        { id: 'learn', icon: GraduationCap, labelEn: 'Learn', labelHe: 'לימוד', onSelect: () => go('/learn') },
        {
          id: 'history',
          icon: History,
          labelEn: 'History',
          labelHe: 'היסטוריה',
          onSelect: () => overlay.open('aion'),
        },
      ],
    },
    {
      id: 'account',
      titleEn: 'Account',
      titleHe: 'חשבון',
      items: [
        { id: 'profile', icon: User, labelEn: 'Account', labelHe: 'חשבון', onSelect: goProfile },
        { id: 'settings', icon: SettingsIcon, labelEn: 'Settings', labelHe: 'הגדרות', onSelect: () => go('/subscriptions') },
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
          <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-3">
            {sections.map((section) => (
              <div key={section.id}>
                {(section.titleEn || section.titleHe) && (
                  <div className="px-3 pt-1 pb-1.5 text-[10px] tracking-[0.18em] uppercase text-foreground/40">
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
                </div>
              </div>
            ))}
          </nav>

          {/* Identity / footer */}
          <div className="border-t border-white/[0.06] p-3 space-y-1">
            <button
              type="button"
              onClick={goProfile}
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
              onClick={handleLogout}
              className="w-full h-10 flex items-center gap-3 px-3 rounded-xl text-[13px] text-foreground/70 hover:bg-white/[0.05] transition-colors text-start"
            >
              <LogOut className="h-[16px] w-[16px] opacity-80" />
              {language === 'he' ? 'התנתקות' : 'Sign out'}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
