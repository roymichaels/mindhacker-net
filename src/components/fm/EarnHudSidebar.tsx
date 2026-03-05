/**
 * EarnHudSidebar — Left sidebar for the Earn hub.
 * Tab navigation, search/filters, and earning stats.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import {
  PanelRightClose, PanelRightOpen, Target, Briefcase, BarChart3,
  ListChecks, Coins, TrendingUp, Award,
} from 'lucide-react';

interface EarnHudSidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  stats?: { totalEarned: number; activeClaims: number; completedBounties: number };
}

export function EarnHudSidebar({ activeTab = 'bounties', onTabChange, stats }: EarnHudSidebarProps) {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';

  const navItems = [
    { id: 'bounties', icon: Target, label: isHe ? 'באונטיז' : 'Bounties', color: 'text-amber-400' },
    { id: 'gigs', icon: Briefcase, label: isHe ? 'עבודות' : 'Gigs', color: 'text-blue-400' },
    { id: 'data', icon: BarChart3, label: isHe ? 'נתונים' : 'Data', color: 'text-emerald-400' },
    { id: 'activity', icon: ListChecks, label: isHe ? 'פעילות' : 'My Activity', color: 'text-violet-400' },
  ];

  const statItems = [
    { icon: Coins, value: stats?.totalEarned ?? 0, label: isHe ? 'הרווחת' : 'Earned', color: 'text-amber-400' },
    { icon: Target, value: stats?.activeClaims ?? 0, label: isHe ? 'פעיל' : 'Active', color: 'text-blue-400' },
    { icon: Award, value: stats?.completedBounties ?? 0, label: isHe ? 'הושלם' : 'Done', color: 'text-emerald-400' },
  ];

  return (
    <aside className={cn(
      "flex flex-col flex-shrink-0 h-full overflow-y-auto scrollbar-hide transition-all duration-300 relative",
      "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
      "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
      "ltr:border-s rtl:border-e border-border/50 dark:border-amber-500/15",
      collapsed ? "w-16 min-w-[64px]" : "w-full md:w-[260px] md:min-w-[200px] xl:w-[280px] fixed md:relative inset-x-0 top-14 bottom-0 z-[55] md:z-auto md:top-auto md:inset-x-auto bg-background md:bg-transparent"
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
          ? (isRTL ? <PanelRightOpen className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />)
          : (isRTL ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />)
        }
      </button>

      {/* COLLAPSED */}
      {collapsed && (
        <div className="flex flex-col items-center gap-2 h-full pt-8 pb-4">
          {/* Stats mini */}
          <div className="flex flex-col items-center gap-1 w-full px-1">
            {statItems.map((m, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5 w-full rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 p-1">
                <m.icon className={cn("w-4 h-4", m.color)} />
                <span className="text-[10px] font-bold leading-none">{m.value}</span>
              </div>
            ))}
          </div>

          <div className="w-8 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent my-1" />

          {/* Nav icons */}
          <div className="flex flex-col items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange?.(item.id)}
                className={cn(
                  "p-2 rounded-lg border transition-colors",
                  activeTab === item.id
                    ? "bg-amber-500/20 border-amber-500/30"
                    : "bg-muted/30 dark:bg-muted/15 border-border/20 hover:bg-accent/10"
                )}
                title={item.label}
              >
                <item.icon className={cn("w-4 h-4", activeTab === item.id ? 'text-amber-400' : item.color)} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* EXPANDED */}
      {!collapsed && (
        <div className="flex flex-col gap-3 p-3 pt-8 pb-4 overflow-y-auto scrollbar-hide h-full">
          {/* Stats Grid */}
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

          {/* Navigation */}
          <div className="flex flex-col gap-1.5 w-full">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange?.(item.id)}
                className={cn(
                  "w-full rounded-xl p-2.5 flex items-center gap-2.5 transition-all border text-start",
                  activeTab === item.id
                    ? "bg-amber-500/15 border-amber-500/30 shadow-sm"
                    : "bg-muted/30 dark:bg-muted/15 border-border/20 hover:bg-accent/10"
                )}
              >
                <item.icon className={cn("w-4 h-4 shrink-0", activeTab === item.id ? 'text-amber-400' : item.color)} />
                <span className={cn(
                  "text-xs font-medium",
                  activeTab === item.id ? 'text-amber-400' : 'text-foreground'
                )}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

          {/* Info card */}
          <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 p-3 text-center">
            <TrendingUp className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">
              {isHe ? 'השלם משימות, הרוויח MOS וצבור ניסיון' : 'Complete tasks, earn MOS and gain XP'}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
