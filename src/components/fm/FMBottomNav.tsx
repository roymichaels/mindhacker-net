/**
 * FMBottomNav — MapleStory-inspired bottom tab bar.
 * Warm amber merchant tones with glowing active tab.
 */
import { useLocation, useNavigate } from 'react-router-dom';
import { Target, Briefcase, ShoppingBag } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const FM_TABS = [
  { id: 'earn',   path: '/fm/earn',   icon: Target,       labelEn: 'Earn',   labelHe: 'הרוויח' },
  { id: 'market', path: '/fm/market', icon: ShoppingBag,  labelEn: 'Market', labelHe: 'מרקט' },
  { id: 'work',   path: '/fm/work',   icon: Briefcase,    labelEn: 'Work',   labelHe: 'עבודה' },
] as const;

export function FMBottomNav() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const location = useLocation();
  const navigate = useNavigate();
  const activePath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-background/95 via-orange-50/90 to-amber-50/95 backdrop-blur-xl border-t border-amber-300/40 dark:from-background/95 dark:via-amber-900/20 dark:to-amber-950/40 dark:border-amber-500/20 md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto h-14">
        {FM_TABS.map((tab) => {
          const isActive =
            (tab.id === 'earn' && activePath.startsWith('/fm/earn')) ||
            (tab.id === 'market' && activePath.startsWith('/fm/market')) ||
            (tab.id === 'work' && (activePath.startsWith('/fm/work') || activePath.startsWith('/coaches') || activePath.startsWith('/business')));
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`relative flex flex-col items-center justify-center gap-0.5 px-5 py-1.5 rounded-lg transition-all min-w-[64px] ${
                isActive
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-amber-500/40 dark:text-amber-200/40 hover:text-amber-600/70 dark:hover:text-amber-200/70'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_6px_rgba(245,158,11,0.3)]' : ''}`} />
              <span className="text-[10px] font-bold leading-tight tracking-wide">
                {isHe ? tab.labelHe : tab.labelEn}
              </span>
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-amber-500 dark:bg-amber-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
