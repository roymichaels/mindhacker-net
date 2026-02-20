/**
 * ArenaActivitySidebar - Right sidebar with arena stats.
 * Amber/orange color scheme.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { PanelLeftClose, PanelLeftOpen, Swords, CheckCircle, Clock, Target, FolderKanban } from 'lucide-react';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { ARENA_DOMAINS } from '@/navigation/lifeDomains';
import { useProjects } from '@/hooks/useProjects';

export function ArenaActivitySidebar() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { statusMap } = useLifeDomains();
  const { projects } = useProjects();

  const arenaDomainIds = ARENA_DOMAINS.map(d => d.id);
  const arenaEntries = Object.entries(statusMap).filter(([id]) => arenaDomainIds.includes(id));
  const totalDomains = ARENA_DOMAINS.length;
  const activeDomains = arenaEntries.filter(([, s]) => s === 'active').length;
  const activeProjects = projects.filter(p => p.status === 'active').length;

  const statItems = [
    { icon: Swords, value: totalDomains, label: isHe ? 'תחומים' : 'Domains', color: 'text-amber-400' },
    { icon: Target, value: activeDomains, label: isHe ? 'פעילים' : 'Active', color: 'text-teal-400' },
    { icon: FolderKanban, value: activeProjects, label: isHe ? 'פרויקטים' : 'Projects', color: 'text-orange-400' },
    { icon: Clock, value: projects.length, label: isHe ? 'סה"כ' : 'Total', color: 'text-indigo-400' },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col flex-shrink-0 h-full overflow-hidden transition-all duration-300 relative",
        "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
        "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
        "ltr:border-e rtl:border-s border-border/50 dark:border-amber-500/15",
        collapsed ? "w-[54px] min-w-[54px]" : "fixed inset-0 z-50 w-full lg:relative lg:inset-auto lg:z-auto lg:w-[280px] xl:w-[300px]"
      )}
    >
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

      {!collapsed && (
        <div className="flex flex-col h-full overflow-hidden p-3 pt-8">
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

          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent mb-3" />

          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
            {isHe ? 'סטטוס תחומים' : 'Domain Status'}
          </span>
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="flex flex-col gap-1.5">
              {ARENA_DOMAINS.map((domain) => {
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

            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent my-3" />

            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 block">
              {isHe ? 'פרויקטים אחרונים' : 'Recent Projects'}
            </span>
            <div className="flex flex-col gap-1.5">
              {projects.slice(0, 5).map((project) => (
                <div key={project.id} className="rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: project.cover_color || '#f59e0b' }} />
                    <span className="text-[11px] font-medium leading-tight truncate">{project.title}</span>
                  </div>
                  <div className="mt-1.5 w-full bg-muted/30 rounded-full h-1">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-1 rounded-full transition-all" style={{ width: `${project.progress_percentage || 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
