import { lazy, Suspense } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useHubModal, type HubId } from '@/contexts/HubModalContext';
import { PageSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const DashboardLayoutWrapper = lazy(() => import('@/components/dashboard/DashboardLayoutWrapper'));
const FMMarketLayoutWrapper = lazy(() => import('@/components/fm/FMMarketLayoutWrapper'));
const CommunityLayoutWrapper = lazy(() => import('@/components/community/CommunityLayoutWrapper'));
const LearnLayoutWrapper = lazy(() => import('@/components/learn/LearnLayoutWrapper'));
const StrategyPage = lazy(() => import('@/pages/StrategyPage'));
const HypnosisPage = lazy(() => import('@/pages/HypnosisPage'));
const JournalingHub = lazy(() => import('@/pages/JournalingHub'));

const HUB_META: Record<HubId, { title: string; accent: string }> = {
  home: { title: 'Home', accent: 'bg-primary' },
  fm: { title: 'Free Market', accent: 'bg-amber-400' },
  strategy: { title: 'Strategy', accent: 'bg-sky-400' },
  hypnosis: { title: 'Hypnosis', accent: 'bg-fuchsia-400' },
  journal: { title: 'Journal', accent: 'bg-rose-400' },
  community: { title: 'Community', accent: 'bg-emerald-400' },
  study: { title: 'Study', accent: 'bg-violet-400' },
};

function HubBody({ hub }: { hub: HubId }) {
  switch (hub) {
    case 'home':
      return <DashboardLayoutWrapper />;
    case 'fm':
      return <FMMarketLayoutWrapper />;
    case 'strategy':
      return <StrategyPage />;
    case 'hypnosis':
      return <HypnosisPage />;
    case 'journal':
      return <JournalingHub />;
    case 'community':
      return <CommunityLayoutWrapper />;
    case 'study':
      return <LearnLayoutWrapper />;
  }
}

export function HubModalHost() {
  const { activeHub, closeHub } = useHubModal();

  return (
    <AnimatePresence>
      {activeHub && (
        <motion.div
          key={activeHub}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-0 z-[95] bg-background flex flex-col"
          style={{ backgroundColor: 'hsl(var(--background))', zIndex: 95 }}
        >
          <div className="flex items-center justify-between gap-3 px-4 h-14 border-b border-border bg-background shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', HUB_META[activeHub].accent)} />
              <span className="text-sm font-semibold tracking-wide truncate">
                {HUB_META[activeHub].title}
              </span>
            </div>
            <button
              type="button"
              onClick={closeHub}
              aria-label="Close"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/40 text-foreground/80 transition hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto bg-background">
            <Suspense fallback={<PageSkeleton />}>
              <HubBody hub={activeHub} />
            </Suspense>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default HubModalHost;
