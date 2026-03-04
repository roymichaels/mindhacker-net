import { useTranslation } from '@/hooks/useTranslation';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type FMTx = Database['public']['Tables']['fm_transactions']['Row'];

interface Props {
  transactions: FMTx[];
  isLoading?: boolean;
}

export function FMActivityFeed({ transactions, isLoading }: Props) {
  const { language } = useTranslation();
  const isHe = language === 'he';

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">{isHe ? 'פעילות אחרונה' : 'Recent Activity'}</h3>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">
          {isHe ? 'עדיין אין פעילות. השלם את המשימה הראשונה שלך!' : 'No activity yet. Complete your first task!'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{isHe ? 'פעילות אחרונה' : 'Recent Activity'}</h3>
      <div className="space-y-2">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between bg-card border border-border rounded-lg px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm text-foreground truncate">{tx.description || tx.type.replace(/_/g, ' ')}</p>
              <p className="text-xs text-muted-foreground">{format(new Date(tx.created_at), 'MMM d, HH:mm')}</p>
            </div>
            <span className={`text-sm font-semibold shrink-0 ${tx.amount >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
              {tx.amount >= 0 ? '+' : ''}{tx.amount} MOS
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
