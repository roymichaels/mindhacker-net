/**
 * FMHomeActivitySidebar — Right sidebar for FM Home.
 * Recent activity feed and quick links.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import {
  PanelLeftClose, PanelLeftOpen, Activity, Clock, Coins, ArrowRight,
} from 'lucide-react';
import { useFMTransactions } from '@/hooks/useFMWallet';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export function FMHomeActivitySidebar() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { data: transactions = [] } = useFMTransactions();
  const navigate = useNavigate();
  const recentTx = transactions.slice(0, 6);

  return (
    <aside className={cn(
      "flex flex-col flex-shrink-0 h-full overflow-y-auto scrollbar-hide transition-all duration-300 relative",
      "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
      "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
      "ltr:border-s rtl:border-e border-border/50 dark:border-amber-500/15",
      collapsed ? "w-16 min-w-[64px]" : "w-[260px] min-w-[200px] xl:w-[280px]"
    )}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute top-2 z-10 p-1 rounded-md hover:bg-accent/20 transition-colors text-muted-foreground hover:text-foreground",
          collapsed
            ? "ltr:left-1/2 ltr:-translate-x-1/2 rtl:right-1/2 rtl:translate-x-1/2"
            : "ltr:right-2 rtl:left-2"
        )}
        title={collapsed ? "Expand" : "Collapse"}
      >
        {collapsed
          ? (isRTL ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />)
          : (isRTL ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />)
        }
      </button>

      {collapsed && (
        <div className="flex flex-col items-center gap-2 h-full pt-8 pb-4">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground -rotate-90 whitespace-nowrap mt-4">
            {isHe ? 'פעילות' : 'Activity'}
          </span>
        </div>
      )}

      {!collapsed && (
        <div className="flex flex-col gap-3 p-3 pt-8 pb-4 overflow-y-auto scrollbar-hide h-full">
          <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-accent" />
            {isHe ? 'פעילות אחרונה' : 'Recent Activity'}
          </h3>

          {recentTx.length === 0 ? (
            <div className="text-center py-6">
              <Clock className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-[10px] text-muted-foreground">
                {isHe ? 'אין פעילות עדיין' : 'No activity yet'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {recentTx.map((tx: any) => {
                const isPositive = tx.amount >= 0;
                return (
                  <div key={tx.id} className="rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 p-2 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-medium text-foreground truncate flex-1">
                        {tx.description || tx.type}
                      </p>
                      <span className={cn("text-[11px] font-bold shrink-0", isPositive ? 'text-emerald-500' : 'text-destructive')}>
                        {isPositive ? '+' : ''}{tx.amount}
                      </span>
                    </div>
                    <p className="text-[9px] text-muted-foreground">
                      {format(new Date(tx.created_at), 'MMM d, HH:mm')}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={() => navigate('/fm/wallet')}
            className="text-[11px] text-accent hover:underline flex items-center gap-1 justify-center pt-1"
          >
            {isHe ? 'הצג הכל' : 'View all'} <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </aside>
  );
}
