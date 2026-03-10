import { useFMWallet, useFMTransactions } from '@/hooks/useFMWallet';
import { FMQuickActions } from '@/components/fm/FMQuickActions';
import { FMActivityFeed } from '@/components/fm/FMActivityFeed';
import { useTranslation } from '@/hooks/useTranslation';
import { Coins, Gem, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOS_TO_USD = 0.01;

export default function FMHome() {
  const { wallet } = useFMWallet();
  const { data: transactions = [], isLoading: txLoading } = useFMTransactions();
  
  const { language } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();

  const balance = wallet?.mos_balance ?? 0;
  const recentTx = transactions.slice(0, 4);

  return (
    <div className="space-y-5 max-w-2xl mx-auto w-full py-4">

      {/* ── Hero Balance Card — MapleStory Meso pouch vibe ── */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-950/60 via-amber-900/30 to-background p-5">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-500/20 rounded-tl-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-500/20 rounded-br-2xl pointer-events-none" />
        {/* Gold shimmer */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/25 border border-amber-400/30">
            <Coins className="w-7 h-7 text-amber-100" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/60 mb-0.5">
              {isHe ? 'יתרה' : 'Balance'}
            </p>
            <p className="font-black text-2xl text-amber-200 tracking-tight drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              {balance.toLocaleString()} <span className="text-sm font-bold text-amber-400/70">MOS</span>
            </p>
            <p className="text-[11px] text-amber-300/40 font-medium">≈ ${(balance * MOS_TO_USD).toFixed(2)}</p>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-60">
            <Crown className="w-5 h-5 text-amber-400" />
            <span className="text-[9px] font-bold text-amber-400/80 uppercase tracking-wider">
              {isHe ? 'סוחר' : 'Merchant'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <FMQuickActions />

      {/* Activity feed */}
      <div className="space-y-2">
        <FMActivityFeed transactions={recentTx} isLoading={txLoading} />
        {transactions.length > 4 && (
          <button
            onClick={() => navigate('/fm')}
            className="text-xs text-amber-400/70 hover:text-amber-300 font-semibold w-full text-center py-1.5 transition-colors"
          >
            {isHe ? 'הצג הכל →' : 'View all →'}
          </button>
        )}
      </div>
    </div>
  );
}
