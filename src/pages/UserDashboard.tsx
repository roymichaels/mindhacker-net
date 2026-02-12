import { useNavigate } from "react-router-dom";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator";
import { useSEO } from "@/hooks/useSEO";
import { getBreadcrumbSchema } from "@/lib/seo";
import { useTranslation } from "@/hooks/useTranslation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { UnifiedDashboardView } from "@/components/dashboard/UnifiedDashboardView";
import { HypnosisModal } from "@/components/dashboard/HypnosisModal";
import { useLaunchpadProgress } from "@/hooks/useLaunchpadProgress";
import { useGuestDataMigration } from "@/hooks/useGuestDataMigration";
import { toast } from "sonner";
import { useState } from "react";

const UserDashboard = () => {
  const { t, isRTL, language } = useTranslation();
  const navigate = useNavigate();
  const [hypnosisOpen, setHypnosisOpen] = useState(false);
  const { isLaunchpadComplete } = useLaunchpadProgress();
  useGuestDataMigration();
  
  // SEO Configuration
  useSEO({
    title: t('seo.dashboardTitle'),
    description: t('seo.dashboardDescription'),
    url: `${window.location.origin}/dashboard`,
    type: "website",
    structuredData: [
      getBreadcrumbSchema([
        { name: t('seo.breadcrumbHome'), url: window.location.origin },
        { name: t('seo.breadcrumbDashboard'), url: `${window.location.origin}/dashboard` },
      ]),
    ],
  });

  const pullToRefresh = usePullToRefresh({
    onRefresh: async () => {
      window.location.reload();
    },
  });

  const handleOpenChat = () => {
    navigate('/aurora');
  };

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

  return (
    <div className="min-h-screen relative">
      <PullToRefreshIndicator {...pullToRefresh} />
      <DashboardLayout>
        <div className="pb-10">
          <UnifiedDashboardView 
            onOpenHypnosis={handleOpenHypnosis}
            onOpenChat={handleOpenChat}
          />
        </div>
      </DashboardLayout>

      <HypnosisModal open={hypnosisOpen} onOpenChange={setHypnosisOpen} />
    </div>
  );
};

export default UserDashboard;
