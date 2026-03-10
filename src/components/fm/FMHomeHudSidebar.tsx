/**
 * FMHomeHudSidebar — Left sidebar for FM Home.
 * Quick nav, balance overview, and FM stats.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import {
  PanelRightClose, PanelRightOpen, Coins, Target,
  Briefcase, Wallet, TrendingUp, Activity, Zap,
} from 'lucide-react';

interface FMHomeHudSidebarProps {
  balance?: number;
  lifetimeEarned?: number;
  activeBounties?: number;
}

export function FMHomeHudSidebar({ balance = 0, lifetimeEarned = 0, activeBounties = 0 }: FMHomeHudSidebarProps) {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();

  const navItems = [
    { id: 'earn', icon: Target, label: isHe ? 'הרוויח' : 'Earn', color: 'text-amber-400', path: '/fm' },
    { id: 'wallet', icon: Wallet, label: isHe ? 'ארנק' : 'Wallet', color: 'text-emerald-400', path: '__wallet__' },
  ];

  const statItems = [
    { icon: Coins, value: balance, label: isHe ? 'יתרה' : 'Balance', color: 'text-amber-400' },
    { icon: TrendingUp, value: lifetimeEarned, label: isHe ? 'הרווחת' : 'Earned', color: 'text-emerald-400' },
    { icon: Target, value: activeBounties, label: isHe ? 'פעיל' : 'Active', color: 'text-blue-400' },
  ];

  return (
    <aside className={cn(
      "flex flex-col flex-shrink-0 h-full overflow-y-auto scrollbar-hide transition-all duration-300 relative",
      "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
      "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
      "ltr:border-e rtl:border-s border-border/50 dark:border-amber-500/15",
      collapsed ? "w-16 min-w-[64px]" : "w-full md:w-[260px] md:min-w-[200px] xl:w-[280px] fixed md:relative right-0 md:right-auto top-14 bottom-0 z-[55] md:z-auto md:top-auto bg-background md:bg-transparent"
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
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent my-1" />
          <div className="flex flex-col items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
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
          <div className="h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
          <div className="flex flex-col gap-1.5 w-full">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="w-full rounded-xl p-2.5 flex items-center gap-2.5 transition-all border text-start bg-muted/30 dark:bg-muted/15 border-border/20 hover:bg-accent/10"
              >
                <item.icon className={cn("w-4 h-4 shrink-0", item.color)} />
                <span className="text-xs font-medium text-foreground">{item.label}</span>
              </button>
            ))}
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
          <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 p-3 text-center">
            <Zap className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">
              {isHe ? 'מרכז הכלכלה הדיגיטלית שלך' : 'Your digital economy hub'}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
