/**
 * StrategyPage — flat top-level Strategy environment (replaces MindOS hub layer).
 * Tabs: Overview (LifeHub) + Mission Control (PlayLayoutWrapper). URL-synced via ?tab=.
 */
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Eye, ListChecks } from 'lucide-react';
import LifeHub from '@/pages/LifeHub';
import PlayLayoutWrapper from '@/components/plan/PlayLayoutWrapper';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { withLegacyGuard } from '@/shellv2/LegacyMountGuard';

type StrategyTab = 'overview' | 'missions';

function StrategyPageImpl() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get('tab') as StrategyTab) === 'missions' ? 'missions' : 'overview';

  const tabs = useMemo(
    () => [
      { id: 'overview' as const, label: isHe ? 'סקירה' : 'Overview', icon: Eye },
      { id: 'missions' as const, label: isHe ? 'בקרת משימות' : 'Mission Control', icon: ListChecks },
    ],
    [isHe],
  );

  const setTab = (next: StrategyTab) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'overview') params.delete('tab');
    else params.set('tab', next);
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="flex min-h-full flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = id === tab;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors',
                  active
                    ? 'border-primary/30 bg-primary/10 text-foreground'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted/50',
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {tab === 'overview' ? <LifeHub /> : <PlayLayoutWrapper />}
      </div>
    </div>
  );
}

export default withLegacyGuard('StrategyPage', StrategyPageImpl);