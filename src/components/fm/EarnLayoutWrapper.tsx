/**
 * EarnLayoutWrapper — wraps FMEarn without sidebars (content merged into page).
 */
import { Suspense, lazy, useState, useCallback } from 'react';
import { useSidebars } from '@/hooks/useSidebars';
import { PageSkeleton } from '@/components/ui/skeleton';

const FMEarn = lazy(() => import('@/pages/fm/FMEarn'));

export default function EarnLayoutWrapper() {
  const [activeTab, setActiveTab] = useState('overview');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setCategoryFilter('all');
  }, []);

  useSidebars(null, null, []);

  return (
    <Suspense fallback={<PageSkeleton />}>
      <FMEarn activeTab={activeTab} onTabChange={handleTabChange} categoryFilter={categoryFilter} onCategoryChange={setCategoryFilter} />
    </Suspense>
  );
}
