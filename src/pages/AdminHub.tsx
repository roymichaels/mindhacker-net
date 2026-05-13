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
    <main
      className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain touch-pan-y px-4 space-y-4"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 3.5rem)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6.5rem)',
      }}
    >
      {/* Stats bar — isolated so a stats failure can't take down the whole admin */}
      <ErrorBoundary fallback={<div className="h-12" />}>
        <AdminStatsBar onNavigate={onTabChange} />
      </ErrorBoundary>

      {/* Inline navigation — also isolated */}
      <ErrorBoundary
        fallback={
          <Card className="p-4 border-destructive/30 bg-destructive/5 text-sm">
            Navigation failed to render — try reloading.
          </Card>
        }
      >
        <AdminInlineNav
          activeTab={activeTab}
          activeSubTab={currentSubTab}
          onTabChange={onTabChange}
        />
      </ErrorBoundary>

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
    </main>
  );
}
