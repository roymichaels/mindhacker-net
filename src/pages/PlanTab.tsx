import { useTranslation } from '@/hooks/useTranslation';
import { useSEO } from '@/hooks/useSEO';
import { getBreadcrumbSchema } from '@/lib/seo';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import ProGateOverlay from '@/components/subscription/ProGateOverlay';
import {
  PlanProgressHero,
  GoalsCard,
  LifeAnalysisChart,
  PlanProgressCard,
} from '@/components/dashboard/v2';

const PlanTab = () => {
  const { t, isRTL } = useTranslation();
  const { canAccessPlan, isLoading } = useSubscriptionGate();

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
      <div className="space-y-5 pt-0 sm:pt-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <ProGateOverlay feature="plan" className="min-h-[60vh]" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-0 sm:pt-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <PlanProgressHero />
      <div className="grid gap-4 md:grid-cols-2">
        <GoalsCard />
        <PlanProgressCard />
      </div>
      <LifeAnalysisChart />
    </div>
  );
};

export default PlanTab;
