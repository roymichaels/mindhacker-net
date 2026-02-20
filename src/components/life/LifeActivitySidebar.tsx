/**
 * LifeActivitySidebar - Right sidebar with life domain stats and activity.
 * Rose/pink color scheme matching Life identity.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { PanelLeftClose, PanelLeftOpen, Heart, CheckCircle, Clock, Target } from 'lucide-react';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { LIFE_DOMAINS } from '@/navigation/lifeDomains';

export function LifeActivitySidebar() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { statusMap } = useLifeDomains();

  const entries = Object.entries(statusMap);
  const totalDomains = 8;
  const activeDomains = entries.filter(([, s]) => s === 'active').length;
  const configuredDomains = entries.filter(([, s]) => s === 'configured').length;
  const completionPct = Math.round(((activeDomains + configuredDomains) / totalDomains) * 100);

  const statItems = [
    { icon: Heart, value: totalDomains, label: isHe ? 'תחומים' : 'Domains', color: 'text-rose-400' },
    { icon: Target, value: activeDomains, label: isHe ? 'פעילים' : 'Active', color: 'text-teal-400' },
    { icon: CheckCircle, value: configuredDomains, label: isHe ? 'הוגדרו' : 'Set Up', color: 'text-emerald-400' },
    { icon: Clock, value: `${completionPct}%`, label: isHe ? 'התקדמות' : 'Progress', color: 'text-indigo-400' },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col flex-shrink-0 h-full overflow-hidden transition-all duration-300 relative",
        "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
        "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
        "ltr:border-e rtl:border-s border-border/50 dark:border-rose-500/15",
        collapsed ? "w-[54px] min-w-[54px]" : "fixed inset-0 z-50 w-full lg:relative lg:inset-auto lg:z-auto lg:w-[280px] xl:w-[300px]"
      )}
    >
      {/* Collapse toggle */}
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
          ? (isRTL ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />)
          : (isRTL ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />)
        }
      </button>

      {/* ===== COLLAPSED MINI VIEW ===== */}
      {collapsed && (
        <div className="flex flex-col items-center justify-between h-full pt-8 pb-3 px-0.5 overflow-y-auto scrollbar-hide">
          <div className="flex flex-col items-center gap-1 w-full">
            {statItems.map((m, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5 w-full rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 p-1">
                <m.icon className={cn("w-4 h-4", m.color)} />
                <span className="text-[10px] font-bold leading-none">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== EXPANDED FULL VIEW ===== */}
      {!collapsed && (
        <div className="flex flex-col h-full overflow-hidden p-3 pt-8">
          {/* Stats */}
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
            {isHe ? 'סטטיסטיקה' : 'Stats'}
          </span>
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {statItems.map((m) => (
              <div key={m.label} className="rounded-lg bg-muted/40 dark:bg-muted/20 border border-border/30 p-1.5 flex flex-col items-center gap-0.5">
                <m.icon className={cn("w-3.5 h-3.5", m.color)} />
                <span className="text-sm font-bold leading-none">{m.value}</span>
                <span className="text-[9px] text-muted-foreground">{m.label}</span>
              </div>
            ))}
          </div>

          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-rose-500/20 to-transparent mb-3" />

          {/* Overall progress */}
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
            {isHe ? 'התקדמות כללית' : 'Overall Progress'}
          </span>
          <div className="rounded-xl bg-muted/30 dark:bg-muted/15 border border-border/20 p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-foreground">
                {isHe ? 'תחומים פעילים' : 'Active Domains'}
              </span>
              <span className="text-xs font-bold text-rose-400">{activeDomains}/{totalDomains}</span>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-rose-400 to-pink-500 h-1.5 rounded-full transition-all"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>

          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-rose-500/20 to-transparent mb-3" />

          {/* Domain status list */}
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
            {isHe ? 'סטטוס תחומים' : 'Domain Status'}
          </span>
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="flex flex-col gap-1.5">
              {LIFE_DOMAINS.map((domain) => {
                const status = statusMap[domain.id] ?? 'unconfigured';
                const statusLabel = isHe
                  ? (status === 'active' ? 'פעיל' : status === 'configured' ? 'הוגדר' : 'לא הוגדר')
                  : (status === 'active' ? 'Active' : status === 'configured' ? 'Set Up' : 'Not Set');
                const statusColor = status === 'active' ? 'bg-emerald-500' : status === 'configured' ? 'bg-amber-500' : 'bg-muted-foreground/30';

                return (
                  <div key={domain.id} className="rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 p-2">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full shrink-0", statusColor)} />
                      <span className="text-[11px] font-medium leading-tight truncate flex-1">
                        {isHe ? domain.labelHe : domain.labelEn}
                      </span>
                      <span className="text-[9px] text-muted-foreground">{statusLabel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
