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
import { NextActionBanner } from '@/components/dashboard/v2';
import { HypnosisModal } from '@/components/dashboard/HypnosisModal';
import { ProfileContent } from '@/components/dashboard/ProfileContent';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { MobileHeroGrid } from '@/components/dashboard/MobileHeroGrid';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  BarChart3, Brain, Shield, Heart,
} from 'lucide-react';

const UserDashboard = () => {
  const { t, language, isRTL } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isLaunchpadComplete } = useLaunchpadProgress();
  const dashboard = useUnifiedDashboard();
  const [hypnosisOpen, setHypnosisOpen] = useState(false);
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

      {/* Sessions, Habits, Plan, Tasks — all consolidated into MobileHeroGrid above */}

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
