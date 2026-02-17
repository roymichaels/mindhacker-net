import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Zap, AlertTriangle } from 'lucide-react';
import { useEnergy } from '@/hooks/useGameState';
import { useTranslation } from '@/hooks/useTranslation';

interface EnergySpendModalProps {
  open: boolean;
  cost: number;
  /** e.g. 'hypnosis', 'aurora_message', 'onboarding_rerun' */
  source: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const sourceLabels: Record<string, { he: string; en: string }> = {
  hypnosis: { he: 'סשן היפנוזה', en: 'Hypnosis Session' },
  aurora_message: { he: 'הודעת אורורה', en: 'Aurora Message' },
  onboarding_rerun: { he: 'הערכה מחדש', en: 'Re-evaluation' },
  pdf_90day: { he: 'תוכנית 90 יום', en: '90-Day Plan' },
};

const earnTips = {
  he: ['השלם משימות יומיות', 'שמור על רצף יומי', 'עלה רמה'],
  en: ['Complete daily tasks', 'Maintain your streak', 'Level up'],
};

const EnergySpendModal = ({ open, cost, source, onConfirm, onCancel }: EnergySpendModalProps) => {
  const { balance } = useEnergy();
  const { language } = useTranslation();
  const isRTL = language === 'he';
  const canAfford = balance >= cost;
  const remaining = balance - cost;

  const label = sourceLabels[source] || sourceLabels.hypnosis;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-sm" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <div className="flex justify-center mb-3">
            <div className={`rounded-full p-3 ${canAfford ? 'bg-primary/15' : 'bg-destructive/15'}`}>
              {canAfford ? (
                <Zap className="h-7 w-7 text-yellow-500 fill-yellow-500/30" />
              ) : (
                <AlertTriangle className="h-7 w-7 text-destructive" />
              )}
            </div>
          </div>
          <DialogTitle className="text-center text-lg">
            {canAfford
              ? (isRTL ? 'אישור שימוש באנרגיה' : 'Confirm Energy Spend')
              : (isRTL ? 'אין מספיק אנרגיה' : 'Not Enough Energy')}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isRTL ? label.he : label.en}
          </DialogDescription>
        </DialogHeader>

        {/* Balance breakdown */}
        <div className="rounded-xl bg-muted p-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{isRTL ? 'יתרה נוכחית' : 'Current Balance'}</span>
            <span className="font-semibold flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500/30" />
              {balance}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{isRTL ? 'עלות' : 'Cost'}</span>
            <span className="font-semibold text-destructive">-{cost}</span>
          </div>
          {canAfford && (
            <div className="flex items-center justify-between border-t border-border pt-2">
              <span className="text-muted-foreground">{isRTL ? 'יתרה לאחר' : 'Remaining'}</span>
              <span className="font-semibold flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500/30" />
                {remaining}
              </span>
            </div>
          )}
        </div>

        {/* Earn tips when can't afford */}
        {!canAfford && (
          <div className="rounded-xl bg-muted/50 p-3 text-sm space-y-1">
            <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
              {isRTL ? 'איך להרוויח אנרגיה' : 'How to earn Energy'}
            </p>
            <ul className="space-y-0.5">
              {(isRTL ? earnTips.he : earnTips.en).map((tip) => (
                <li key={tip} className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="text-yellow-500">⚡</span> {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-2 mt-2">
          {canAfford ? (
            <Button onClick={onConfirm} className="w-full">
              <Zap className="h-4 w-4 ltr:mr-1.5 rtl:ml-1.5 text-yellow-300" />
              {isRTL ? `השתמש ב-${cost} אנרגיה` : `Spend ${cost} Energy`}
            </Button>
          ) : (
            <Button onClick={onCancel} className="w-full">
              {isRTL ? 'הבנתי' : 'Got it'}
            </Button>
          )}
          <Button variant="ghost" onClick={onCancel} className="w-full text-muted-foreground">
            {isRTL ? 'ביטול' : 'Cancel'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnergySpendModal;
