/**
 * FMBottomNav — MapleStory-inspired bottom tab bar.
 * Warm amber merchant tones with glowing active tab.
 */
import { useLocation, useNavigate } from 'react-router-dom';
import { Target, Briefcase } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const FM_TABS = [
  { id: 'earn',   path: '/fm/earn',   icon: Target,      labelEn: 'Earn',   labelHe: 'הרוויח' },
  { id: 'work',   path: '/fm/work',   icon: Briefcase,   labelEn: 'Work',   labelHe: 'עבודה' },
] as const;

export function FMBottomNav() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const location = useLocation();
  const navigate = useNavigate();
  const activePath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-amber-950/98 via-amber-950/95 to-amber-950/85 backdrop-blur-xl border-t-2 border-amber-600/30 md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto h-14">
        {FM_TABS.map((tab) => {
          const isActive =
            (tab.id === 'earn' && activePath.startsWith('/fm/earn')) ||
            (tab.id === 'work' && (activePath.startsWith('/fm/work') || activePath.startsWith('/coaches') || activePath.startsWith('/business')));
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`relative flex flex-col items-center justify-center gap-0.5 px-5 py-1.5 rounded-lg transition-all min-w-[64px] ${
                isActive
                  ? 'text-amber-300'
                  : 'text-amber-200/40 hover:text-amber-200/70'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]' : ''}`} />
              <span className="text-[10px] font-bold leading-tight tracking-wide">
                {isHe ? tab.labelHe : tab.labelEn}
              </span>
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
