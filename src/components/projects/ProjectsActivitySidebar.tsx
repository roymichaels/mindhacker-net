/**
 * ProjectsActivitySidebar - Right sidebar with project stats and roadmap.
 * Amber/gold color scheme matching projects identity.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { PanelLeftClose, PanelLeftOpen, FolderKanban, CheckCircle, Clock, Target } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';

export function ProjectsActivitySidebar() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { projects } = useProjects();

  const activeCount = projects.filter(p => p.status === 'active').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;
  const totalCount = projects.length;
  const avgProgress = totalCount > 0
    ? Math.round(projects.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / totalCount)
    : 0;

  const statItems = [
    { icon: FolderKanban, value: totalCount, label: isHe ? 'סה"כ' : 'Total', color: 'text-amber-400' },
    { icon: Target, value: activeCount, label: isHe ? 'פעילים' : 'Active', color: 'text-teal-400' },
    { icon: CheckCircle, value: completedCount, label: isHe ? 'הושלמו' : 'Done', color: 'text-emerald-400' },
    { icon: Clock, value: `${avgProgress}%`, label: isHe ? 'התקדמות' : 'Progress', color: 'text-indigo-400' },
  ];

  const recentProjects = projects.slice(0, 5);

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
            {isHe ? 'פרויקטים אחרונים' : 'Recent Projects'}
          </span>
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {recentProjects.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">{isHe ? 'אין פרויקטים' : 'No projects yet'}</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {recentProjects.map((project) => (
                  <div key={project.id} className="rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: project.cover_color || '#f59e0b' }} />
                      <span className="text-[11px] font-medium leading-tight truncate">{project.title}</span>
                    </div>
                    <div className="mt-1.5 w-full bg-muted/30 rounded-full h-1">
                      <div className="bg-gradient-to-r from-amber-400 to-yellow-500 h-1 rounded-full transition-all" style={{ width: `${project.progress_percentage || 0}%` }} />
                    </div>
                    <span className="text-[9px] text-muted-foreground mt-0.5 block">
                      {project.progress_percentage || 0}% {isHe ? 'הושלם' : 'complete'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
