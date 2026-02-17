import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSEO } from '@/hooks/useSEO';
import { getBreadcrumbSchema } from '@/lib/seo';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useGuestDataMigration } from '@/hooks/useGuestDataMigration';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useGameState } from '@/contexts/GameStateContext';
import { useDailyHypnosis } from '@/hooks/useDailyHypnosis';
import { useHaptics } from '@/hooks/useHaptics';
import { NextActionBanner } from '@/components/dashboard/v2';
import { TodaysHabitsCard } from '@/components/dashboard/v2';
import { ChecklistsCard } from '@/components/dashboard/unified';
import { PlanRoadmap } from '@/components/dashboard/plan/PlanRoadmap';
import { HypnosisModal } from '@/components/dashboard/HypnosisModal';
import { ProfileContent } from '@/components/dashboard/ProfileContent';
import { RecentSessions } from '@/components/hypnosis';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { MobileHeroGrid } from '@/components/dashboard/MobileHeroGrid';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Zap, TrendingUp, Flame, ChevronDown, Calendar,
  BarChart3, Brain, Shield, Heart, Play, Clock, Target, Star, Lock, Rocket,
} from 'lucide-react';

const QUICK_SESSIONS = [
  { id: 'calm', duration: 5, icon: '🧘', titleHe: 'רגיעה', titleEn: 'Calm', gradient: 'from-blue-500 to-cyan-500' },
  { id: 'focus', duration: 10, icon: '🎯', titleHe: 'מיקוד', titleEn: 'Focus', gradient: 'from-purple-500 to-indigo-500' },
  { id: 'energy', duration: 7, icon: '⚡', titleHe: 'אנרגיה', titleEn: 'Energy', gradient: 'from-amber-500 to-orange-500' },
  { id: 'sleep', duration: 15, icon: '🌙', titleHe: 'שינה', titleEn: 'Sleep', gradient: 'from-indigo-500 to-purple-600' },
];

