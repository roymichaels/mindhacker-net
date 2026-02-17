import { useTranslation } from '@/hooks/useTranslation';
import { useSEO } from '@/hooks/useSEO';
import { getBreadcrumbSchema } from '@/lib/seo';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import ProGateOverlay from '@/components/subscription/ProGateOverlay';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ListChecks, Target } from 'lucide-react';
import {
  PlanProgressHero,
  GoalsCard,
  LifeAnalysisChart,
  PlanProgressCard,
} from '@/components/dashboard/v2';
import { TasksPanel } from '@/components/dashboard/plan/TasksPanel';
import { GoalsPanel } from '@/components/dashboard/plan/GoalsPanel';

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
    <div className="space-y-5 pt-0 sm:pt-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <PlanProgressHero />

      <Tabs defaultValue="missions" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="missions" className="gap-2">
            <ListChecks className="h-4 w-4" />
            {language === 'he' ? 'משימות' : 'Missions'}
          </TabsTrigger>
          <TabsTrigger value="plan" className="gap-2">
            <Target className="h-4 w-4" />
            {language === 'he' ? 'תוכנית' : 'Plan'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="missions" className="mt-4">
          <TasksPanel />
        </TabsContent>

        <TabsContent value="plan" className="mt-4 space-y-4">
          <GoalsPanel />
          <div className="grid gap-4 md:grid-cols-2">
            <GoalsCard />
            <PlanProgressCard />
          </div>
          <LifeAnalysisChart />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlanTab;
