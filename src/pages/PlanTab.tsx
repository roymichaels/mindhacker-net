import { useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSEO } from '@/hooks/useSEO';
import { getBreadcrumbSchema } from '@/lib/seo';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import ProGateOverlay from '@/components/subscription/ProGateOverlay';
import { LifeAnalysisChart } from '@/components/dashboard/v2';
import { TasksPanel } from '@/components/dashboard/plan/TasksPanel';
import { PlanRoadmap } from '@/components/dashboard/plan/PlanRoadmap';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { SectionHeader } from '@/components/aurora-ui/SectionHeader';
import { ListChecks, Target, Calendar, Map, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const PlanTab = () => {
  const { t, isRTL, language } = useTranslation();
  const { canAccessPlan, isLoading } = useSubscriptionGate();
  const { user } = useAuth();
  const roadmapRef = useRef<HTMLDivElement>(null);
  const analysisRef = useRef<HTMLDivElement>(null);

  const { data: planData } = useQuery({
    queryKey: ['plan-hero-grid', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data: plan } = await supabase
        .from('life_plans')
        .select('id, duration_months, start_date, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!plan) return null;
      const { data: milestones } = await supabase
        .from('life_plan_milestones')
        .select('id, title, week_number, is_completed')
        .eq('plan_id', plan.id)
        .order('week_number', { ascending: true });
      const completedMilestones = milestones?.filter(m => m.is_completed) || [];
      const currentMilestone = milestones?.find(m => !m.is_completed);
      const totalWeeks = (plan.duration_months || 3) * 4;
      const currentWeek = currentMilestone?.week_number || completedMilestones.length + 1;
      const currentMonth = Math.min(3, Math.ceil(currentWeek / 4));
      const progressPercent = Math.round((completedMilestones.length / (milestones?.length || totalWeeks)) * 100);
      return { currentWeek, totalWeeks, currentMonth, completedCount: completedMilestones.length, totalCount: milestones?.length || totalWeeks, progressPercent, currentMilestone };
    },
    enabled: !!user?.id,
  });

  useSEO({
    title: t('seo.dashboardTitle'),
    description: t('seo.dashboardDescription'),
    url: `${window.location.origin}/plan`,
    type: 'website',
    structuredData: [
      getBreadcrumbSchema([
        { name: t('seo.breadcrumbHome'), url: window.location.origin },
        { name: 'Plan', url: `${window.location.origin}/plan` },
      ]),
    ],
  });

  if (!isLoading && !canAccessPlan) {
    return (
      <PageShell>
        <ProGateOverlay feature="plan" className="min-h-[60vh]" />
      </PageShell>
    );
  }

  return (
    <PageShell className="space-y-3">
      {/* ===== 3-COLUMN HERO GRID ===== */}
      <div className="grid grid-cols-3 gap-3">
        {/* Column 1: Dark card with week indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 border border-primary/30 p-4 flex flex-col items-center justify-center text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex flex-col items-center justify-center">
              <span className="text-[10px] text-white/60">{language === 'he' ? 'שבוע' : 'Wk'}</span>
              <span className="text-2xl font-black text-white leading-none">{planData?.currentWeek || 1}</span>
            </div>
            <h3 className="text-sm font-bold text-white/90 leading-tight">
              {language === 'he' ? 'תוכנית טרנספורמציה' : 'Transformation Plan'}
            </h3>
            {planData && (
              <Badge variant="secondary" className="text-xs h-5 px-2">
                <Calendar className="h-3 w-3 mr-1" />M{planData.currentMonth}
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Column 2: Progress stats */}
        <div className="flex flex-col gap-1.5">
          <div className="rounded-xl bg-card border border-border p-3 flex items-center gap-2 flex-1">
            <Target className="w-4 h-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-lg font-bold leading-none">{planData?.completedCount || 0}/{planData?.totalCount || 0}</p>
              <p className="text-xs text-muted-foreground">{language === 'he' ? 'הושלמו' : 'Done'}</p>
            </div>
          </div>
          <div className="rounded-xl bg-card border border-border p-3 flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">{language === 'he' ? 'התקדמות' : 'Progress'}</span>
              <span className="font-bold text-primary">{planData?.progressPercent || 0}%</span>
            </div>
            <Progress value={planData?.progressPercent || 0} className="h-2 [&>div]:bg-primary" />
          </div>
          {planData?.currentMilestone && (
            <div className="rounded-xl bg-card border border-border p-3 flex-1">
              <p className="text-xs text-muted-foreground truncate">→ {planData.currentMilestone.title}</p>
            </div>
          )}
        </div>

        {/* Column 3: Action buttons */}
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => roadmapRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-1 rounded-xl bg-card border border-border p-3 flex items-center gap-2 hover:bg-primary/10 hover:border-primary/40 transition-all text-start"
          >
            <Map className="w-5 h-5 text-primary shrink-0" />
            <span className="text-sm font-medium">{language === 'he' ? 'מפת דרכים' : 'Roadmap'}</span>
          </button>
          <button
            onClick={() => analysisRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-1 rounded-xl bg-card border border-border p-3 flex items-center gap-2 hover:bg-primary/10 hover:border-primary/40 transition-all text-start"
          >
            <BarChart3 className="w-5 h-5 text-accent shrink-0" />
            <span className="text-sm font-medium">{language === 'he' ? 'ניתוח חיים' : 'Life Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Today's Missions */}
      <section className="space-y-2">
        <SectionHeader
          icon={ListChecks}
          title={language === 'he' ? '⚡ משימות היום' : "⚡ Today's Missions"}
        />
        <div className="rounded-2xl border border-border bg-card shadow-sm p-4">
          <TasksPanel />
        </div>
      </section>

      {/* 90-Day Roadmap */}
      <section ref={roadmapRef}>
        <PlanRoadmap />
      </section>

      {/* Life Analysis */}
      <section ref={analysisRef}>
        <LifeAnalysisChart />
      </section>
    </PageShell>
  );
};

export default PlanTab;
