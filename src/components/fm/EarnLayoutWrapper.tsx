/**
 * EarnLayoutWrapper — wraps FMEarn with sidebar HUD architecture.
 * Manages tab state + category filter state, passing to both sidebars.
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
  const [categoryFilter, setCategoryFilter] = useState('all');
  const isMobile = useIsMobile();
  const { data: claims = [] } = useFMClaims();

  // Reset category filter when switching tabs
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCategoryFilter('all');
  };

  const activeClaims = claims.filter((c: any) => c.status === 'claimed').length;
  const completedClaims = claims.filter((c: any) => c.status === 'approved').length;

  const stats = {
    totalEarned: claims.filter((c: any) => c.status === 'approved').reduce((sum: number, c: any) => sum + (c.fm_bounties?.reward_mos || 0), 0),
    activeClaims,
    completedBounties: completedClaims,
  };

  useSidebars(
    !isMobile ? <EarnHudSidebar activeTab={activeTab} onTabChange={handleTabChange} stats={stats} /> : null,
    !isMobile ? (
      <EarnActivitySidebar
        activeTab={activeTab}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        onGoToBounties={() => handleTabChange('bounties')}
      />
    ) : null,
    [isMobile, activeTab, categoryFilter, claims.length]
  );

  return (
    <Suspense fallback={<PageSkeleton />}>
      <FMEarn activeTab={activeTab} onTabChange={handleTabChange} categoryFilter={categoryFilter} onCategoryChange={setCategoryFilter} />
    </Suspense>
  );
}
