/**
 * EarnLayoutWrapper — wraps FMEarn with sidebar HUD architecture.
 * Registers Earn-specific sidebars and manages tab state.
 */
import { Suspense, lazy, useState } from 'react';
import { useSidebars } from '@/hooks/useSidebars';
import { useIsMobile } from '@/hooks/use-mobile';
import { EarnHudSidebar } from '@/components/fm/EarnHudSidebar';
import { EarnActivitySidebar } from '@/components/fm/EarnActivitySidebar';
import { useFMClaims } from '@/hooks/useFMWallet';
import { PageSkeleton } from '@/components/ui/skeleton';

const FMEarn = lazy(() => import('@/pages/fm/FMEarn'));

export default function EarnLayoutWrapper() {
  const [activeTab, setActiveTab] = useState('bounties');
  const isMobile = useIsMobile();
  const { data: claims = [] } = useFMClaims();

  const activeClaims = claims.filter((c: any) => c.status === 'claimed').length;
  const completedClaims = claims.filter((c: any) => c.status === 'approved').length;

  const stats = {
    totalEarned: claims.filter((c: any) => c.status === 'approved').reduce((sum: number, c: any) => sum + (c.fm_bounties?.reward_mos || 0), 0),
    activeClaims,
    completedBounties: completedClaims,
  };

  useSidebars(
    !isMobile ? <EarnHudSidebar activeTab={activeTab} onTabChange={setActiveTab} stats={stats} /> : null,
    !isMobile ? <EarnActivitySidebar onGoToBounties={() => setActiveTab('bounties')} /> : null,
    [isMobile, activeTab, claims.length]
  );

  return (
    <Suspense fallback={<PageSkeleton />}>
      <FMEarn activeTab={activeTab} onTabChange={setActiveTab} />
    </Suspense>
  );
}
