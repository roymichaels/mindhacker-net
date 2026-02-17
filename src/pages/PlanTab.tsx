import { useTranslation } from '@/hooks/useTranslation';
import { useSEO } from '@/hooks/useSEO';
import { getBreadcrumbSchema } from '@/lib/seo';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import ProGateOverlay from '@/components/subscription/ProGateOverlay';
import { PlanProgressHero, LifeAnalysisChart } from '@/components/dashboard/v2';
import { TasksPanel } from '@/components/dashboard/plan/TasksPanel';
import { PlanRoadmap } from '@/components/dashboard/plan/PlanRoadmap';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { SectionHeader } from '@/components/aurora-ui/SectionHeader';
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
      <PageShell>
        <ProGateOverlay feature="plan" className="min-h-[60vh]" />
      </PageShell>
    );
  }

  return (
    <PageShell className="space-y-6">
      {/* Hero progress summary */}
      <PlanProgressHero />

      {/* Today's Missions */}
      <section className="space-y-3">
        <SectionHeader
          icon={ListChecks}
          title={language === 'he' ? '⚡ משימות היום' : "⚡ Today's Missions"}
        />
        <div className="rounded-2xl border border-border bg-card shadow-sm p-4">
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
    </PageShell>
  );
};

export default PlanTab;
