/**
 * FMTopNav — Desktop top navigation for the FM module.
 * Mirrors FMBottomNav tabs + back-to-OS button + notification bell.
 */
import { useLocation, useNavigate } from 'react-router-dom';
import { Target, Briefcase, ArrowLeft, Wallet, Store } from 'lucide-react';
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
      className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-lg"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex h-16 items-center justify-between px-4 lg:px-6 max-w-screen-2xl mx-auto">
        {/* Left: App name + FM tabs */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <Store className="h-5 w-5 text-primary" />
            <span className="text-base font-bold text-foreground">{isHe ? 'פרי-מארקט' : 'FreeMarket'}</span>
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
                    "relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{isHe ? tab.labelHe : tab.labelEn}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Back to main OS + actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
