import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, Sparkles, Target, Brain } from 'lucide-react';
import { PresetOrb } from '@/components/orb';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSEO } from '@/hooks/useSEO';
import { getBreadcrumbSchema } from '@/lib/seo';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useGuestDataMigration } from '@/hooks/useGuestDataMigration';
import { NextActionBanner } from '@/components/dashboard/v2';
import { HypnosisModal } from '@/components/dashboard/HypnosisModal';
import UpgradePromptModal from '@/components/subscription/UpgradePromptModal';
import { ProfileContent } from '@/components/dashboard/ProfileContent';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { MobileHeroGrid } from '@/components/dashboard/MobileHeroGrid';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usePromoPopup } from '@/hooks/usePromoPopup';
import PromoUpgradeModal from '@/components/subscription/PromoUpgradeModal';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import { DailyPrioritiesModal } from '@/components/dashboard/DailyPrioritiesModal';
import { useDailyPriorities } from '@/hooks/useDailyPriorities';

const UserDashboard = () => {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isLaunchpadComplete } = useLaunchpadProgress();
  const [hypnosisOpen, setHypnosisOpen] = useState(false);
  useGuestDataMigration();
  const { shouldShowPromo, dismissPromo } = usePromoPopup();

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

  const { canAccessHypnosis, showUpgradePrompt: showSubUpgrade, upgradeFeature: subUpgradeFeature, dismissUpgrade: dismissSubUpgrade } = useSubscriptionGate();
  const { filledToday: prioritiesFilledToday, isLoading: prioritiesLoading } = useDailyPriorities();

  const handleOpenHypnosis = () => {
    if (!isLaunchpadComplete) {
      toast(language === 'he' ? 'יש להשלים את מסע התודעה לפני שימוש בהיפנוזה' : 'Complete the Consciousness Journey before using Hypnosis', {
        action: {
          label: language === 'he' ? 'התחל מסע' : 'Start Journey',
          onClick: () => navigate('/onboarding'),
        },
      });
      return;
    }
    if (!canAccessHypnosis) {
      showSubUpgrade('hypnosis');
      return;
    }
    setHypnosisOpen(true);
  };

  const handleOpenChat = () => {
    navigate('/aurora');
  };

  // Gate: un-onboarded users see intro CTA
  if (!isLaunchpadComplete) {
    const isHe = language === 'he';
    const features = [
      { icon: Target, he: 'תוכנית 90 יום מותאמת אישית', en: 'Personalized 90-day plan' },
      { icon: Sparkles, he: 'אימון AI יומי עם אורורה', en: 'Daily AI coaching with Aurora' },
      { icon: Brain, he: 'כלי התבוננות וצמיחה', en: 'Introspection & growth tools' },
    ];
    return (
      <PageShell className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 max-w-lg mx-auto"
        >
          <div className="flex items-center justify-center w-full">
            <PresetOrb size={80} />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">
            {isHe ? 'המסע שלך מתחיל כאן' : 'Your Journey Starts Here'}
          </h2>
          <p className="text-muted-foreground">
            {isHe
              ? 'השלם את תהליך הכיול כדי לפתוח את הדאשבורד המלא — תוכנית 90 יום, אימון יומי וכלי צמיחה מותאמים אישית.'
              : 'Complete the calibration to unlock your full dashboard — a 90-day plan, daily coaching, and personalized growth tools.'}
          </p>

          <div className="grid gap-3 text-start">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: isHe ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-3"
              >
                <div className="rounded-full bg-primary/10 p-2">
                  <f.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{isHe ? f.he : f.en}</span>
              </motion.div>
            ))}
          </div>

          <Button
            onClick={() => navigate('/onboarding')}
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
          >
            <Rocket className="w-5 h-5 me-2" />
            {isHe ? 'התחל את המסע' : 'Start Your Journey'}
          </Button>
        </motion.div>
      </PageShell>
    );
  }

  // Show daily priorities gate for onboarded users who haven't filled today
  const showPrioritiesGate = !prioritiesLoading && !prioritiesFilledToday;

  return (
    <PageShell className="flex-1 flex flex-col min-h-0 gap-4 !max-w-full !px-0 md:!px-4 !py-0 md:!py-4 overflow-y-auto">
      {showPrioritiesGate && <DailyPrioritiesModal />}
      <MobileHeroGrid planData={planData} />
      <section className="md:hidden">
        <ProfileContent />
      </section>
      <HypnosisModal open={hypnosisOpen} onOpenChange={setHypnosisOpen} />
      <PromoUpgradeModal open={shouldShowPromo} onDismiss={dismissPromo} />
      <UpgradePromptModal feature={subUpgradeFeature} onDismiss={dismissSubUpgrade} />
    </PageShell>
  );
};

export default UserDashboard;
