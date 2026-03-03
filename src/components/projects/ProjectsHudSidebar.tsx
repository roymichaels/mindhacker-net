/**
 * ProjectsHudSidebar - Left sidebar for projects navigation.
 * Amber/gold color scheme matching projects identity.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { PanelRightClose, PanelRightOpen, FolderKanban, Plus, Compass, ListChecks, Target, BarChart3 } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectsHudSidebarProps {
  onNewProject?: () => void;
}

export function ProjectsHudSidebar({ onNewProject }: ProjectsHudSidebarProps) {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check journey completion
  const { data: journeyData } = useQuery({
    queryKey: ['projects-journey-status', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('projects_journeys')
        .select('journey_complete, current_step')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const journeyComplete = journeyData?.journey_complete || false;
  const journeyStep = journeyData?.current_step || 0;

  const navItems = [
    { id: 'projects', icon: FolderKanban, label: isHe ? 'הפרויקטים שלי' : 'My Projects', onClick: () => {} },
    { id: 'journey', icon: Compass, label: isHe ? 'מסע פרויקטים' : 'Projects Journey', onClick: () => navigate('/projects/journey'), badge: !journeyComplete ? `${journeyStep}/8` : undefined },
  ];

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
          ? (isRTL ? <PanelRightOpen className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />)
          : (isRTL ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />)
        }
      </button>

      {/* ===== COLLAPSED MINI VIEW ===== */}
      {collapsed && (
        <div className="flex flex-col items-center gap-3 h-full pt-7 pb-4 px-0 overflow-hidden">
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-white shadow-lg">
              <FolderKanban className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              {isHe ? 'פרויקטים' : 'Projects'}
            </span>
          </div>

          <div className="w-8 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent my-1" />

          <div className="flex flex-col items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className="p-2 rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 hover:bg-accent/10 transition-colors"
                title={item.label}
              >
                <item.icon className="w-4 h-4 text-amber-400" />
              </button>
            ))}
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
          {/* Header badge */}
          <div className="w-full rounded-xl bg-gradient-to-br from-amber-500/15 to-yellow-500/15 border border-amber-500/20 p-3 flex items-center justify-between">
            <div className="text-center flex-1">
              <span className="text-sm font-bold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                {isHe ? 'מרכז פרויקטים' : 'Projects Hub'}
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {isHe ? 'נהלו את הפרויקטים שלכם' : 'Manage your projects'}
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

          {/* Journey CTA */}
          {!journeyComplete && (
            <button
              onClick={() => navigate('/projects/journey')}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500/15 to-yellow-500/15 border border-amber-500/30 p-3 text-start hover:from-amber-500/25 hover:to-yellow-500/25 transition-all"
            >
              <div className="flex items-center gap-2 mb-1">
                <Compass className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400">
                  {isHe ? 'התחל את המסע' : 'Start Journey'}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {isHe ? `שלב ${journeyStep}/8 – הגדר את חזון הפרויקטים שלך` : `Step ${journeyStep}/8 – Define your project vision`}
              </p>
              <div className="w-full bg-muted/30 rounded-full h-1 mt-2">
                <div className="bg-gradient-to-r from-amber-400 to-yellow-500 h-1 rounded-full transition-all" style={{ width: `${(journeyStep / 8) * 100}%` }} />
              </div>
            </button>
          )}

          {/* Nav items */}
          <div className="flex flex-col gap-1 w-full">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={cn(
                  "w-full rounded-xl p-2.5 flex items-center gap-2.5 transition-all border text-start",
                  item.id === 'projects'
                    ? "bg-amber-500/15 border-amber-500/30 shadow-sm"
                    : "bg-muted/30 dark:bg-muted/15 border-border/20 hover:bg-accent/10"
                )}
              >
                <item.icon className={cn("w-4 h-4 shrink-0", item.id === 'projects' ? 'text-amber-400' : 'text-muted-foreground')} />
                <span className={cn("text-xs font-medium flex-1", item.id === 'projects' ? 'text-amber-400' : 'text-foreground')}>
                  {item.label}
                </span>
                {item.badge && (
                  <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

          {/* New Project button */}
          <button
            onClick={onNewProject}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white p-2.5 flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs font-semibold">{isHe ? 'פרויקט חדש' : 'New Project'}</span>
          </button>
        </div>
      )}
    </aside>
  );
}
