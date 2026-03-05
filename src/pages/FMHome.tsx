import { useFMWallet, useFMTransactions } from '@/hooks/useFMWallet';
import { FMBalanceBar } from '@/components/fm/FMBalanceBar';
import { FMAuroraCard } from '@/components/fm/FMAuroraCard';
import { FMQuickActions } from '@/components/fm/FMQuickActions';
import { FMActivityFeed } from '@/components/fm/FMActivityFeed';

export default function FMHome() {
  const { wallet } = useFMWallet();
  const { data: transactions = [], isLoading: txLoading } = useFMTransactions();

  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full py-4">
      <FMBalanceBar mos={wallet?.mos_balance ?? 0} isNew={!wallet || wallet.mos_balance === 0} />

      <FMAuroraCard
        suggestion="Write a 2-min health tip for the community — earn 50 MOS"
      />

      <FMQuickActions />

      <FMActivityFeed transactions={transactions} isLoading={txLoading} />
    </div>
  );
}
