import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator";
import { useSEO } from "@/hooks/useSEO";
import { getBreadcrumbSchema } from "@/lib/seo";
import { useTranslation } from "@/hooks/useTranslation";
import Header from "@/components/Header";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CompactCourses from "@/components/dashboard/CompactCourses";
import CompactRecordings from "@/components/dashboard/CompactRecordings";
import CompactSessions from "@/components/dashboard/CompactSessions";
import CompactAffiliate from "@/components/dashboard/CompactAffiliate";
import LifeDirectionCard from "@/components/dashboard/LifeDirectionCard";
import WeeklyProgressCard from "@/components/dashboard/WeeklyProgressCard";
import DailyAnchorsCard from "@/components/dashboard/DailyAnchorsCard";
import RecentInsightsCard from "@/components/dashboard/RecentInsightsCard";
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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="p-8" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <PullToRefreshIndicator {...pullToRefresh} />
      <Header />
      
      <DashboardLayout>
        {/* Dashboard Content - Unified View */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{t('common.dashboard')}</h1>
            <p className="text-muted-foreground">{t('dashboard.welcomeBack')}</p>
          </div>
          
          {/* Life Model Integration - Top Row */}
          <div className="grid gap-6 md:grid-cols-2">
            <LifeDirectionCard />
            <WeeklyProgressCard />
          </div>
          
          {/* Daily Anchors & Insights */}
          <div className="grid gap-6 md:grid-cols-2">
            <DailyAnchorsCard />
            <RecentInsightsCard />
          </div>
          
          {/* Existing Content - Courses & Recordings */}
          <div className="grid gap-6 md:grid-cols-2">
            <CompactCourses />
            <CompactRecordings />
          </div>
          
          {/* Sessions & Affiliate */}
          <div className="grid gap-6 md:grid-cols-2">
            <CompactSessions />
            <CompactAffiliate />
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
};

export default UserDashboard;
