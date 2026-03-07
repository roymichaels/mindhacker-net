import { useTranslation } from '@/hooks/useTranslation';
import { DollarSign } from 'lucide-react';

export default function FreelancerEarningsTab() {
  const { language } = useTranslation();
  const isHe = language === 'he';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold">{isHe ? 'הכנסות' : 'Earnings'}</h3>
      </div>
      <div className="rounded-xl border border-border/50 bg-card/50 p-8 text-center">
        <p className="text-muted-foreground text-sm">
          {isHe ? 'הכנסות יופיעו כאן ברגע שתתחיל לעבוד.' : 'Earnings will appear here once you start working.'}
        </p>
      </div>
    </div>
  );
}
