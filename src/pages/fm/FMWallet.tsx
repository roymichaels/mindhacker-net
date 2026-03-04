import { ArrowLeft, Coins, TrendingUp, TrendingDown, ArrowUpRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { useFMWallet, useFMTransactions } from '@/hooks/useFMWallet';
import { format } from 'date-fns';
import { PageSkeleton } from '@/components/ui/skeleton';

const MOS_TO_USD = 0.01;

export default function FMWalletPage() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();
  const { wallet, isLoading } = useFMWallet();
  const { data: transactions = [], isLoading: txLoading } = useFMTransactions();

  if (isLoading) return <PageSkeleton />;

  const balance = wallet?.mos_balance ?? 0;
  const earned = wallet?.lifetime_earned ?? 0;
  const spent = wallet?.lifetime_spent ?? 0;

  return (
    <div className="space-y-5 max-w-2xl mx-auto w-full py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/fm')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">{isHe ? 'ארנק' : 'Wallet'}</h1>
        </div>
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Balance card */}
      <div className="bg-card border border-border rounded-2xl p-6 text-center space-y-2">
        <Coins className="w-10 h-10 text-accent mx-auto" />
        <p className="text-3xl font-bold text-foreground">{balance.toLocaleString()} MOS</p>
        <p className="text-sm text-muted-foreground">≈ ${(balance * MOS_TO_USD).toFixed(2)} USD</p>
        <div className="flex gap-3 justify-center pt-3">
          <Button className="gap-1">{isHe ? 'משיכה' : 'Withdraw'}</Button>
          <Button variant="outline" className="gap-1">{isHe ? 'היסטוריה' : 'History'}</Button>
        </div>
      </div>

      {/* Monthly summary */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">{isHe ? 'סיכום' : 'Summary'}</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> {isHe ? 'הרווחת' : 'Earned'}
            </span>
            <span className="font-semibold text-emerald-500">+{earned.toLocaleString()} MOS</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <TrendingDown className="w-4 h-4 text-destructive" /> {isHe ? 'הוצאת' : 'Spent'}
            </span>
            <span className="font-semibold text-destructive">-{spent.toLocaleString()} MOS</span>
          </div>
          <div className="border-t border-border pt-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{isHe ? 'נטו' : 'Net'}</span>
            <span className="font-bold text-foreground">
              {earned - spent >= 0 ? '+' : ''}{(earned - spent).toLocaleString()} MOS
            </span>
          </div>
        </div>
      </div>

      {/* Transaction list */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">{isHe ? 'עסקאות' : 'Transactions'}</h3>
        {txLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />)}
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            {isHe ? 'אין עסקאות עדיין' : 'No transactions yet'}
          </p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between bg-card border border-border rounded-lg px-3 py-2.5">
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm text-foreground truncate">{tx.description || tx.type.replace(/_/g, ' ')}</p>
                  <p className="text-[10px] text-muted-foreground">{format(new Date(tx.created_at), 'MMM d · HH:mm')}</p>
                </div>
                <span className={`text-sm font-semibold shrink-0 ${tx.amount >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                  {tx.amount >= 0 ? '+' : ''}{tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
