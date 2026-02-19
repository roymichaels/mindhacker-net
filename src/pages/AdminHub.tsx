/**
 * @tab Admin
 * @purpose Unified admin control center — thin shell over domain/admin tabConfig
 * @data ADMIN_TABS (domain/admin), useTranslation
 */

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { PageSkeleton } from '@/components/ui/skeleton';
import { NotificationBell } from '@/components/admin/NotificationBell';
import { HeroBanner } from '@/components/aurora-ui/HeroBanner';
import { PillTabNav, SubTabNav } from '@/components/aurora-ui/PillTabNav';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Shield } from 'lucide-react';
import { ADMIN_TABS } from '@/domain/admin';

export default function AdminHub() {
  const { language, isRTL } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isHebrew = language === 'he';

  const activeTab = searchParams.get('tab') || 'overview';
  const activeSubTab = searchParams.get('sub') || '';

  const currentTabConfig = useMemo(
    () => ADMIN_TABS.find(t => t.id === activeTab) || ADMIN_TABS[0],
    [activeTab]
  );

  const currentSubTab = activeSubTab || currentTabConfig.subTabs[0]?.id || '';

  const setTab = (tab: string) => {
    const newParams = new URLSearchParams();
    newParams.set('tab', tab);
    setSearchParams(newParams, { replace: true });
  };

  const setSubTab = (sub: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sub', sub);
    setSearchParams(newParams, { replace: true });
  };

  const ActiveSubComponent = useMemo(() => {
    const sub = currentTabConfig.subTabs.find(s => s.id === currentSubTab);
    return sub?.component || currentTabConfig.subTabs[0]?.component;
  }, [currentTabConfig, currentSubTab]);

  const pillTabs = ADMIN_TABS.map((tab) => ({
    id: tab.id,
    label: isHebrew ? tab.labelHe : tab.labelEn,
    icon: tab.icon,
  }));

  const subTabs = currentTabConfig.subTabs.map((sub) => ({
    id: sub.id,
    label: isHebrew ? sub.labelHe : sub.labelEn,
  }));

  return (
    <PageShell>
      <div className="space-y-6">
        <HeroBanner
          gradient="from-emerald-500/15 to-teal-500/15"
          icon={
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
              <Shield className="h-5 w-5" />
            </div>
          }
          title={isHebrew ? 'מרכז בקרה' : 'Control Center'}
          subtitle={isHebrew ? 'נהלו את המערכת מכאן' : 'Manage your platform from here'}
          className="border-emerald-500/20"
        >
          <div className="absolute top-4 end-4 z-20">
            <NotificationBell />
          </div>
        </HeroBanner>

        <PillTabNav
          tabs={pillTabs}
          activeTab={activeTab}
          onTabChange={setTab}
          activeGradient="from-emerald-500 to-teal-600"
        />

        {currentTabConfig.subTabs.length > 1 && (
          <SubTabNav
            tabs={subTabs}
            activeTab={currentSubTab}
            onTabChange={setSubTab}
            accentColor="border-emerald-500"
          />
        )}

        <div className="min-h-[60vh]">
          <Suspense fallback={<PageSkeleton />}>
            {ActiveSubComponent && <ActiveSubComponent />}
          </Suspense>
        </div>
      </div>
    </PageShell>
  );
}
