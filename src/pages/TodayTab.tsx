import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSEO } from '@/hooks/useSEO';
import { getBreadcrumbSchema } from '@/lib/seo';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useGuestDataMigration } from '@/hooks/useGuestDataMigration';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { NextActionBanner } from '@/components/dashboard/v2';
import { TodaysHabitsCard } from '@/components/dashboard/v2';
import { ChecklistsCard } from '@/components/dashboard/unified';
import { PlanRoadmap } from '@/components/dashboard/plan/PlanRoadmap';
import { HypnosisModal } from '@/components/dashboard/HypnosisModal';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  AIAnalysisModal, LifePlanModal, ConsciousnessModal, BehavioralModal,
  IdentityModal, TraitsModal, CommitmentsModal, AnchorsModal,
} from '@/components/dashboard/DashboardModals';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Zap, TrendingUp, Flame, ChevronDown, Calendar, Map,
  BarChart3, Brain, Shield, Heart
} from 'lucide-react';

const TodayTab = () => {
  const { t, language, isRTL } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isLaunchpadComplete } = useLaunchpadProgress();
  const dashboard = useUnifiedDashboard();
  const [hypnosisOpen, setHypnosisOpen] = useState(false);
  const [roadmapOpen, setRoadmapOpen] = useState(false);
  const [activeInsight, setActiveInsight] = useState<string | null>(null);
  useGuestDataMigration();

  // Plan data query (reused from PlanTab)
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
    url: `${window.location.origin}/today`,
    type: 'website',
    structuredData: [
      getBreadcrumbSchema([
        { name: t('seo.breadcrumbHome'), url: window.location.origin },
        { name: 'Home', url: `${window.location.origin}/today` },
      ]),
    ],
  });

  // Update last_active_at
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('aurora_onboarding_progress')
      .update({ last_active_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .then(() => {});
  }, [user?.id]);

  const handleOpenHypnosis = () => {
    if (!isLaunchpadComplete) {
      toast(language === 'he' ? 'יש להשלים את מסע התודעה לפני שימוש בהיפנוזה' : 'Complete the Consciousness Journey before using Hypnosis', {
        action: {
          label: language === 'he' ? 'התחל מסע' : 'Start Journey',
          onClick: () => navigate('/launchpad'),
        },
      });
      return;
    }
    setHypnosisOpen(true);
  };

  const handleOpenChat = () => {
    navigate('/aurora');
  };

  const xpPercent = dashboard.xpProgress.percentage;

  const insightTabs = [
    { id: 'stats', icon: BarChart3, label: language === 'he' ? 'סטטיסטיקה' : 'Stats' },
    { id: 'ai', icon: Brain, label: language === 'he' ? 'ניתוח AI' : 'AI Analysis' },
    { id: 'identity', icon: Shield, label: language === 'he' ? 'זהות' : 'Identity' },
    { id: 'values', icon: Heart, label: language === 'he' ? 'ערכים' : 'Values' },
  ];

  return (
    <PageShell className="space-y-3">
      {/* ===== SECTION 1: COMPACT IDENTITY HEADER ===== */}
      <div className="flex items-center gap-3 py-2 px-1" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold truncate">
            {dashboard.user.name || (language === 'he' ? 'שלום' : 'Welcome')}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">
              Lv.{dashboard.level}
            </span>
            <Progress value={xpPercent} className="h-1.5 flex-1 max-w-[100px]" />
            <span className="text-[10px] text-muted-foreground">
              {dashboard.xpProgress.current}/{dashboard.xpProgress.required}
            </span>
          </div>
        </div>
        {/* Micro-metrics */}
        <div className="flex gap-1.5">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/50 border border-border/50">
            <Zap className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] font-semibold">{dashboard.streak}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/50 border border-border/50">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-semibold">{dashboard.totalSessions}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/50 border border-border/50">
            <Flame className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-semibold">{dashboard.tokens}</span>
          </div>
        </div>
      </div>

      {/* ===== SECTION 2: NEXT ACTION BANNER ===== */}
      <NextActionBanner onOpenHypnosis={handleOpenHypnosis} onOpenChat={handleOpenChat} />

      {/* ===== SECTION 3: THREE MODULE GRID ===== */}
      <div className="grid gap-3 md:grid-cols-3">
        {/* Card 1: Today — Execution Layer */}
        <TodaysHabitsCard />

        {/* Card 2: 90-Day Roadmap — Strategy Layer */}
        <Card id="roadmap-card" className="rounded-xl shadow-sm">
          <CardContent className="p-0">
            <button
              onClick={() => setRoadmapOpen(!roadmapOpen)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/30 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[8px] text-muted-foreground leading-none">{language === 'he' ? 'שבוע' : 'Wk'}</span>
                  <span className="text-sm font-black leading-none">{planData?.currentWeek || 1}</span>
                </div>
                <div className="text-start">
                  <span className="text-sm font-semibold block">
                    {language === 'he' ? 'תוכנית 90 יום' : '90-Day Plan'}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {planData && (
                      <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
                        <Calendar className="h-2.5 w-2.5 me-0.5" />
                        {language === 'he' ? `חודש ${planData.currentMonth}` : `M${planData.currentMonth}`}
                      </Badge>
                    )}
                    <span className="text-xs font-medium text-primary">{planData?.progressPercent || 0}%</span>
                  </div>
                </div>
              </div>
              <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", roadmapOpen && "rotate-180")} />
            </button>

            {/* Progress bar */}
            <div className="px-4 pb-2">
              <Progress value={planData?.progressPercent || 0} className="h-1.5" />
              {planData?.currentMilestone && (
                <p className="text-[11px] text-muted-foreground mt-1.5 truncate">
                  → {planData.currentMilestone.title}
                </p>
              )}
            </div>

            {/* Expandable roadmap */}
            <AnimatePresence initial={false}>
              {roadmapOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden border-t"
                >
                  <div className="p-3">
                    <PlanRoadmap />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Card 3: Tasks & Systems — Foundation Layer */}
        <div id="tasks-card">
          <ChecklistsCard />
        </div>
      </div>

      {/* ===== SECTION 4: DEEP INSIGHTS STRIP ===== */}
      <div className="space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {insightTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeInsight === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveInsight(isActive ? null : tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeInsight && (
            <motion.div
              key={activeInsight}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Card className="rounded-xl">
                <CardContent className="p-4">
                  {activeInsight === 'stats' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 rounded-lg bg-muted/30">
                        <p className="text-2xl font-bold">{dashboard.level}</p>
                        <p className="text-[10px] text-muted-foreground">{language === 'he' ? 'רמה' : 'Level'}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/30">
                        <p className="text-2xl font-bold">{dashboard.streak}</p>
                        <p className="text-[10px] text-muted-foreground">{language === 'he' ? 'רצף' : 'Streak'}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/30">
                        <p className="text-2xl font-bold">{dashboard.totalSessions}</p>
                        <p className="text-[10px] text-muted-foreground">{language === 'he' ? 'סשנים' : 'Sessions'}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/30">
                        <p className="text-2xl font-bold">{dashboard.tokens}</p>
                        <p className="text-[10px] text-muted-foreground">{language === 'he' ? 'טוקנים' : 'Tokens'}</p>
                      </div>
                    </div>
                  )}
                  {activeInsight === 'ai' && (
                    <div className="text-center py-4">
                      <Brain className="w-8 h-8 mx-auto text-primary mb-2" />
                      <p className="text-sm text-muted-foreground mb-3">
                        {language === 'he' ? 'ניתוח AI מעמיק של המסע שלך' : 'Deep AI analysis of your journey'}
                      </p>
                      <button
                        onClick={() => setActiveInsight(null)}
                        className="text-xs text-primary font-medium"
                      >
                        {/* Trigger AI analysis modal via profile */}
                      </button>
                    </div>
                  )}
                  {activeInsight === 'identity' && (
                    <div dir={isRTL ? 'rtl' : 'ltr'}>
                      {dashboard.identityTitle && (
                        <div className="text-center mb-3">
                          <span className="text-2xl">{dashboard.identityTitle.icon}</span>
                          <h3 className="font-semibold text-sm mt-1">
                            {language === 'he' ? dashboard.identityTitle.title : dashboard.identityTitle.titleEn}
                          </h3>
                        </div>
                      )}
                      {dashboard.selfConcepts.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {dashboard.selfConcepts.slice(0, 5).map((c, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                      {dashboard.selfConcepts.length === 0 && (
                        <p className="text-xs text-center text-muted-foreground">
                          {language === 'he' ? 'השלם את המסע לגלות את הזהות שלך' : 'Complete the journey to discover your identity'}
                        </p>
                      )}
                    </div>
                  )}
                  {activeInsight === 'values' && (
                    <div dir={isRTL ? 'rtl' : 'ltr'}>
                      {dashboard.values.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {dashboard.values.map((v, i) => (
                            <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-accent/50 border border-border/50 font-medium">
                              {v}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-center text-muted-foreground">
                          {language === 'he' ? 'השלם את המסע לגלות את הערכים שלך' : 'Complete the journey to discover your values'}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <HypnosisModal open={hypnosisOpen} onOpenChange={setHypnosisOpen} />
    </PageShell>
  );
};

export default TodayTab;
