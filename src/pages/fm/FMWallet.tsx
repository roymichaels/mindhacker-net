import { useState } from 'react';
import { Coins, TrendingUp, TrendingDown, ArrowUpRight, Shield, Eye, EyeOff, Wallet, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useFMWallet, useFMTransactions } from '@/hooks/useFMWallet';
import { format } from 'date-fns';
import { PageSkeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const MOS_TO_USD = 0.01;

const TX_LABELS: Record<string, { en: string; he: string; icon: string }> = {
  earn_bounty: { en: 'Bounty Reward', he: 'תגמול באונטי', icon: '🎯' },
  earn_gig: { en: 'Gig Payment', he: 'תשלום עבודה', icon: '💼' },
  earn_data: { en: 'Data Reward', he: 'תגמול נתונים', icon: '📊' },
  spend_purchase: { en: 'Purchase', he: 'רכישה', icon: '🛒' },
  escrow_hold: { en: 'Escrow Hold', he: 'הפקדת נאמנות', icon: '🔒' },
  escrow_release: { en: 'Escrow Release', he: 'שחרור נאמנות', icon: '🔓' },
  withdraw_fiat: { en: 'Withdrawal', he: 'משיכה', icon: '🏦' },
  withdraw_crypto: { en: 'Crypto Withdrawal', he: 'משיכת קריפטו', icon: '⛓️' },
  deposit: { en: 'Deposit', he: 'הפקדה', icon: '📥' },
  adjustment: { en: 'Adjustment', he: 'התאמה', icon: '⚙️' },
};

export default function FMWalletPage() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { wallet, isLoading } = useFMWallet();
  const { data: transactions = [], isLoading: txLoading } = useFMTransactions();
  const [balanceHidden, setBalanceHidden] = useState(false);

  if (isLoading) return <PageSkeleton />;

  const balance = wallet?.mos_balance ?? 0;
  const earned = wallet?.lifetime_earned ?? 0;
  const spent = wallet?.lifetime_spent ?? 0;
  const isAdvanced = wallet?.mode === 'advanced';

  const fiatValue = (balance * MOS_TO_USD).toFixed(2);

  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full py-4">
      {/* Balance Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-card border border-border rounded-2xl p-6"
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/10 pointer-events-none" />

        <div className="relative space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium text-muted-foreground">
                {isAdvanced ? 'Advanced Wallet' : (isHe ? 'הארנק שלי' : 'My Wallet')}
              </span>
            </div>
            <button
              onClick={() => setBalanceHidden(!balanceHidden)}
              className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground"
            >
              {balanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-center space-y-1">
            <p className="text-4xl font-bold text-foreground tracking-tight">
              {balanceHidden ? '•••••' : balance.toLocaleString()}
              {!balanceHidden && <span className="text-lg font-medium text-muted-foreground ml-1.5">MOS</span>}
            </p>
            <p className="text-sm text-muted-foreground">
              {balanceHidden ? '••••' : `≈ $${fiatValue} USD`}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <Button className="flex-1 gap-1.5" size="sm" onClick={() => toast.info(isHe ? 'משיכות יהיו זמינות בקרוב' : 'Withdrawals coming soon')}>
              <ArrowUpRight className="w-4 h-4" />
              {isHe ? 'משיכה' : 'Withdraw'}
            </Button>
            <Button variant="outline" className="flex-1 gap-1.5" size="sm" onClick={() => toast.info(isHe ? 'הפקדות יהיו זמינות בקרוב' : 'Deposits coming soon')}>
              <Coins className="w-4 h-4" />
              {isHe ? 'הפקדה' : 'Deposit'}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Lifetime Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] font-medium">{isHe ? 'סה״כ הרווחת' : 'Total Earned'}</span>
          </div>
          <p className="text-lg font-bold text-emerald-500">+{earned.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">≈ ${(earned * MOS_TO_USD).toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <TrendingDown className="w-3.5 h-3.5 text-destructive" />
            <span className="text-[11px] font-medium">{isHe ? 'סה״כ הוצאת' : 'Total Spent'}</span>
          </div>
          <p className="text-lg font-bold text-destructive">-{spent.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">≈ ${(spent * MOS_TO_USD).toFixed(2)}</p>
        </div>
      </div>

      {/* Wallet Mode Toggle */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-accent" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {isAdvanced ? (isHe ? 'מצב מתקדם' : 'Advanced Mode') : (isHe ? 'מצב פשוט' : 'Simple Mode')}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {isAdvanced
                  ? (isHe ? 'כתובת ארנק, משיכת קריפטו' : 'Wallet address, crypto withdrawals')
                  : (isHe ? 'נקודות ומשיכה לבנק' : 'Points & bank withdrawals')
                }
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => toast.info(isHe ? 'מעבר למצב מתקדם יהיה זמין בקרוב' : 'Advanced mode coming soon')}
          >
            {isAdvanced ? (isHe ? 'פשוט' : 'Simple') : (isHe ? 'מתקדם' : 'Advanced')} →
          </Button>
        </div>

        {/* Advanced mode preview — show wallet address stub */}
        {isAdvanced && wallet?.solana_address && (
          <div className="mt-3 pt-3 border-t border-border space-y-2">
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
              <code className="text-[11px] text-muted-foreground flex-1 truncate font-mono">
                {wallet.solana_address}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(wallet.solana_address || '');
                  toast.success('Copied!');
                }}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <a
                href={`https://explorer.solana.com/address/${wallet.solana_address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">{isHe ? 'היסטוריית עסקאות' : 'Transaction History'}</h3>
        {txLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-14 bg-muted/50 rounded-xl animate-pulse" />)}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <Coins className="w-8 h-8 text-muted-foreground/40 mx-auto" />
            <p className="text-sm text-muted-foreground">
              {isHe ? 'אין עסקאות עדיין. התחל להרוויח!' : 'No transactions yet. Start earning!'}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {transactions.map((tx: any) => {
              const label = TX_LABELS[tx.type] || { en: tx.type, he: tx.type, icon: '💰' };
              const isPositive = tx.amount >= 0;
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 bg-card border border-border rounded-xl px-3.5 py-3 active:scale-[0.99] transition-transform"
                >
                  <span className="text-lg">{label.icon}</span>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-sm font-medium text-foreground truncate">
                      {tx.description || (isHe ? label.he : label.en)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {format(new Date(tx.created_at), 'MMM d, yyyy · HH:mm')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${isPositive ? 'text-emerald-500' : 'text-destructive'}`}>
                      {isPositive ? '+' : ''}{tx.amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {isPositive ? '+' : '-'}${Math.abs(tx.amount * MOS_TO_USD).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
