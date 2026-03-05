/**
 * FMWalletModal — Wallet as a modal dialog, triggered from header icon.
 */
import { useState } from 'react';
import { Coins, TrendingUp, TrendingDown, ArrowUpRight, Shield, Eye, EyeOff, Wallet, Copy, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useFMWallet, useFMTransactions } from '@/hooks/useFMWallet';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

interface FMWalletModalProps {
  open: boolean;
  onClose: () => void;
}

export function FMWalletModal({ open, onClose }: FMWalletModalProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { wallet, isLoading } = useFMWallet();
  const { data: transactions = [], isLoading: txLoading } = useFMTransactions();
  const [balanceHidden, setBalanceHidden] = useState(false);

  if (!open) return null;

  const balance = wallet?.mos_balance ?? 0;
  const earned = wallet?.lifetime_earned ?? 0;
  const spent = wallet?.lifetime_spent ?? 0;
  const isAdvanced = wallet?.mode === 'advanced';
  const fiatValue = (balance * MOS_TO_USD).toFixed(2);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-x-0 top-16 z-[71] flex justify-center px-4">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl max-h-[80vh] overflow-y-auto scrollbar-hide">
          {/* Header */}
          <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center justify-between rounded-t-2xl z-10">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-foreground">
                {isAdvanced ? 'Advanced Wallet' : (isHe ? 'הארנק שלי' : 'My Wallet')}
              </span>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted/50 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {/* Balance */}
              <div className="text-center space-y-1 py-2">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-3xl font-bold text-foreground tracking-tight">
                    {balanceHidden ? '•••••' : balance.toLocaleString()}
                    {!balanceHidden && <span className="text-base font-medium text-muted-foreground ml-1">MOS</span>}
                  </p>
                  <button onClick={() => setBalanceHidden(!balanceHidden)} className="p-1 rounded-lg hover:bg-muted/50 text-muted-foreground">
                    {balanceHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {balanceHidden ? '••••' : `≈ $${fiatValue} USD`}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button className="flex-1 gap-1.5" size="sm" onClick={() => toast.info(isHe ? 'משיכות יהיו זמינות בקרוב' : 'Withdrawals coming soon')}>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {isHe ? 'משיכה' : 'Withdraw'}
                </Button>
                <Button variant="outline" className="flex-1 gap-1.5" size="sm" onClick={() => toast.info(isHe ? 'הפקדות יהיו זמינות בקרוב' : 'Deposits coming soon')}>
                  <Coins className="w-3.5 h-3.5" />
                  {isHe ? 'הפקדה' : 'Deposit'}
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/30 rounded-xl p-2.5 space-y-0.5">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-medium">{isHe ? 'הרווחת' : 'Earned'}</span>
                  </div>
                  <p className="text-sm font-bold text-emerald-500">+{earned.toLocaleString()}</p>
                </div>
                <div className="bg-muted/30 rounded-xl p-2.5 space-y-0.5">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <TrendingDown className="w-3 h-3 text-destructive" />
                    <span className="text-[10px] font-medium">{isHe ? 'הוצאת' : 'Spent'}</span>
                  </div>
                  <p className="text-sm font-bold text-destructive">-{spent.toLocaleString()}</p>
                </div>
              </div>

              {/* Wallet Mode */}
              <div className="bg-muted/20 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-medium text-foreground">
                    {isAdvanced ? (isHe ? 'מצב מתקדם' : 'Advanced') : (isHe ? 'מצב פשוט' : 'Simple')}
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2"
                  onClick={() => toast.info(isHe ? 'בקרוב' : 'Coming soon')}
                >
                  {isAdvanced ? (isHe ? 'פשוט' : 'Simple') : (isHe ? 'מתקדם' : 'Advanced')} →
                </Button>
              </div>

              {/* Advanced address */}
              {isAdvanced && wallet?.solana_address && (
                <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
                  <code className="text-[10px] text-muted-foreground flex-1 truncate font-mono">{wallet.solana_address}</code>
                  <button onClick={() => { navigator.clipboard.writeText(wallet.solana_address || ''); toast.success('Copied!'); }} className="p-1 hover:bg-muted rounded">
                    <Copy className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              )}

              {/* Transactions */}
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-semibold text-foreground">{isHe ? 'עסקאות' : 'Transactions'}</h4>
                {txLoading ? (
                  <div className="space-y-1.5">
                    {[1, 2, 3].map(i => <div key={i} className="h-10 bg-muted/50 rounded-lg animate-pulse" />)}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-4">
                    <Coins className="w-6 h-6 text-muted-foreground/30 mx-auto mb-1" />
                    <p className="text-[11px] text-muted-foreground">{isHe ? 'אין עסקאות עדיין' : 'No transactions yet'}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {transactions.slice(0, 10).map((tx: any) => {
                      const label = TX_LABELS[tx.type] || { en: tx.type, he: tx.type, icon: '💰' };
                      const isPositive = tx.amount >= 0;
                      return (
                        <div key={tx.id} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted/30 transition-colors">
                          <span className="text-sm">{label.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium text-foreground truncate">{tx.description || (isHe ? label.he : label.en)}</p>
                            <p className="text-[9px] text-muted-foreground">{format(new Date(tx.created_at), 'MMM d, HH:mm')}</p>
                          </div>
                          <span className={cn("text-[11px] font-bold", isPositive ? 'text-emerald-500' : 'text-destructive')}>
                            {isPositive ? '+' : ''}{tx.amount.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
