/**
 * TransactionPreview — Shows gross/fee/net breakdown before a MOS purchase.
 * Used inside dialogs before confirming a transaction.
 */
import { Coins, ArrowDown, Shield } from 'lucide-react';
import { calculateFee, MOS_TO_USD } from '@/hooks/fm/useMOSEconomy';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface Props {
  amount: number;
  sellerName?: string;
  currentBalance?: number;
  className?: string;
}

export function TransactionPreview({ amount, sellerName, currentBalance, className }: Props) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const fee = calculateFee(amount);
  const balanceAfter = currentBalance != null ? currentBalance - amount : null;
  const canAfford = currentBalance != null ? currentBalance >= amount : true;

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="w-3.5 h-3.5" />
        <span>{isHe ? 'פירוט עסקה' : 'Transaction Breakdown'}</span>
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {/* Gross */}
        <Row
          label={isHe ? 'סכום' : 'Amount'}
          mos={fee.grossAmount}
          usd={fee.grossUsd}
          variant="default"
        />

        {/* Fee */}
        <Row
          label={isHe ? 'עמלת פלטפורמה (2%)' : 'Platform fee (2%)'}
          mos={fee.feeAmount}
          usd={fee.feeUsd}
          variant="fee"
        />

        <div className="border-t border-border" />

        {/* Net to seller */}
        {sellerName && (
          <Row
            label={isHe ? `${sellerName} מקבל` : `${sellerName} receives`}
            mos={fee.netToSeller}
            usd={fee.netUsd}
            variant="success"
          />
        )}

        {/* You pay */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-semibold text-foreground">
            {isHe ? 'אתה משלם' : 'You pay'}
          </span>
          <div className="text-end">
            <p className="text-sm font-bold text-foreground">{fee.grossAmount.toLocaleString()} MOS</p>
            <p className="text-[10px] text-muted-foreground">≈ ${fee.grossUsd.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Balance after */}
      {balanceAfter != null && (
        <div className={cn(
          "flex items-center justify-between rounded-lg px-3 py-2 text-xs",
          canAfford ? "bg-muted/30" : "bg-destructive/10 border border-destructive/20"
        )}>
          <span className="text-muted-foreground">
            {isHe ? 'יתרה לאחר' : 'Balance after'}
          </span>
          <span className={cn("font-bold", canAfford ? "text-foreground" : "text-destructive")}>
            {canAfford ? balanceAfter.toLocaleString() : (isHe ? 'יתרה לא מספיקה' : 'Insufficient balance')} {canAfford ? 'MOS' : ''}
          </span>
        </div>
      )}

      {/* Fee split info */}
      <details className="group">
        <summary className="text-[10px] text-muted-foreground/60 cursor-pointer hover:text-muted-foreground transition-colors">
          {isHe ? 'לאן הולכת העמלה?' : 'Where does the fee go?'}
        </summary>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
          <FeeChip label={isHe ? 'קרן' : 'Treasury'} amount={fee.split.treasury} pct="50%" />
          <FeeChip label={isHe ? 'תגמולים' : 'Rewards'} amount={fee.split.rewards} pct="25%" />
          <FeeChip label={isHe ? 'רזרבה' : 'Reserve'} amount={fee.split.reserve} pct="25%" />
        </div>
      </details>
    </div>
  );
}

function Row({ label, mos, usd, variant }: { label: string; mos: number; usd: number; variant: 'default' | 'fee' | 'success' }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className={cn(
        variant === 'fee' ? 'text-amber-500' : variant === 'success' ? 'text-emerald-500' : 'text-muted-foreground'
      )}>
        {label}
      </span>
      <div className="text-end">
        <span className={cn(
          "font-medium",
          variant === 'fee' ? 'text-amber-500' : variant === 'success' ? 'text-emerald-500' : 'text-foreground'
        )}>
          {variant === 'fee' ? '-' : ''}{mos.toLocaleString()} MOS
        </span>
        <span className="text-muted-foreground/50 ms-1">(${usd.toFixed(2)})</span>
      </div>
    </div>
  );
}

function FeeChip({ label, amount, pct }: { label: string; amount: number; pct: string }) {
  return (
    <div className="text-center bg-muted/30 rounded-lg py-1.5 px-1">
      <p className="font-medium text-foreground">{amount}</p>
      <p className="text-muted-foreground">{label} ({pct})</p>
    </div>
  );
}