const UserDashboard = () => {
  const { t, language, isRTL } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isLaunchpadComplete } = useLaunchpadProgress();
  const dashboard = useUnifiedDashboard();
  const { sessionStats, gameState } = useGameState();
  const { suggestedGoal } = useDailyHypnosis();
  const { impact } = useHaptics();
  const [hypnosisOpen, setHypnosisOpen] = useState(false);
  const [roadmapOpen, setRoadmapOpen] = useState(false);
  const [activeInsight, setActiveInsight] = useState<string | null>(null);
  useGuestDataMigration();

  // Plan data query
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
    url: `${window.location.origin}/dashboard`,
    type: 'website',
    structuredData: [
      getBreadcrumbSchema([
        { name: t('seo.breadcrumbHome'), url: window.location.origin },
        { name: 'Dashboard', url: `${window.location.origin}/dashboard` },
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

  const handleStartSession = (preset?: string, duration?: number) => {
    impact('medium');
    const params = new URLSearchParams();
    if (preset) params.set('preset', preset);
    if (duration) params.set('duration', duration.toString());
    navigate(`/hypnosis/session?${params.toString()}`);
  };

  const handleStartDailySession = () => {
    impact('medium');
    const params = new URLSearchParams();
    params.set('duration', '15');
    params.set('goal', suggestedGoal);
    params.set('daily', 'true');
    navigate(`/hypnosis/session?${params.toString()}`);
  };

  const xpPercent = dashboard.xpProgress.percentage;
  const sessionsUnlocked = isLaunchpadComplete;

  const insightTabs = [
    { id: 'stats', icon: BarChart3, label: language === 'he' ? 'סטטיסטיקה' : 'Stats' },
    { id: 'ai', icon: Brain, label: language === 'he' ? 'ניתוח AI' : 'AI Analysis' },
    { id: 'identity', icon: Shield, label: language === 'he' ? 'זהות' : 'Identity' },
    { id: 'values', icon: Heart, label: language === 'he' ? 'ערכים' : 'Values' },
  ];

  return (
    <PageShell className="space-y-6">
      {/* ===== MOBILE HERO GRID ===== */}
      <MobileHeroGrid planData={planData} />
      {/* ===== SECTION 1: PROFILE IDENTITY CARD ===== */}
      <section>
        <ProfileContent />
      </section>

      {/* ===== SECTION 2: NEXT ACTION BANNER ===== */}
      <section>
        <NextActionBanner onOpenHypnosis={handleOpenHypnosis} onOpenChat={handleOpenChat} />
      </section>

      {/* ===== SECTION 3: SESSIONS ===== */}
      <section className="space-y-3">
        {sessionsUnlocked ? (
          <>
            {/* Daily Session Hero */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden rounded-2xl p-6 cursor-pointer bg-gradient-to-br from-primary to-primary/80 active:brightness-95 transition-all"
              onClick={handleStartDailySession}
            >
              <div className="absolute inset-0 bg-white/5" />
              <div className="relative z-10 text-white flex flex-col items-center text-center gap-2">
                <span className="text-4xl">✨</span>
                <h2 className="text-xl font-bold leading-tight">
                  {language === 'he' ? 'הסשן היומי שלך' : 'Your Daily Session'}
                </h2>
                <span className="text-sm opacity-80 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />15 {language === 'he' ? 'דקות' : 'minutes'}
                </span>
                <div className="mt-2 flex items-center gap-2 bg-background/90 text-foreground rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg">
                  <Play className="w-4 h-4" />
                  {language === 'he' ? 'התחל עכשיו' : 'Start Now'}
                </div>
              </div>
            </motion.div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: Target, value: sessionStats?.totalSessions || 0, label: language === 'he' ? 'סשנים' : 'Sessions', color: 'text-blue-500' },
                { icon: Clock, value: sessionStats?.totalDurationSeconds ? Math.floor(sessionStats.totalDurationSeconds / 60) : 0, label: language === 'he' ? 'דקות' : 'Min', color: 'text-green-500' },
                { icon: Zap, value: gameState?.experience || 0, label: 'XP', color: 'text-amber-500' },
                { icon: Star, value: gameState?.level || 1, label: language === 'he' ? 'רמה' : 'Lvl', color: 'text-purple-500' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-card border border-border p-3 flex flex-col items-center text-center">
                  <stat.icon className={cn("w-5 h-5 mb-1", stat.color)} />
                  <p className="text-lg font-bold leading-none">{stat.value.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Quick Sessions */}
            <div className="grid grid-cols-4 gap-2">
              {QUICK_SESSIONS.map((session) => (
                <Card
                  key={session.id}
                  className="relative overflow-hidden p-3 cursor-pointer hover:shadow-md transition-all active:scale-95 touch-manipulation"
                  onClick={() => handleStartSession(session.id, session.duration)}
                >
                  <div className={cn("absolute inset-0 opacity-10 bg-gradient-to-br", session.gradient)} />
                  <div className="relative z-10 text-center flex flex-col items-center gap-1">
                    <span className="text-2xl">{session.icon}</span>
                    <p className="text-xs font-semibold leading-tight">
                      {language === 'he' ? session.titleHe : session.titleEn}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{session.duration}{language === 'he' ? 'דק׳' : 'm'}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Recent Sessions */}
            <RecentSessions language={language as 'he' | 'en'} isRTL={isRTL} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4 rounded-2xl border border-border bg-card" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-bold mb-2">
              {language === 'he' ? 'סשנים מותאמים אישית' : 'Personalized Sessions'}
            </h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              {language === 'he'
                ? 'השלם את מסע הטרנספורמציה תחילה.'
                : 'Complete the Transformation Journey first.'}
            </p>
            <Button size="sm" onClick={() => navigate('/launchpad')} className="gap-1.5">
              <Rocket className="w-4 h-4" />
              {language === 'he' ? 'התחל' : 'Start'}
            </Button>
          </div>
        )}
      </section>

      {/* ===== SECTION 4: THREE MODULE GRID ===== */}
      <section className="grid gap-3 md:grid-cols-3">
        <TodaysHabitsCard />

        {/* 90-Day Roadmap */}
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

            <div className="px-4 pb-2">
              <Progress value={planData?.progressPercent || 0} className="h-1.5" />
              {planData?.currentMilestone && (
                <p className="text-[11px] text-muted-foreground mt-1.5 truncate">
                  → {planData.currentMilestone.title}
                </p>
              )}
            </div>

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

        <div id="tasks-card">
          <ChecklistsCard />
        </div>
      </section>

      {/* ===== SECTION 5: DEEP INSIGHTS STRIP ===== */}
      <section className="space-y-2">
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
                      <p className="text-sm text-muted-foreground">
                        {language === 'he' ? 'ניתוח AI מעמיק של המסע שלך' : 'Deep AI analysis of your journey'}
                      </p>
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
                      {dashboard.selfConcepts.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {dashboard.selfConcepts.slice(0, 5).map((c, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{c}</span>
                          ))}
                        </div>
                      ) : (
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
                            <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-accent/50 border border-border/50 font-medium">{v}</span>
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
      </section>

      <HypnosisModal open={hypnosisOpen} onOpenChange={setHypnosisOpen} />
    </PageShell>
  );
};

export default UserDashboard;
