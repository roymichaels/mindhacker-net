/**
 * FMActivitySidebar — Right sidebar for FM (Free Market) hub.
 * Shows Aurora opportunities, recent transactions, and tips.
 * Amber/gold color scheme matching FM economic identity.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import {
  PanelLeftClose, PanelLeftOpen, Sparkles, Coins,
  TrendingUp, TrendingDown, ChevronRight,
} from 'lucide-react';
import { useFMTransactions } from '@/hooks/useFMWallet';
import { useAuroraOpportunities, type FMOpportunity } from '@/hooks/fm/useAuroraOpportunities';
import { format } from 'date-fns';

const TX_ICONS: Record<string, string> = {
  earn_bounty: '🎯', earn_gig: '💼', earn_data: '📊',
  spend_purchase: '🛒', escrow_hold: '🔒', escrow_release: '🔓',
  withdraw_fiat: '🏦', withdraw_crypto: '⛓️', deposit: '📥', adjustment: '⚙️',
};

export function FMActivitySidebar() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();
  const { data: transactions = [] } = useFMTransactions();
  const { opportunities } = useAuroraOpportunities();

  const recentTx = transactions.slice(0, 5);

  return (
    <aside className={cn(
      "flex flex-col flex-shrink-0 h-full overflow-y-auto scrollbar-hide transition-all duration-300 relative",
      "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
      "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
      "ltr:border-s rtl:border-e border-border/50 dark:border-amber-500/15",
      collapsed ? "w-16 min-w-[64px]" : "w-[280px] min-w-[220px] xl:w-[300px]"
    )}>
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute top-2 z-10 p-1 rounded-md hover:bg-accent/20 transition-colors text-muted-foreground hover:text-foreground",
          collapsed
            ? "ltr:left-1/2 ltr:-translate-x-1/2 rtl:right-1/2 rtl:translate-x-1/2"
            : "ltr:left-2 rtl:right-2"
        )}
        title={collapsed ? "Expand" : "Collapse"}
      >
        {collapsed
          ? (isRTL ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />)
          : (isRTL ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />)
        }
      </button>

      {/* ===== COLLAPSED ===== */}
      {collapsed && (
        <div className="flex flex-col items-center gap-3 h-full pt-10 pb-4 overflow-hidden">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
          {/* Mini opportunity count */}
          {opportunities.length > 0 && (
            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <span className="text-[10px] font-bold text-amber-400">{opportunities.length}</span>
            </div>
          )}
          {/* Mini tx indicators */}
          {recentTx.slice(0, 3).map((tx: any) => (
            <div key={tx.id} className="flex items-center justify-center">
              <span className="text-sm">{TX_ICONS[tx.type] || '💰'}</span>
            </div>
          ))}
        </div>
      )}

      {/* ===== EXPANDED ===== */}
      {!collapsed && (
        <div className="flex flex-col gap-3 p-3 pt-8 pb-4 overflow-y-auto scrollbar-hide h-full">
          {/* Aurora Opportunities Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                {isHe ? 'הזדמנויות' : 'Opportunities'}
              </span>
            </div>

            {opportunities.length === 0 ? (
              <div className="rounded-xl bg-muted/30 border border-border/20 p-3 text-center">
                <p className="text-[11px] text-muted-foreground">
                  {isHe ? 'אין הזדמנויות כרגע' : 'No opportunities right now'}
                </p>
              </div>
            ) : (
              opportunities.map((opp: FMOpportunity) => (
                <button
                  key={opp.id}
                  onClick={() => {
                    if (opp.action.type === 'navigate') navigate(opp.action.path);
                  }}
                  className="w-full rounded-xl bg-amber-500/5 border border-amber-500/15 p-2.5 text-start hover:bg-amber-500/10 transition-colors group"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base shrink-0">{opp.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-foreground line-clamp-2">{opp.text}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{opp.subtext}</p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {opp.reward > 0 && (
                        <span className="text-[10px] font-bold text-amber-400">+{opp.reward}</span>
                      )}
                      <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-amber-400 transition-colors" />
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

          {/* Recent Transactions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {isHe ? 'פעילות אחרונה' : 'Recent Activity'}
              </span>
              <button
                onClick={() => navigate('/fm/wallet')}
                className="text-[10px] text-amber-400 hover:underline"
              >
                {isHe ? 'הכל' : 'View all'}
              </button>
            </div>

            {recentTx.length === 0 ? (
              <div className="rounded-xl bg-muted/30 border border-border/20 p-3 text-center">
                <Coins className="w-5 h-5 text-muted-foreground/30 mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground">
                  {isHe ? 'אין פעילות עדיין' : 'No activity yet'}
                </p>
              </div>
            ) : (
              recentTx.map((tx: any) => {
                const isPositive = tx.amount >= 0;
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-2 rounded-lg bg-muted/20 border border-border/10 px-2.5 py-2"
                  >
                    <span className="text-sm shrink-0">{TX_ICONS[tx.type] || '💰'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-foreground truncate">
                        {tx.description || tx.type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        {format(new Date(tx.created_at), 'MMM d, HH:mm')}
                      </p>
                    </div>
                    <span className={cn(
                      "text-[11px] font-bold shrink-0",
                      isPositive ? "text-emerald-500" : "text-destructive"
                    )}>
                      {isPositive ? '+' : ''}{tx.amount}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

          {/* Earning Tips */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {isHe ? 'טיפים' : 'Tips'}
            </span>
            <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/15 p-3 space-y-1.5">
              <p className="text-[11px] font-medium text-foreground">
                {isHe ? '💡 השלם באונטיז כדי לבנות רפוטציה' : '💡 Complete bounties to build reputation'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isHe
                  ? 'רפוטציה גבוהה = גישה לעבודות עם תשלום גבוה יותר'
                  : 'Higher reputation = access to higher-paying gigs'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
