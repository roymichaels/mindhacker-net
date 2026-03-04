import { Coins, Settings } from 'lucide-react';

interface Props {
  mos: number;
  isNew?: boolean;
}

const MOS_TO_USD = 0.01; // 1 MOS ≈ $0.01

export function FMBalanceBar({ mos, isNew }: Props) {
  const usd = (mos * MOS_TO_USD).toFixed(2);

  return (
    <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
          <Coins className="w-5 h-5 text-accent" />
        </div>
        <div>
          {isNew ? (
            <p className="text-sm text-muted-foreground">Complete your first task to earn!</p>
          ) : (
            <>
              <p className="font-bold text-foreground">{mos.toLocaleString()} MOS</p>
              <p className="text-xs text-muted-foreground">≈ ${usd}</p>
            </>
          )}
        </div>
      </div>
      <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
}
