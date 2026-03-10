/**
 * ArenaHudSidebar - Left sidebar for Arena navigation.
 * Amber/orange color scheme. Pillar buttons navigate to results pages.
 */
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PanelRightClose, PanelRightOpen, Plus } from 'lucide-react';
import { CORE_DOMAINS } from '@/navigation/lifeDomains';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { useStrategyPlans } from '@/hooks/useStrategyPlans';
import { useProjects } from '@/hooks/useProjects';
import { useBusinessJourneys } from '@/hooks/useBusinessJourneys';
import { supabase } from '@/integrations/supabase/client';
import { SidebarOrbWidget } from '@/components/sidebar/SidebarOrbWidget';
import { Progress } from '@/components/ui/progress';

interface ArenaHudSidebarProps {
  onNewProject?: () => void;
}

export function ArenaHudSidebar({ onNewProject }: ArenaHudSidebarProps) {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();
  const { statusMap } = useLifeDomains();
  const { arenaPlan } = useStrategyPlans();
  const { projects } = useProjects();
  const { journeys: businesses } = useBusinessJourneys();

  const domainColorMap: Record<string, string> = {
    violet: 'text-violet-400', fuchsia: 'text-fuchsia-400', red: 'text-red-400',
    amber: 'text-amber-400', cyan: 'text-cyan-400', slate: 'text-slate-400',
    indigo: 'text-indigo-400', emerald: 'text-emerald-400', purple: 'text-purple-400',
    sky: 'text-sky-400', orange: 'text-orange-400', blue: 'text-blue-400',
    lime: 'text-lime-400', teal: 'text-teal-400', rose: 'text-rose-400',
  };

  const activeColorMap: Record<string, string> = {
    violet: 'bg-violet-500/20 border-violet-500/30',
    fuchsia: 'bg-fuchsia-500/20 border-fuchsia-500/30',
    red: 'bg-red-500/20 border-red-500/30',
    amber: 'bg-amber-500/20 border-amber-500/30',
    cyan: 'bg-cyan-500/20 border-cyan-500/30',
    slate: 'bg-slate-500/20 border-slate-500/30',
    indigo: 'bg-indigo-500/20 border-indigo-500/30',
    emerald: 'bg-emerald-500/20 border-emerald-500/30',
    purple: 'bg-purple-500/20 border-purple-500/30',
    sky: 'bg-sky-500/20 border-sky-500/30',
    orange: 'bg-orange-500/20 border-orange-500/30',
    blue: 'bg-blue-500/20 border-blue-500/30',
    lime: 'bg-lime-500/20 border-lime-500/30',
    teal: 'bg-teal-500/20 border-teal-500/30',
    rose: 'bg-rose-500/20 border-rose-500/30',
  };

  const inactiveColorMap: Record<string, string> = {
    violet: 'bg-violet-500/8 border-violet-500/15 hover:bg-violet-500/15',
    fuchsia: 'bg-fuchsia-500/8 border-fuchsia-500/15 hover:bg-fuchsia-500/15',
    red: 'bg-red-500/8 border-red-500/15 hover:bg-red-500/15',
    amber: 'bg-amber-500/8 border-amber-500/15 hover:bg-amber-500/15',
    cyan: 'bg-cyan-500/8 border-cyan-500/15 hover:bg-cyan-500/15',
    slate: 'bg-slate-500/8 border-slate-500/15 hover:bg-slate-500/15',
    indigo: 'bg-indigo-500/8 border-indigo-500/15 hover:bg-indigo-500/15',
    emerald: 'bg-emerald-500/8 border-emerald-500/15 hover:bg-emerald-500/15',
    purple: 'bg-purple-500/8 border-purple-500/15 hover:bg-purple-500/15',
    sky: 'bg-sky-500/8 border-sky-500/15 hover:bg-sky-500/15',
    orange: 'bg-orange-500/8 border-orange-500/15 hover:bg-orange-500/15',
    blue: 'bg-blue-500/8 border-blue-500/15 hover:bg-blue-500/15',
    lime: 'bg-lime-500/8 border-lime-500/15 hover:bg-lime-500/15',
    teal: 'bg-teal-500/8 border-teal-500/15 hover:bg-teal-500/15',
    rose: 'bg-rose-500/8 border-rose-500/15 hover:bg-rose-500/15',
  };

  const activeProjects = projects.filter(p => p.status === 'active');

  // Fetch missions for progress display
  const { data: missions } = useQuery({
    queryKey: ['plan-missions', arenaPlan?.id],
    queryFn: async () => {
      if (!arenaPlan?.id) return [];
      const { data } = await supabase
        .from('plan_missions').select('*')
        .eq('plan_id', arenaPlan.id).order('mission_number');
      return data || [];
    },
    enabled: !!arenaPlan?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: milestones } = useQuery({
    queryKey: ['mission-milestones', arenaPlan?.id],
    queryFn: async () => {
      if (!arenaPlan?.id) return [];
      const { data } = await supabase
        .from('life_plan_milestones')
        .select('id, title, title_en, is_completed, mission_id, milestone_number, focus_area')
        .eq('plan_id', arenaPlan.id).not('mission_id', 'is', null).order('milestone_number');
      return data || [];
    },
    enabled: !!arenaPlan?.id,
    staleTime: 5 * 60 * 1000,
  });

  const missionsByPillar = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    for (const m of (missions || [])) {
      if (!grouped[m.pillar]) grouped[m.pillar] = [];
      grouped[m.pillar].push(m);
    }
    return grouped;
  }, [missions]);

  const milestonesByMission = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    for (const ms of (milestones || [])) {
      if (!ms.mission_id) continue;
      if (!grouped[ms.mission_id]) grouped[ms.mission_id] = [];
      grouped[ms.mission_id].push(ms);
    }
    return grouped;
  }, [milestones]);

  const getPillarProgress = (domainId: string) => {
    const pillarMissions = missionsByPillar[domainId] || [];
    const totalMs = pillarMissions.reduce((s, m) => s + (milestonesByMission[m.id]?.length || 0), 0);
    const doneMs = pillarMissions.reduce((s, m) => s + (milestonesByMission[m.id]?.filter(ms => ms.is_completed).length || 0), 0);
    return totalMs > 0 ? Math.round((doneMs / totalMs) * 100) : 0;
  };

  const handlePillarClick = (domainId: string) => {
    navigate(`/strategy/${domainId}/results`);
  };

  return (
    <aside className={cn(
      "flex flex-col flex-shrink-0 h-full overflow-y-auto scrollbar-hide transition-all duration-300 relative",
      "backdrop-blur-xl bg-card/90",
      "ltr:border-s rtl:border-e border-border/50",
      collapsed ? "w-16 min-w-[64px]" : "w-full md:w-[280px] md:min-w-[220px] xl:w-[300px] fixed md:relative right-0 md:right-auto top-14 bottom-0 z-[55] md:z-auto md:top-auto bg-background md:bg-transparent"
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

      {/* ===== COLLAPSED MINI VIEW ===== */}
      {collapsed && (
        <div className="flex flex-col items-center gap-3 h-full pt-10 pb-4 px-0 overflow-hidden">
          <SidebarOrbWidget collapsed />
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
                {isHe ? 'זירה — ביצוע חי' : 'Arena — Live Execution'}
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {isHe ? 'כל 14 התחומים בפעולה' : 'All 14 pillars in action'}
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

        </div>
      )}
    </aside>
  );
}
