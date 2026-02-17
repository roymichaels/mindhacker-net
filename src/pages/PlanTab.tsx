import { useTranslation } from '@/hooks/useTranslation';
import { useSEO } from '@/hooks/useSEO';
import { getBreadcrumbSchema } from '@/lib/seo';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import ProGateOverlay from '@/components/subscription/ProGateOverlay';
import { PlanProgressHero, LifeAnalysisChart } from '@/components/dashboard/v2';
import { TasksPanel } from '@/components/dashboard/plan/TasksPanel';
import { PlanRoadmap } from '@/components/dashboard/plan/PlanRoadmap';
import { ListChecks } from 'lucide-react';

const PlanTab = () => {
  const { t, isRTL, language } = useTranslation();
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
    <div className="space-y-6 pt-0 sm:pt-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero progress summary */}
      <PlanProgressHero />

      {/* Today's Missions */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-primary" />
          <h2 className="text-base font-bold">
            {language === 'he' ? '⚡ משימות היום' : '⚡ Today\'s Missions'}
          </h2>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <TasksPanel />
        </div>
      </section>

      {/* 90-Day Roadmap */}
      <section>
        <PlanRoadmap />
      </section>

      {/* Life Analysis */}
      <section>
        <LifeAnalysisChart />
      </section>
    </div>
  );
};

export default PlanTab;
