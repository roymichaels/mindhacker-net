/**
 * FMAppShell — Self-contained app shell for the Free Market module.
 * MapleStory FM aesthetic — warm amber merchant tones.
 * Uses in-page top tabs (Earn / Career / Wallet) like the Path page.
 */
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useFMWallet } from '@/hooks/useFMWallet';
import { FMOnboarding } from '@/components/fm/FMOnboarding';
import { EarnLaunchpadBanner } from '@/components/fm/EarnLaunchpadBanner';
import { PageSkeleton } from '@/components/ui/skeleton';
import { useSidebars } from '@/hooks/useSidebars';
import { Target, Briefcase, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

const FM_TABS = [
  { id: 'earn',   path: '/fm/earn',   icon: Target,      labelEn: 'Earn',   labelHe: 'הרוויח' },
  { id: 'work',   path: '/fm/work',   icon: Briefcase,   labelEn: 'Career', labelHe: 'קריירה' },
  { id: 'wallet', path: '/fm/wallet', icon: Wallet,      labelEn: 'Wallet', labelHe: 'ארנק' },
] as const;

export default function FMAppShell() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const location = useLocation();
  const navigate = useNavigate();
  const { wallet, isLoading, completeOnboarding } = useFMWallet();

  // Hide global sidebars for all FM pages
  useSidebars(null, null, []);

  if (isLoading) return <PageSkeleton />;

  const needsOnboarding = !wallet || !wallet.onboarding_complete;
  if (needsOnboarding) {
    return (
      <div className="max-w-2xl mx-auto w-full py-8 px-4">
        <FMOnboarding onFinish={() => completeOnboarding.mutate()} />
      </div>
    );
  }

  const isActive = (tabId: string) => {
    if (tabId === 'earn') return location.pathname.startsWith('/fm/earn') || location.pathname === '/fm' || location.pathname.startsWith('/fm/market');
    if (tabId === 'work') return location.pathname.startsWith('/fm/work') || location.pathname.startsWith('/coaches') || location.pathname.startsWith('/business');
    if (tabId === 'wallet') return location.pathname.startsWith('/fm/wallet') || location.pathname.startsWith('/fm/cashout') || location.pathname.startsWith('/fm/bridge');
    return false;
  };

  return (
    <div className="relative flex flex-col -mx-2 lg:-mx-3 -mb-64 md:-mb-24 pb-20">
      {/* Persistent Earn Launchpad banner — above tabs */}
      <div className="relative z-10 px-4 pt-2 pb-0">
        <EarnLaunchpadBanner />
      </div>

      {/* Top tabs — styled like Path page tabs */}
      <div className="relative z-10 px-4 pt-2 pb-0">
        <div className="flex items-center gap-1 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/15 p-1">
          {FM_TABS.map((tab) => {
            const active = isActive(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all",
                  active
                    ? "bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 shadow-sm border border-amber-500/25"
                    : "text-amber-600/60 dark:text-amber-400/50 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-500/5"
                )}
              >
                <tab.icon className={cn("w-4 h-4", active && "drop-shadow-[0_0_4px_rgba(245,158,11,0.3)]")} />
                <span>{isHe ? tab.labelHe : tab.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 relative z-10">
        <Outlet />
      </div>
    </div>
  );
}
