/**
 * @tab Admin
 * @purpose Unified admin control center — thin shell rendering active sub-page
 * @data ADMIN_TABS (domain/admin), useTranslation
 */

import { Suspense, useMemo } from 'react';
import { PageSkeleton } from '@/components/ui/skeleton';
import { ADMIN_TABS } from '@/domain/admin';

interface AdminHubProps {
  activeTab?: string;
  activeSubTab?: string;
}

export default function AdminHub({ activeTab = 'overview', activeSubTab }: AdminHubProps) {
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
    <div className="min-h-[60vh]">
      <Suspense fallback={<PageSkeleton />}>
        {ActiveSubComponent && <ActiveSubComponent />}
      </Suspense>
    </div>
  );
}
