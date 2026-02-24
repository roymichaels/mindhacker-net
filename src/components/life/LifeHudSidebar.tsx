/**
 * CoreHudSidebar - Left sidebar for Core System navigation.
 * Rose/pink color scheme matching Core identity.
 * Pillar buttons navigate to assessment results pages.
 */
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { CORE_DOMAINS } from '@/navigation/lifeDomains';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { useStrategyPlans } from '@/hooks/useStrategyPlans';
import { supabase } from '@/integrations/supabase/client';
import { SidebarOrbWidget } from '@/components/sidebar/SidebarOrbWidget';
import { Progress } from '@/components/ui/progress';

export function LifeHudSidebar() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();
  const { statusMap } = useLifeDomains();
  const { corePlan } = useStrategyPlans();

  const domainColorMap: Record<string, string> = {
    rose: 'text-rose-400', red: 'text-red-400', amber: 'text-amber-400',
    violet: 'text-violet-400', emerald: 'text-emerald-400', slate: 'text-slate-400',
    indigo: 'text-indigo-400', orange: 'text-orange-400',
    blue: 'text-blue-400', fuchsia: 'text-fuchsia-400', cyan: 'text-cyan-400',
  };

  const activeColorMap: Record<string, string> = {
    rose: 'bg-rose-500/20 border-rose-500/30',
    red: 'bg-red-500/20 border-red-500/30',
    amber: 'bg-amber-500/20 border-amber-500/30',
    violet: 'bg-violet-500/20 border-violet-500/30',
    emerald: 'bg-emerald-500/20 border-emerald-500/30',
    slate: 'bg-slate-500/20 border-slate-500/30',
    indigo: 'bg-indigo-500/20 border-indigo-500/30',
    orange: 'bg-orange-500/20 border-orange-500/30',
    blue: 'bg-blue-500/20 border-blue-500/30',
    fuchsia: 'bg-fuchsia-500/20 border-fuchsia-500/30',
    cyan: 'bg-cyan-500/20 border-cyan-500/30',
  };

  const inactiveColorMap: Record<string, string> = {
    rose: 'bg-rose-500/8 border-rose-500/15 hover:bg-rose-500/15',
    red: 'bg-red-500/8 border-red-500/15 hover:bg-red-500/15',
    amber: 'bg-amber-500/8 border-amber-500/15 hover:bg-amber-500/15',
    violet: 'bg-violet-500/8 border-violet-500/15 hover:bg-violet-500/15',
    emerald: 'bg-emerald-500/8 border-emerald-500/15 hover:bg-emerald-500/15',
    slate: 'bg-slate-500/8 border-slate-500/15 hover:bg-slate-500/15',
    indigo: 'bg-indigo-500/8 border-indigo-500/15 hover:bg-indigo-500/15',
    orange: 'bg-orange-500/8 border-orange-500/15 hover:bg-orange-500/15',
    blue: 'bg-blue-500/8 border-blue-500/15 hover:bg-blue-500/15',
    fuchsia: 'bg-fuchsia-500/8 border-fuchsia-500/15 hover:bg-fuchsia-500/15',
    cyan: 'bg-cyan-500/8 border-cyan-500/15 hover:bg-cyan-500/15',
  };

  // Fetch missions for progress display
  const { data: missions } = useQuery({
    queryKey: ['plan-missions', corePlan?.id],
    queryFn: async () => {
      if (!corePlan?.id) return [];
      const { data } = await supabase
        .from('plan_missions').select('*')
        .eq('plan_id', corePlan.id).order('mission_number');
      return data || [];
    },
    enabled: !!corePlan?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: milestones } = useQuery({
    queryKey: ['mission-milestones', corePlan?.id],
    queryFn: async () => {
      if (!corePlan?.id) return [];
      const { data } = await supabase
        .from('life_plan_milestones')
        .select('id, title, title_en, is_completed, mission_id, milestone_number, focus_area')
        .eq('plan_id', corePlan.id).not('mission_id', 'is', null).order('milestone_number');
      return data || [];
    },
    enabled: !!corePlan?.id,
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
    navigate(`/life/${domainId}/results`);
  };

  return (
    <aside className={cn(
      "flex flex-col flex-shrink-0 h-full overflow-y-auto scrollbar-hide transition-all duration-300 relative",
      "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
      "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
      "ltr:border-s rtl:border-e border-border/50 dark:border-rose-500/15",
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
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
          <div className="flex flex-col items-center gap-1 overflow-y-auto scrollbar-hide">
            {CORE_DOMAINS.map((domain) => {
              const status = statusMap[domain.id] ?? 'unconfigured';
              return (
                <button
                  key={domain.id}
                  onClick={() => handlePillarClick(domain.id)}
                  className={cn(
                    "p-2 rounded-lg border transition-colors",
                    status === 'active'
                      ? activeColorMap[domain.color]
                      : (inactiveColorMap[domain.color] || "bg-muted/30 dark:bg-muted/15 border-border/20 hover:bg-accent/10")
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
          <SidebarOrbWidget />
          <div className="h-px w-full bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
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

          {/* Domain nav items — navigate to results */}
          <div className="flex flex-col gap-1 w-full">
            {CORE_DOMAINS.map((domain) => {
              const status = statusMap[domain.id] ?? 'unconfigured';
              const isActive = status === 'active' || status === 'configured';
              const progress = getPillarProgress(domain.id);
              const hasMissions = (missionsByPillar[domain.id] || []).length > 0;
              return (
                <button
                  key={domain.id}
                  onClick={() => handlePillarClick(domain.id)}
                  className={cn(
                    "w-full rounded-xl p-2.5 flex items-center gap-2.5 transition-all border text-start",
                    isActive
                      ? `${activeColorMap[domain.color]} shadow-sm`
                      : (inactiveColorMap[domain.color] || "bg-muted/30 dark:bg-muted/15 border-border/20 hover:bg-accent/10")
                  )}
                >
                  <domain.icon className={cn("w-4 h-4 shrink-0", domainColorMap[domain.color])} />
                  <div className="flex-1 min-w-0">
                    <span className={cn("text-xs font-semibold", domainColorMap[domain.color])}>
                      {isHe ? domain.labelHe : domain.labelEn}
                    </span>
                    {hasMissions && (
                      <Progress value={progress} className="h-1 mt-1" />
                    )}
                  </div>
                  {status !== 'unconfigured' && (
                    <span className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded-full border shrink-0",
                      isActive
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                        : status === 'needs_reassessment'
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/20"
                          : "bg-muted/40 text-muted-foreground border-border/20"
                    )}>
                      {isHe
                        ? (isActive ? 'פעיל' : status === 'needs_reassessment' ? 'נדרש כיול' : 'הוגדר')
                        : (isActive ? 'Active' : status === 'needs_reassessment' ? 'Needs Update' : 'Set')
                      }
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
