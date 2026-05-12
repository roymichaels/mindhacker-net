/**
 * @tab Admin
 * @purpose Unified admin control center — sidebar-less, everything inline
 */

import { Suspense, useMemo } from 'react';
import { PageSkeleton } from '@/components/ui/skeleton';
import { ADMIN_TABS } from '@/domain/admin';
import { AdminInlineNav } from '@/components/admin/AdminInlineNav';
import { AdminStatsBar } from '@/components/admin/AdminStatsBar';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
      <ErrorBoundary
        key={`${activeTab}:${currentSubTab}`}
        fallback={
          <Card className="p-6 space-y-4 border-destructive/30 bg-destructive/5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h3 className="font-semibold">
                This admin section failed to load
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              The other tabs still work — switch tabs above, or reload to retry.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reload
            </Button>
          </Card>
        }
      >
        <Suspense fallback={<PageSkeleton />}>
          {ActiveSubComponent && <ActiveSubComponent />}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
