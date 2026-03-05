/**
 * FMAppShell — Self-contained app shell for the Free Market module.
 * Renders its own bottom tab navigation while sharing the global auth session.
 * Wraps all /fm/* routes via <Outlet />.
 */
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Target, Briefcase, BarChart3, Wallet } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useFMWallet } from '@/hooks/useFMWallet';
import { FMOnboarding } from '@/components/fm/FMOnboarding';
import { PageSkeleton } from '@/components/ui/skeleton';
import { useSidebars } from '@/hooks/useSidebars';
import { FMHudSidebar } from '@/components/fm/FMHudSidebar';
import { FMActivitySidebar } from '@/components/fm/FMActivitySidebar';

const FM_TABS = [
  { id: 'home',  path: '/fm/home',    icon: Home,      labelEn: 'Home',   labelHe: 'בית' },
  { id: 'earn',  path: '/fm/earn',    icon: Target,    labelEn: 'Earn',   labelHe: 'הרוויח' },
  { id: 'work',  path: '/fm/work',    icon: Briefcase, labelEn: 'Work',   labelHe: 'עבודה' },
  { id: 'share', path: '/fm/share',   icon: BarChart3, labelEn: 'Share',  labelHe: 'שתף' },
  { id: 'wallet',path: '/fm/wallet',  icon: Wallet,    labelEn: 'Wallet', labelHe: 'ארנק' },
] as const;

export default function FMAppShell() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const location = useLocation();
  const navigate = useNavigate();
  const { wallet, isLoading, completeOnboarding } = useFMWallet();

  if (isLoading) return <PageSkeleton />;

  // Onboarding gate — show onboarding before any FM content
  const needsOnboarding = !wallet || !wallet.onboarding_complete;
  if (needsOnboarding) {
    return (
      <div className="max-w-2xl mx-auto w-full py-8 px-4">
        <FMOnboarding onFinish={() => completeOnboarding.mutate()} />
      </div>
    );
  }

  // Determine active tab
  const activePath = location.pathname;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* FM Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-20">
        <Outlet />
      </div>

      {/* FM Bottom Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around max-w-2xl mx-auto h-14">
          {FM_TABS.map((tab) => {
            const isActive = activePath === tab.path || 
              (tab.id === 'home' && activePath === '/fm');
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
    </div>
  );
}
