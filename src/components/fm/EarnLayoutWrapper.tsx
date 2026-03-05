/**
 * EarnLayoutWrapper — wraps FMEarn with sidebar HUD architecture.
 * Manages tab + category filter state, sets sidebars via useSidebars hook.
 */
import { Suspense, lazy, useState, useCallback, useMemo } from 'react';
import { EarnHudSidebar } from '@/components/fm/EarnHudSidebar';
import { EarnActivitySidebar } from '@/components/fm/EarnActivitySidebar';
import { useFMClaims } from '@/hooks/useFMWallet';
import { useSidebars } from '@/hooks/useSidebars';
import { PageSkeleton } from '@/components/ui/skeleton';

const FMEarn = lazy(() => import('@/pages/fm/FMEarn'));

export default function EarnLayoutWrapper() {
  const [activeTab, setActiveTab] = useState('overview');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { data: claims = [] } = useFMClaims();

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setCategoryFilter('all');
  }, []);

  const activeClaims = claims.filter((c: any) => c.status === 'claimed').length;
  const completedClaims = claims.filter((c: any) => c.status === 'approved').length;
  const totalEarned = claims.filter((c: any) => c.status === 'approved').reduce((sum: number, c: any) => sum + (c.fm_bounties?.reward_mos || 0), 0);

  const left = useMemo(() => (
    <EarnHudSidebar
      activeTab={activeTab}
      onTabChange={handleTabChange}
      stats={{ totalEarned, activeClaims, completedBounties: completedClaims }}
    />
  ), [activeTab, handleTabChange, totalEarned, activeClaims, completedClaims]);

  const right = useMemo(() => (
    <EarnActivitySidebar
      activeTab={activeTab}
      categoryFilter={categoryFilter}
      onCategoryChange={setCategoryFilter}
      onGoToBounties={() => handleTabChange('bounties')}
    />
  ), [activeTab, categoryFilter, handleTabChange]);

  useSidebars(left, right, [left, right]);

  return (
    <Suspense fallback={<PageSkeleton />}>
      <FMEarn activeTab={activeTab} onTabChange={handleTabChange} categoryFilter={categoryFilter} onCategoryChange={setCategoryFilter} />
    </Suspense>
  );
}