/**
 * FMAppShell — Self-contained app shell for the Free Market module.
 * MapleStory FM aesthetic — warm amber merchant tones.
 */
import { Outlet } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useFMWallet } from '@/hooks/useFMWallet';
import { FMOnboarding } from '@/components/fm/FMOnboarding';
import { PageSkeleton } from '@/components/ui/skeleton';
import { useSidebars } from '@/hooks/useSidebars';

export default function FMAppShell() {
  const { language } = useTranslation();
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

  return (
    <div className="relative flex flex-col h-full min-h-0 -mx-2 lg:-mx-3 -mb-64 md:-mb-24 pb-0">
      {/* Subtle warm ambient glow for the whole FM area */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.04),transparent_50%)] pointer-events-none" />
      <div className="flex-1 overflow-y-auto px-4 pb-4 relative z-10">
        <Outlet />
      </div>
      <FMBottomNav />
    </div>
  );
}
