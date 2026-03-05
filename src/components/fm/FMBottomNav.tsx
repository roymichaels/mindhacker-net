/**
 * FMBottomNav — Shared FM bottom tab navigation.
 * Used by FMAppShell and also rendered standalone on /coaches, /business, etc.
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto h-14">
        {FM_TABS.map((tab) => {
          const isActive =
            (tab.id === 'home' && (activePath === '/fm' || activePath === '/fm/home')) ||
            (tab.id === 'earn' && activePath.startsWith('/fm/earn')) ||
            (tab.id === 'work' && (activePath.startsWith('/fm/work') || activePath.startsWith('/coaches') || activePath.startsWith('/business'))) ||
            (tab.id === 'wallet' && activePath.startsWith('/fm/wallet'));
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[56px] ${
                isActive
                  ? 'text-accent'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${isActive ? 'text-accent' : ''}`} />
              <span className="text-[10px] font-medium leading-tight">
                {isHe ? tab.labelHe : tab.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
