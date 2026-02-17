import { useRef, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSEO } from '@/hooks/useSEO';
import { getBreadcrumbSchema } from '@/lib/seo';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import ProGateOverlay from '@/components/subscription/ProGateOverlay';
import { TasksPanel } from '@/components/dashboard/plan/TasksPanel';
import { PlanRoadmap } from '@/components/dashboard/plan/PlanRoadmap';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { ListChecks, Calendar, Map, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const PlanTab = () => {
  const { t, isRTL, language } = useTranslation();
  const { canAccessPlan, isLoading } = useSubscriptionGate();
  const { user } = useAuth();
  const roadmapRef = useRef<HTMLDivElement>(null);
  const [tasksOpen, setTasksOpen] = useState(true);
  const [roadmapOpen, setRoadmapOpen] = useState(false);

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
    <PageShell className="space-y-4">
      {/* ===== FULL-WIDTH TRANSFORMATION HERO ===== */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 border border-primary/30 p-5"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/15" />
        <div className="relative z-10">
          {/* Top row: Week circle + Title + Month badge */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/40 flex flex-col items-center justify-center shrink-0">
              <span className="text-xs text-white/60 leading-none">{language === 'he' ? 'שבוע' : 'Week'}</span>
              <span className="text-3xl font-black text-white leading-none">{planData?.currentWeek || 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white leading-tight">
                {language === 'he' ? 'תוכנית טרנספורמציה' : 'Transformation Plan'}
              </h2>
              {planData && (
                <Badge variant="secondary" className="mt-1.5 text-xs h-6 px-2.5">
                  <Calendar className="h-3 w-3 mr-1" />
                  {language === 'he' ? `חודש ${planData.currentMonth}` : `Month ${planData.currentMonth}`}
                </Badge>
              )}
            </div>
          </div>

          {/* Progress section */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">
                {planData?.completedCount || 0}/{planData?.totalCount || 0} {language === 'he' ? 'הושלמו' : 'completed'}
              </span>
              <span className="font-bold text-primary">{planData?.progressPercent || 0}%</span>
            </div>
            <Progress value={planData?.progressPercent || 0} className="h-2.5 [&>div]:bg-primary" />
          </div>

          {/* Current milestone */}
          {planData?.currentMilestone && (
            <div className="mt-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-white/80 truncate">
                → {planData.currentMilestone.title}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ===== TODAY'S MISSIONS — Collapsible ===== */}
      <section className="space-y-0">
        <button
          onClick={() => setTasksOpen(!tasksOpen)}
          className="w-full flex items-center justify-between rounded-2xl bg-card border border-border px-4 py-3.5 hover:bg-accent/5 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ListChecks className="w-4.5 h-4.5 text-primary" />
            </div>
            <span className="text-base font-semibold">{language === 'he' ? '⚡ משימות היום' : "⚡ Today's Missions"}</span>
          </div>
          <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-200", tasksOpen && "rotate-180")} />
        </button>
        <AnimatePresence initial={false}>
          {tasksOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-border border-t-0 rounded-t-none bg-card shadow-sm p-4">
                <TasksPanel />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ===== 90-DAY ROADMAP — Collapsible ===== */}
      <section ref={roadmapRef} className="space-y-0">
        <button
          onClick={() => setRoadmapOpen(!roadmapOpen)}
          className="w-full flex items-center justify-between rounded-2xl bg-card border border-border px-4 py-3.5 hover:bg-accent/5 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Map className="w-4.5 h-4.5 text-primary" />
            </div>
            <span className="text-base font-semibold">{language === 'he' ? '🗺️ מפת דרכים 90 יום' : '🗺️ 90-Day Roadmap'}</span>
          </div>
          <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-200", roadmapOpen && "rotate-180")} />
        </button>
        <AnimatePresence initial={false}>
          {roadmapOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="pt-3">
                <PlanRoadmap />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </PageShell>
  );
};

export default PlanTab;
