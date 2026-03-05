/**
 * EarnLayoutWrapper — wraps FMEarn with sidebar HUD architecture.
 * Manages tab + category filter state, sets sidebars via context.
 */
import { Suspense, lazy, useState, useEffect, useCallback } from 'react';
import { useSidebarContext } from '@/contexts/SidebarContext';
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
  const { setLeftSidebar, setRightSidebar } = useSidebarContext();

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setCategoryFilter('all');
  }, []);

  const activeClaims = claims.filter((c: any) => c.status === 'claimed').length;
  const completedClaims = claims.filter((c: any) => c.status === 'approved').length;
  const totalEarned = claims.filter((c: any) => c.status === 'approved').reduce((sum: number, c: any) => sum + (c.fm_bounties?.reward_mos || 0), 0);

  // Set sidebars when relevant state changes
  useEffect(() => {
    if (!isMobile) {
      setLeftSidebar(
        <EarnHudSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          stats={{ totalEarned, activeClaims, completedBounties: completedClaims }}
        />
      );
      setRightSidebar(
        <EarnActivitySidebar
          activeTab={activeTab}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          onGoToBounties={() => handleTabChange('bounties')}
        />
      );
    } else {
      setLeftSidebar(null);
      setRightSidebar(null);
    }
  }, [isMobile, activeTab, categoryFilter, activeClaims, completedClaims, totalEarned, setLeftSidebar, setRightSidebar, handleTabChange]);

  // Clear on unmount
  useEffect(() => {
    return () => {
      setLeftSidebar(undefined);
      setRightSidebar(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Suspense fallback={<PageSkeleton />}>
      <FMEarn activeTab={activeTab} onTabChange={handleTabChange} categoryFilter={categoryFilter} onCategoryChange={setCategoryFilter} />
    </Suspense>
  );
}
