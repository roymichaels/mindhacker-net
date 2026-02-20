/**
 * ArenaHudSidebar - Left sidebar for Arena navigation.
 * Amber/orange color scheme. Shows arena domains + projects nav.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { PanelRightClose, PanelRightOpen, Swords, Plus, FolderKanban, Briefcase } from 'lucide-react';
import { ARENA_DOMAINS } from '@/navigation/lifeDomains';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { useProjects } from '@/hooks/useProjects';
import { useBusinessJourneys } from '@/hooks/useBusinessJourneys';
import { SidebarOrbWidget } from '@/components/sidebar/SidebarOrbWidget';

interface ArenaHudSidebarProps {
  onNewProject?: () => void;
}

export function ArenaHudSidebar({ onNewProject }: ArenaHudSidebarProps) {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();
  const { statusMap } = useLifeDomains();
  const { projects } = useProjects();
  const { journeys: businesses } = useBusinessJourneys();

  const domainColorMap: Record<string, string> = {
    emerald: 'text-emerald-400', purple: 'text-purple-400', sky: 'text-sky-400', amber: 'text-amber-400', orange: 'text-orange-400', rose: 'text-rose-400',
  };

  const activeColorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/15 border-emerald-500/30',
    purple: 'bg-purple-500/15 border-purple-500/30',
    sky: 'bg-sky-500/15 border-sky-500/30',
    amber: 'bg-amber-500/15 border-amber-500/30',
    orange: 'bg-orange-500/15 border-orange-500/30',
    rose: 'bg-rose-500/15 border-rose-500/30',
  };

  const activeProjects = projects.filter(p => p.status === 'active');

  return (
    <aside className={cn(
      "flex flex-col flex-shrink-0 h-full overflow-hidden transition-all duration-300 relative",
      "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
      "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
      "ltr:border-s rtl:border-e border-border/50 dark:border-amber-500/15",
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
        <div className="flex flex-col items-center gap-3 h-full pt-10 pb-4 px-0 overflow-hidden">
          <SidebarOrbWidget collapsed />
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
          {/* Arena domain icons */}
          <div className="flex flex-col items-center gap-1 overflow-y-auto scrollbar-hide">
            {ARENA_DOMAINS.map((domain) => {
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

          <div className="w-8 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent my-1" />

          <button
            onClick={onNewProject}
            className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
            title={isHe ? 'פרויקט חדש' : 'New Project'}
          >
            <Plus className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      )}

      {/* ===== EXPANDED FULL VIEW ===== */}
      {!collapsed && (
        <div className="flex flex-col gap-3 p-3 pt-8 pb-4 overflow-y-auto scrollbar-hide h-full">
          <SidebarOrbWidget />
          <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
          {/* Header badge */}
          <div className="w-full rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 border border-amber-500/20 p-3 flex items-center justify-between">
            <div className="text-center flex-1">
              <span className="text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                {isHe ? 'זירה' : 'Arena'}
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {isHe ? 'עושר, השפעה, קשרים ופרויקטים' : 'Wealth, influence, relationships & projects'}
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

          {/* Arena domain nav items */}
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            {isHe ? 'תחומים' : 'Domains'}
          </span>
          <div className="flex flex-col gap-1 w-full">
            {ARENA_DOMAINS.map((domain) => {
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

          <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

          {/* Projects section */}
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            {isHe ? `פרויקטים (${activeProjects.length})` : `Projects (${activeProjects.length})`}
          </span>
          <div className="flex flex-col gap-1">
            {activeProjects.slice(0, 5).map((project) => (
              <div key={project.id} className="rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 p-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: project.cover_color || '#f59e0b' }} />
                  <span className="text-[11px] font-medium leading-tight truncate">{project.title}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

          {/* Businesses section */}
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            {isHe ? `עסקים (${businesses.length})` : `Businesses (${businesses.length})`}
          </span>
          <div className="flex flex-col gap-1">
            {businesses.slice(0, 5).map((biz) => (
              <button
                key={biz.id}
                onClick={() => navigate(`/business/journey/${biz.id}`)}
                className="w-full rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 p-2 text-start hover:bg-accent/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0 bg-amber-400" />
                  <span className="text-[11px] font-medium leading-tight truncate">
                    {biz.business_name || (isHe ? 'עסק ללא שם' : 'Unnamed Business')}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

          {/* New Project button */}
          <button
            onClick={onNewProject}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white p-2.5 flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs font-semibold">{isHe ? 'פרויקט חדש' : 'New Project'}</span>
          </button>
        </div>
      )}
    </aside>
  );
}
