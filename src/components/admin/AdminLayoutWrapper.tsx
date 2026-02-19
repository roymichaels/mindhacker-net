/**
 * AdminLayoutWrapper - Wraps AdminHub with sidebar-driven layout.
 * Mirrors CoachesLayoutWrapper pattern.
 */
import { Suspense, lazy, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageSkeleton } from '@/components/ui/skeleton';
import { AdminHudSidebar } from '@/components/admin/AdminHudSidebar';
import { AdminActivitySidebar } from '@/components/admin/AdminActivitySidebar';
import { ADMIN_TABS } from '@/domain/admin';

const DashboardLayout = lazy(() => import('@/components/dashboard/DashboardLayout'));
const AdminHub = lazy(() => import('@/pages/AdminHub'));

export default function AdminLayoutWrapper() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'overview';
  const currentTabConfig = ADMIN_TABS.find(t => t.id === activeTab) || ADMIN_TABS[0];
  const activeSubTab = searchParams.get('sub') || currentTabConfig.subTabs[0]?.id || '';

  const handleTabChange = (tab: string, sub?: string) => {
    const newParams = new URLSearchParams();
    newParams.set('tab', tab);
    if (sub) newParams.set('sub', sub);
    setSearchParams(newParams, { replace: true });
  };

  const handleNavigate = (tab: string, sub?: string) => {
    handleTabChange(tab, sub);
  };

  const leftSidebar = (
    <AdminHudSidebar
      activeTab={activeTab}
      activeSubTab={activeSubTab}
      onTabChange={handleTabChange}
    />
  );

  const rightSidebar = (
    <AdminActivitySidebar onNavigate={handleNavigate} />
  );

  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardLayout leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
        <AdminHub activeTab={activeTab} activeSubTab={activeSubTab} />
      </DashboardLayout>
    </Suspense>
  );
}
