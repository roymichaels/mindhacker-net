import { useFMWallet, useFMTransactions } from '@/hooks/useFMWallet';
import { FMOnboarding } from '@/components/fm/FMOnboarding';
import { FMBalanceBar } from '@/components/fm/FMBalanceBar';
import { FMAuroraCard } from '@/components/fm/FMAuroraCard';
import { FMQuickActions } from '@/components/fm/FMQuickActions';
import { FMActivityFeed } from '@/components/fm/FMActivityFeed';
import { PageSkeleton } from '@/components/ui/skeleton';

export default function FMHome() {
  const { wallet, isLoading, completeOnboarding } = useFMWallet();
  const { data: transactions = [], isLoading: txLoading } = useFMTransactions();

  if (isLoading) return <PageSkeleton />;

  const needsOnboarding = !wallet || !wallet.onboarding_complete;

  const handleFinishOnboarding = () => {
    completeOnboarding.mutate();
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full py-4">
      {needsOnboarding && <FMOnboarding onFinish={handleFinishOnboarding} />}

      <FMBalanceBar mos={wallet?.mos_balance ?? 0} isNew={!wallet || wallet.mos_balance === 0} />

      <FMAuroraCard
        suggestion="Write a 2-min health tip for the community — earn 50 MOS"
      />

      <FMQuickActions />

      <FMActivityFeed transactions={transactions} isLoading={txLoading} />
    </div>
  );
}
