import { Coins, Settings, Gem } from 'lucide-react';

interface Props {
  mos: number;
  isNew?: boolean;
}

const MOS_TO_USD = 0.01;

export function FMBalanceBar({ mos, isNew }: Props) {
  const usd = (mos * MOS_TO_USD).toFixed(2);

  return (
    <div className="relative flex items-center justify-between rounded-xl px-4 py-3 border-2 border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent overflow-hidden">
      {/* Subtle gold shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/5 to-transparent animate-pulse pointer-events-none" />
      
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Coins className="w-5 h-5 text-amber-100" />
        </div>
        <div>
          {isNew ? (
            <p className="text-sm text-amber-200/80 font-medium">Complete your first quest to earn!</p>
          ) : (
            <>
              <p className="font-black text-amber-300 text-lg tracking-tight drop-shadow-[0_0_6px_rgba(245,158,11,0.3)]">{mos.toLocaleString()} <span className="text-xs font-bold text-amber-400/80">MOS</span></p>
              <p className="text-[10px] text-amber-200/50 font-medium">≈ ${usd}</p>
            </>
          )}
        </div>
      </div>
      <button className="p-2 rounded-lg hover:bg-amber-500/10 transition-colors text-amber-400/50 hover:text-amber-300 relative z-10">
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
}
