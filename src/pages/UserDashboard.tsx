import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator";
import { useSEO } from "@/hooks/useSEO";
import { getBreadcrumbSchema } from "@/lib/seo";
import { useTranslation } from "@/hooks/useTranslation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CompactSessions from "@/components/dashboard/CompactSessions";
import { UnifiedDashboardView } from "@/components/dashboard/UnifiedDashboardView";
import { Skeleton } from "@/components/ui/skeleton";

const UserDashboard = () => {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const pullToRefresh = usePullToRefresh({
    onRefresh: async () => {
      window.location.reload();
    },
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6" dir={isRTL ? "rtl" : "ltr"}>
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen relative">
      <PullToRefreshIndicator {...pullToRefresh} />
      <DashboardLayout>
        {/* Dashboard Content - Unified View */}
        <div className="space-y-6 pb-10">
          <p className="text-lg font-semibold text-muted-foreground">{t('dashboard.welcomeBack')}</p>
          
          {/* Unified Life Model + Gamification Dashboard */}
          <UnifiedDashboardView />

          {/* Sessions */}
          <div className="grid gap-6">
            <CompactSessions />
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
};

export default UserDashboard;
