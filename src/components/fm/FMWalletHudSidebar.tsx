/**
 * FMWalletHudSidebar — Left sidebar for FM Wallet page.
 * Balance summary, quick actions, and navigation.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import {
  PanelRightClose, PanelRightOpen, Wallet, Coins,
  ArrowUpRight, ArrowDownLeft, Shield, TrendingUp,
} from 'lucide-react';

interface FMWalletHudSidebarProps {
  balance?: number;
  lifetimeEarned?: number;
  lifetimeSpent?: number;
  mode?: string;
}

export function FMWalletHudSidebar({ balance = 0, lifetimeEarned = 0, lifetimeSpent = 0, mode = 'simple' }: FMWalletHudSidebarProps) {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();

  const statItems = [
    { icon: Coins, value: balance, label: isHe ? 'יתרה' : 'Balance', color: 'text-amber-400' },
    { icon: TrendingUp, value: lifetimeEarned, label: isHe ? 'הרווחת' : 'Earned', color: 'text-emerald-400' },
    { icon: ArrowUpRight, value: lifetimeSpent, label: isHe ? 'הוצאת' : 'Spent', color: 'text-destructive' },
  ];

  const actions = [
    { id: 'earn', icon: Coins, label: isHe ? 'הרוויח' : 'Earn More', color: 'text-amber-400', path: '/fm/earn' },
    { id: 'withdraw', icon: ArrowUpRight, label: isHe ? 'משיכה' : 'Withdraw', color: 'text-blue-400', path: '' },
    { id: 'deposit', icon: ArrowDownLeft, label: isHe ? 'הפקדה' : 'Deposit', color: 'text-emerald-400', path: '' },
  ];

  return (
    <aside className={cn(
      "flex flex-col flex-shrink-0 h-full overflow-y-auto scrollbar-hide transition-all duration-300 relative",
      "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
      "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
      "ltr:border-e rtl:border-s border-border/50 dark:border-emerald-500/15",
      collapsed ? "w-16 min-w-[64px]" : "w-[260px] min-w-[200px] xl:w-[280px]"
    )}>
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
          ? (isRTL ? <PanelRightOpen className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />)
          : (isRTL ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />)
        }
      </button>

      {collapsed && (
        <div className="flex flex-col items-center gap-2 h-full pt-8 pb-4">
          <div className="flex flex-col items-center gap-1 w-full px-1">
            {statItems.map((m, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5 w-full rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 p-1">
                <m.icon className={cn("w-4 h-4", m.color)} />
                <span className="text-[10px] font-bold leading-none">{m.value}</span>
              </div>
            ))}
          </div>
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent my-1" />
          <div className="flex flex-col items-center gap-1">
            {actions.map((item) => (
              <button
                key={item.id}
                onClick={() => item.path && navigate(item.path)}
                className="p-2 rounded-lg border bg-muted/30 dark:bg-muted/15 border-border/20 hover:bg-accent/10 transition-colors"
                title={item.label}
              >
                <item.icon className={cn("w-4 h-4", item.color)} />
              </button>
            ))}
          </div>
        </div>
      )}

      {!collapsed && (
        <div className="flex flex-col gap-3 p-3 pt-8 pb-4 overflow-y-auto scrollbar-hide h-full">
          <div className="grid grid-cols-3 gap-1.5">
            {statItems.map((m) => (
              <div key={m.label} className="rounded-lg bg-muted/40 dark:bg-muted/20 border border-border/30 p-1.5 flex flex-col items-center gap-0.5">
                <m.icon className={cn("w-3.5 h-3.5", m.color)} />
                <span className="text-sm font-bold leading-none">{m.value}</span>
                <span className="text-[9px] text-muted-foreground">{m.label}</span>
              </div>
            ))}
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

          <div className="flex flex-col gap-1.5 w-full">
            {actions.map((item) => (
              <button
                key={item.id}
                onClick={() => item.path && navigate(item.path)}
                className="w-full rounded-xl p-2.5 flex items-center gap-2.5 transition-all border text-start bg-muted/30 dark:bg-muted/15 border-border/20 hover:bg-accent/10"
              >
                <item.icon className={cn("w-4 h-4 shrink-0", item.color)} />
                <span className="text-xs font-medium text-foreground">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

          <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/15 p-3 text-center">
            <Shield className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">
              {mode === 'advanced'
                ? (isHe ? 'ארנק מתקדם עם קריפטו' : 'Advanced wallet with crypto')
                : (isHe ? 'ארנק מאובטח ופשוט' : 'Simple & secure wallet')
              }
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
