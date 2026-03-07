/**
 * FMTopNav — MapleStory FM-inspired top navigation.
 * Warm merchant golds, fantasy shop signboard feel.
 */
import { useLocation, useNavigate } from 'react-router-dom';
import { Target, Briefcase, ArrowLeft, Store, Gem } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { HeaderActions } from '@/components/navigation/HeaderActions';

const FM_TABS = [
  { id: 'earn',   path: '/fm/earn',   icon: Target,    labelEn: 'Earn',   labelHe: 'הרוויח' },
  { id: 'work',   path: '/fm/work',   icon: Briefcase, labelEn: 'Work',   labelHe: 'עבודה' },
] as const;

interface FMTopNavProps {
  onOpenSettings: () => void;
}

export function FMTopNav({ onOpenSettings }: FMTopNavProps) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const location = useLocation();
  const navigate = useNavigate();

  const isTabActive = (tab: typeof FM_TABS[number]) => {
    const p = location.pathname;
    if (tab.id === 'earn') return p.startsWith('/fm/earn');
    if (tab.id === 'work') return p.startsWith('/fm/work') || p.startsWith('/coaches') || p.startsWith('/business');
    return false;
  };

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-amber-300/40 bg-gradient-to-b from-amber-50/95 via-orange-50/90 to-background/95 backdrop-blur-xl dark:from-amber-950/40 dark:via-amber-900/20 dark:to-background/95 dark:border-amber-500/20"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex h-16 items-center justify-between px-4 lg:px-6 max-w-screen-2xl mx-auto">
        {/* Left: FM brand + tabs */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Store className="h-4 w-4 text-amber-100" />
            </div>
            <span className="text-base font-black text-amber-100 tracking-tight drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
              {isHe ? 'פרי-מארקט' : 'Free Market'}
            </span>
          </div>

          <nav className="flex items-center gap-1">
            {FM_TABS.map((tab) => {
              const active = isTabActive(tab);
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                    active
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-inner shadow-amber-500/10"
                      : "text-amber-200/60 hover:text-amber-200 hover:bg-amber-500/10"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{isHe ? tab.labelHe : tab.labelEn}</span>
                  {active && (
                    <span className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Back to OS + actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300/70 hover:text-amber-200 hover:bg-amber-500/10 border border-amber-500/10 transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{isHe ? 'חזור ל-OS' : 'Back to OS'}</span>
          </button>
          <HeaderActions />
        </div>
      </div>
    </header>
  );
}
