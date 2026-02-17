import { useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSEO } from '@/hooks/useSEO';
import { getBreadcrumbSchema } from '@/lib/seo';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useGuestDataMigration } from '@/hooks/useGuestDataMigration';
import { DashboardBannerSlider } from '@/components/dashboard/DashboardBannerSlider';
import { NextActionBanner } from '@/components/dashboard/v2';
import { TodaysHabitsCard } from '@/components/dashboard/v2';
import { ChecklistsCard } from '@/components/dashboard/unified';
import { HypnosisModal } from '@/components/dashboard/HypnosisModal';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useState } from 'react';

const TodayTab = () => {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isLaunchpadComplete } = useLaunchpadProgress();
  const [hypnosisOpen, setHypnosisOpen] = useState(false);
  useGuestDataMigration();

  useSEO({
    title: t('seo.dashboardTitle'),
    description: t('seo.dashboardDescription'),
    url: `${window.location.origin}/today`,
    type: 'website',
    structuredData: [
      getBreadcrumbSchema([
        { name: t('seo.breadcrumbHome'), url: window.location.origin },
        { name: 'Today', url: `${window.location.origin}/today` },
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

  return (
    <PageShell className="space-y-2">
      <DashboardBannerSlider />
      <NextActionBanner onOpenHypnosis={handleOpenHypnosis} onOpenChat={handleOpenChat} />
      <div className="grid gap-2 md:grid-cols-2">
        <TodaysHabitsCard />
        <ChecklistsCard />
      </div>
      <HypnosisModal open={hypnosisOpen} onOpenChange={setHypnosisOpen} />
    </PageShell>
  );
};

export default TodayTab;
