/**
 * @tab Admin
 * @purpose Unified admin control center — sidebar-less, everything inline
 */

import { Suspense, useMemo } from 'react';
import { PageSkeleton } from '@/components/ui/skeleton';
import { ADMIN_TABS } from '@/domain/admin';
import { AdminInlineNav } from '@/components/admin/AdminInlineNav';
import { AdminStatsBar } from '@/components/admin/AdminStatsBar';

interface AdminHubProps {
  activeTab?: string;
  activeSubTab?: string;
  onTabChange?: (tab: string, sub?: string) => void;
}

export default function AdminHub({ activeTab = 'overview', activeSubTab, onTabChange }: AdminHubProps) {
  const currentTabConfig = useMemo(
    () => ADMIN_TABS.find(t => t.id === activeTab) || ADMIN_TABS[0],
    [activeTab]
  );

  const currentSubTab = activeSubTab || currentTabConfig.subTabs[0]?.id || '';

  const ActiveSubComponent = useMemo(() => {
    const sub = currentTabConfig.subTabs.find(s => s.id === currentSubTab);
    return sub?.component || currentTabConfig.subTabs[0]?.component;
  }, [currentTabConfig, currentSubTab]);

  return (
    <div className="min-h-[60vh] space-y-4 pb-6">
      {/* Stats bar */}
      <AdminStatsBar onNavigate={onTabChange} />

      {/* Inline navigation */}
      <AdminInlineNav
        activeTab={activeTab}
        activeSubTab={currentSubTab}
        onTabChange={onTabChange}
      />

      {/* Active sub-page */}
      <Suspense fallback={<PageSkeleton />}>
        {ActiveSubComponent && <ActiveSubComponent />}
      </Suspense>
    </div>
  );
}
