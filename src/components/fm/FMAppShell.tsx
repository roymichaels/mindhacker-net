/**
 * FMAppShell — Self-contained app shell for the Free Market module.
 * Renders its own bottom tab navigation while sharing the global auth session.
 * Wraps all /fm/* routes via <Outlet />.
 */
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Target, Wallet } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useFMWallet } from '@/hooks/useFMWallet';
import { FMOnboarding } from '@/components/fm/FMOnboarding';
import { PageSkeleton } from '@/components/ui/skeleton';
import { useSidebars } from '@/hooks/useSidebars';
import { FMActivitySidebar } from '@/components/fm/FMActivitySidebar';
import { useIsMobile } from '@/hooks/use-mobile';

const FM_TABS = [
  { id: 'home',   path: '/fm/home',   icon: Home,        labelEn: 'Home',   labelHe: 'בית' },
  { id: 'earn',   path: '/fm/earn',   icon: Target,      labelEn: 'Earn',   labelHe: 'הרוויח' },
  { id: 'wallet', path: '/fm/wallet', icon: Wallet,      labelEn: 'Wallet', labelHe: 'ארנק' },
] as const;

export default function FMAppShell() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { wallet, isLoading, completeOnboarding } = useFMWallet();

  // Register FM-specific sidebars — mobile: none, desktop: right only
  const needsOnboarding = !wallet || !wallet.onboarding_complete;
  useSidebars(
    null, // no left sidebar
    !isLoading && !needsOnboarding && !isMobile ? <FMActivitySidebar /> : null,
    [isLoading, needsOnboarding, isMobile]
  );

  if (isLoading) return <PageSkeleton />;

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
        <div className="flex items-center justify-around max-w-md mx-auto h-14">
          {FM_TABS.map((tab) => {
            const isActive = activePath === tab.path || 
              (tab.id === 'home' && activePath === '/fm') ||
              (tab.id === 'market' && activePath.startsWith('/fm/earn'));
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
