/**
 * SpendConfirmDialog — Confirmation dialog before spending MOS.
 * Shows TransactionPreview + confirm/cancel.
 */
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck } from 'lucide-react';
import { TransactionPreview } from './TransactionPreview';
import { useMOSEconomy } from '@/hooks/fm/useMOSEconomy';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  description: string;
  sellerName?: string;
  sellerId?: string;
  referenceType?: string;
  referenceId?: string;
  onSuccess?: (result: any) => void;
}

export function SpendConfirmDialog({
  open, onOpenChange, amount, description, sellerName, sellerId,
  referenceType, referenceId, onSuccess,
}: Props) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { balance, canAfford, spendMOS, isSpending } = useMOSEconomy();
  const affordable = canAfford(amount);

  const handleConfirm = async () => {
    const result = await spendMOS({
      amount,
      description,
      sellerId: sellerId ?? undefined,
      referenceType: referenceType ?? undefined,
      referenceId: referenceId ?? undefined,
      idempotencyKey: `spend_${referenceType}_${referenceId}_${Date.now()}`,
    });

    if (result.success) {
      toast.success(isHe ? `✅ עסקה בוצעה — ${result.fee} MOS עמלה` : `✅ Transaction complete — ${result.fee} MOS fee`);
      onOpenChange(false);
      onSuccess?.(result);
    } else {
      toast.error(result.error || (isHe ? 'העסקה נכשלה' : 'Transaction failed'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm w-[90vw] p-0 gap-0 rounded-2xl overflow-hidden">
        <DialogTitle className="sr-only">{isHe ? 'אישור תשלום' : 'Confirm Payment'}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>

        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">
              {isHe ? 'אישור תשלום MOS' : 'Confirm MOS Payment'}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* What you're buying */}
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">{isHe ? 'אתה רוכש' : "You're purchasing"}</p>
            <p className="text-sm font-semibold text-foreground">{description}</p>
          </div>

          {/* Transaction preview */}
          <TransactionPreview
            amount={amount}
            sellerName={sellerName}
            currentBalance={balance}
          />

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isSpending}
            >
              {isHe ? 'ביטול' : 'Cancel'}
            </Button>
            <Button
              className="flex-1 gap-1.5"
              onClick={handleConfirm}
              disabled={!affordable || isSpending}
            >
              {isSpending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isHe ? 'אשר תשלום' : 'Confirm Payment'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
