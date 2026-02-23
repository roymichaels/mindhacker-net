/**
 * AdminLayoutWrapper - Sets sidebars for the Admin hub.
 */
import { Suspense, lazy } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminHudSidebar } from '@/components/admin/AdminHudSidebar';
import { AdminActivitySidebar } from '@/components/admin/AdminActivitySidebar';
import { ADMIN_TABS } from '@/domain/admin';
import { useSidebars } from '@/hooks/useSidebars';

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

  useSidebars(
    <AdminHudSidebar activeTab={activeTab} activeSubTab={activeSubTab} onTabChange={handleTabChange} />,
    <AdminActivitySidebar onNavigate={handleNavigate} />
  );

  return (
    <Suspense fallback={null}>
      <AdminHub activeTab={activeTab} activeSubTab={activeSubTab} />
    </Suspense>
  );
}
