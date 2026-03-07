/**
 * AdminLayoutWrapper - Sidebar-less layout for Admin hub.
 * Navigation and stats are rendered inline in the page body.
 */
import { Suspense, lazy, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ADMIN_TABS } from '@/domain/admin';
import { useSidebars } from '@/hooks/useSidebars';
import { PageSkeleton } from '@/components/ui/skeleton';

const AdminHub = lazy(() => import('@/pages/AdminHub'));

export default function AdminLayoutWrapper() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'overview';
  const currentTabConfig = ADMIN_TABS.find(t => t.id === activeTab) || ADMIN_TABS[0];
  const activeSubTab = searchParams.get('sub') || currentTabConfig.subTabs[0]?.id || '';

  const handleTabChange = useCallback((tab: string, sub?: string) => {
    const newParams = new URLSearchParams();
    newParams.set('tab', tab);
    if (sub) newParams.set('sub', sub);
    setSearchParams(newParams, { replace: true });
  }, [setSearchParams]);

  // Suppress all sidebars — navigation is inline now
  useSidebars(null, null, []);

  return (
    <Suspense fallback={<PageSkeleton />}>
      <AdminHub
        activeTab={activeTab}
        activeSubTab={activeSubTab}
        onTabChange={handleTabChange}
      />
    </Suspense>
  );
}
