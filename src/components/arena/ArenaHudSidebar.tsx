/**
 * ArenaHudSidebar - Left sidebar for Arena navigation.
 * Amber/orange color scheme. Pillar buttons open PillarModal.
 */
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PanelRightClose, PanelRightOpen, Plus } from 'lucide-react';
import { ARENA_DOMAINS, type LifeDomain } from '@/navigation/lifeDomains';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { useStrategyPlans } from '@/hooks/useStrategyPlans';
import { useProjects } from '@/hooks/useProjects';
import { useBusinessJourneys } from '@/hooks/useBusinessJourneys';
import { supabase } from '@/integrations/supabase/client';
import { SidebarOrbWidget } from '@/components/sidebar/SidebarOrbWidget';
import { PillarModal } from '@/components/missions/PillarModal';
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
  const [selectedDomain, setSelectedDomain] = useState<LifeDomain | null>(null);

  const domainColorMap: Record<string, string> = {
    emerald: 'text-emerald-400', purple: 'text-purple-400', sky: 'text-sky-400', amber: 'text-amber-400', orange: 'text-orange-400', rose: 'text-rose-400', violet: 'text-violet-400', teal: 'text-teal-400',
  };

  const activeColorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/15 border-emerald-500/30',
    purple: 'bg-purple-500/15 border-purple-500/30',
    sky: 'bg-sky-500/15 border-sky-500/30',
    amber: 'bg-amber-500/15 border-amber-500/30',
    orange: 'bg-orange-500/15 border-orange-500/30',
    rose: 'bg-rose-500/15 border-rose-500/30',
    violet: 'bg-violet-500/15 border-violet-500/30',
    teal: 'bg-teal-500/15 border-teal-500/30',
  };

  const activeProjects = projects.filter(p => p.status === 'active');

  // Fetch missions & milestones for PillarModal
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

  return (
    <>
      <aside className={cn(
        "flex flex-col flex-shrink-0 h-full overflow-hidden transition-all duration-300 relative",
        "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
        "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
        "ltr:border-s rtl:border-e border-border/50 dark:border-amber-500/15",
        collapsed ? "w-16 min-w-[64px]" : "fixed top-14 bottom-14 inset-x-0 z-50 w-full lg:relative lg:top-auto lg:bottom-auto lg:inset-x-auto lg:z-auto lg:w-[280px] xl:w-[300px]"
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
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            <div className="flex flex-col items-center gap-1 overflow-y-auto scrollbar-hide">
              {ARENA_DOMAINS.map((domain) => {
                const status = statusMap[domain.id] ?? 'unconfigured';
                return (
                  <button
                    key={domain.id}
                    onClick={() => setSelectedDomain(domain)}
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

            {/* Arena domain nav items — open PillarModal */}
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {isHe ? 'תחומים' : 'Domains'}
            </span>
            <div className="flex flex-col gap-1 w-full">
              {ARENA_DOMAINS.map((domain) => {
                const status = statusMap[domain.id] ?? 'unconfigured';
                const isActive = status === 'active' || status === 'configured';
                const progress = getPillarProgress(domain.id);
                const hasMissions = (missionsByPillar[domain.id] || []).length > 0;
                return (
                  <button
                    key={domain.id}
                    onClick={() => setSelectedDomain(domain)}
                    className={cn(
                      "w-full rounded-xl p-2.5 flex items-center gap-2.5 transition-all border text-start",
                      isActive
                        ? `${activeColorMap[domain.color]} shadow-sm`
                        : "bg-muted/30 dark:bg-muted/15 border-border/20 hover:bg-accent/10"
                    )}
                  >
                    <domain.icon className={cn("w-4 h-4 shrink-0", domainColorMap[domain.color])} />
                    <div className="flex-1 min-w-0">
                      <span className={cn("text-xs font-medium", isActive ? domainColorMap[domain.color] : 'text-foreground')}>
                        {isHe ? domain.labelHe : domain.labelEn}
                      </span>
                      {hasMissions && (
                        <Progress value={progress} className="h-1 mt-1 [&>div]:bg-amber-400" />
                      )}
                    </div>
                    {status !== 'unconfigured' && (
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded-full border shrink-0",
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

      {/* Pillar Modal */}
      {selectedDomain && (
        <PillarModal
          open={!!selectedDomain}
          onOpenChange={(o) => !o && setSelectedDomain(null)}
          hub="arena"
          pillar={selectedDomain}
          missions={missionsByPillar[selectedDomain.id] || []}
          milestonesByMission={milestonesByMission}
          isActive={(statusMap[selectedDomain.id] ?? 'unconfigured') === 'active' || statusMap[selectedDomain.id] === 'configured'}
        />
      )}
    </>
  );
}
