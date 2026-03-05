import { useFMWallet, useFMTransactions } from '@/hooks/useFMWallet';
import { FMAuroraCard } from '@/components/fm/FMAuroraCard';
import { FMQuickActions } from '@/components/fm/FMQuickActions';
import { FMActivityFeed } from '@/components/fm/FMActivityFeed';
import { useAuroraOpportunities } from '@/hooks/fm/useAuroraOpportunities';
import { useTranslation } from '@/hooks/useTranslation';
import { Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOS_TO_USD = 0.01;

export default function FMHome() {
  const { wallet } = useFMWallet();
  const { data: transactions = [], isLoading: txLoading } = useFMTransactions();
  const { opportunities } = useAuroraOpportunities();
  const { language } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();

  const balance = wallet?.mos_balance ?? 0;
  const recentTx = transactions.slice(0, 4);

  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full py-4">
      {/* Aurora opportunity — PRIMARY CTA */}
      <FMAuroraCard opportunities={opportunities} />

      {/* Compact balance */}
      <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
        <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
          <Coins className="w-4 h-4 text-accent" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-foreground text-sm">{balance.toLocaleString()} MOS</p>
          <p className="text-[10px] text-muted-foreground">≈ ${(balance * MOS_TO_USD).toFixed(2)}</p>
        </div>
      </div>

      {/* Quick actions — 3 items only */}
      <FMQuickActions />

      {/* Activity feed — capped with View All */}
      <div className="space-y-2">
        <FMActivityFeed transactions={recentTx} isLoading={txLoading} />
        {transactions.length > 4 && (
          <button
            onClick={() => navigate('/fm/wallet')}
            className="text-xs text-accent hover:underline w-full text-center py-1"
          >
            {isHe ? 'הצג הכל →' : 'View all →'}
          </button>
        )}
      </div>
    </div>
  );
}
