/**
 * CoreHudSidebar - Left sidebar for Core System navigation.
 * Rose/pink color scheme matching Core identity.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { PanelRightClose, PanelRightOpen, Flame } from 'lucide-react';
import { CORE_DOMAINS } from '@/navigation/lifeDomains';
import { useLifeDomains } from '@/hooks/useLifeDomains';

export function LifeHudSidebar() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();
  const { statusMap } = useLifeDomains();

  const domainColorMap: Record<string, string> = {
    rose: 'text-rose-400', red: 'text-red-400', amber: 'text-amber-400',
    violet: 'text-violet-400', emerald: 'text-emerald-400', slate: 'text-slate-400',
    indigo: 'text-indigo-400', orange: 'text-orange-400',
  };

  const activeColorMap: Record<string, string> = {
    rose: 'bg-rose-500/15 border-rose-500/30',
    red: 'bg-red-500/15 border-red-500/30',
    amber: 'bg-amber-500/15 border-amber-500/30',
    violet: 'bg-violet-500/15 border-violet-500/30',
    emerald: 'bg-emerald-500/15 border-emerald-500/30',
    slate: 'bg-slate-500/15 border-slate-500/30',
    indigo: 'bg-indigo-500/15 border-indigo-500/30',
    orange: 'bg-orange-500/15 border-orange-500/30',
  };

  return (
    <aside className={cn(
      "flex flex-col flex-shrink-0 h-full overflow-hidden transition-all duration-300 relative",
      "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
      "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
      "ltr:border-s rtl:border-e border-border/50 dark:border-rose-500/15",
      collapsed ? "w-16 min-w-[64px]" : "fixed inset-0 z-50 w-full lg:relative lg:inset-auto lg:z-auto lg:w-[280px] xl:w-[300px]"
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

      {/* ===== COLLAPSED MINI VIEW ===== */}
      {collapsed && (
        <div className="flex flex-col items-center gap-3 h-full pt-7 pb-4 px-0 overflow-hidden">

          <div className="flex flex-col items-center gap-1 overflow-y-auto scrollbar-hide">
            {CORE_DOMAINS.map((domain) => {
              const status = statusMap[domain.id] ?? 'unconfigured';
              return (
                <button
                  key={domain.id}
                  onClick={() => navigate(`/life/${domain.id}`)}
                  className={cn(
                    "p-2 rounded-lg border transition-colors",
                    status === 'active'
                      ? activeColorMap[domain.color]
                      : "bg-muted/30 dark:bg-muted/15 border-border/20 hover:bg-accent/10"
                  )}
                  title={isHe ? domain.labelHe : domain.labelEn}
                >
                  <domain.icon className={cn("w-4 h-4", domainColorMap[domain.color])} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== EXPANDED FULL VIEW ===== */}
      {!collapsed && (
        <div className="flex flex-col gap-3 p-3 pt-8 pb-4 overflow-y-auto scrollbar-hide h-full">
          {/* Header badge */}
          <div className="w-full rounded-xl bg-gradient-to-br from-rose-500/15 to-pink-500/15 border border-rose-500/20 p-3 flex items-center justify-between">
            <div className="text-center flex-1">
              <span className="text-sm font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                {isHe ? 'ליבה' : 'Core'}
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {isHe ? `${CORE_DOMAINS.length} תחומי ביצוע` : `${CORE_DOMAINS.length} execution domains`}
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />

          {/* Domain nav items */}
          <div className="flex flex-col gap-1 w-full">
            {CORE_DOMAINS.map((domain) => {
              const status = statusMap[domain.id] ?? 'unconfigured';
              const isActive = status === 'active';
              return (
                <button
                  key={domain.id}
                  onClick={() => navigate(`/life/${domain.id}`)}
                  className={cn(
                    "w-full rounded-xl p-2.5 flex items-center gap-2.5 transition-all border text-start",
                    isActive
                      ? `${activeColorMap[domain.color]} shadow-sm`
                      : "bg-muted/30 dark:bg-muted/15 border-border/20 hover:bg-accent/10"
                  )}
                >
                  <domain.icon className={cn("w-4 h-4 shrink-0", domainColorMap[domain.color])} />
                  <span className={cn("text-xs font-medium flex-1", isActive ? domainColorMap[domain.color] : 'text-foreground')}>
                    {isHe ? domain.labelHe : domain.labelEn}
                  </span>
                  {status !== 'unconfigured' && (
                    <span className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded-full border",
                      isActive
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                        : "bg-muted/40 text-muted-foreground border-border/20"
                    )}>
                      {isHe ? (isActive ? 'פעיל' : 'הוגדר') : (isActive ? 'Active' : 'Set')}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
